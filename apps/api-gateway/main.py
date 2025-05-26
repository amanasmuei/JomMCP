"""
Main API Gateway for MCP Hub Platform.
Aggregates all microservices into a single API endpoint.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

from core.config import settings
from core.database import create_tables

from middleware import AuthMiddleware, RateLimitMiddleware
from routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    await create_tables()

    # Initialize HTTP client for service communication
    app.state.http_client = httpx.AsyncClient(timeout=30.0)

    yield

    # Shutdown
    await app.state.http_client.aclose()


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title="MCP Hub Platform API Gateway",
        description="Unified API gateway for the MCP Hub Platform microservices",
        version="1.0.0",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url=f"{settings.api_v1_prefix}/docs",
        redoc_url=f"{settings.api_v1_prefix}/redoc",
        lifespan=lifespan,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add custom middleware
    app.add_middleware(AuthMiddleware)
    app.add_middleware(RateLimitMiddleware)

    # Include API routes
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": (
                    str(exc) if settings.debug else "An unexpected error occurred"
                ),
            },
        )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Global health check endpoint."""
        return {"status": "healthy", "service": "api-gateway", "version": "1.0.0"}

    return app


# Create the application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
