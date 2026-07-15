from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_hr_or_admin
from app.models.seat import SeatStatus
from app.schemas.seat import SeatCreate, SeatResponse, SeatListResponse
from app.schemas.seat_allocation import AllocateSeatRequest, ReleaseSeatRequest, AllocationResultResponse
from app.schemas.common import MessageResponse
from app.services import seat_service

router = APIRouter(prefix="/api/v1/seats", tags=["Seats"])


@router.post("", response_model=SeatResponse, status_code=201, dependencies=[Depends(require_hr_or_admin)])
def create_seat(payload: SeatCreate, db: Session = Depends(get_db)):
    return seat_service.create_seat(db, payload)


@router.get("", response_model=SeatListResponse)
def list_seats(
    floor: int | None = Query(None),
    zone: str | None = Query(None),
    status: SeatStatus | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=6000),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    items, total = seat_service.search_seats(db, floor=floor, zone=zone, status=status, offset=offset, limit=page_size)
    return SeatListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get("/available", response_model=list[SeatResponse])
def list_available_seats(
    floor: int | None = Query(None),
    zone: str | None = Query(None),
    limit: int = Query(50, ge=1, le=6000),
    db: Session = Depends(get_db),
):
    return seat_service.get_available_seats(db, floor=floor, zone=zone, limit=limit)


@router.post("/allocate", response_model=AllocationResultResponse, dependencies=[Depends(require_hr_or_admin)])
def allocate_seat(payload: AllocateSeatRequest, db: Session = Depends(get_db)):
    return seat_service.allocate_seat(db, employee_id=payload.employee_id, seat_id=payload.seat_id)


@router.post("/release", response_model=MessageResponse, dependencies=[Depends(require_hr_or_admin)])
def release_seat(payload: ReleaseSeatRequest, db: Session = Depends(get_db)):
    result = seat_service.release_seat(db, employee_id=payload.employee_id)
    return MessageResponse(message=result["message"])