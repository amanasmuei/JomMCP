"""
MCP Server model and related enums.
"""

import enum
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel


class MCPServerStatus(str, enum.Enum):
    """MCP Server status enumeration."""
    
    PENDING = "pending"
    GENERATING = "generating"
    BUILDING = "building"
    READY = "ready"
    DEPLOYING = "deploying"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    FAILED = "failed"


class MCPServer(BaseModel):
    """MCP Server model for generated server instances."""
    
    __tablename__ = "mcp_servers"
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    status: Mapped[MCPServerStatus] = mapped_column(
        Enum(MCPServerStatus),
        default=MCPServerStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Generated code information
    generated_code_path: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True
    )
    
    docker_image_name: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True
    )
    
    docker_image_tag: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True
    )
    
    # MCP server configuration
    mcp_config: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict
    )
    
    # Generation and build logs
    generation_logs: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    build_logs: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Error information
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # API registration relationship
    api_registration_id: Mapped[UUID] = mapped_column(
        ForeignKey("api_registrations.id"),
        nullable=False,
        index=True
    )
    
    # Owner relationship
    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    # Relationships
    api_registration: Mapped["APIRegistration"] = relationship(
        "APIRegistration", 
        back_populates="mcp_servers"
    )
    owner: Mapped["User"] = relationship("User", back_populates="mcp_servers")
    deployments: Mapped[list["Deployment"]] = relationship(
        "Deployment",
        back_populates="mcp_server",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<MCPServer(name='{self.name}', status='{self.status}')>"
