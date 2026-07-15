from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_employees: int
    total_seats: int
    occupied_seats: int
    available_seats: int
    reserved_seats: int
    maintenance_seats: int
    pending_new_joiners: int


class ProjectUtilization(BaseModel):
    project_id: int
    project_name: str
    total_employees: int
    seats_occupied: int


class ProjectUtilizationResponse(BaseModel):
    items: list[ProjectUtilization]


class FloorUtilization(BaseModel):
    floor: int
    total_seats: int
    occupied: int
    available: int
    reserved: int
    maintenance: int
    occupancy_percentage: float


class FloorUtilizationResponse(BaseModel):
    items: list[FloorUtilization]