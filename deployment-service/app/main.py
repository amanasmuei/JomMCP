"""
Main FastAPI application for the Deployment Service.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import create_tables

from .api.v1 import api_router
from .services.kubernetes_manager import KubernetesManager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    await create_tables()
    
    # Initialize Kubernetes manager
    k8s_manager = KubernetesManager()
    await k8s_manager.initialize()
    app.state.k8s_manager = k8s_manager
    
    yield
    
    # Shutdown
    if hasattr(app.state, 'k8s_manager'):
        await app.state.k8s_manager.cleanup()


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title="MCP Hub Deployment Service",
        description="Container orchestration and deployment management",
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
    
    # Include API routes
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    
    return app


# Create the application instance
app = create_app()
