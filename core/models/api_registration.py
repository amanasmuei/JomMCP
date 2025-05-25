"""
API Registration model and related enums.
"""

import enum
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel


class APIType(str, enum.Enum):
    """API type enumeration."""
    
    REST = "rest"
    GRAPHQL = "graphql"
    SOAP = "soap"
    GRPC = "grpc"
    WEBSOCKET = "websocket"


class AuthenticationType(str, enum.Enum):
    """Authentication type enumeration."""
    
    NONE = "none"
    API_KEY = "api_key"
    BEARER_TOKEN = "bearer_token"
    BASIC_AUTH = "basic_auth"
    OAUTH2 = "oauth2"
    CUSTOM = "custom"


class APIRegistration(BaseModel):
    """API registration model for storing API configurations."""
    
    __tablename__ = "api_registrations"
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    base_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False
    )
    
    api_type: Mapped[APIType] = mapped_column(
        Enum(APIType),
        nullable=False
    )
    
    authentication_type: Mapped[AuthenticationType] = mapped_column(
        Enum(AuthenticationType),
        default=AuthenticationType.NONE,
        nullable=False
    )
    
    # Encrypted authentication credentials
    encrypted_credentials: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # API specification (OpenAPI, GraphQL schema, etc.)
    specification: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Additional configuration options
    configuration: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict
    )
    
    # Health check configuration
    health_check_url: Mapped[Optional[str]] = mapped_column(
        String(2048),
        nullable=True
    )
    
    health_check_interval_seconds: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        default=300  # 5 minutes
    )
    
    # Owner relationship
    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="api_registrations")
    mcp_servers: Mapped[list["MCPServer"]] = relationship(
        "MCPServer", 
        back_populates="api_registration",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<APIRegistration(name='{self.name}', type='{self.api_type}', url='{self.base_url}')>"
