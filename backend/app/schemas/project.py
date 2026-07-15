from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(None, max_length=500)
    manager_name: str | None = Field(None, max_length=100)
    preferred_floor: int | None = None
    preferred_zone: str | None = Field(None, max_length=20)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = None
    manager_name: str | None = None
    status: ProjectStatus | None = None
    preferred_floor: int | None = None
    preferred_zone: str | None = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ProjectStatus
    created_at: datetime

    # Enriched by project_service.attach_stats
    employee_count: int = 0
    allocated_seats: int = 0
    floor_count: int = 0


class ProjectListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ProjectResponse]