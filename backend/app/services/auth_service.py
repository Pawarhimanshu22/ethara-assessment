from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedException
from app.schemas.user import UserLogin, TokenResponse, UserResponse


def login(db: Session, credentials: UserLogin) -> TokenResponse:
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedException("Incorrect email or password")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )