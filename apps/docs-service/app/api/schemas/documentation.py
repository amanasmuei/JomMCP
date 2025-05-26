"""
Documentation service schemas.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentationGenerateRequest(BaseModel):
    """Request schema for generating documentation."""
    
    mcp_server_id: UUID = Field(..., description="MCP server ID")
    format: str = Field(default="markdown", description="Documentation format (markdown, html, json)")
    include_examples: bool = Field(default=True, description="Include API examples")
    include_schemas: bool = Field(default=True, description="Include data schemas")
    custom_sections: Optional[List[str]] = Field(default=None, description="Custom sections to include")


class DocumentationUpdateRequest(BaseModel):
    """Request schema for updating documentation."""
    
    format: Optional[str] = Field(None, description="Documentation format")
    include_examples: Optional[bool] = Field(None, description="Include API examples")
    include_schemas: Optional[bool] = Field(None, description="Include data schemas")
    custom_sections: Optional[List[str]] = Field(None, description="Custom sections to include")


class DocumentationResponse(BaseModel):
    """Response schema for documentation operations."""
    
    mcp_server_id: UUID = Field(..., description="MCP server ID")
    format: str = Field(..., description="Documentation format")
    status: str = Field(..., description="Generation status")
    message: Optional[str] = Field(None, description="Status message")
    url: Optional[str] = Field(None, description="Documentation URL")
    generated_at: Optional[datetime] = Field(None, description="Generation timestamp")
    
    class Config:
        from_attributes = True


class DocumentationList(BaseModel):
    """Response schema for listing documentation."""
    
    items: List[DocumentationResponse] = Field(..., description="List of documentation")
    total: int = Field(..., description="Total number of items")
    
    class Config:
        from_attributes = True


class DocumentationMetadata(BaseModel):
    """Documentation metadata schema."""
    
    title: str = Field(..., description="Documentation title")
    description: Optional[str] = Field(None, description="Documentation description")
    version: str = Field(..., description="API version")
    server_name: str = Field(..., description="MCP server name")
    api_type: str = Field(..., description="API type")
    base_url: str = Field(..., description="API base URL")
    generated_at: datetime = Field(..., description="Generation timestamp")
    
    class Config:
        from_attributes = True


class DocumentationSection(BaseModel):
    """Documentation section schema."""
    
    title: str = Field(..., description="Section title")
    content: str = Field(..., description="Section content")
    order: int = Field(..., description="Section order")
    subsections: Optional[List["DocumentationSection"]] = Field(default=None, description="Subsections")
    
    class Config:
        from_attributes = True


class APIEndpointDoc(BaseModel):
    """API endpoint documentation schema."""
    
    method: str = Field(..., description="HTTP method")
    path: str = Field(..., description="Endpoint path")
    summary: Optional[str] = Field(None, description="Endpoint summary")
    description: Optional[str] = Field(None, description="Endpoint description")
    parameters: Optional[List[dict]] = Field(default=None, description="Endpoint parameters")
    request_body: Optional[dict] = Field(None, description="Request body schema")
    responses: Optional[dict] = Field(default=None, description="Response schemas")
    examples: Optional[List[dict]] = Field(default=None, description="Usage examples")
    
    class Config:
        from_attributes = True


class DocumentationTemplate(BaseModel):
    """Documentation template schema."""
    
    name: str = Field(..., description="Template name")
    format: str = Field(..., description="Template format")
    content: str = Field(..., description="Template content")
    variables: Optional[List[str]] = Field(default=None, description="Template variables")
    
    class Config:
        from_attributes = True
