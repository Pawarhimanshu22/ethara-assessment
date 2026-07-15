from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ai_query import AIQueryRequest, AIQueryResponse
from app.services import ai_service

router = APIRouter(prefix="/api/v1/ai", tags=["AI Assistant"])


@router.post("/query", response_model=AIQueryResponse)
def ai_query(payload: AIQueryRequest, db: Session = Depends(get_db)):
    return ai_service.answer_query(db, query=payload.query, email=payload.email)


@router.get("/examples", response_model=list[str])
def ai_examples(db: Session = Depends(get_db)):
    """Suggested prompt chips built from real seeded data so they always resolve."""
    return ai_service.example_queries(db)