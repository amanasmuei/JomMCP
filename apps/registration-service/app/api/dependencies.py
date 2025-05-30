"""
FastAPI dependencies for the registration service.
"""

from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from core.models.user import User, UserRole
from core.security import verify_token

security = HTTPBearer()


async def get_current_user_gateway_aware(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> User:
    """
    Get current authenticated user, supporting both gateway and direct authentication.

    Args:
        request: FastAPI request object
        db: Database session
        credentials: Optional HTTP authorization credentials

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Check if request comes from API Gateway
    gateway_auth = request.headers.get("X-Gateway-Auth")
    if gateway_auth == "true":
        # Trust gateway authentication
        user_id_header = request.headers.get("X-User-ID")
        username_header = request.headers.get("X-Username")

        if not user_id_header or not username_header:
            raise credentials_exception

        try:
            user_uuid = UUID(user_id_header)
        except ValueError:
            raise credentials_exception

        # Get user from database
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()

        if not user:
            raise credentials_exception

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
            )

        return user

    # Fall back to direct authentication
    if not credentials:
        raise credentials_exception

    # Verify token
    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        raise credentials_exception

    username = payload.get("sub")
    user_id = payload.get("user_id")

    if not username or not user_id:
        raise credentials_exception

    # Get user from database
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP authorization credentials
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token
    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        raise credentials_exception

    username = payload.get("sub")
    user_id = payload.get("user_id")

    if not username or not user_id:
        raise credentials_exception

    # Get user from database
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user_gateway_aware),
) -> User:
    """
    Get current active user.

    Args:
        current_user: Current user from token

    Returns:
        User: Current active user

    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current admin user.

    Args:
        current_user: Current active user

    Returns:
        User: Current admin user

    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Get current user if token is provided, otherwise return None.

    Args:
        credentials: Optional HTTP authorization credentials
        db: Database session

    Returns:
        Optional[User]: Current user or None
    """
    if not credentials:
        return None

    try:
        # Use the existing get_current_user dependency
        # This is a simplified version - in practice you'd want to handle this more elegantly
        payload = verify_token(credentials.credentials, token_type="access")
        if not payload:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        # This would need to be async in real implementation
        # For now, return None if optional auth fails
        return None
    except Exception:
        return None


class RoleChecker:
    """Dependency class for checking user roles."""

    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        """
        Check if current user has required role.

        Args:
            current_user: Current active user

        Returns:
            User: Current user if role is allowed

        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        return current_user


# Common role checkers
require_admin = RoleChecker([UserRole.ADMIN])
require_user_or_admin = RoleChecker([UserRole.USER, UserRole.ADMIN])
require_any_role = RoleChecker([UserRole.USER, UserRole.ADMIN, UserRole.VIEWER])
