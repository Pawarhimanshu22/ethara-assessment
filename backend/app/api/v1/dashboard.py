from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.dashboard import DashboardSummary, ProjectUtilizationResponse, FloorUtilizationResponse
from app.services import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    return dashboard_service.get_summary(db)


@router.get("/project-utilization", response_model=ProjectUtilizationResponse)
def get_project_utilization(db: Session = Depends(get_db)):
    return dashboard_service.get_project_utilization(db)


@router.get("/floor-utilization", response_model=FloorUtilizationResponse)
def get_floor_utilization(db: Session = Depends(get_db)):
    return dashboard_service.get_floor_utilization(db)