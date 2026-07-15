from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.EMPLOYEE
    employee_id: int | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: UserRole
    employee_id: int | None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse