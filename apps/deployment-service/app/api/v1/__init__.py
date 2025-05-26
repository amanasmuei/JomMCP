"""
API v1 package for the deployment service.
"""

from fastapi import APIRouter

from .deployments import router as deployments_router

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(deployments_router, prefix="/deployments", tags=["deployments"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "deployment-service"}
