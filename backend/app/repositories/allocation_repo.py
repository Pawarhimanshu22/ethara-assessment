from sqlalchemy.orm import Session
from app.models.seat_allocation import SeatAllocation, AllocationStatus


def get_active_by_employee(db: Session, employee_id: int) -> SeatAllocation | None:
    return (
        db.query(SeatAllocation)
        .filter(
            SeatAllocation.employee_id == employee_id,
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
        )
        .first()
    )


def get_active_by_seat(db: Session, seat_id: int) -> SeatAllocation | None:
    return (
        db.query(SeatAllocation)
        .filter(
            SeatAllocation.seat_id == seat_id,
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
        )
        .first()
    )


def create(db: Session, allocation: SeatAllocation) -> SeatAllocation:
    db.add(allocation)
    db.flush()  # flush (not commit) — allocation service controls the transaction boundary
    return allocation


def release(db: Session, allocation: SeatAllocation) -> SeatAllocation:
    from datetime import datetime, timezone
    allocation.allocation_status = AllocationStatus.RELEASED
    allocation.released_date = datetime.now(timezone.utc)
    db.flush()
    return allocation


def get_history_by_employee(db: Session, employee_id: int) -> list[SeatAllocation]:
    return (
        db.query(SeatAllocation)
        .filter(SeatAllocation.employee_id == employee_id)
        .order_by(SeatAllocation.allocation_date.desc())
        .all()
    )