"""
API Registration-related Pydantic schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, validator

from core.models.api_registration import APIType, AuthenticationType


class APIRegistrationCreate(BaseModel):
    """Schema for creating API registration."""
    
    name: str = Field(..., min_length=1, max_length=255, description="API name")
    description: Optional[str] = Field(None, description="API description")
    base_url: HttpUrl = Field(..., description="Base URL of the API")
    api_type: APIType = Field(..., description="Type of API")
    authentication_type: AuthenticationType = Field(
        default=AuthenticationType.NONE,
        description="Authentication type"
    )
    credentials: Optional[Dict[str, str]] = Field(
        None,
        description="Authentication credentials (will be encrypted)"
    )
    specification: Optional[Dict[str, Any]] = Field(
        None,
        description="API specification (OpenAPI, GraphQL schema, etc.)"
    )
    configuration: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional configuration options"
    )
    health_check_url: Optional[HttpUrl] = Field(
        None,
        description="Health check endpoint URL"
    )
    health_check_interval_seconds: Optional[int] = Field(
        default=300,
        ge=60,
        le=3600,
        description="Health check interval in seconds"
    )
    
    @validator("name")
    def validate_name(cls, v):
        """Validate API name."""
        if not v.strip():
            raise ValueError("API name cannot be empty")
        return v.strip()
    
    @validator("credentials")
    def validate_credentials(cls, v, values):
        """Validate credentials based on authentication type."""
        auth_type = values.get("authentication_type")
        
        if auth_type == AuthenticationType.NONE:
            return None
        
        if not v:
            raise ValueError(f"Credentials required for authentication type: {auth_type}")
        
        # Validate required fields based on auth type
        if auth_type == AuthenticationType.API_KEY:
            if "api_key" not in v:
                raise ValueError("API key required for API_KEY authentication")
        elif auth_type == AuthenticationType.BEARER_TOKEN:
            if "token" not in v:
                raise ValueError("Token required for BEARER_TOKEN authentication")
        elif auth_type == AuthenticationType.BASIC_AUTH:
            if "username" not in v or "password" not in v:
                raise ValueError("Username and password required for BASIC_AUTH authentication")
        elif auth_type == AuthenticationType.OAUTH2:
            required_fields = ["client_id", "client_secret"]
            missing_fields = [field for field in required_fields if field not in v]
            if missing_fields:
                raise ValueError(f"Missing required OAuth2 fields: {missing_fields}")
        
        return v


class APIRegistrationUpdate(BaseModel):
    """Schema for updating API registration."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="API name")
    description: Optional[str] = Field(None, description="API description")
    base_url: Optional[HttpUrl] = Field(None, description="Base URL of the API")
    authentication_type: Optional[AuthenticationType] = Field(
        None,
        description="Authentication type"
    )
    credentials: Optional[Dict[str, str]] = Field(
        None,
        description="Authentication credentials (will be encrypted)"
    )
    specification: Optional[Dict[str, Any]] = Field(
        None,
        description="API specification (OpenAPI, GraphQL schema, etc.)"
    )
    configuration: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional configuration options"
    )
    health_check_url: Optional[HttpUrl] = Field(
        None,
        description="Health check endpoint URL"
    )
    health_check_interval_seconds: Optional[int] = Field(
        None,
        ge=60,
        le=3600,
        description="Health check interval in seconds"
    )


class APIRegistrationResponse(BaseModel):
    """Schema for API registration response."""
    
    id: UUID
    name: str
    description: Optional[str]
    base_url: str
    api_type: APIType
    authentication_type: AuthenticationType
    specification: Optional[Dict[str, Any]]
    configuration: Optional[Dict[str, Any]]
    health_check_url: Optional[str]
    health_check_interval_seconds: Optional[int]
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Note: credentials are not included in response for security
    
    class Config:
        from_attributes = True


class APIRegistrationList(BaseModel):
    """Schema for paginated API registration list."""
    
    items: List[APIRegistrationResponse]
    total: int
    page: int
    size: int
    pages: int


class APIValidationRequest(BaseModel):
    """Schema for API validation request."""
    
    base_url: HttpUrl = Field(..., description="Base URL to validate")
    authentication_type: AuthenticationType = Field(
        default=AuthenticationType.NONE,
        description="Authentication type"
    )
    credentials: Optional[Dict[str, str]] = Field(
        None,
        description="Authentication credentials"
    )
    timeout_seconds: Optional[int] = Field(
        default=30,
        ge=5,
        le=120,
        description="Validation timeout in seconds"
    )


class APIValidationResponse(BaseModel):
    """Schema for API validation response."""
    
    is_valid: bool
    status_code: Optional[int]
    response_time_ms: Optional[float]
    error_message: Optional[str]
    detected_api_type: Optional[APIType]
    specification: Optional[Dict[str, Any]]
