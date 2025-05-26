"""
Integration tests for the complete MCP Hub Platform workflow.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.user import User
from core.models.api_registration import APIRegistration, APIType, AuthenticationType
from core.models.mcp_server import MCPServer, MCPServerStatus


class TestCompleteWorkflow:
    """Test the complete workflow from API registration to deployment."""
    
    @pytest.mark.asyncio
    async def test_complete_workflow(
        self,
        db_session: AsyncSession,
        async_registration_client: AsyncClient,
        async_generator_client: AsyncClient,
        async_deployment_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test the complete workflow from API registration to MCP server deployment."""
        
        # Step 1: Register an API
        api_data = {
            "name": "Test API",
            "description": "A test API for integration testing",
            "base_url": "https://jsonplaceholder.typicode.com",
            "api_type": "rest",
            "authentication_type": "none",
            "health_check_url": "https://jsonplaceholder.typicode.com/posts/1",
            "health_check_interval_seconds": 300,
        }
        
        response = await async_registration_client.post(
            "/api/v1/registrations",
            json=api_data,
            headers=auth_headers,
        )
        assert response.status_code == 201
        registration_data = response.json()
        registration_id = registration_data["id"]
        
        # Verify registration was created
        assert registration_data["name"] == api_data["name"]
        assert registration_data["api_type"] == api_data["api_type"]
        assert registration_data["owner_id"] == str(test_user.id)
        
        # Step 2: Validate the API
        validation_data = {
            "base_url": api_data["base_url"],
            "authentication_type": api_data["authentication_type"],
            "timeout_seconds": 30,
        }
        
        response = await async_registration_client.post(
            "/api/v1/registrations/validate",
            json=validation_data,
            headers=auth_headers,
        )
        assert response.status_code == 200
        validation_result = response.json()
        assert validation_result["is_valid"] is True
        
        # Step 3: Generate MCP server
        generation_data = {
            "api_registration_id": registration_id,
            "name": "Test MCP Server",
            "description": "Generated MCP server for test API",
            "mcp_config": {
                "timeout": 30,
                "retry_attempts": 3,
            },
        }
        
        response = await async_generator_client.post(
            "/api/v1/generation",
            json=generation_data,
            headers=auth_headers,
        )
        assert response.status_code == 201
        mcp_server_data = response.json()
        mcp_server_id = mcp_server_data["id"]
        
        # Verify MCP server was created
        assert mcp_server_data["name"] == generation_data["name"]
        assert mcp_server_data["api_registration_id"] == registration_id
        assert mcp_server_data["status"] == "pending"
        assert mcp_server_data["owner_id"] == str(test_user.id)
        
        # Step 4: Check generation status
        response = await async_generator_client.get(
            f"/api/v1/generation/{mcp_server_id}/status",
            headers=auth_headers,
        )
        assert response.status_code == 200
        status_data = response.json()
        assert status_data["server_id"] == mcp_server_id
        
        # Step 5: List MCP servers
        response = await async_generator_client.get(
            "/api/v1/generation",
            headers=auth_headers,
        )
        assert response.status_code == 200
        servers_data = response.json()
        assert len(servers_data["items"]) == 1
        assert servers_data["items"][0]["id"] == mcp_server_id
        
        # Step 6: Create deployment (simulated - would normally wait for generation to complete)
        # For testing, we'll manually set the server to READY status
        mcp_server = await db_session.get(MCPServer, mcp_server_id)
        mcp_server.status = MCPServerStatus.READY
        mcp_server.docker_image_name = "test/mcp-server"
        mcp_server.docker_image_tag = "latest"
        await db_session.commit()
        
        deployment_data = {
            "mcp_server_id": mcp_server_id,
            "name": "test-deployment",
            "namespace": "mcphub-test",
            "cpu_limit": "500m",
            "memory_limit": "512Mi",
            "replicas": 1,
            "port": 8080,
            "environment_variables": {
                "ENV": "test",
                "LOG_LEVEL": "debug",
            },
            "health_check_path": "/health",
        }
        
        response = await async_deployment_client.post(
            "/api/v1/deployments",
            json=deployment_data,
            headers=auth_headers,
        )
        assert response.status_code == 201
        deployment_response = response.json()
        deployment_id = deployment_response["id"]
        
        # Verify deployment was created
        assert deployment_response["name"] == deployment_data["name"]
        assert deployment_response["mcp_server_id"] == mcp_server_id
        assert deployment_response["status"] == "pending"
        assert deployment_response["owner_id"] == str(test_user.id)
        
        # Step 7: List deployments
        response = await async_deployment_client.get(
            "/api/v1/deployments",
            headers=auth_headers,
        )
        assert response.status_code == 200
        deployments_data = response.json()
        assert len(deployments_data["items"]) == 1
        assert deployments_data["items"][0]["id"] == deployment_id
        
        # Step 8: Get deployment details
        response = await async_deployment_client.get(
            f"/api/v1/deployments/{deployment_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        deployment_details = response.json()
        assert deployment_details["id"] == deployment_id
        assert deployment_details["name"] == deployment_data["name"]
        
        # Step 9: Scale deployment
        scale_data = {"replicas": 3}
        response = await async_deployment_client.post(
            f"/api/v1/deployments/{deployment_id}/scale",
            json=scale_data,
            headers=auth_headers,
        )
        assert response.status_code == 200
        scaled_deployment = response.json()
        assert scaled_deployment["replicas"] == 3
        assert scaled_deployment["status"] == "scaling"
        
        # Step 10: Stop deployment
        response = await async_deployment_client.post(
            f"/api/v1/deployments/{deployment_id}/stop",
            headers=auth_headers,
        )
        assert response.status_code == 200
        
        # Step 11: Delete deployment
        response = await async_deployment_client.delete(
            f"/api/v1/deployments/{deployment_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
        
        # Step 12: Delete MCP server
        response = await async_generator_client.delete(
            f"/api/v1/generation/{mcp_server_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
        
        # Step 13: Delete API registration
        response = await async_registration_client.delete(
            f"/api/v1/registrations/{registration_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
        
        # Verify cleanup
        response = await async_registration_client.get(
            "/api/v1/registrations",
            headers=auth_headers,
        )
        assert response.status_code == 200
        registrations_data = response.json()
        assert registrations_data["total"] == 0


class TestAuthenticationFlow:
    """Test authentication and authorization flows."""
    
    @pytest.mark.asyncio
    async def test_user_registration_and_login(
        self,
        async_registration_client: AsyncClient,
    ):
        """Test user registration and login flow."""
        
        # Step 1: Register a new user
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePassword123!",
            "full_name": "New User",
        }
        
        response = await async_registration_client.post(
            "/api/v1/auth/register",
            json=user_data,
        )
        assert response.status_code == 201
        user_response = response.json()
        assert user_response["username"] == user_data["username"]
        assert user_response["email"] == user_data["email"]
        assert user_response["is_active"] is True
        
        # Step 2: Login with the new user
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"],
        }
        
        response = await async_registration_client.post(
            "/api/v1/auth/login",
            json=login_data,
        )
        assert response.status_code == 200
        token_response = response.json()
        assert "access_token" in token_response
        assert "refresh_token" in token_response
        assert token_response["token_type"] == "bearer"
        
        # Step 3: Use the access token to get user info
        headers = {"Authorization": f"Bearer {token_response['access_token']}"}
        response = await async_registration_client.get(
            "/api/v1/auth/me",
            headers=headers,
        )
        assert response.status_code == 200
        user_info = response.json()
        assert user_info["username"] == user_data["username"]
        
        # Step 4: Refresh the token
        refresh_data = {"refresh_token": token_response["refresh_token"]}
        response = await async_registration_client.post(
            "/api/v1/auth/refresh",
            json=refresh_data,
        )
        assert response.status_code == 200
        new_token_response = response.json()
        assert "access_token" in new_token_response
        assert "refresh_token" in new_token_response
        
        # Step 5: Logout
        response = await async_registration_client.post(
            "/api/v1/auth/logout",
            headers=headers,
        )
        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and edge cases."""
    
    @pytest.mark.asyncio
    async def test_unauthorized_access(
        self,
        async_registration_client: AsyncClient,
    ):
        """Test that unauthorized requests are properly rejected."""
        
        # Try to access protected endpoint without token
        response = await async_registration_client.get("/api/v1/registrations")
        assert response.status_code == 401
        
        # Try to access with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = await async_registration_client.get(
            "/api/v1/registrations",
            headers=headers,
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_invalid_api_registration(
        self,
        async_registration_client: AsyncClient,
        auth_headers: dict,
    ):
        """Test validation of invalid API registration data."""
        
        # Test missing required fields
        invalid_data = {
            "name": "",  # Empty name
            "base_url": "not-a-url",  # Invalid URL
            "api_type": "invalid_type",  # Invalid API type
        }
        
        response = await async_registration_client.post(
            "/api/v1/registrations",
            json=invalid_data,
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_resource_not_found(
        self,
        async_registration_client: AsyncClient,
        auth_headers: dict,
    ):
        """Test handling of non-existent resources."""
        
        # Try to get non-existent registration
        response = await async_registration_client.get(
            "/api/v1/registrations/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404
