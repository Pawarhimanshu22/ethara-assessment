from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class MessageResponse(BaseModel):
    """Generic success message wrapper — used for delete/release confirmations."""
    success: bool = True
    message: str