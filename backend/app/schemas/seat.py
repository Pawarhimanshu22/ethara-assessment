from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.seat import SeatStatus


class SeatBase(BaseModel):
    floor: int = Field(..., ge=0, le=100)
    zone: str = Field(..., min_length=1, max_length=20)
    bay: str | None = Field(None, max_length=20)
    seat_number: str = Field(..., min_length=1, max_length=20)


class SeatCreate(SeatBase):
    status: SeatStatus = SeatStatus.AVAILABLE


class SeatUpdate(BaseModel):
    status: SeatStatus | None = None
    bay: str | None = None


class SeatResponse(SeatBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: SeatStatus
    created_at: datetime


class SeatWithOccupantResponse(SeatResponse):
    """Used in Seats page grid — shows who's sitting there, if occupied."""
    model_config = ConfigDict(from_attributes=True)

    employee_id: int | None = None
    employee_name: str | None = None
    project_name: str | None = None


class SeatListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[SeatWithOccupantResponse]