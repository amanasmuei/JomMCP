"""
API v1 package for the documentation service.
"""

from fastapi import APIRouter

from .documentation import router as docs_router

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(docs_router, prefix="/docs", tags=["documentation"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "docs-service"}
