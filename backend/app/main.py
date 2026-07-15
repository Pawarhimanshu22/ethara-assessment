from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.v1 import employees, projects, seats, dashboard, auth, ai

app = FastAPI(
    title="Ethara Seat Allocation & Project Mapping System",
    description="Backend API for employee, project, seat, and dashboard management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(projects.router)
app.include_router(seats.router)
app.include_router(dashboard.router)
app.include_router(ai.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}