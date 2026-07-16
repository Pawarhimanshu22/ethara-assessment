from sqlalchemy.orm import Session
from app.models.employee import Employee, EmployeeStatus
from app.models.project import Project
from app.models.seat import Seat
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.core.exceptions import NotFoundException, DuplicateException, ValidationException
from app.repositories import employee_repo, project_repo
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def attach_details(db: Session, employees: list[Employee]) -> list[Employee]:
    """
    Attach transient project_name + current-seat fields onto each Employee so the
    EmployeeResponse schema can serialize them. Batched to avoid N+1 queries.
    """
    if not employees:
        return employees

    ids = [e.id for e in employees]
    project_ids = {e.project_id for e in employees if e.project_id is not None}

    project_names = (
        {pid: name for pid, name in db.query(Project.id, Project.name).filter(Project.id.in_(project_ids)).all()}
        if project_ids
        else {}
    )

    seat_rows = (
        db.query(SeatAllocation.employee_id, Seat)
        .join(Seat, Seat.id == SeatAllocation.seat_id)
        .filter(
            SeatAllocation.employee_id.in_(ids),
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
        )
        .all()
    )
    seat_by_emp = {emp_id: seat for emp_id, seat in seat_rows}

    for e in employees:
        e.project_name = project_names.get(e.project_id)
        seat = seat_by_emp.get(e.id)
        e.seat_number = seat.seat_number if seat else None
        e.seat_floor = seat.floor if seat else None
        e.seat_zone = seat.zone if seat else None
        e.seat_bay = seat.bay if seat else None

    return employees


def create_employee(db: Session, payload: EmployeeCreate) -> Employee:
    # Rule: duplicate employee email should not be allowed
    if employee_repo.get_by_email(db, payload.email):
        raise DuplicateException(f"An employee with email '{payload.email}' already exists")

    if employee_repo.get_by_employee_code(db, payload.employee_code):
        raise DuplicateException(f"Employee code '{payload.employee_code}' is already in use")

    if payload.project_id is not None:
        project = project_repo.get_by_id(db, payload.project_id)
        if not project:
            raise NotFoundException(f"Project with id {payload.project_id} not found")

    employee = Employee(
        employee_code=payload.employee_code,
        name=payload.name,
        email=payload.email,
        department=payload.department,
        role=payload.role,
        joining_date=payload.joining_date,
        project_id=payload.project_id,
        status=EmployeeStatus.PENDING_ALLOCATION,
    )
    return employee_repo.create(db, employee)


def get_employee(db: Session, employee_id: int) -> Employee:
    employee = employee_repo.get_by_id(db, employee_id)
    if not employee:
        raise NotFoundException(f"Employee with id {employee_id} not found")
    attach_details(db, [employee])
    return employee


def search_employees(
    db: Session,
    search_term: str | None,
    project_id: int | None,
    status: EmployeeStatus | None,
    page: int,
    page_size: int,
) -> tuple[list[Employee], int]:
    offset = (page - 1) * page_size
    items, total = employee_repo.search(
        db, search_term=search_term, project_id=project_id, status=status,
        offset=offset, limit=page_size,
    )
    attach_details(db, items)
    return items, total


def update_employee(db: Session, employee_id: int, payload: EmployeeUpdate) -> Employee:
    employee = get_employee(db, employee_id)

    update_data = payload.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != employee.email:
        if employee_repo.get_by_email(db, update_data["email"]):
            raise DuplicateException(f"Email '{update_data['email']}' is already in use by another employee")

    if "project_id" in update_data and update_data["project_id"] is not None:
        if not project_repo.get_by_id(db, update_data["project_id"]):
            raise NotFoundException(f"Project with id {update_data['project_id']} not found")

    return employee_repo.update(db, employee, update_data)


def delete_employee(db: Session, employee_id: int) -> str:
    """
    Hard-delete an employee. Frees their active seat first (so it becomes AVAILABLE again),
    then removes the employee and their allocation history. Returns the deleted name.
    Because the row is removed, the dashboard employee count drops immediately.
    """
    employee = get_employee(db, employee_id)

    from app.repositories import allocation_repo
    from app.services import seat_service

    active_allocation = allocation_repo.get_active_by_employee(db, employee_id)
    if active_allocation:
        # Release their seat first so it doesn't stay locked forever
        seat_service.release_seat(db, employee_id)

    name = employee.name
    employee_repo.delete(db, employee)
    return name