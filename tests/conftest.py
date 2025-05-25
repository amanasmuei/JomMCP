"""
Pytest configuration and fixtures.
"""

import asyncio
import os
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from core.database import Base, get_db
from core.models.user import User, UserRole
from core.security import get_password_hash


# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/mcphub_test"

# Create test engine
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Drop tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
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
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create a test admin user."""
    user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


def override_get_db():
    """Override database dependency for testing."""
    async def _get_db():
        async with TestSessionLocal() as session:
            yield session
    return _get_db


@pytest.fixture
def registration_client() -> TestClient:
    """Create a test client for the registration service."""
    from registration_service.app.main import app
    
    app.dependency_overrides[get_db] = override_get_db()
    return TestClient(app)


@pytest.fixture
def generator_client() -> TestClient:
    """Create a test client for the generator service."""
    from generator_service.app.main import app
    
    app.dependency_overrides[get_db] = override_get_db()
    return TestClient(app)


@pytest.fixture
def deployment_client() -> TestClient:
    """Create a test client for the deployment service."""
    from deployment_service.app.main import app
    
    app.dependency_overrides[get_db] = override_get_db()
    return TestClient(app)


@pytest_asyncio.fixture
async def async_registration_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the registration service."""
    from registration_service.app.main import app
    
    app.dependency_overrides[get_db] = lambda: db_session
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def async_generator_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the generator service."""
    from generator_service.app.main import app
    
    app.dependency_overrides[get_db] = lambda: db_session
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def async_deployment_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the deployment service."""
    from deployment_service.app.main import app
    
    app.dependency_overrides[get_db] = lambda: db_session
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    from core.security import create_access_token
    
    token = create_access_token(
        data={"sub": test_user.username, "user_id": str(test_user.id), "role": test_user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(admin_user: User) -> dict:
    """Create authentication headers for admin user."""
    from core.security import create_access_token
    
    token = create_access_token(
        data={"sub": admin_user.username, "user_id": str(admin_user.id), "role": admin_user.role}
    )
    return {"Authorization": f"Bearer {token}"}
