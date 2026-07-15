from typing import Generator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise UnauthorizedException("Missing authentication token")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise UnauthorizedException("User no longer exists")

    return user


def require_roles(*allowed_roles: UserRole):
    """
    Usage in a route:
        @router.post("/", dependencies=[Depends(require_roles(UserRole.HR, UserRole.ADMIN))])
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"This action requires one of these roles: {', '.join(r.value for r in allowed_roles)}"
            )
        return current_user

    return role_checker


# Convenience shortcuts for common role checks
require_admin = require_roles(UserRole.ADMIN)
require_hr_or_admin = require_roles(UserRole.HR, UserRole.ADMIN)