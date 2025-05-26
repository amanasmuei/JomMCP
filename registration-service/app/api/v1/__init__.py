"""
API v1 package for the registration service.
"""

from fastapi import APIRouter

from .auth import router as auth_router
from .registrations import router as registrations_router
from .users import router as users_router

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(
    registrations_router, prefix="/registrations", tags=["registrations"]
)


# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "registration-service"}
