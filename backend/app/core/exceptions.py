from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError


class EtharaException(Exception):
    """Base exception for all custom app errors."""
    def __init__(self, message: str, status_code: int = 400, error_code: str = "BAD_REQUEST"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)


class NotFoundException(EtharaException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404, error_code="NOT_FOUND")


class DuplicateException(EtharaException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=409, error_code="DUPLICATE")


class SeatUnavailableException(EtharaException):
    def __init__(self, message: str = "Seat is not available for allocation"):
        super().__init__(message, status_code=409, error_code="SEAT_UNAVAILABLE")


class ValidationException(EtharaException):
    def __init__(self, message: str = "Invalid input"):
        super().__init__(message, status_code=422, error_code="VALIDATION_ERROR")


class UnauthorizedException(EtharaException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status_code=401, error_code="UNAUTHORIZED")


class ForbiddenException(EtharaException):
    def __init__(self, message: str = "You don't have permission to perform this action"):
        super().__init__(message, status_code=403, error_code="FORBIDDEN")


def _error_response(status_code: int, error_code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error_code": error_code, "message": message},
    )


async def ethara_exception_handler(request: Request, exc: EtharaException) -> JSONResponse:
    return _error_response(exc.status_code, exc.error_code, exc.message)


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    # Catches DB-level unique constraint violations (e.g. race condition on seat allocation
    # that slips past app-level checks) and turns the raw Postgres error into a clean response.
    return _error_response(
        409, "INTEGRITY_ERROR",
        "This operation conflicts with existing data (possible duplicate or already allocated).",
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(loc) for loc in first_error.get("loc", []) if loc != "body")
    message = f"{field}: {first_error.get('msg', 'Invalid input')}" if field else "Invalid input"
    return _error_response(422, "VALIDATION_ERROR", message)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred.")


def register_exception_handlers(app):
    app.add_exception_handler(EtharaException, ethara_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)