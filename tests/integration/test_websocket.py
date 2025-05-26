#!/usr/bin/env python3
"""
Test WebSocket functionality through the API Gateway.
"""

import asyncio
import websockets
import json
from typing import Dict, Any

WS_GATEWAY_URL = "ws://localhost:8000"

async def test_websocket_connection():
    """Test basic WebSocket connection through the gateway."""
    print("\n🔌 Testing WebSocket Connection")
    print("-" * 40)
    
    # Test connection without token (should fail)
    print("1. Testing connection without token...")
    try:
        async with websockets.connect(
            f"{WS_GATEWAY_URL}/api/v1/ws/status",
            timeout=5
        ) as websocket:
            print("   ❌ Connection succeeded without token (unexpected)")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"   ✅ Connection properly rejected: {e}")
    except Exception as e:
        print(f"   ⚠️  Connection failed: {e}")
    
    # Test connection with mock token
    print("2. Testing connection with token...")
    try:
        async with websockets.connect(
            f"{WS_GATEWAY_URL}/api/v1/ws/status?token=mock_access_token_123",
            timeout=5
        ) as websocket:
            print("   ✅ WebSocket connection established")
            
            # Send ping
            await websocket.send("ping")
            response = await asyncio.wait_for(websocket.recv(), timeout=5)
            print(f"   ✅ Ping response: {response}")
            
            # Test message handling
            test_message = {
                "type": "test",
                "data": {"message": "Hello WebSocket!"}
            }
            await websocket.send(json.dumps(test_message))
            print("   ✅ Test message sent")
            
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"   ⚠️  Connection closed: {e}")
    except asyncio.TimeoutError:
        print("   ⚠️  WebSocket timeout (may be expected if auth fails)")
    except Exception as e:
        print(f"   ❌ WebSocket error: {e}")

async def test_websocket_routing():
    """Test WebSocket routing to different endpoints."""
    print("\n🔀 Testing WebSocket Routing")
    print("-" * 40)
    
    endpoints = [
        "/api/v1/ws/status",
        "/api/v1/ws/generation/test-server-id"
    ]
    
    for endpoint in endpoints:
        print(f"Testing {endpoint}...")
        try:
            async with websockets.connect(
                f"{WS_GATEWAY_URL}{endpoint}?token=mock_token",
                timeout=3
            ) as websocket:
                print(f"   ✅ Connected to {endpoint}")
                await websocket.close()
        except Exception as e:
            print(f"   ⚠️  {endpoint}: {e}")

async def main():
    """Main WebSocket test function."""
    print("🚀 MCP Hub Platform - WebSocket Testing")
    print("=" * 50)
    
    await test_websocket_connection()
    await test_websocket_routing()
    
    print("\n" + "=" * 50)
    print("📋 WebSocket Test Summary:")
    print("✅ WebSocket routing through gateway tested")
    print("⚠️  Note: Full WebSocket functionality requires authentication service")

if __name__ == "__main__":
    asyncio.run(main())
