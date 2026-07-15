from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_hr_or_admin
from app.models.project import ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.schemas.employee import EmployeeResponse
from app.schemas.common import MessageResponse
from app.services import project_service

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=201, dependencies=[Depends(require_hr_or_admin)])
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    return project_service.create_project(db, payload)


@router.get("", response_model=ProjectListResponse)
def list_projects(
    status: ProjectStatus | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    items, total = project_service.list_projects(db, status=status, page=page, page_size=page_size)
    return ProjectListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return project_service.get_project(db, project_id)


@router.get("/{project_id}/employees", response_model=list[EmployeeResponse])
def get_project_employees(project_id: int, db: Session = Depends(get_db)):
    items, _ = project_service.get_employees_in_project(db, project_id)
    return items


@router.put("/{project_id}", response_model=ProjectResponse, dependencies=[Depends(require_hr_or_admin)])
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    return project_service.update_project(db, project_id, payload)


@router.delete("/{project_id}", response_model=MessageResponse, dependencies=[Depends(require_hr_or_admin)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = project_service.delete_project(db, project_id)
    return MessageResponse(message=f"Project '{project.name}' closed successfully")