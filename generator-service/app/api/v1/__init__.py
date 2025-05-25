"""
API v1 package for the generator service.
"""

from fastapi import APIRouter

from .generation import router as generation_router
from .websocket import router as websocket_router

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(generation_router, prefix="/generation", tags=["generation"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websocket"])


# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "generator-service"}
