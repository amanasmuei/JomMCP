"""
API registration endpoints for the registration service.
"""

import json
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.models.api_registration import APIRegistration, APIType
from core.models.user import User
from core.security import encrypt_data, decrypt_data

from ..schemas.registration import (
    APIRegistrationCreate,
    APIRegistrationUpdate,
    APIRegistrationResponse,
    APIRegistrationList,
    APIValidationRequest,
    APIValidationResponse,
)
from ..dependencies import get_current_active_user, require_user_or_admin
from ..services.validation import APIValidationService

router = APIRouter()


@router.post("/", response_model=APIRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def create_api_registration(
    registration_data: APIRegistrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user_or_admin)
) -> APIRegistrationResponse:
    """
    Create a new API registration.
    
    Args:
        registration_data: API registration data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        APIRegistrationResponse: Created API registration
    """
    # Encrypt credentials if provided
    encrypted_credentials = None
    if registration_data.credentials:
        credentials_json = json.dumps(registration_data.credentials)
        encrypted_credentials = encrypt_data(credentials_json)
    
    # Create API registration
    db_registration = APIRegistration(
        name=registration_data.name,
        description=registration_data.description,
        base_url=str(registration_data.base_url),
        api_type=registration_data.api_type,
        authentication_type=registration_data.authentication_type,
        encrypted_credentials=encrypted_credentials,
        specification=registration_data.specification,
        configuration=registration_data.configuration,
        health_check_url=str(registration_data.health_check_url) if registration_data.health_check_url else None,
        health_check_interval_seconds=registration_data.health_check_interval_seconds,
        owner_id=current_user.id,
    )
    
    db.add(db_registration)
    await db.commit()
    await db.refresh(db_registration)
    
    return APIRegistrationResponse.from_orm(db_registration)


@router.get("/", response_model=APIRegistrationList)
async def list_api_registrations(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    api_type: Optional[APIType] = Query(None, description="Filter by API type"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> APIRegistrationList:
    """
    List API registrations for the current user.
    
    Args:
        page: Page number
        size: Page size
        api_type: Optional API type filter
        search: Optional search term
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        APIRegistrationList: Paginated list of API registrations
    """
    # Build query
    query = select(APIRegistration).where(APIRegistration.owner_id == current_user.id)
    
    # Apply filters
    if api_type:
        query = query.where(APIRegistration.api_type == api_type)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (APIRegistration.name.ilike(search_term)) |
            (APIRegistration.description.ilike(search_term))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(APIRegistration.created_at.desc())
    
    # Execute query
    result = await db.execute(query)
    registrations = result.scalars().all()
    
    # Calculate pagination info
    pages = (total + size - 1) // size
    
    return APIRegistrationList(
        items=[APIRegistrationResponse.from_orm(reg) for reg in registrations],
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{registration_id}", response_model=APIRegistrationResponse)
async def get_api_registration(
    registration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> APIRegistrationResponse:
    """
    Get a specific API registration.
    
    Args:
        registration_id: API registration ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        APIRegistrationResponse: API registration details
        
    Raises:
        HTTPException: If registration not found or access denied
    """
    result = await db.execute(
        select(APIRegistration).where(
            and_(
                APIRegistration.id == registration_id,
                APIRegistration.owner_id == current_user.id
            )
        )
    )
    registration = result.scalar_one_or_none()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API registration not found"
        )
    
    return APIRegistrationResponse.from_orm(registration)


@router.put("/{registration_id}", response_model=APIRegistrationResponse)
async def update_api_registration(
    registration_id: UUID,
    update_data: APIRegistrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> APIRegistrationResponse:
    """
    Update an API registration.
    
    Args:
        registration_id: API registration ID
        update_data: Update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        APIRegistrationResponse: Updated API registration
        
    Raises:
        HTTPException: If registration not found or access denied
    """
    result = await db.execute(
        select(APIRegistration).where(
            and_(
                APIRegistration.id == registration_id,
                APIRegistration.owner_id == current_user.id
            )
        )
    )
    registration = result.scalar_one_or_none()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API registration not found"
        )
    
    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    
    # Handle credentials encryption
    if "credentials" in update_dict:
        if update_dict["credentials"]:
            credentials_json = json.dumps(update_dict["credentials"])
            update_dict["encrypted_credentials"] = encrypt_data(credentials_json)
        else:
            update_dict["encrypted_credentials"] = None
        del update_dict["credentials"]
    
    # Convert URLs to strings
    if "base_url" in update_dict:
        update_dict["base_url"] = str(update_dict["base_url"])
    if "health_check_url" in update_dict:
        update_dict["health_check_url"] = str(update_dict["health_check_url"]) if update_dict["health_check_url"] else None
    
    # Update registration
    for field, value in update_dict.items():
        setattr(registration, field, value)
    
    await db.commit()
    await db.refresh(registration)
    
    return APIRegistrationResponse.from_orm(registration)


@router.delete("/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_registration(
    registration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    """
    Delete an API registration.
    
    Args:
        registration_id: API registration ID
        db: Database session
        current_user: Current authenticated user
        
    Raises:
        HTTPException: If registration not found or access denied
    """
    result = await db.execute(
        select(APIRegistration).where(
            and_(
                APIRegistration.id == registration_id,
                APIRegistration.owner_id == current_user.id
            )
        )
    )
    registration = result.scalar_one_or_none()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API registration not found"
        )
    
    await db.delete(registration)
    await db.commit()


@router.post("/validate", response_model=APIValidationResponse)
async def validate_api(
    validation_request: APIValidationRequest,
    current_user: User = Depends(get_current_active_user)
) -> APIValidationResponse:
    """
    Validate an API endpoint.
    
    Args:
        validation_request: API validation request
        current_user: Current authenticated user
        
    Returns:
        APIValidationResponse: Validation results
    """
    validation_service = APIValidationService()
    return await validation_service.validate_api(validation_request)
