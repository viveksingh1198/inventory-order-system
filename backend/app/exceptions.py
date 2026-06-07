from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError):
        errors = exc.errors()
        message = errors[0]["msg"] if errors else "Validation error"
        return JSONResponse(status_code=400, content={"detail": message})

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(_: Request, exc: IntegrityError):
        message = str(exc.orig) if exc.orig else "Database integrity error"
        status_code = 409
        if "products_sku" in message or "sku" in message.lower():
            message = "Product SKU already exists"
        elif "customers_email" in message or "email" in message.lower():
            message = "Customer email already exists"
        elif "foreign key" in message.lower():
            message = "Referenced record does not exist or cannot be deleted"
            status_code = 409
        return JSONResponse(status_code=status_code, content={"detail": message})
