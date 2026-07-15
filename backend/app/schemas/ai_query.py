from pydantic import BaseModel, Field


class AIQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    email: str | None = Field(None, description="Optional — used when query refers to 'my seat/project'")


class AIQueryResponse(BaseModel):
    answer: str
    intent_detected: str | None = None
    """e.g. 'find_seat', 'available_seats', 'project_utilization' — useful for debugging in demo"""