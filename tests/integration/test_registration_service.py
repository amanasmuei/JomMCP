#!/usr/bin/env python3
"""
Simple test registration service to verify end-to-end routing.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import uuid
from datetime import datetime

app = FastAPI(
    title="Test Registration Service",
    description="Simple test service for API Gateway testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict

class APIRegistration(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    base_url: str
    api_type: str
    created_at: str

# Mock data storage
mock_registrations = []
mock_users = {
    "admin": {"id": "1", "username": "admin", "email": "admin@example.com"},
    "test": {"id": "2", "username": "test", "email": "test@example.com"}
}

# Health check
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "test-registration-service"}

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Mock login endpoint."""
    if request.username in mock_users and request.password == "password":
        return LoginResponse(
            access_token=f"mock_access_token_{uuid.uuid4()}",
            refresh_token=f"mock_refresh_token_{uuid.uuid4()}",
            user=mock_users[request.username]
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@app.post("/api/v1/auth/refresh")
async def refresh_token(refresh_token: str):
    """Mock token refresh endpoint."""
    return {
        "access_token": f"mock_access_token_{uuid.uuid4()}",
        "refresh_token": f"mock_refresh_token_{uuid.uuid4()}"
    }

# Registration endpoints
@app.get("/api/v1/registrations", response_model=List[APIRegistration])
async def list_registrations():
    """List all API registrations."""
    return mock_registrations

@app.post("/api/v1/registrations", response_model=APIRegistration)
async def create_registration(registration: dict):
    """Create a new API registration."""
    new_registration = APIRegistration(
        id=str(uuid.uuid4()),
        name=registration.get("name", "Test API"),
        description=registration.get("description"),
        base_url=registration.get("base_url", "https://api.example.com"),
        api_type=registration.get("api_type", "rest"),
        created_at=datetime.utcnow().isoformat()
    )
    mock_registrations.append(new_registration)
    return new_registration

@app.get("/api/v1/registrations/{registration_id}", response_model=APIRegistration)
async def get_registration(registration_id: str):
    """Get a specific API registration."""
    for reg in mock_registrations:
        if reg.id == registration_id:
            return reg
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Registration not found"
    )

# User endpoints
@app.get("/api/v1/users/me")
async def get_current_user():
    """Get current user info."""
    return mock_users["admin"]  # Mock current user

if __name__ == "__main__":
    print("🚀 Starting Test Registration Service on port 8081")
    uvicorn.run(app, host="0.0.0.0", port=8081)
