"""
MCP server generation-related Pydantic schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from core.models.mcp_server import MCPServerStatus


class MCPServerGenerationRequest(BaseModel):
    """Schema for MCP server generation request."""
    
    api_registration_id: UUID = Field(..., description="API registration ID")
    name: str = Field(..., min_length=1, max_length=255, description="MCP server name")
    description: Optional[str] = Field(None, description="MCP server description")
    mcp_config: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="MCP server configuration"
    )


class MCPServerResponse(BaseModel):
    """Schema for MCP server response."""
    
    id: UUID
    name: str
    description: Optional[str]
    status: MCPServerStatus
    generated_code_path: Optional[str]
    docker_image_name: Optional[str]
    docker_image_tag: Optional[str]
    mcp_config: Optional[Dict[str, Any]]
    error_message: Optional[str]
    api_registration_id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GenerationStatusResponse(BaseModel):
    """Schema for generation status response."""
    
    server_id: UUID
    status: MCPServerStatus
    generation_logs: Optional[str]
    build_logs: Optional[str]
    error_message: Optional[str]
    docker_image_name: Optional[str]
    docker_image_tag: Optional[str]


class MCPServerList(BaseModel):
    """Schema for MCP server list."""
    
    items: List[MCPServerResponse]


class TemplateInfo(BaseModel):
    """Schema for template information."""
    
    name: str
    description: str
    api_types: List[str]
    variables: List[str]


class TemplateListResponse(BaseModel):
    """Schema for template list response."""
    
    templates: List[TemplateInfo]


class CodeGenerationRequest(BaseModel):
    """Schema for code generation request."""
    
    template_name: str = Field(..., description="Template name to use")
    api_specification: Dict[str, Any] = Field(..., description="API specification")
    configuration: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Generation configuration"
    )


class CodeGenerationResponse(BaseModel):
    """Schema for code generation response."""
    
    success: bool
    generated_files: List[str]
    output_directory: str
    error_message: Optional[str]


class DockerBuildRequest(BaseModel):
    """Schema for Docker build request."""
    
    source_directory: str = Field(..., description="Source code directory")
    image_name: str = Field(..., description="Docker image name")
    image_tag: str = Field(default="latest", description="Docker image tag")
    build_args: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Docker build arguments"
    )


class DockerBuildResponse(BaseModel):
    """Schema for Docker build response."""
    
    success: bool
    image_name: str
    image_tag: str
    image_id: Optional[str]
    build_logs: str
    error_message: Optional[str]
