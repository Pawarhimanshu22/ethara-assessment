from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.seat_allocation import AllocationStatus


class AllocateSeatRequest(BaseModel):
    """Request to allocate a seat to an employee."""

    employee_id: int = Field(
        ...,
        gt=0,
        description="Unique ID of the employee.",
    )
    seat_id: int | None = Field(
        default=None,
        gt=0,
        description=(
            "Specific seat to allocate. If omitted, the system automatically "
            "suggests the best available seat based on the employee's project zone."
        ),
    )


class ReleaseSeatRequest(BaseModel):
    """Request to release an employee's currently allocated seat."""

    employee_id: int = Field(
        ...,
        gt=0,
        description="Unique ID of the employee whose seat should be released.",
    )


class AllocationResponse(BaseModel):
    """Basic seat allocation details."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    seat_id: int
    project_id: int | None
    allocation_status: AllocationStatus
    allocation_date: datetime
    released_date: datetime | None


class AllocationResultResponse(BaseModel):
    """Detailed response returned after a successful seat allocation."""

    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    employee_name: str
    seat_id: int
    floor: int
    zone: str
    bay: str | None
    seat_number: str
    project_name: str | None
    allocation_date: datetime
    used_fallback_zone: bool = Field(
        default=False,
        description=(
            "True if the employee's preferred zone had no available seats and "
            "the allocation was made in an alternate zone."
        ),
    )