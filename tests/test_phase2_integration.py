"""
Phase 2 Integration tests for the MCP Hub platform.
Tests the complete backend implementation including all services.
"""

import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import AsyncSessionLocal, create_tables, drop_tables
from core.models.user import User, UserRole
from core.models.api_registration import APIRegistration, APIType, AuthenticationType
from core.models.mcp_server import MCPServer, MCPServerStatus
from core.models.deployment import Deployment, DeploymentStatus
from core.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def setup_database():
    """Set up test database."""
    await create_tables()
    yield
    await drop_tables()


@pytest.fixture
async def db_session() -> AsyncSession:
    """Create a database session for testing."""
    async with AsyncSessionLocal() as session:
        yield session


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        is_active=True,
        is_verified=True,
        role=UserRole.USER
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create an admin user."""
    user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword"),
        full_name="Admin User",
        is_active=True,
        is_verified=True,
        role=UserRole.ADMIN
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    token = create_access_token({"user_id": str(test_user.id), "username": test_user.username})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_api_registration(db_session: AsyncSession, test_user: User) -> APIRegistration:
    """Create a test API registration."""
    registration = APIRegistration(
        name="Test API",
        description="A test API for integration testing",
        base_url="https://api.example.com",
        api_type=APIType.REST,
        authentication_type=AuthenticationType.API_KEY,
        specification={
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/users": {
                    "get": {
                        "summary": "Get users",
                        "responses": {"200": {"description": "Success"}}
                    }
                }
            }
        },
        owner_id=test_user.id
    )
    db_session.add(registration)
    await db_session.commit()
    await db_session.refresh(registration)
    return registration


@pytest.fixture
async def test_mcp_server(
    db_session: AsyncSession, 
    test_user: User, 
    test_api_registration: APIRegistration
) -> MCPServer:
    """Create a test MCP server."""
    mcp_server = MCPServer(
        name="Test MCP Server",
        description="A test MCP server",
        status=MCPServerStatus.READY,
        docker_image_name="test/mcp-server",
        docker_image_tag="latest",
        mcp_config={"test": "config"},
        api_registration_id=test_api_registration.id,
        owner_id=test_user.id
    )
    db_session.add(mcp_server)
    await db_session.commit()
    await db_session.refresh(mcp_server)
    return mcp_server


class TestPhase2Backend:
    """Test Phase 2 backend implementation."""
    
    @pytest.mark.asyncio
    async def test_database_models_and_relationships(
        self,
        setup_database,
        db_session: AsyncSession,
        test_user: User,
        test_api_registration: APIRegistration,
        test_mcp_server: MCPServer
    ):
        """Test all database models and their relationships."""
        
        # Test User model
        assert test_user.username == "testuser"
        assert test_user.role == UserRole.USER
        assert test_user.is_active is True
        
        # Test API Registration model
        assert test_api_registration.name == "Test API"
        assert test_api_registration.api_type == APIType.REST
        assert test_api_registration.owner_id == test_user.id
        
        # Test MCP Server model
        assert test_mcp_server.name == "Test MCP Server"
        assert test_mcp_server.status == MCPServerStatus.READY
        assert test_mcp_server.api_registration_id == test_api_registration.id
        assert test_mcp_server.owner_id == test_user.id
        
        # Test relationships
        await db_session.refresh(test_user, ["api_registrations", "mcp_servers"])
        assert len(test_user.api_registrations) == 1
        assert len(test_user.mcp_servers) == 1
        assert test_user.api_registrations[0].id == test_api_registration.id
        assert test_user.mcp_servers[0].id == test_mcp_server.id
        
        await db_session.refresh(test_api_registration, ["mcp_servers"])
        assert len(test_api_registration.mcp_servers) == 1
        assert test_api_registration.mcp_servers[0].id == test_mcp_server.id
    
    @pytest.mark.asyncio
    async def test_deployment_model_and_relationships(
        self,
        setup_database,
        db_session: AsyncSession,
        test_user: User,
        test_mcp_server: MCPServer
    ):
        """Test deployment model and relationships."""
        
        # Create deployment
        deployment = Deployment(
            name="Test Deployment",
            status=DeploymentStatus.RUNNING,
            namespace="mcphub-test",
            replicas=2,
            port=8080,
            external_url="https://test.mcphub.com",
            mcp_server_id=test_mcp_server.id,
            owner_id=test_user.id
        )
        db_session.add(deployment)
        await db_session.commit()
        await db_session.refresh(deployment)
        
        # Test deployment properties
        assert deployment.name == "Test Deployment"
        assert deployment.status == DeploymentStatus.RUNNING
        assert deployment.replicas == 2
        assert deployment.mcp_server_id == test_mcp_server.id
        
        # Test relationships
        await db_session.refresh(test_mcp_server, ["deployments"])
        assert len(test_mcp_server.deployments) == 1
        assert test_mcp_server.deployments[0].id == deployment.id
        
        await db_session.refresh(test_user, ["deployments"])
        assert len(test_user.deployments) == 1
        assert test_user.deployments[0].id == deployment.id
    
    @pytest.mark.asyncio
    async def test_cascade_deletions(
        self,
        setup_database,
        db_session: AsyncSession,
        test_user: User,
        test_api_registration: APIRegistration
    ):
        """Test cascade deletion behavior."""
        
        # Create MCP server
        mcp_server = MCPServer(
            name="Test Server for Deletion",
            status=MCPServerStatus.READY,
            api_registration_id=test_api_registration.id,
            owner_id=test_user.id
        )
        db_session.add(mcp_server)
        await db_session.commit()
        await db_session.refresh(mcp_server)
        
        # Create deployment
        deployment = Deployment(
            name="Test Deployment for Deletion",
            status=DeploymentStatus.RUNNING,
            mcp_server_id=mcp_server.id,
            owner_id=test_user.id
        )
        db_session.add(deployment)
        await db_session.commit()
        deployment_id = deployment.id
        
        # Delete MCP server (should cascade to deployments)
        await db_session.delete(mcp_server)
        await db_session.commit()
        
        # Verify deployment was also deleted
        from sqlalchemy import select
        result = await db_session.execute(
            select(Deployment).where(Deployment.id == deployment_id)
        )
        deleted_deployment = result.scalar_one_or_none()
        assert deleted_deployment is None


class TestServiceArchitecture:
    """Test the microservices architecture."""
    
    @pytest.mark.asyncio
    async def test_service_separation(self):
        """Test that services are properly separated."""
        
        # Test that each service has its own main.py
        import os
        
        services = [
            "registration-service",
            "generator-service", 
            "deployment-service",
            "docs-service",
            "api-gateway"
        ]
        
        for service in services:
            service_path = f"{service}/app/main.py"
            if service == "api-gateway":
                service_path = f"{service}/main.py"
            
            assert os.path.exists(service_path), f"Service {service} main.py not found"
    
    @pytest.mark.asyncio
    async def test_api_gateway_structure(self):
        """Test API gateway structure."""
        
        # Test that API gateway has proper routing
        from api_gateway.routes import api_router
        from api_gateway.middleware import AuthMiddleware, RateLimitMiddleware
        
        assert api_router is not None
        assert AuthMiddleware is not None
        assert RateLimitMiddleware is not None
    
    @pytest.mark.asyncio
    async def test_websocket_manager(self):
        """Test WebSocket connection manager."""
        
        from core.websocket import ConnectionManager, manager
        from uuid import uuid4
        
        # Test connection manager structure
        assert isinstance(manager, ConnectionManager)
        assert hasattr(manager, 'active_connections')
        assert hasattr(manager, 'user_connections')
        
        # Test connection ID generation
        user_id = uuid4()
        connection_id = f"test_{user_id}"
        
        assert connection_id.startswith("test_")
        assert str(user_id) in connection_id


class TestSecurityImplementation:
    """Test security features."""
    
    @pytest.mark.asyncio
    async def test_password_hashing(self):
        """Test password hashing functionality."""
        
        from core.security import get_password_hash, verify_password
        
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # Test that password is hashed
        assert hashed != password
        assert len(hashed) > 50  # Bcrypt hashes are long
        
        # Test password verification
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False
    
    @pytest.mark.asyncio
    async def test_jwt_tokens(self):
        """Test JWT token creation and verification."""
        
        from core.security import create_access_token, create_refresh_token, verify_token
        from uuid import uuid4
        
        user_data = {
            "user_id": str(uuid4()),
            "username": "testuser"
        }
        
        # Test access token
        access_token = create_access_token(user_data)
        assert access_token is not None
        assert len(access_token) > 100  # JWT tokens are long
        
        # Test token verification
        payload = verify_token(access_token, "access")
        assert payload is not None
        assert payload["user_id"] == user_data["user_id"]
        assert payload["username"] == user_data["username"]
        assert payload["type"] == "access"
        
        # Test refresh token
        refresh_token = create_refresh_token(user_data)
        refresh_payload = verify_token(refresh_token, "refresh")
        assert refresh_payload is not None
        assert refresh_payload["type"] == "refresh"
    
    @pytest.mark.asyncio
    async def test_data_encryption(self):
        """Test data encryption functionality."""
        
        from core.security import encrypt_data, decrypt_data
        
        sensitive_data = "api_key_12345"
        encrypted = encrypt_data(sensitive_data)
        
        # Test that data is encrypted
        assert encrypted != sensitive_data
        assert len(encrypted) > len(sensitive_data)
        
        # Test decryption
        decrypted = decrypt_data(encrypted)
        assert decrypted == sensitive_data


class TestConfigurationManagement:
    """Test configuration management."""
    
    @pytest.mark.asyncio
    async def test_settings_structure(self):
        """Test settings structure and components."""
        
        from core.config import settings
        
        # Test main settings
        assert hasattr(settings, 'app_name')
        assert hasattr(settings, 'debug')
        assert hasattr(settings, 'api_v1_prefix')
        
        # Test component settings
        assert hasattr(settings, 'database')
        assert hasattr(settings, 'redis')
        assert hasattr(settings, 'security')
        assert hasattr(settings, 'docker')
        assert hasattr(settings, 'kubernetes')
        assert hasattr(settings, 'generator')
        assert hasattr(settings, 'docs')
        assert hasattr(settings, 'monitoring')
        
        # Test documentation settings
        assert hasattr(settings.docs, 'output_directory')
        assert hasattr(settings.docs, 'supported_formats')
        assert "markdown" in settings.docs.supported_formats
        assert "html" in settings.docs.supported_formats
    
    @pytest.mark.asyncio
    async def test_database_configuration(self):
        """Test database configuration."""
        
        from core.config import settings
        from core.database import engine, AsyncSessionLocal
        
        # Test database settings
        assert settings.database.url is not None
        assert "postgresql" in settings.database.url
        
        # Test database engine
        assert engine is not None
        assert AsyncSessionLocal is not None
