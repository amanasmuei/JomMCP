"""
API routes for the gateway that proxy to microservices.
"""

from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse
import httpx
import structlog

logger = structlog.get_logger()

api_router = APIRouter()

# Service URL mappings
SERVICE_URLS = {
    "registration": "http://registration-service:8081",
    "generator": "http://generator-service:8082",
    "deployment": "http://deployment-service:8083",
    "docs": "http://docs-service:8003",
}

# For local development
if True:  # Replace with environment check
    SERVICE_URLS = {
        "registration": "http://localhost:8081",
        "generator": "http://localhost:8082",
        "deployment": "http://localhost:8083",
        "docs": "http://localhost:8084",
    }


async def proxy_request(
    request: Request, service_name: str, path: str = "", method: str = None
) -> StreamingResponse:
    """
    Proxy request to a microservice.

    Args:
        request: FastAPI request object
        service_name: Target service name
        path: Additional path to append
        method: HTTP method override

    Returns:
        StreamingResponse: Proxied response
    """
    if service_name not in SERVICE_URLS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service '{service_name}' not found",
        )

    # Build target URL
    base_url = SERVICE_URLS[service_name]
    target_url = f"{base_url}/api/v1{path}"

    # Get HTTP method
    http_method = method or request.method

    # Prepare headers (forward auth and other important headers)
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ["host", "content-length"]:
            headers[key] = value

    # Add user information from gateway authentication
    if hasattr(request.state, "user_id") and request.state.user_id:
        headers["X-User-ID"] = str(request.state.user_id)
        headers["X-Username"] = str(request.state.username)
        headers["X-Gateway-Auth"] = "true"

    # Get request body if present
    body = None
    if http_method.upper() in ["POST", "PUT", "PATCH"]:
        body = await request.body()

    # Get query parameters
    query_params = dict(request.query_params)

    try:
        # Make request to microservice
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=http_method,
                url=target_url,
                headers=headers,
                content=body,
                params=query_params,
            )

        # Forward response
        return StreamingResponse(
            iter([response.content]),
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type"),
        )

    except httpx.RequestError as e:
        logger.error(
            "Service request failed", service=service_name, url=target_url, error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service '{service_name}' is unavailable",
        )


# Registration Service Routes
@api_router.api_route(
    "/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def auth_proxy(request: Request, path: str):
    """Proxy authentication requests to registration service."""
    return await proxy_request(request, "registration", f"/auth/{path}")


@api_router.api_route(
    "/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def users_proxy(request: Request, path: str):
    """Proxy user management requests to registration service."""
    return await proxy_request(request, "registration", f"/users/{path}")


@api_router.api_route("/registrations", methods=["GET", "POST"])
async def registrations_root_proxy(request: Request):
    """Proxy API registration root requests to registration service."""
    return await proxy_request(request, "registration", "/registrations/")


@api_router.api_route(
    "/registrations/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def registrations_proxy(request: Request, path: str):
    """Proxy API registration requests to registration service."""
    return await proxy_request(request, "registration", f"/registrations/{path}")


# Generator Service Routes
@api_router.api_route("/generation", methods=["GET", "POST"])
async def generation_root_proxy(request: Request):
    """Proxy generation root requests to generator service."""
    return await proxy_request(request, "generator", "/generation/")


@api_router.api_route(
    "/generation/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def generation_proxy(request: Request, path: str):
    """Proxy generation requests to generator service."""
    return await proxy_request(request, "generator", f"/generation/{path}")


# Deployment Service Routes
@api_router.api_route("/deployments", methods=["GET", "POST"])
async def deployments_root_proxy(request: Request):
    """Proxy deployment root requests to deployment service."""
    return await proxy_request(request, "deployment", "/deployments/")


@api_router.api_route(
    "/deployments/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def deployments_proxy(request: Request, path: str):
    """Proxy deployment requests to deployment service."""
    return await proxy_request(request, "deployment", f"/deployments/{path}")


# Documentation Service Routes
@api_router.api_route(
    "/docs/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def docs_proxy(request: Request, path: str):
    """Proxy documentation requests to docs service."""
    return await proxy_request(request, "docs", f"/docs/{path}")


# WebSocket Routes (these need special handling)
from fastapi import WebSocket, WebSocketDisconnect
from core.websocket import manager, authenticate_websocket


@api_router.websocket("/ws/generation/{server_id}")
async def websocket_generation_proxy(websocket: WebSocket, server_id: str):
    """WebSocket proxy for generation updates."""
    user_id = await authenticate_websocket(websocket)
    if not user_id:
        return

    connection_id = f"gateway_generation_{server_id}_{user_id}"

    try:
        await manager.connect(websocket, user_id, connection_id)

        await websocket.send_json(
            {
                "type": "connection_established",
                "server_id": server_id,
                "message": "Connected to generation updates via gateway",
            }
        )

        while True:
            try:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, user_id, connection_id)


@api_router.websocket("/ws/status")
async def websocket_status_proxy(websocket: WebSocket):
    """WebSocket proxy for global status updates."""
    user_id = await authenticate_websocket(websocket)
    if not user_id:
        return

    connection_id = f"gateway_status_{user_id}"

    try:
        await manager.connect(websocket, user_id, connection_id)

        await websocket.send_json(
            {
                "type": "connection_established",
                "message": "Connected to global status updates via gateway",
            }
        )

        while True:
            try:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, user_id, connection_id)


# Health check endpoints for individual services
@api_router.get("/health/registration")
async def registration_health():
    """Check registration service health."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SERVICE_URLS['registration']}/api/v1/health")
            return response.json()
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@api_router.get("/health/generator")
async def generator_health():
    """Check generator service health."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SERVICE_URLS['generator']}/api/v1/health")
            return response.json()
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@api_router.get("/health/deployment")
async def deployment_health():
    """Check deployment service health."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SERVICE_URLS['deployment']}/api/v1/health")
            return response.json()
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@api_router.get("/health/docs")
async def docs_health():
    """Check documentation service health."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SERVICE_URLS['docs']}/api/v1/health")
            return response.json()
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@api_router.get("/health/all")
async def all_services_health():
    """Check all services health."""
    services = ["registration", "generator", "deployment", "docs"]
    health_status = {}

    for service in services:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{SERVICE_URLS[service]}/api/v1/health")
                health_status[service] = response.json()
        except Exception as e:
            health_status[service] = {"status": "unhealthy", "error": str(e)}

    # Overall status
    all_healthy = all(
        service.get("status") == "healthy" for service in health_status.values()
    )

    return {
        "status": "healthy" if all_healthy else "degraded",
        "services": health_status,
    }
