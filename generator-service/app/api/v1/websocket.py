"""
WebSocket endpoints for real-time generation updates.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from uuid import uuid4

from core.websocket import manager, authenticate_websocket

router = APIRouter()


@router.websocket("/generation")
async def websocket_generation_updates(websocket: WebSocket):
    """
    WebSocket endpoint for real-time generation updates.
    
    Args:
        websocket: WebSocket connection
    """
    # Authenticate user
    user_id = await authenticate_websocket(websocket)
    if not user_id:
        return
    
    connection_id = f"generation_{uuid4()}"
    
    try:
        await manager.connect(websocket, user_id, connection_id)
        
        # Send welcome message
        await manager.send_to_connection({
            "type": "connected",
            "message": "Connected to generation updates",
            "connection_id": connection_id
        }, connection_id)
        
        # Keep connection alive
        while True:
            try:
                # Wait for messages from client (ping/pong)
                data = await websocket.receive_text()
                
                # Echo back for ping/pong
                if data == "ping":
                    await websocket.send_text("pong")
                    
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket, user_id, connection_id)
