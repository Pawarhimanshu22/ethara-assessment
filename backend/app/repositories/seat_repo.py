from sqlalchemy.orm import Session
from app.models.seat import Seat, SeatStatus


def get_by_id(db: Session, seat_id: int) -> Seat | None:
    return db.query(Seat).filter(Seat.id == seat_id).first()


def get_by_id_for_update(db: Session, seat_id: int) -> Seat | None:
    """
    SELECT ... FOR UPDATE — row-level lock used during allocation to prevent
    two concurrent requests from allocating the same seat (race condition guard,
    on top of the DB partial unique index).
    """
    return db.query(Seat).filter(Seat.id == seat_id).with_for_update().first()


def search(
    db: Session,
    floor: int | None = None,
    zone: str | None = None,
    status: SeatStatus | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Seat], int]:
    query = db.query(Seat)

    if floor is not None:
        query = query.filter(Seat.floor == floor)
    if zone is not None:
        query = query.filter(Seat.zone == zone)
    if status is not None:
        query = query.filter(Seat.status == status)

    total = query.count()
    items = query.order_by(Seat.floor, Seat.zone, Seat.seat_number).offset(offset).limit(limit).all()
    return items, total


def find_available_seats(
    db: Session,
    floor: int | None = None,
    zone: str | None = None,
    limit: int = 10,
) -> list[Seat]:
    """Used by allocation algorithm — narrows to floor/zone first, caller widens if empty."""
    query = db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE)

    if floor is not None:
        query = query.filter(Seat.floor == floor)
    if zone is not None:
        query = query.filter(Seat.zone == zone)

    return query.order_by(Seat.seat_number).limit(limit).all()


def create(db: Session, seat: Seat) -> Seat:
    db.add(seat)
    db.commit()
    db.refresh(seat)
    return seat


def update_status(db: Session, seat: Seat, status: SeatStatus) -> Seat:
    seat.status = status
    db.commit()
    db.refresh(seat)
    return seat


def count_by_status(db: Session, status: SeatStatus) -> int:
    return db.query(Seat).filter(Seat.status == status).count()


def count_all(db: Session) -> int:
    return db.query(Seat).count()