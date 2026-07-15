from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_hr_or_admin, get_current_user
from app.models.employee import EmployeeStatus, Employee
from app.schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse,
)
from app.schemas.common import MessageResponse
from app.services import employee_service

router = APIRouter(prefix="/api/v1/employees", tags=["Employees"])


@router.post("", response_model=EmployeeResponse, status_code=201, dependencies=[Depends(require_hr_or_admin)])
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(db, payload)


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    search: str | None = Query(None, description="Matches name, employee_code, or email"),
    project_id: int | None = Query(None),
    status: EmployeeStatus | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    items, total = employee_service.search_employees(
        db, search_term=search, project_id=project_id, status=status, page=page, page_size=page_size
    )
    return EmployeeListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    return employee_service.get_employee(db, employee_id)


@router.put("/{employee_id}", response_model=EmployeeResponse, dependencies=[Depends(require_hr_or_admin)])
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    return employee_service.update_employee(db, employee_id, payload)


@router.delete("/{employee_id}", response_model=MessageResponse, dependencies=[Depends(require_hr_or_admin)])
def deactivate_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = employee_service.deactivate_employee(db, employee_id)
    return MessageResponse(message=f"Employee '{employee.name}' deactivated successfully")