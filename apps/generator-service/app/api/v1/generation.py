"""
MCP server generation endpoints.
"""

from typing import Dict, List
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from core.database import get_db
from core.models.api_registration import APIRegistration
from core.models.mcp_server import MCPServer, MCPServerStatus
from core.models.user import User

from ..schemas.generation import (
    MCPServerGenerationRequest,
    MCPServerResponse,
    GenerationStatusResponse,
    MCPServerList,
)
from ..dependencies import get_current_active_user
from ..services.generator import MCPServerGenerator

router = APIRouter()


@router.post("/", response_model=MCPServerResponse, status_code=status.HTTP_201_CREATED)
async def generate_mcp_server(
    generation_request: MCPServerGenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> MCPServerResponse:
    """
    Generate a new MCP server from an API registration.
    
    Args:
        generation_request: MCP server generation request
        background_tasks: Background task manager
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        MCPServerResponse: Created MCP server information
        
    Raises:
        HTTPException: If API registration not found or access denied
    """
    # Verify API registration exists and belongs to user
    result = await db.execute(
        select(APIRegistration).where(
            and_(
                APIRegistration.id == generation_request.api_registration_id,
                APIRegistration.owner_id == current_user.id
            )
        )
    )
    api_registration = result.scalar_one_or_none()
    
    if not api_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API registration not found"
        )
    
    # Create MCP server record
    mcp_server = MCPServer(
        name=generation_request.name,
        description=generation_request.description,
        status=MCPServerStatus.PENDING,
        mcp_config=generation_request.mcp_config,
        api_registration_id=api_registration.id,
        owner_id=current_user.id,
    )
    
    db.add(mcp_server)
    await db.commit()
    await db.refresh(mcp_server)
    
    # Start generation process in background
    generator = MCPServerGenerator()
    background_tasks.add_task(
        generator.generate_mcp_server,
        mcp_server.id,
        api_registration
    )
    
    return MCPServerResponse.from_orm(mcp_server)


@router.get("/", response_model=MCPServerList)
async def list_mcp_servers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> MCPServerList:
    """
    List MCP servers for the current user.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        MCPServerList: List of MCP servers
    """
    result = await db.execute(
        select(MCPServer)
        .where(MCPServer.owner_id == current_user.id)
        .order_by(MCPServer.created_at.desc())
    )
    servers = result.scalars().all()
    
    return MCPServerList(
        items=[MCPServerResponse.from_orm(server) for server in servers]
    )


@router.get("/{server_id}", response_model=MCPServerResponse)
async def get_mcp_server(
    server_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> MCPServerResponse:
    """
    Get a specific MCP server.
    
    Args:
        server_id: MCP server ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        MCPServerResponse: MCP server details
        
    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == server_id,
                MCPServer.owner_id == current_user.id
            )
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    return MCPServerResponse.from_orm(server)


@router.get("/{server_id}/status", response_model=GenerationStatusResponse)
async def get_generation_status(
    server_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> GenerationStatusResponse:
    """
    Get generation status for an MCP server.
    
    Args:
        server_id: MCP server ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        GenerationStatusResponse: Generation status and logs
        
    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == server_id,
                MCPServer.owner_id == current_user.id
            )
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    return GenerationStatusResponse(
        server_id=server.id,
        status=server.status,
        generation_logs=server.generation_logs,
        build_logs=server.build_logs,
        error_message=server.error_message,
        docker_image_name=server.docker_image_name,
        docker_image_tag=server.docker_image_tag,
    )


@router.post("/{server_id}/regenerate", response_model=MCPServerResponse)
async def regenerate_mcp_server(
    server_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> MCPServerResponse:
    """
    Regenerate an existing MCP server.
    
    Args:
        server_id: MCP server ID
        background_tasks: Background task manager
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        MCPServerResponse: Updated MCP server information
        
    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == server_id,
                MCPServer.owner_id == current_user.id
            )
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    # Get API registration
    result = await db.execute(
        select(APIRegistration).where(APIRegistration.id == server.api_registration_id)
    )
    api_registration = result.scalar_one_or_none()
    
    if not api_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API registration not found"
        )
    
    # Reset server status
    server.status = MCPServerStatus.PENDING
    server.generation_logs = None
    server.build_logs = None
    server.error_message = None
    
    await db.commit()
    await db.refresh(server)
    
    # Start regeneration process in background
    generator = MCPServerGenerator()
    background_tasks.add_task(
        generator.generate_mcp_server,
        server.id,
        api_registration
    )
    
    return MCPServerResponse.from_orm(server)


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mcp_server(
    server_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    """
    Delete an MCP server.
    
    Args:
        server_id: MCP server ID
        db: Database session
        current_user: Current authenticated user
        
    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == server_id,
                MCPServer.owner_id == current_user.id
            )
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    await db.delete(server)
    await db.commit()
