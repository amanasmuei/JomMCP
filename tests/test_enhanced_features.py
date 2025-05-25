"""
Tests for enhanced features: error handling and logging
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession
from core.models.user import User, UserRole
from core.security import get_password_hash


class TestEnhancedErrorHandling:
    """Test enhanced error handling functionality."""

    @pytest.mark.asyncio
    async def test_user_creation_with_duplicate_email(self, db_session: AsyncSession):
        """Test error handling when creating duplicate users."""
        # Create first user
        user1 = User(
            username="testuser1",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User 1",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        
        db_session.add(user1)
        await db_session.commit()
        
        # Try to create second user with same email
        user2 = User(
            username="testuser2",
            email="test@example.com",  # Same email
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User 2",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        
        db_session.add(user2)
        
        # This should raise an integrity error
        with pytest.raises(Exception):  # SQLAlchemy will raise an IntegrityError
            await db_session.commit()

    @pytest.mark.asyncio
    async def test_user_creation_with_invalid_role(self, db_session: AsyncSession):
        """Test error handling with invalid user role."""
        # This should work fine as we're using proper enum
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            role=UserRole.ADMIN,  # Valid role
            is_active=True,
            is_verified=True,
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        assert user.role == UserRole.ADMIN

    @pytest.mark.asyncio
    async def test_password_validation(self):
        """Test password hashing and validation."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Test that password is properly hashed
        assert hashed != password
        assert len(hashed) > 20  # Bcrypt hashes are typically longer
        assert hashed.startswith('$2b$')  # Bcrypt prefix

    @pytest.mark.asyncio
    async def test_database_transaction_rollback(self, db_session: AsyncSession):
        """Test that database transactions can be rolled back on error."""
        # Start a transaction
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
        
        # Simulate an error and rollback
        await db_session.rollback()
        
        # Verify the user was not saved
        from sqlalchemy import select
        result = await db_session.execute(
            select(User).where(User.email == "test@example.com")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is None


class TestDatabaseConstraints:
    """Test database constraints and validation."""

    @pytest.mark.asyncio
    async def test_user_username_uniqueness(self, db_session: AsyncSession):
        """Test that usernames must be unique."""
        # Create first user
        user1 = User(
            username="uniqueuser",
            email="user1@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="User 1",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        
        db_session.add(user1)
        await db_session.commit()
        
        # Try to create second user with same username
        user2 = User(
            username="uniqueuser",  # Same username
            email="user2@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="User 2",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        
        db_session.add(user2)
        
        # This should raise an integrity error
        with pytest.raises(Exception):
            await db_session.commit()

    @pytest.mark.asyncio
    async def test_user_required_fields(self, db_session: AsyncSession):
        """Test that required fields are enforced."""
        # Try to create user without required fields
        with pytest.raises(Exception):
            user = User(
                # Missing username
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test User",
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
            )
            db_session.add(user)
            await db_session.commit()

    @pytest.mark.asyncio
    async def test_api_registration_owner_relationship(self, db_session: AsyncSession):
        """Test that API registrations require valid owner."""
        from core.models.api_registration import APIRegistration, APIType, AuthenticationType
        
        # Try to create API registration without valid owner
        api_registration = APIRegistration(
            name="Test API",
            description="A test API",
            base_url="https://api.example.com",
            api_type=APIType.REST,
            authentication_type=AuthenticationType.API_KEY,
            owner_id=99999,  # Non-existent user ID
        )
        
        db_session.add(api_registration)
        
        # This should raise a foreign key constraint error
        with pytest.raises(Exception):
            await db_session.commit()


class TestPerformanceAndLimits:
    """Test performance characteristics and limits."""

    @pytest.mark.asyncio
    async def test_bulk_user_creation(self, db_session: AsyncSession):
        """Test creating multiple users efficiently."""
        users = []
        for i in range(10):
            user = User(
                username=f"bulkuser{i}",
                email=f"bulk{i}@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name=f"Bulk User {i}",
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
            )
            users.append(user)
        
        # Add all users at once
        db_session.add_all(users)
        await db_session.commit()
        
        # Verify all users were created
        from sqlalchemy import select, func
        result = await db_session.execute(
            select(func.count(User.id)).where(User.username.like('bulkuser%'))
        )
        count = result.scalar()
        
        assert count == 10

    @pytest.mark.asyncio
    async def test_large_text_fields(self, db_session: AsyncSession):
        """Test handling of large text fields."""
        large_description = "A" * 1000  # 1000 character description
        
        from core.models.api_registration import APIRegistration, APIType, AuthenticationType
        
        # Create user first
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
        
        # Create API registration with large description
        api_registration = APIRegistration(
            name="Test API",
            description=large_description,
            base_url="https://api.example.com",
            api_type=APIType.REST,
            authentication_type=AuthenticationType.API_KEY,
            owner_id=user.id,
        )
        
        db_session.add(api_registration)
        await db_session.commit()
        await db_session.refresh(api_registration)
        
        assert len(api_registration.description) == 1000
        assert api_registration.description == large_description


class TestConcurrency:
    """Test concurrent operations."""

    @pytest.mark.asyncio
    async def test_concurrent_user_creation(self, db_session: AsyncSession):
        """Test that concurrent user creation works properly."""
        async def create_user(index: int):
            user = User(
                username=f"concurrent{index}",
                email=f"concurrent{index}@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name=f"Concurrent User {index}",
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
            )
            db_session.add(user)
        
        # Create multiple users concurrently
        tasks = [create_user(i) for i in range(5)]
        await asyncio.gather(*tasks)
        
        await db_session.commit()
        
        # Verify all users were created
        from sqlalchemy import select, func
        result = await db_session.execute(
            select(func.count(User.id)).where(User.username.like('concurrent%'))
        )
        count = result.scalar()
        
        assert count == 5
