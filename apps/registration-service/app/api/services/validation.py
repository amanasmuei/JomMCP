"""
API validation service for testing API endpoints.
"""

import json
import time
from typing import Any, Dict, Optional

import httpx
import structlog
from openapi_spec_validator import validate_spec
from openapi_spec_validator.exceptions import OpenAPISpecValidatorError

from core.models.api_registration import APIType, AuthenticationType
from ..schemas.registration import APIValidationRequest, APIValidationResponse

logger = structlog.get_logger()


class APIValidationService:
    """Service for validating API endpoints."""

    def __init__(self):
        self.timeout = 30

    async def validate_api(
        self, request: APIValidationRequest
    ) -> APIValidationResponse:
        """
        Validate an API endpoint.

        Args:
            request: API validation request

        Returns:
            APIValidationResponse: Validation results
        """
        start_time = time.time()

        try:
            # Prepare headers
            headers = {"User-Agent": "MCP-Hub-Validator/1.0"}

            # Add authentication headers
            if (
                request.authentication_type != AuthenticationType.NONE
                and request.credentials
            ):
                headers.update(
                    self._get_auth_headers(
                        request.authentication_type, request.credentials
                    )
                )

            # Make HTTP request
            async with httpx.AsyncClient(timeout=request.timeout_seconds) as client:
                response = await client.get(str(request.base_url), headers=headers)

                response_time_ms = (time.time() - start_time) * 1000

                # Basic validation - check if we get a response
                is_valid = response.status_code < 500

                # Try to detect API type and get specification
                detected_api_type, specification = await self._detect_api_type_and_spec(
                    client, str(request.base_url), headers
                )

                return APIValidationResponse(
                    is_valid=is_valid,
                    status_code=response.status_code,
                    response_time_ms=response_time_ms,
                    error_message=None if is_valid else f"HTTP {response.status_code}",
                    detected_api_type=detected_api_type,
                    specification=specification,
                )

        except httpx.TimeoutException:
            response_time_ms = (time.time() - start_time) * 1000
            return APIValidationResponse(
                is_valid=False,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message="Request timeout",
                detected_api_type=None,
                specification=None,
            )

        except httpx.RequestError as e:
            response_time_ms = (time.time() - start_time) * 1000
            return APIValidationResponse(
                is_valid=False,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message=f"Request error: {str(e)}",
                detected_api_type=None,
                specification=None,
            )

        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            logger.error("Unexpected error during API validation", error=str(e))
            return APIValidationResponse(
                is_valid=False,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message=f"Validation error: {str(e)}",
                detected_api_type=None,
                specification=None,
            )

    def _get_auth_headers(
        self, auth_type: AuthenticationType, credentials: Dict[str, str]
    ) -> Dict[str, str]:
        """
        Get authentication headers based on auth type and credentials.

        Args:
            auth_type: Authentication type
            credentials: Authentication credentials

        Returns:
            Dict[str, str]: Authentication headers
        """
        headers = {}

        if auth_type == AuthenticationType.API_KEY:
            api_key = credentials.get("api_key")
            header_name = credentials.get("header_name", "X-API-Key")
            if api_key:
                headers[header_name] = api_key

        elif auth_type == AuthenticationType.BEARER_TOKEN:
            token = credentials.get("token")
            if token:
                headers["Authorization"] = f"Bearer {token}"

        elif auth_type == AuthenticationType.BASIC_AUTH:
            username = credentials.get("username")
            password = credentials.get("password")
            if username and password:
                import base64

                credentials_str = f"{username}:{password}"
                encoded_credentials = base64.b64encode(
                    credentials_str.encode()
                ).decode()
                headers["Authorization"] = f"Basic {encoded_credentials}"

        return headers

    async def _detect_api_type_and_spec(
        self, client: httpx.AsyncClient, base_url: str, headers: Dict[str, str]
    ) -> tuple[Optional[APIType], Optional[Dict[str, Any]]]:
        """
        Try to detect API type and get specification.

        Args:
            client: HTTP client
            base_url: Base URL of the API
            headers: Request headers

        Returns:
            tuple: (detected_api_type, specification)
        """
        detected_type = None
        specification = None

        # Try to detect OpenAPI/REST API
        openapi_paths = [
            "/openapi.json",
            "/swagger.json",
            "/api-docs",
            "/docs/openapi.json",
            "/v1/openapi.json",
            "/api/v1/openapi.json",
        ]

        for path in openapi_paths:
            try:
                url = base_url.rstrip("/") + path
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    try:
                        spec = response.json()
                        # Validate OpenAPI spec
                        validate_spec(spec)
                        detected_type = APIType.REST
                        specification = spec
                        break
                    except (json.JSONDecodeError, OpenAPISpecValidatorError):
                        continue
            except Exception:
                continue

        # Try to detect GraphQL
        if not detected_type:
            try:
                graphql_url = base_url.rstrip("/") + "/graphql"
                introspection_query = {
                    "query": """
                    query IntrospectionQuery {
                        __schema {
                            queryType { name }
                            mutationType { name }
                            subscriptionType { name }
                        }
                    }
                    """
                }
                response = await client.post(
                    graphql_url,
                    json=introspection_query,
                    headers={**headers, "Content-Type": "application/json"},
                )
                if response.status_code == 200:
                    result = response.json()
                    if "data" in result and "__schema" in result["data"]:
                        detected_type = APIType.GRAPHQL
                        specification = result["data"]["__schema"]
            except Exception:
                pass

        # If no specific type detected but we got a successful response, assume REST
        if not detected_type:
            try:
                response = await client.get(base_url, headers=headers)
                if response.status_code < 400:
                    detected_type = APIType.REST
            except Exception:
                pass

        return detected_type, specification
