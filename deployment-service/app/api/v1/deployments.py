"""
Deployment management endpoints.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from core.database import get_db
from core.models.deployment import Deployment, DeploymentStatus
from core.models.mcp_server import MCPServer, MCPServerStatus
from core.models.user import User

from ..schemas.deployment import (
    DeploymentCreateRequest,
    DeploymentResponse,
    DeploymentList,
    DeploymentUpdateRequest,
    DeploymentLogsResponse,
    DeploymentScaleRequest,
)
from ..dependencies import get_current_active_user
from ..services.deployment_manager import DeploymentManager

router = APIRouter()


@router.post("/", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
async def create_deployment(
    deployment_request: DeploymentCreateRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentResponse:
    """
    Create a new deployment for an MCP server.
    
    Args:
        deployment_request: Deployment creation request
        background_tasks: Background task manager
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentResponse: Created deployment information
        
    Raises:
        HTTPException: If MCP server not found or not ready
    """
    # Verify MCP server exists and belongs to user
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == deployment_request.mcp_server_id,
                MCPServer.owner_id == current_user.id
            )
        )
    )
    mcp_server = result.scalar_one_or_none()
    
    if not mcp_server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    if mcp_server.status != MCPServerStatus.READY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MCP server must be in READY status, currently: {mcp_server.status}"
        )
    
    if not mcp_server.docker_image_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MCP server does not have a Docker image"
        )
    
    # Create deployment record
    deployment = Deployment(
        name=deployment_request.name,
        status=DeploymentStatus.PENDING,
        namespace=deployment_request.namespace or "mcphub",
        cpu_limit=deployment_request.cpu_limit or "500m",
        memory_limit=deployment_request.memory_limit or "512Mi",
        replicas=deployment_request.replicas or 1,
        port=deployment_request.port or 8080,
        environment_variables=deployment_request.environment_variables or {},
        deployment_config=deployment_request.deployment_config or {},
        health_check_path=deployment_request.health_check_path or "/health",
        mcp_server_id=mcp_server.id,
        owner_id=current_user.id,
    )
    
    db.add(deployment)
    await db.commit()
    await db.refresh(deployment)
    
    # Start deployment process in background
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    background_tasks.add_task(
        deployment_manager.deploy_mcp_server,
        deployment.id,
        mcp_server
    )
    
    return DeploymentResponse.from_orm(deployment)


@router.get("/", response_model=DeploymentList)
async def list_deployments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentList:
    """
    List deployments for the current user.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentList: List of deployments
    """
    result = await db.execute(
        select(Deployment)
        .where(Deployment.owner_id == current_user.id)
        .order_by(Deployment.created_at.desc())
    )
    deployments = result.scalars().all()
    
    return DeploymentList(
        items=[DeploymentResponse.from_orm(deployment) for deployment in deployments]
    )


@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentResponse:
    """
    Get a specific deployment.
    
    Args:
        deployment_id: Deployment ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentResponse: Deployment details
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    return DeploymentResponse.from_orm(deployment)


@router.put("/{deployment_id}", response_model=DeploymentResponse)
async def update_deployment(
    deployment_id: UUID,
    update_request: DeploymentUpdateRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentResponse:
    """
    Update a deployment.
    
    Args:
        deployment_id: Deployment ID
        update_request: Update request
        background_tasks: Background task manager
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentResponse: Updated deployment
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    # Update deployment fields
    update_dict = update_request.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(deployment, field, value)
    
    deployment.status = DeploymentStatus.UPDATING
    await db.commit()
    await db.refresh(deployment)
    
    # Start update process in background
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    background_tasks.add_task(
        deployment_manager.update_deployment,
        deployment.id
    )
    
    return DeploymentResponse.from_orm(deployment)


@router.post("/{deployment_id}/scale", response_model=DeploymentResponse)
async def scale_deployment(
    deployment_id: UUID,
    scale_request: DeploymentScaleRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentResponse:
    """
    Scale a deployment.
    
    Args:
        deployment_id: Deployment ID
        scale_request: Scale request
        background_tasks: Background task manager
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentResponse: Updated deployment
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    # Update replica count
    deployment.replicas = scale_request.replicas
    deployment.status = DeploymentStatus.SCALING
    await db.commit()
    await db.refresh(deployment)
    
    # Start scaling process in background
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    background_tasks.add_task(
        deployment_manager.scale_deployment,
        deployment.id,
        scale_request.replicas
    )
    
    return DeploymentResponse.from_orm(deployment)


@router.get("/{deployment_id}/logs", response_model=DeploymentLogsResponse)
async def get_deployment_logs(
    deployment_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> DeploymentLogsResponse:
    """
    Get deployment logs.
    
    Args:
        deployment_id: Deployment ID
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        DeploymentLogsResponse: Deployment logs
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    # Get logs from Kubernetes
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    logs = await deployment_manager.get_deployment_logs(deployment)
    
    return DeploymentLogsResponse(
        deployment_id=deployment.id,
        logs=logs,
        deployment_logs=deployment.deployment_logs
    )


@router.post("/{deployment_id}/stop")
async def stop_deployment(
    deployment_id: UUID,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """
    Stop a deployment.
    
    Args:
        deployment_id: Deployment ID
        background_tasks: Background task manager
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    deployment.status = DeploymentStatus.STOPPING
    await db.commit()
    
    # Start stop process in background
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    background_tasks.add_task(
        deployment_manager.stop_deployment,
        deployment.id
    )
    
    return {"message": "Deployment stop initiated"}


@router.delete("/{deployment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deployment(
    deployment_id: UUID,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    """
    Delete a deployment.
    
    Args:
        deployment_id: Deployment ID
        background_tasks: Background task manager
        request: FastAPI request object
        db: Database session
        current_user: Current authenticated user
        
    Raises:
        HTTPException: If deployment not found or access denied
    """
    result = await db.execute(
        select(Deployment).where(
            and_(
                Deployment.id == deployment_id,
                Deployment.owner_id == current_user.id
            )
        )
    )
    deployment = result.scalar_one_or_none()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    # Start deletion process in background
    deployment_manager = DeploymentManager(request.app.state.k8s_manager)
    background_tasks.add_task(
        deployment_manager.delete_deployment,
        deployment.id
    )
    
    # Mark as deleting but don't delete from DB yet
    deployment.status = DeploymentStatus.STOPPING
    await db.commit()
