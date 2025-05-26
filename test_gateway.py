#!/usr/bin/env python3
"""
Simplified API Gateway for testing routing fixes.
"""

import os
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import httpx
import uvicorn

app = FastAPI(
    title="MCP Hub Test API Gateway",
    description="Test gateway for routing fixes",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URL mappings
def get_service_urls():
    """Get service URLs based on environment."""
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "docker":
        return {
            "registration": "http://registration-service:8081",
            "generator": "http://generator-service:8082",
            "deployment": "http://deployment-service:8083",
            "docs": "http://docs-service:8084",
        }
    else:
        # Local development
        return {
            "registration": "http://localhost:8081",
            "generator": "http://localhost:8082",
            "deployment": "http://localhost:8083",
            "docs": "http://localhost:8084",
        }

SERVICE_URLS = get_service_urls()

async def proxy_request(request: Request, service_name: str, path: str = ""):
    """Proxy request to a microservice with improved error handling."""
    if service_name not in SERVICE_URLS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service '{service_name}' not found",
        )

    # Build target URL
    base_url = SERVICE_URLS[service_name]
    target_url = f"{base_url}/api/v1{path}"

    # Get HTTP method
    http_method = request.method

    # Prepare headers (forward auth and other important headers)
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ["host", "content-length"]:
            headers[key] = value

    # Get request body if present
    body = None
    if http_method.upper() in ["POST", "PUT", "PATCH"]:
        body = await request.body()

    # Get query parameters
    query_params = dict(request.query_params)

    try:
        # Make request to microservice with redirect handling
        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=False  # Handle redirects manually to avoid 307 issues
        ) as client:
            response = await client.request(
                method=http_method,
                url=target_url,
                headers=headers,
                content=body,
                params=query_params,
            )

        # Handle redirects manually
        if response.status_code in [301, 302, 307, 308]:
            location = response.headers.get("location")
            if location:
                print(f"Service returned redirect: {response.status_code} -> {location}")
                # For 307/308, preserve the original method and body
                if response.status_code in [307, 308]:
                    async with httpx.AsyncClient(timeout=30.0) as redirect_client:
                        redirect_response = await redirect_client.request(
                            method=http_method,
                            url=location,
                            headers=headers,
                            content=body,
                            params=query_params,
                        )
                        response = redirect_response

        # Filter response headers to avoid conflicts
        response_headers = {}
        for key, value in response.headers.items():
            # Skip headers that might cause issues
            if key.lower() not in [
                "content-encoding", "content-length", "transfer-encoding",
                "connection", "upgrade", "server"
            ]:
                response_headers[key] = value

        # Forward response
        return StreamingResponse(
            iter([response.content]),
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("content-type"),
        )

    except httpx.ConnectError as e:
        print(f"Service connection failed: {service_name} - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service '{service_name}' is unavailable - connection failed",
        )
    except httpx.TimeoutException as e:
        print(f"Service request timeout: {service_name} - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Service '{service_name}' request timed out",
        )
    except httpx.RequestError as e:
        print(f"Service request failed: {service_name} - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service '{service_name}' is unavailable",
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Global health check endpoint."""
    return {"status": "healthy", "service": "test-api-gateway", "version": "1.0.0"}

# Registration Service Routes
@app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_proxy(request: Request, path: str):
    """Proxy authentication requests to registration service."""
    return await proxy_request(request, "registration", f"/auth/{path}")

@app.api_route("/api/v1/registrations", methods=["GET", "POST"])
async def registrations_root_proxy(request: Request):
    """Proxy API registration root requests to registration service."""
    return await proxy_request(request, "registration", "/registrations/")

@app.api_route("/api/v1/registrations/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def registrations_proxy(request: Request, path: str):
    """Proxy API registration requests to registration service."""
    return await proxy_request(request, "registration", f"/registrations/{path}")

# Generator Service Routes
@app.api_route("/api/v1/generation", methods=["GET", "POST"])
async def generation_root_proxy(request: Request):
    """Proxy generation root requests to generator service."""
    return await proxy_request(request, "generator", "/generation/")

@app.api_route("/api/v1/generation/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def generation_proxy(request: Request, path: str):
    """Proxy generation requests to generator service."""
    return await proxy_request(request, "generator", f"/generation/{path}")

# Deployment Service Routes
@app.api_route("/api/v1/deployments", methods=["GET", "POST"])
async def deployments_root_proxy(request: Request):
    """Proxy deployment root requests to deployment service."""
    return await proxy_request(request, "deployment", "/deployments/")

@app.api_route("/api/v1/deployments/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def deployments_proxy(request: Request, path: str):
    """Proxy deployment requests to deployment service."""
    return await proxy_request(request, "deployment", f"/deployments/{path}")

# Documentation Service Routes
@app.api_route("/api/v1/docs/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def docs_proxy(request: Request, path: str):
    """Proxy documentation requests to docs service."""
    return await proxy_request(request, "docs", f"/docs/{path}")

# Health check endpoints for individual services
@app.get("/api/v1/health/all")
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

if __name__ == "__main__":
    print("🚀 Starting Test API Gateway on port 8000")
    print("Environment:", os.getenv("ENVIRONMENT", "development"))
    print("Service URLs:", SERVICE_URLS)
    uvicorn.run(app, host="0.0.0.0", port=8000)
