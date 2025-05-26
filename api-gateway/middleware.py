"""
Middleware for the API Gateway.
"""

import time
from typing import Dict, Optional
from collections import defaultdict, deque

from fastapi import Request, Response, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

from core.security import verify_token
from core.config import settings

logger = structlog.get_logger()
security = HTTPBearer(auto_error=False)


class AuthMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for API Gateway."""

    # Paths that don't require authentication
    EXEMPT_PATHS = {
        "/health",
        "/api/v1/health",
        "/api/v1/health/all",  # Service health aggregation
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/refresh",
        "/docs",
        "/redoc",
        "/openapi.json",
    }

    async def dispatch(self, request: Request, call_next):
        """
        Process authentication for incoming requests.

        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint

        Returns:
            Response: HTTP response
        """
        # Skip authentication for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)

        # Skip authentication for OPTIONS requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Extract authorization header
        authorization = request.headers.get("Authorization")
        if not authorization:
            return Response(
                content='{"error": "Missing authorization header"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json",
            )

        # Verify token format
        if not authorization.startswith("Bearer "):
            return Response(
                content='{"error": "Invalid authorization format"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json",
            )

        # Extract and verify token
        token = authorization.split(" ")[1]
        payload = verify_token(token, token_type="access")

        if not payload:
            return Response(
                content='{"error": "Invalid or expired token"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json",
            )

        # Add user info to request state
        request.state.user_id = payload.get("user_id")
        request.state.username = payload.get("username")

        return await call_next(request)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware for API Gateway."""

    def __init__(
        self, app, requests_per_minute: int = None, burst_capacity: int = None
    ):
        super().__init__(app)
        self.requests_per_minute = (
            requests_per_minute or settings.rate_limit_requests_per_minute
        )
        self.burst_capacity = burst_capacity or settings.rate_limit_burst_capacity

        # In-memory storage for rate limiting (use Redis in production)
        self.request_counts: Dict[str, deque] = defaultdict(deque)
        self.burst_counts: Dict[str, int] = defaultdict(int)

    async def dispatch(self, request: Request, call_next):
        """
        Process rate limiting for incoming requests.

        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint

        Returns:
            Response: HTTP response
        """
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/api/v1/health"]:
            return await call_next(request)

        # Get client identifier (IP address or user ID)
        client_id = self._get_client_id(request)
        current_time = time.time()

        # Clean old requests (older than 1 minute)
        self._clean_old_requests(client_id, current_time)

        # Check rate limits
        if self._is_rate_limited(client_id, current_time):
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                path=request.url.path,
                method=request.method,
            )
            return Response(
                content='{"error": "Rate limit exceeded"}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        # Record the request
        self.request_counts[client_id].append(current_time)
        self.burst_counts[client_id] += 1

        response = await call_next(request)

        # Add rate limit headers
        remaining = max(
            0, self.requests_per_minute - len(self.request_counts[client_id])
        )
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))

        return response

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier for rate limiting."""
        # Use user ID if authenticated, otherwise use IP address
        if hasattr(request.state, "user_id") and request.state.user_id:
            return f"user:{request.state.user_id}"

        # Get IP address from headers (considering proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"

        return f"ip:{request.client.host}"

    def _clean_old_requests(self, client_id: str, current_time: float):
        """Remove requests older than 1 minute."""
        cutoff_time = current_time - 60  # 1 minute ago

        while (
            self.request_counts[client_id]
            and self.request_counts[client_id][0] < cutoff_time
        ):
            self.request_counts[client_id].popleft()
            self.burst_counts[client_id] = max(0, self.burst_counts[client_id] - 1)

    def _is_rate_limited(self, client_id: str, current_time: float) -> bool:
        """Check if client is rate limited."""
        # Check per-minute limit
        if len(self.request_counts[client_id]) >= self.requests_per_minute:
            return True

        # Check burst capacity
        if self.burst_counts[client_id] >= self.burst_capacity:
            return True

        return False
