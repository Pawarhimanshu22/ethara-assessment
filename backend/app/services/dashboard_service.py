from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.employee import Employee, EmployeeStatus
from app.models.seat import Seat, SeatStatus
from app.models.project import Project
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.schemas.dashboard import (
    DashboardSummary, ProjectUtilization, ProjectUtilizationResponse,
    FloorUtilization, FloorUtilizationResponse,
)


def get_summary(db: Session) -> DashboardSummary:
    total_employees = db.query(Employee).count()
    total_seats = db.query(Seat).count()
    occupied = db.query(Seat).filter(Seat.status == SeatStatus.OCCUPIED).count()
    available = db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE).count()
    reserved = db.query(Seat).filter(Seat.status == SeatStatus.RESERVED).count()
    maintenance = db.query(Seat).filter(Seat.status == SeatStatus.MAINTENANCE).count()
    pending = db.query(Employee).filter(Employee.status == EmployeeStatus.PENDING_ALLOCATION).count()

    return DashboardSummary(
        total_employees=total_employees,
        total_seats=total_seats,
        occupied_seats=occupied,
        available_seats=available,
        reserved_seats=reserved,
        maintenance_seats=maintenance,
        pending_new_joiners=pending,
    )


def get_project_utilization(db: Session) -> ProjectUtilizationResponse:
    # Total employees per project
    employee_counts = dict(
        db.query(Employee.project_id, func.count(Employee.id))
        .filter(Employee.project_id.isnot(None))
        .group_by(Employee.project_id)
        .all()
    )

    # Active seats occupied per project (via active allocations)
    seat_counts = dict(
        db.query(SeatAllocation.project_id, func.count(SeatAllocation.id))
        .filter(SeatAllocation.allocation_status == AllocationStatus.ACTIVE)
        .filter(SeatAllocation.project_id.isnot(None))
        .group_by(SeatAllocation.project_id)
        .all()
    )

    projects = db.query(Project).all()
    items = [
        ProjectUtilization(
            project_id=p.id,
            project_name=p.name,
            total_employees=employee_counts.get(p.id, 0),
            seats_occupied=seat_counts.get(p.id, 0),
        )
        for p in projects
    ]
    return ProjectUtilizationResponse(items=items)


def get_floor_utilization(db: Session) -> FloorUtilizationResponse:
    floors = [row[0] for row in db.query(Seat.floor).distinct().order_by(Seat.floor).all()]

    items = []
    for floor in floors:
        total = db.query(Seat).filter(Seat.floor == floor).count()
        occupied = db.query(Seat).filter(Seat.floor == floor, Seat.status == SeatStatus.OCCUPIED).count()
        available = db.query(Seat).filter(Seat.floor == floor, Seat.status == SeatStatus.AVAILABLE).count()
        reserved = db.query(Seat).filter(Seat.floor == floor, Seat.status == SeatStatus.RESERVED).count()
        maintenance = db.query(Seat).filter(Seat.floor == floor, Seat.status == SeatStatus.MAINTENANCE).count()

        occupancy_pct = round((occupied / total * 100), 2) if total > 0 else 0.0

        items.append(FloorUtilization(
            floor=floor, total_seats=total, occupied=occupied,
            available=available, reserved=reserved, maintenance=maintenance,
            occupancy_percentage=occupancy_pct,
        ))

    return FloorUtilizationResponse(items=items)