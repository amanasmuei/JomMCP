"""
WebSocket utilities for real-time updates.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from .security import verify_token

logger = structlog.get_logger()


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[UUID, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: UUID, connection_id: str):
        """
        Accept a WebSocket connection.

        Args:
            websocket: WebSocket connection
            user_id: User ID
            connection_id: Unique connection ID
        """
        await websocket.accept()

        # Add to active connections
        if connection_id not in self.active_connections:
            self.active_connections[connection_id] = []
        self.active_connections[connection_id].append(websocket)

        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

        logger.info("WebSocket connected", user_id=user_id, connection_id=connection_id)

    def disconnect(self, websocket: WebSocket, user_id: UUID, connection_id: str):
        """
        Remove a WebSocket connection.

        Args:
            websocket: WebSocket connection
            user_id: User ID
            connection_id: Unique connection ID
        """
        # Remove from active connections
        if connection_id in self.active_connections:
            if websocket in self.active_connections[connection_id]:
                self.active_connections[connection_id].remove(websocket)
            if not self.active_connections[connection_id]:
                del self.active_connections[connection_id]

        # Remove from user connections
        if user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

        logger.info(
            "WebSocket disconnected", user_id=user_id, connection_id=connection_id
        )

    async def send_personal_message(self, message: Dict[str, Any], user_id: UUID):
        """
        Send a message to a specific user.

        Args:
            message: Message to send
            user_id: Target user ID
        """
        if user_id in self.user_connections:
            message_str = json.dumps(message)
            disconnected_connections = []

            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.warning("Failed to send WebSocket message", error=str(e))
                    disconnected_connections.append(connection)

            # Remove disconnected connections
            for connection in disconnected_connections:
                self.user_connections[user_id].remove(connection)

    async def send_to_connection(self, message: Dict[str, Any], connection_id: str):
        """
        Send a message to a specific connection.

        Args:
            message: Message to send
            connection_id: Target connection ID
        """
        if connection_id in self.active_connections:
            message_str = json.dumps(message)
            disconnected_connections = []

            for connection in self.active_connections[connection_id]:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.warning("Failed to send WebSocket message", error=str(e))
                    disconnected_connections.append(connection)

            # Remove disconnected connections
            for connection in disconnected_connections:
                self.active_connections[connection_id].remove(connection)

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast a message to all connections.

        Args:
            message: Message to broadcast
        """
        message_str = json.dumps(message)

        for connections in self.active_connections.values():
            for connection in connections:
                try:
                    await connection.send_text(message_str)
                except Exception:
                    # Connection is probably closed, will be cleaned up later
                    pass


# Global connection manager instance
manager = ConnectionManager()


async def authenticate_websocket(websocket: WebSocket) -> Optional[UUID]:
    """
    Authenticate WebSocket connection using token.

    Args:
        websocket: WebSocket connection

    Returns:
        Optional[UUID]: User ID if authenticated, None otherwise
    """
    try:
        # Get token from query parameters
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="Missing authentication token")
            return None

        # Verify token
        payload = verify_token(token, token_type="access")
        if not payload:
            await websocket.close(code=4001, reason="Invalid authentication token")
            return None

        user_id = payload.get("user_id")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token payload")
            return None

        return UUID(user_id)

    except Exception as e:
        logger.error("WebSocket authentication failed", error=str(e))
        await websocket.close(code=4001, reason="Authentication failed")
        return None


async def send_status_update(
    user_id: UUID,
    resource_type: str,
    resource_id: str,
    status: str,
    message: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
):
    """
    Send a status update to a user.

    Args:
        user_id: Target user ID
        resource_type: Type of resource (e.g., 'mcp_server', 'deployment')
        resource_id: Resource ID
        status: New status
        message: Optional message
        data: Optional additional data
    """
    update_message = {
        "type": "status_update",
        "resource_type": resource_type,
        "resource_id": resource_id,
        "status": status,
        "message": message,
        "data": data,
        "timestamp": str(datetime.utcnow()),
    }

    await manager.send_personal_message(update_message, user_id)


async def send_log_update(
    user_id: UUID, resource_type: str, resource_id: str, log_type: str, logs: str
):
    """
    Send a log update to a user.

    Args:
        user_id: Target user ID
        resource_type: Type of resource
        resource_id: Resource ID
        log_type: Type of logs (e.g., 'generation', 'build', 'deployment')
        logs: Log content
    """
    log_message = {
        "type": "log_update",
        "resource_type": resource_type,
        "resource_id": resource_id,
        "log_type": log_type,
        "logs": logs,
        "timestamp": str(datetime.utcnow()),
    }

    await manager.send_personal_message(log_message, user_id)
