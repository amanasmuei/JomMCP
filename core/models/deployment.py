"""
Deployment model and related enums.
"""

import enum
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel


class DeploymentStatus(str, enum.Enum):
    """Deployment status enumeration."""
    
    PENDING = "pending"
    DEPLOYING = "deploying"
    RUNNING = "running"
    SCALING = "scaling"
    UPDATING = "updating"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"
    ERROR = "error"


class Deployment(BaseModel):
    """Deployment model for MCP server deployments."""
    
    __tablename__ = "deployments"
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    status: Mapped[DeploymentStatus] = mapped_column(
        Enum(DeploymentStatus),
        default=DeploymentStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Container configuration
    container_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    container_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    # Kubernetes configuration
    namespace: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        default="default"
    )
    
    deployment_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    service_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    # Resource configuration
    cpu_limit: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        default="500m"
    )
    
    memory_limit: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        default="512Mi"
    )
    
    replicas: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )
    
    # Network configuration
    port: Mapped[int] = mapped_column(
        Integer,
        default=8080,
        nullable=False
    )
    
    external_url: Mapped[Optional[str]] = mapped_column(
        String(2048),
        nullable=True
    )
    
    # Environment variables and configuration
    environment_variables: Mapped[Optional[Dict[str, str]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict
    )
    
    # Deployment configuration
    deployment_config: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict
    )
    
    # Logs and monitoring
    deployment_logs: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Health check configuration
    health_check_path: Mapped[str] = mapped_column(
        String(255),
        default="/health",
        nullable=False
    )
    
    # MCP server relationship
    mcp_server_id: Mapped[UUID] = mapped_column(
        ForeignKey("mcp_servers.id"),
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
    mcp_server: Mapped["MCPServer"] = relationship(
        "MCPServer",
        back_populates="deployments"
    )
    owner: Mapped["User"] = relationship("User", back_populates="deployments")
    
    def __repr__(self) -> str:
        return f"<Deployment(name='{self.name}', status='{self.status}', replicas={self.replicas})>"
