"""
Basic tests for the MCP Hub platform.
"""

import pytest
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from core.models.user import User, UserRole
from core.models.api_registration import APIRegistration, APIType, AuthenticationType
from core.security import get_password_hash


class TestBasicFunctionality:
    """Test basic functionality without service dependencies."""

    @pytest.mark.asyncio
    async def test_user_creation(self, db_session: AsyncSession):
        """Test creating a user in the database."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.role == UserRole.USER

    @pytest.mark.asyncio
    async def test_api_registration_creation(self, db_session: AsyncSession):
        """Test creating an API registration."""
        # First create a user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create API registration
        api_registration = APIRegistration(
            name="Test API",
            description="A test API",
            base_url="https://api.example.com",
            api_type=APIType.REST,
            authentication_type=AuthenticationType.API_KEY,
            owner_id=user.id,
        )

        db_session.add(api_registration)
        await db_session.commit()
        await db_session.refresh(api_registration)

        assert api_registration.id is not None
        assert api_registration.name == "Test API"
        assert api_registration.base_url == "https://api.example.com"
        assert api_registration.api_type == APIType.REST
        assert api_registration.owner_id == user.id

    @pytest.mark.asyncio
    async def test_password_hashing(self):
        """Test password hashing functionality."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert hashed != password
        assert len(hashed) > 0

        # Test that the same password produces different hashes (due to salt)
        hashed2 = get_password_hash(password)
        assert hashed != hashed2

    @pytest.mark.asyncio
    async def test_database_connection(self, db_session: AsyncSession):
        """Test that database connection works."""
        from sqlalchemy import text

        # Simple query to test connection
        result = await db_session.execute(text("SELECT 1 as test"))
        row = result.fetchone()
        assert row[0] == 1


class TestModelRelationships:
    """Test model relationships and constraints."""

    @pytest.mark.asyncio
    async def test_user_api_registrations_relationship(self, db_session: AsyncSession):
        """Test the relationship between users and API registrations."""
        # Create user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create multiple API registrations for the user
        api1 = APIRegistration(
            name="API 1",
            description="First API",
            base_url="https://api1.example.com",
            api_type=APIType.REST,
            authentication_type=AuthenticationType.NONE,
            owner_id=user.id,
        )

        api2 = APIRegistration(
            name="API 2",
            description="Second API",
            base_url="https://api2.example.com",
            api_type=APIType.GRAPHQL,
            authentication_type=AuthenticationType.BEARER_TOKEN,
            owner_id=user.id,
        )

        db_session.add_all([api1, api2])
        await db_session.commit()

        # Refresh to get the relationships
        await db_session.refresh(user)

        # Load the relationship explicitly for async context
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select

        # Query user with loaded relationships
        result = await db_session.execute(
            select(User)
            .options(selectinload(User.api_registrations))
            .where(User.id == user.id)
        )
        user_with_registrations = result.scalar_one()

        # Test that user has the correct number of API registrations
        assert len(user_with_registrations.api_registrations) == 2
        registration_names = [
            reg.name for reg in user_with_registrations.api_registrations
        ]
        assert "API 1" in registration_names
        assert "API 2" in registration_names

    @pytest.mark.asyncio
    async def test_enum_values(self):
        """Test that enum values work correctly."""
        # Test APIType enum
        assert APIType.REST == "rest"
        assert APIType.GRAPHQL == "graphql"
        assert APIType.SOAP == "soap"
        assert APIType.GRPC == "grpc"
        assert APIType.WEBSOCKET == "websocket"

        # Test AuthenticationType enum
        assert AuthenticationType.NONE == "none"
        assert AuthenticationType.API_KEY == "api_key"
        assert AuthenticationType.BEARER_TOKEN == "bearer_token"
        assert AuthenticationType.BASIC_AUTH == "basic_auth"
        assert AuthenticationType.OAUTH2 == "oauth2"

        # Test UserRole enum
        assert UserRole.USER == "user"
        assert UserRole.ADMIN == "admin"
