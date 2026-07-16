from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.seat import Seat, SeatStatus
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.models.employee import Employee, EmployeeStatus
from app.models.project import Project
from app.core.exceptions import (
    NotFoundException,
    SeatUnavailableException,
    ValidationException,
)
from app.repositories import seat_repo, allocation_repo, employee_repo
from app.schemas.seat import SeatCreate
from app.schemas.seat_allocation import AllocationResultResponse


# ---------- Basic seat CRUD ----------

def create_seat(db: Session, payload: SeatCreate) -> Seat:
    seat = Seat(**payload.model_dump())
    try:
        return seat_repo.create(db, seat)
    except IntegrityError:
        db.rollback()
        raise ValidationException(
            f"Seat {payload.seat_number} already exists on Floor {payload.floor}, Zone {payload.zone}"
        )


def _attach_occupants(db: Session, seats: list[Seat]) -> list[Seat]:
    """
    Attach transient occupant fields (employee_id/employee_name/project_name) onto each
    seat so SeatWithOccupantResponse can serialize who is sitting there. Batched — one query.
    Occupant is the ACTIVE allocation for that seat, if any.
    """
    if not seats:
        return seats

    seat_ids = [s.id for s in seats]
    rows = (
        db.query(SeatAllocation.seat_id, Employee.id, Employee.name, Project.name)
        .join(Employee, Employee.id == SeatAllocation.employee_id)
        .outerjoin(Project, Project.id == SeatAllocation.project_id)
        .filter(
            SeatAllocation.seat_id.in_(seat_ids),
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
        )
        .all()
    )
    by_seat = {seat_id: (emp_id, emp_name, proj_name) for seat_id, emp_id, emp_name, proj_name in rows}

    for s in seats:
        occ = by_seat.get(s.id)
        s.employee_id = occ[0] if occ else None
        s.employee_name = occ[1] if occ else None
        s.project_name = occ[2] if occ else None

    return seats


def search_seats(db, floor=None, zone=None, status=None, offset=0, limit=20):
    items, total = seat_repo.search(db, floor=floor, zone=zone, status=status, offset=offset, limit=limit)
    _attach_occupants(db, items)
    return items, total


def get_available_seats(db, floor=None, zone=None, limit=50):
    return seat_repo.find_available_seats(db, floor=floor, zone=zone, limit=limit)


# ---------- Core allocation logic ----------

def allocate_seat(db: Session, employee_id: int, seat_id: int | None = None) -> AllocationResultResponse:
    """
    Allocates a seat to an employee.
    - If seat_id is given: validates and allocates that specific seat (manual allocation).
    - If seat_id is None: auto-suggests best seat using project zone preference,
      falling back to same floor, then any floor (new-joiner flow).

    Wrapped in a single transaction: check -> lock -> allocate -> commit.
    Guarded by both application checks AND the DB partial unique index (belt & braces).
    """
    employee = employee_repo.get_by_id(db, employee_id)
    if not employee:
        raise NotFoundException(f"Employee with id {employee_id} not found")

    # Rule: one employee can have only one active seat
    existing_allocation = allocation_repo.get_active_by_employee(db, employee_id)
    if existing_allocation:
        raise SeatUnavailableException(
            f"Employee '{employee.name}' already has an active seat allocation "
            f"(seat_id={existing_allocation.seat_id}). Release it first before reallocating."
        )

    used_fallback_zone = False

    if seat_id is not None:
        # Manual allocation — lock and validate the specific seat
        seat = seat_repo.get_by_id_for_update(db, seat_id)
        if not seat:
            raise NotFoundException(f"Seat with id {seat_id} not found")
        if seat.status != SeatStatus.AVAILABLE:
            raise SeatUnavailableException(
                f"Seat {seat.seat_number} (Floor {seat.floor}, Zone {seat.zone}) "
                f"is currently {seat.status.value} and cannot be allocated."
            )
    else:
        # Auto-suggest flow (new joiner)
        seat, used_fallback_zone = _find_best_seat_for_employee(db, employee)

    # Re-check under lock (defends against race condition between check and lock)
    active_check = allocation_repo.get_active_by_seat(db, seat.id)
    if active_check:
        raise SeatUnavailableException(f"Seat {seat.seat_number} was just allocated to someone else.")

    try:
        seat.status = SeatStatus.OCCUPIED
        db.add(seat)

        allocation = SeatAllocation(
            employee_id=employee.id,
            seat_id=seat.id,
            project_id=employee.project_id,
            allocation_status=AllocationStatus.ACTIVE,
        )
        allocation_repo.create(db, allocation)

        if employee.status == EmployeeStatus.PENDING_ALLOCATION:
            employee.status = EmployeeStatus.ACTIVE
            db.add(employee)

        db.commit()
        db.refresh(seat)
        db.refresh(allocation)

    except IntegrityError:
        # DB-level partial unique index caught a race condition the app checks missed
        db.rollback()
        raise SeatUnavailableException(
            "This seat or employee was allocated by another request at the same moment. Please retry."
        )

    return AllocationResultResponse(
        employee_id=employee.id,
        employee_name=employee.name,
        seat_id=seat.id,
        floor=seat.floor,
        zone=seat.zone,
        bay=seat.bay,
        seat_number=seat.seat_number,
        project_name=employee.project.name if employee.project else None,
        allocation_date=allocation.allocation_date,
        used_fallback_zone=used_fallback_zone,
    )


def _find_best_seat_for_employee(db: Session, employee: Employee) -> tuple[Seat, bool]:
    """
    Allocation priority order:
      1. Employee's project preferred floor + zone
      2. Same floor, any zone
      3. Any floor, any zone
    Returns (seat, used_fallback_zone).
    """
    project = employee.project

    # 1. Preferred floor + zone
    if project and project.preferred_floor is not None and project.preferred_zone:
        candidates = seat_repo.find_available_seats(
            db, floor=project.preferred_floor, zone=project.preferred_zone, limit=1
        )
        if candidates:
            return candidates[0], False

    # 2. Same floor, any zone
    if project and project.preferred_floor is not None:
        candidates = seat_repo.find_available_seats(db, floor=project.preferred_floor, limit=1)
        if candidates:
            return candidates[0], True

    # 3. Any floor, any zone
    candidates = seat_repo.find_available_seats(db, limit=1)
    if candidates:
        return candidates[0], True

    raise SeatUnavailableException(
        "No available seats found in any floor or zone. All seats are currently occupied, "
        "reserved, or under maintenance."
    )


def release_seat(db: Session, employee_id: int) -> dict:
    """Releases an employee's active seat, making it AVAILABLE again."""
    employee = employee_repo.get_by_id(db, employee_id)
    if not employee:
        raise NotFoundException(f"Employee with id {employee_id} not found")

    allocation = allocation_repo.get_active_by_employee(db, employee_id)
    if not allocation:
        raise NotFoundException(f"Employee '{employee.name}' has no active seat allocation to release")

    seat = seat_repo.get_by_id_for_update(db, allocation.seat_id)

    try:
        allocation_repo.release(db, allocation)
        seat.status = SeatStatus.AVAILABLE
        db.add(seat)
        db.commit()
        db.refresh(seat)
    except IntegrityError:
        db.rollback()
        raise ValidationException("Failed to release seat due to a conflicting update. Please retry.")

    return {
        "message": f"Seat {seat.seat_number} (Floor {seat.floor}, Zone {seat.zone}) released successfully.",
        "seat_id": seat.id,
        "employee_id": employee.id,
    }