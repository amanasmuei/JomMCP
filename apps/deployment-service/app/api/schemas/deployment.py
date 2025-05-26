"""
Deployment-related Pydantic schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from core.models.deployment import DeploymentStatus


class DeploymentCreateRequest(BaseModel):
    """Schema for deployment creation request."""
    
    mcp_server_id: UUID = Field(..., description="MCP server ID to deploy")
    name: str = Field(..., min_length=1, max_length=255, description="Deployment name")
    namespace: Optional[str] = Field(
        default="mcphub",
        max_length=255,
        description="Kubernetes namespace"
    )
    cpu_limit: Optional[str] = Field(
        default="500m",
        max_length=50,
        description="CPU limit (e.g., '500m', '1')"
    )
    memory_limit: Optional[str] = Field(
        default="512Mi",
        max_length=50,
        description="Memory limit (e.g., '512Mi', '1Gi')"
    )
    replicas: Optional[int] = Field(
        default=1,
        ge=1,
        le=10,
        description="Number of replicas"
    )
    port: Optional[int] = Field(
        default=8080,
        ge=1,
        le=65535,
        description="Container port"
    )
    environment_variables: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Environment variables"
    )
    deployment_config: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional deployment configuration"
    )
    health_check_path: Optional[str] = Field(
        default="/health",
        max_length=255,
        description="Health check endpoint path"
    )
    
    @validator("name")
    def validate_name(cls, v):
        """Validate deployment name."""
        if not v.strip():
            raise ValueError("Deployment name cannot be empty")
        # Kubernetes naming requirements
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Deployment name can only contain alphanumeric characters, hyphens, and underscores")
        return v.strip().lower()
    
    @validator("namespace")
    def validate_namespace(cls, v):
        """Validate Kubernetes namespace."""
        if v and not v.replace("-", "").isalnum():
            raise ValueError("Namespace can only contain alphanumeric characters and hyphens")
        return v.lower() if v else v


class DeploymentUpdateRequest(BaseModel):
    """Schema for deployment update request."""
    
    cpu_limit: Optional[str] = Field(None, max_length=50, description="CPU limit")
    memory_limit: Optional[str] = Field(None, max_length=50, description="Memory limit")
    environment_variables: Optional[Dict[str, str]] = Field(
        None,
        description="Environment variables"
    )
    deployment_config: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional deployment configuration"
    )
    health_check_path: Optional[str] = Field(
        None,
        max_length=255,
        description="Health check endpoint path"
    )


class DeploymentScaleRequest(BaseModel):
    """Schema for deployment scaling request."""
    
    replicas: int = Field(..., ge=0, le=10, description="Number of replicas")


class DeploymentResponse(BaseModel):
    """Schema for deployment response."""
    
    id: UUID
    name: str
    status: DeploymentStatus
    container_name: Optional[str]
    container_id: Optional[str]
    namespace: Optional[str]
    deployment_name: Optional[str]
    service_name: Optional[str]
    cpu_limit: Optional[str]
    memory_limit: Optional[str]
    replicas: int
    port: int
    external_url: Optional[str]
    environment_variables: Optional[Dict[str, str]]
    deployment_config: Optional[Dict[str, Any]]
    error_message: Optional[str]
    health_check_path: str
    mcp_server_id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DeploymentList(BaseModel):
    """Schema for deployment list."""
    
    items: List[DeploymentResponse]


class DeploymentLogsResponse(BaseModel):
    """Schema for deployment logs response."""
    
    deployment_id: UUID
    logs: str
    deployment_logs: Optional[str]


class DeploymentStatusResponse(BaseModel):
    """Schema for deployment status response."""
    
    deployment_id: UUID
    status: DeploymentStatus
    replicas: int
    ready_replicas: int
    available_replicas: int
    error_message: Optional[str]
    last_updated: datetime


class DeploymentMetricsResponse(BaseModel):
    """Schema for deployment metrics response."""
    
    deployment_id: UUID
    cpu_usage: Optional[float]
    memory_usage: Optional[float]
    network_in: Optional[float]
    network_out: Optional[float]
    request_count: Optional[int]
    error_rate: Optional[float]
    timestamp: datetime
