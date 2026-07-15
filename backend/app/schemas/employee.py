from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from app.models.employee import EmployeeStatus


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str | None = Field(None, max_length=100)
    role: str | None = Field(None, max_length=100)
    joining_date: date
    project_id: int | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be blank")
        return v.strip()


class EmployeeCreate(EmployeeBase):
    employee_code: str = Field(..., min_length=2, max_length=20)


class EmployeeUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None
    department: str | None = None
    role: str | None = None
    project_id: int | None = None
    status: EmployeeStatus | None = None


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_code: str
    status: EmployeeStatus
    created_at: datetime
    updated_at: datetime

    # Enriched by employee_service (None when no project / not allocated a seat)
    project_name: str | None = None
    seat_number: str | None = None
    seat_floor: int | None = None
    seat_zone: str | None = None
    seat_bay: str | None = None


class EmployeeWithSeatResponse(EmployeeResponse):
    """Kept for the AI assistant — same enriched shape as EmployeeResponse."""
    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EmployeeResponse]



    