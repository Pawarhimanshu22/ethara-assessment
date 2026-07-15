from sqlalchemy.orm import Session
from app.models.project import Project, ProjectStatus


def get_by_id(db: Session, project_id: int) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


def get_by_name(db: Session, name: str) -> Project | None:
    return db.query(Project).filter(Project.name == name).first()


def list_all(
    db: Session,
    status: ProjectStatus | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Project], int]:
    query = db.query(Project)
    if status is not None:
        query = query.filter(Project.status == status)

    total = query.count()
    items = query.order_by(Project.name).offset(offset).limit(limit).all()
    return items, total


def create(db: Session, project: Project) -> Project:
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update(db: Session, project: Project, update_data: dict) -> Project:
    for field, value in update_data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def soft_delete(db: Session, project: Project) -> Project:
    project.status = ProjectStatus.CLOSED
    db.commit()
    db.refresh(project)
    return project