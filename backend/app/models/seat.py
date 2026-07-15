import enum
from datetime import datetime
from sqlalchemy import String, Integer, Enum, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class SeatStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    RESERVED = "RESERVED"
    MAINTENANCE = "MAINTENANCE"


class Seat(Base):
    __tablename__ = "seats"
    __table_args__ = (
        # Prevents duplicate seat number within the same floor/zone
        UniqueConstraint("floor", "zone", "seat_number", name="uq_seat_floor_zone_number"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    floor: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    zone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    bay: Mapped[str | None] = mapped_column(String(20), nullable=True)
    seat_number: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[SeatStatus] = mapped_column(
        Enum(SeatStatus), default=SeatStatus.AVAILABLE, nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    allocations = relationship("SeatAllocation", back_populates="seat")