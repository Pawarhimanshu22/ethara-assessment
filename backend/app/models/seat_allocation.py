import enum
from datetime import datetime
from sqlalchemy import Enum, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class AllocationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RELEASED = "RELEASED"


class SeatAllocation(Base):
    """
    History table — every allocate/release creates or updates a row here.
    Partial unique indexes (below, applied via Alembic migration) enforce:
      - one ACTIVE allocation per employee
      - one ACTIVE allocation per seat
    This is what actually prevents duplicate/double allocation at the DB level.
    """
    __tablename__ = "seat_allocations"
    __table_args__ = (
        Index("ix_allocation_employee_status", "employee_id", "allocation_status"),
        Index("ix_allocation_seat_status", "seat_id", "allocation_status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    seat_id: Mapped[int] = mapped_column(ForeignKey("seats.id"), nullable=False)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)

    allocation_status: Mapped[AllocationStatus] = mapped_column(
        Enum(AllocationStatus), default=AllocationStatus.ACTIVE, nullable=False
    )

    allocation_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    released_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    employee = relationship("Employee", back_populates="allocations")
    seat = relationship("Seat", back_populates="allocations")
    project = relationship("Project", back_populates="allocations")