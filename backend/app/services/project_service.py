from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.employee import Employee, EmployeeStatus
from app.models.seat import Seat
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.core.exceptions import NotFoundException, DuplicateException
from app.repositories import project_repo
from app.schemas.project import ProjectCreate, ProjectUpdate


def attach_stats(db: Session, projects: list[Project]) -> list[Project]:
    """Attach transient employee_count / allocated_seats / floor_count. Batched (no N+1)."""
    if not projects:
        return projects

    ids = [p.id for p in projects]

    emp_counts = dict(
        db.query(Employee.project_id, func.count(Employee.id))
        .filter(Employee.project_id.in_(ids), Employee.status != EmployeeStatus.INACTIVE)
        .group_by(Employee.project_id)
        .all()
    )

    seat_rows = (
        db.query(
            SeatAllocation.project_id,
            func.count(SeatAllocation.id),
            func.count(distinct(Seat.floor)),
        )
        .join(Seat, Seat.id == SeatAllocation.seat_id)
        .filter(
            SeatAllocation.project_id.in_(ids),
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
        )
        .group_by(SeatAllocation.project_id)
        .all()
    )
    seat_stats = {pid: (seats, floors) for pid, seats, floors in seat_rows}

    for p in projects:
        p.employee_count = emp_counts.get(p.id, 0)
        seats, floors = seat_stats.get(p.id, (0, 0))
        p.allocated_seats = seats
        p.floor_count = floors

    return projects


def create_project(db: Session, payload: ProjectCreate) -> Project:
    if project_repo.get_by_name(db, payload.name):
        raise DuplicateException(f"A project named '{payload.name}' already exists")

    project = Project(**payload.model_dump())
    return project_repo.create(db, project)


def get_project(db: Session, project_id: int) -> Project:
    project = project_repo.get_by_id(db, project_id)
    if not project:
        raise NotFoundException(f"Project with id {project_id} not found")
    attach_stats(db, [project])
    return project


def list_projects(db: Session, status=None, page: int = 1, page_size: int = 20):
    offset = (page - 1) * page_size
    items, total = project_repo.list_all(db, status=status, offset=offset, limit=page_size)
    attach_stats(db, items)
    return items, total


def update_project(db: Session, project_id: int, payload: ProjectUpdate) -> Project:
    project = get_project(db, project_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != project.name:
        if project_repo.get_by_name(db, update_data["name"]):
            raise DuplicateException(f"A project named '{update_data['name']}' already exists")

    return project_repo.update(db, project, update_data)


def delete_project(db: Session, project_id: int) -> Project:
    project = get_project(db, project_id)
    return project_repo.soft_delete(db, project)


def get_employees_in_project(db: Session, project_id: int):
    get_project(db, project_id)  # validates existence, raises 404 if not found
    from app.repositories import employee_repo
    from app.services import employee_service
    items, total = employee_repo.search(db, project_id=project_id, limit=1000)
    employee_service.attach_details(db, items)
    return items, total