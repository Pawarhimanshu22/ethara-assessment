from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.employee import Employee, EmployeeStatus


def get_by_id(db: Session, employee_id: int) -> Employee | None:
    return db.query(Employee).filter(Employee.id == employee_id).first()


def get_by_email(db: Session, email: str) -> Employee | None:
    return db.query(Employee).filter(Employee.email == email).first()


def get_by_employee_code(db: Session, employee_code: str) -> Employee | None:
    return db.query(Employee).filter(Employee.employee_code == employee_code).first()


def search(
    db: Session,
    search_term: str | None = None,
    project_id: int | None = None,
    status: EmployeeStatus | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Employee], int]:
    """
    Search by name / employee_code / email (search_term matches any of these),
    optionally filtered by project or status. Returns (items, total_count).
    """
    query = db.query(Employee)

    if search_term:
        pattern = f"%{search_term.strip()}%"
        query = query.filter(
            or_(
                Employee.name.ilike(pattern),
                Employee.employee_code.ilike(pattern),
                Employee.email.ilike(pattern),
            )
        )

    if project_id is not None:
        query = query.filter(Employee.project_id == project_id)

    if status is not None:
        query = query.filter(Employee.status == status)

    total = query.count()
    items = query.order_by(Employee.id.desc()).offset(offset).limit(limit).all()
    return items, total


def create(db: Session, employee: Employee) -> Employee:
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update(db: Session, employee: Employee, update_data: dict) -> Employee:
    for field, value in update_data.items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee


def soft_delete(db: Session, employee: Employee) -> Employee:
    """Deactivate rather than hard-delete, per spec (DELETE /employees/{id} = 'Deactivate employee')."""
    employee.status = EmployeeStatus.INACTIVE
    db.commit()
    db.refresh(employee)
    return employee


def count_pending_allocation(db: Session) -> int:
    return db.query(Employee).filter(Employee.status == EmployeeStatus.PENDING_ALLOCATION).count()


def count_all(db: Session) -> int:
    return db.query(Employee).count()