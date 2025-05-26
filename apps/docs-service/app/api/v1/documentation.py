"""
Documentation generation and management endpoints.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from core.database import get_db
from core.models.mcp_server import MCPServer, MCPServerStatus
from core.models.api_registration import APIRegistration
from core.models.user import User

from ...api.schemas.documentation import (
    DocumentationGenerateRequest,
    DocumentationResponse,
    DocumentationList,
    DocumentationUpdateRequest,
)
from ..dependencies import get_current_active_user
from ..services.doc_generator import DocumentationGenerator

router = APIRouter()


@router.post(
    "/generate",
    response_model=DocumentationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_documentation(
    generate_request: DocumentationGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DocumentationResponse:
    """
    Generate documentation for an MCP server.

    Args:
        generate_request: Documentation generation request
        background_tasks: Background task manager
        db: Database session
        current_user: Current authenticated user

    Returns:
        DocumentationResponse: Generated documentation information

    Raises:
        HTTPException: If MCP server not found or access denied
    """
    # Verify MCP server exists and belongs to user
    result = await db.execute(
        select(MCPServer).where(
            and_(
                MCPServer.id == generate_request.mcp_server_id,
                MCPServer.owner_id == current_user.id,
            )
        )
    )
    mcp_server = result.scalar_one_or_none()

    if not mcp_server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="MCP server not found"
        )

    if mcp_server.status != MCPServerStatus.READY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MCP server must be in READY status, currently: {mcp_server.status}",
        )

    # Get API registration
    result = await db.execute(
        select(APIRegistration).where(
            APIRegistration.id == mcp_server.api_registration_id
        )
    )
    api_registration = result.scalar_one_or_none()

    if not api_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="API registration not found"
        )

    # Start documentation generation in background
    doc_generator = DocumentationGenerator()
    background_tasks.add_task(
        doc_generator.generate_documentation,
        mcp_server,
        api_registration,
        generate_request.format,
        generate_request.include_examples,
        generate_request.include_schemas,
    )

    return DocumentationResponse(
        mcp_server_id=mcp_server.id,
        format=generate_request.format,
        status="generating",
        message="Documentation generation started",
    )


@router.get("/{server_id}", response_model=DocumentationResponse)
async def get_documentation_status(
    server_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DocumentationResponse:
    """
    Get documentation generation status for an MCP server.

    Args:
        server_id: MCP server ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        DocumentationResponse: Documentation status

    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(MCPServer.id == server_id, MCPServer.owner_id == current_user.id)
        )
    )
    server = result.scalar_one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="MCP server not found"
        )

    # Check if documentation exists
    doc_generator = DocumentationGenerator()
    doc_status = await doc_generator.get_documentation_status(server.id)

    return DocumentationResponse(
        mcp_server_id=server.id,
        format=doc_status.get("format", "markdown"),
        status=doc_status.get("status", "not_generated"),
        message=doc_status.get("message", ""),
        url=doc_status.get("url"),
        generated_at=doc_status.get("generated_at"),
    )


@router.get("/{server_id}/view")
async def view_documentation(
    server_id: UUID,
    format: str = "html",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    View generated documentation for an MCP server.

    Args:
        server_id: MCP server ID
        format: Documentation format (html, markdown, json)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Documentation content in requested format

    Raises:
        HTTPException: If server not found or documentation not available
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(MCPServer.id == server_id, MCPServer.owner_id == current_user.id)
        )
    )
    server = result.scalar_one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="MCP server not found"
        )

    # Get documentation content
    doc_generator = DocumentationGenerator()
    doc_content = await doc_generator.get_documentation_content(server.id, format)

    if not doc_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documentation not found. Generate documentation first.",
        )

    if format == "html":
        return HTMLResponse(content=doc_content)
    elif format == "json":
        return JSONResponse(content=doc_content)
    else:
        return {"content": doc_content, "format": format}


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_documentation(
    server_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    Delete documentation for an MCP server.

    Args:
        server_id: MCP server ID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If server not found or access denied
    """
    result = await db.execute(
        select(MCPServer).where(
            and_(MCPServer.id == server_id, MCPServer.owner_id == current_user.id)
        )
    )
    server = result.scalar_one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="MCP server not found"
        )

    # Delete documentation
    doc_generator = DocumentationGenerator()
    await doc_generator.delete_documentation(server.id)
