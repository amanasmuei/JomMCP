"""
MCP server generation service.
"""

import asyncio
import json
import os
import shutil
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import AsyncSessionLocal
from core.models.api_registration import APIRegistration, APIType
from core.models.mcp_server import MCPServer, MCPServerStatus
from core.security import decrypt_data
from core.config import settings
from core.websocket import send_status_update, send_log_update

from .template_engine import TemplateEngine
from .docker_builder import DockerBuilder

logger = structlog.get_logger()


class MCPServerGenerator:
    """Service for generating MCP servers from API specifications."""

    def __init__(self):
        self.template_engine = TemplateEngine()
        self.docker_builder = DockerBuilder()
        self.output_base_dir = Path(settings.generator.output_directory)
        self.output_base_dir.mkdir(parents=True, exist_ok=True)

    async def generate_mcp_server(
        self, server_id: UUID, api_registration: APIRegistration
    ) -> None:
        """
        Generate MCP server code and Docker image.

        Args:
            server_id: MCP server ID
            api_registration: API registration to generate server for
        """
        async with AsyncSessionLocal() as db:
            try:
                # Get MCP server record
                result = await db.execute(
                    select(MCPServer).where(MCPServer.id == server_id)
                )
                mcp_server = result.scalar_one_or_none()

                if not mcp_server:
                    logger.error("MCP server not found", server_id=server_id)
                    return

                # Update status to generating
                mcp_server.status = MCPServerStatus.GENERATING
                await db.commit()

                # Send WebSocket update
                await send_status_update(
                    mcp_server.owner_id,
                    "mcp_server",
                    str(mcp_server.id),
                    "generating",
                    "Starting code generation",
                )

                logger.info(
                    "Starting MCP server generation",
                    server_id=server_id,
                    api_name=api_registration.name,
                    api_type=api_registration.api_type,
                )

                # Generate code
                generation_result = await self._generate_code(
                    mcp_server, api_registration
                )

                if not generation_result["success"]:
                    mcp_server.status = MCPServerStatus.ERROR
                    mcp_server.error_message = generation_result["error"]
                    mcp_server.generation_logs = generation_result.get("logs", "")
                    await db.commit()
                    return

                # Update server with generation results
                mcp_server.generated_code_path = generation_result["output_directory"]
                mcp_server.generation_logs = generation_result.get("logs", "")
                mcp_server.status = MCPServerStatus.BUILDING
                await db.commit()

                # Build Docker image
                build_result = await self._build_docker_image(
                    mcp_server, generation_result["output_directory"]
                )

                if not build_result["success"]:
                    mcp_server.status = MCPServerStatus.ERROR
                    mcp_server.error_message = build_result["error"]
                    mcp_server.build_logs = build_result.get("logs", "")
                    await db.commit()
                    return

                # Update server with build results
                mcp_server.docker_image_name = build_result["image_name"]
                mcp_server.docker_image_tag = build_result["image_tag"]
                mcp_server.build_logs = build_result.get("logs", "")
                mcp_server.status = MCPServerStatus.READY
                await db.commit()

                logger.info(
                    "MCP server generation completed successfully",
                    server_id=server_id,
                    image_name=build_result["image_name"],
                )

            except Exception as e:
                logger.error(
                    "Error during MCP server generation",
                    server_id=server_id,
                    error=str(e),
                )

                # Update server with error
                try:
                    result = await db.execute(
                        select(MCPServer).where(MCPServer.id == server_id)
                    )
                    mcp_server = result.scalar_one_or_none()
                    if mcp_server:
                        mcp_server.status = MCPServerStatus.FAILED
                        mcp_server.error_message = str(e)
                        await db.commit()
                except Exception as db_error:
                    logger.error(
                        "Failed to update server error status", error=str(db_error)
                    )

    async def _generate_code(
        self, mcp_server: MCPServer, api_registration: APIRegistration
    ) -> Dict[str, Any]:
        """
        Generate MCP server code from API specification.

        Args:
            mcp_server: MCP server record
            api_registration: API registration

        Returns:
            Dict[str, Any]: Generation result
        """
        try:
            # Create output directory
            output_dir = self.output_base_dir / f"mcp_server_{mcp_server.id}"
            if output_dir.exists():
                shutil.rmtree(output_dir)
            output_dir.mkdir(parents=True)

            # Prepare template variables
            template_vars = await self._prepare_template_variables(
                mcp_server, api_registration
            )

            # Select template based on API type
            template_name = self._get_template_name(api_registration.api_type)

            # Generate code using template engine
            generated_files = await self.template_engine.generate_from_template(
                template_name=template_name,
                output_directory=str(output_dir),
                variables=template_vars,
            )

            return {
                "success": True,
                "output_directory": str(output_dir),
                "generated_files": generated_files,
                "logs": f"Generated {len(generated_files)} files successfully",
            }

        except Exception as e:
            logger.error("Code generation failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "logs": f"Code generation failed: {str(e)}",
            }

    async def _build_docker_image(
        self, mcp_server: MCPServer, source_directory: str
    ) -> Dict[str, Any]:
        """
        Build Docker image for the generated MCP server.

        Args:
            mcp_server: MCP server record
            source_directory: Source code directory

        Returns:
            Dict[str, Any]: Build result
        """
        try:
            # Generate image name and tag
            image_name = f"{settings.docker.namespace}/mcp-server-{mcp_server.name.lower().replace(' ', '-')}"
            image_tag = f"v{mcp_server.id.hex[:8]}"

            # Build Docker image
            build_result = await self.docker_builder.build_image(
                source_directory=source_directory,
                image_name=image_name,
                image_tag=image_tag,
            )

            return {
                "success": build_result["success"],
                "image_name": image_name,
                "image_tag": image_tag,
                "image_id": build_result.get("image_id"),
                "logs": build_result.get("logs", ""),
                "error": build_result.get("error"),
            }

        except Exception as e:
            logger.error("Docker build failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "logs": f"Docker build failed: {str(e)}",
            }

    async def _prepare_template_variables(
        self, mcp_server: MCPServer, api_registration: APIRegistration
    ) -> Dict[str, Any]:
        """
        Prepare variables for template rendering.

        Args:
            mcp_server: MCP server record
            api_registration: API registration

        Returns:
            Dict[str, Any]: Template variables
        """
        # Decrypt credentials if present
        credentials = {}
        if api_registration.encrypted_credentials:
            try:
                credentials_json = decrypt_data(api_registration.encrypted_credentials)
                credentials = json.loads(credentials_json)
            except Exception as e:
                logger.warning("Failed to decrypt credentials", error=str(e))

        return {
            "server_name": mcp_server.name,
            "server_description": mcp_server.description or "",
            "api_name": api_registration.name,
            "api_description": api_registration.description or "",
            "base_url": api_registration.base_url,
            "api_type": api_registration.api_type.value,
            "authentication_type": api_registration.authentication_type.value,
            "credentials": credentials,
            "specification": api_registration.specification or {},
            "configuration": api_registration.configuration or {},
            "mcp_config": mcp_server.mcp_config or {},
            "health_check_url": api_registration.health_check_url,
            "health_check_interval": api_registration.health_check_interval_seconds,
        }

    def _get_template_name(self, api_type: APIType) -> str:
        """
        Get template name based on API type.

        Args:
            api_type: API type

        Returns:
            str: Template name
        """
        template_mapping = {
            APIType.REST: "rest_api_server",
            APIType.GRAPHQL: "graphql_server",
            APIType.SOAP: "soap_server",
            APIType.GRPC: "grpc_server",
            APIType.WEBSOCKET: "websocket_server",
        }

        return template_mapping.get(api_type, "rest_api_server")
