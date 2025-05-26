"""
Docker image builder service.
"""

import asyncio
import io
import tarfile
from pathlib import Path
from typing import Any, Dict, List, Optional

import docker
import structlog

logger = structlog.get_logger()


class DockerBuilder:
    """Service for building Docker images."""

    def __init__(self):
        """Initialize Docker builder."""
        try:
            self.client = docker.from_env()
            # Test connection
            self.client.ping()
            logger.info("Docker client initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize Docker client", error=str(e))
            self.client = None

    async def build_image(
        self,
        source_directory: str,
        image_name: str,
        image_tag: str = "latest",
        build_args: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Build Docker image from source directory.

        Args:
            source_directory: Path to source code directory
            image_name: Name for the Docker image
            image_tag: Tag for the Docker image
            build_args: Build arguments

        Returns:
            Dict[str, Any]: Build result
        """
        if not self.client:
            return {
                "success": False,
                "error": "Docker client not available",
                "logs": "Docker client initialization failed",
            }

        try:
            source_path = Path(source_directory)
            if not source_path.exists():
                return {
                    "success": False,
                    "error": f"Source directory does not exist: {source_directory}",
                    "logs": "",
                }

            # Check if Dockerfile exists
            dockerfile_path = source_path / "Dockerfile"
            if not dockerfile_path.exists():
                return {
                    "success": False,
                    "error": "Dockerfile not found in source directory",
                    "logs": "",
                }

            full_image_name = f"{image_name}:{image_tag}"
            build_logs = []

            logger.info(
                "Starting Docker build",
                image_name=full_image_name,
                source_directory=source_directory,
            )

            # Build image
            try:
                image, build_log_generator = self.client.images.build(
                    path=str(source_path),
                    tag=full_image_name,
                    rm=True,  # Remove intermediate containers
                    forcerm=True,  # Always remove intermediate containers
                    buildargs=build_args or {},
                    decode=True,
                )

                # Collect build logs
                for log_entry in build_log_generator:
                    if "stream" in log_entry:
                        log_line = log_entry["stream"].strip()
                        if log_line:
                            build_logs.append(log_line)
                            logger.debug("Docker build log", line=log_line)
                    elif "error" in log_entry:
                        error_msg = log_entry["error"]
                        build_logs.append(f"ERROR: {error_msg}")
                        logger.error("Docker build error", error=error_msg)
                        return {
                            "success": False,
                            "error": error_msg,
                            "logs": "\n".join(build_logs),
                        }

                logger.info(
                    "Docker build completed successfully",
                    image_name=full_image_name,
                    image_id=image.id,
                )

                return {
                    "success": True,
                    "image_name": image_name,
                    "image_tag": image_tag,
                    "image_id": image.id,
                    "logs": "\n".join(build_logs),
                }

            except docker.errors.BuildError as e:
                error_msg = f"Docker build failed: {str(e)}"
                logger.error("Docker build failed", error=error_msg)

                # Extract build logs from exception
                for log_entry in e.build_log:
                    if "stream" in log_entry:
                        build_logs.append(log_entry["stream"].strip())

                return {
                    "success": False,
                    "error": error_msg,
                    "logs": "\n".join(build_logs),
                }

        except Exception as e:
            error_msg = f"Unexpected error during Docker build: {str(e)}"
            logger.error("Docker build failed with unexpected error", error=error_msg)
            return {
                "success": False,
                "error": error_msg,
                "logs": "\n".join(build_logs) if "build_logs" in locals() else "",
            }

    async def push_image(
        self,
        image_name: str,
        image_tag: str = "latest",
        registry_auth: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Push Docker image to registry.

        Args:
            image_name: Name of the Docker image
            image_tag: Tag of the Docker image
            registry_auth: Registry authentication credentials

        Returns:
            Dict[str, Any]: Push result
        """
        if not self.client:
            return {
                "success": False,
                "error": "Docker client not available",
                "logs": "",
            }

        try:
            full_image_name = f"{image_name}:{image_tag}"

            logger.info("Starting Docker push", image_name=full_image_name)

            # Push image
            push_logs = []
            for log_entry in self.client.images.push(
                repository=image_name,
                tag=image_tag,
                auth_config=registry_auth,
                stream=True,
                decode=True,
            ):
                if "status" in log_entry:
                    log_line = log_entry["status"]
                    if "progress" in log_entry:
                        log_line += f" {log_entry['progress']}"
                    push_logs.append(log_line)
                    logger.debug("Docker push log", line=log_line)
                elif "error" in log_entry:
                    error_msg = log_entry["error"]
                    logger.error("Docker push error", error=error_msg)
                    return {
                        "success": False,
                        "error": error_msg,
                        "logs": "\n".join(push_logs),
                    }

            logger.info(
                "Docker push completed successfully", image_name=full_image_name
            )

            return {
                "success": True,
                "image_name": image_name,
                "image_tag": image_tag,
                "logs": "\n".join(push_logs),
            }

        except Exception as e:
            error_msg = f"Docker push failed: {str(e)}"
            logger.error("Docker push failed", error=error_msg)
            return {"success": False, "error": error_msg, "logs": ""}

    def list_images(self, name_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List Docker images.

        Args:
            name_filter: Optional name filter

        Returns:
            List[Dict[str, Any]]: List of images
        """
        if not self.client:
            return []

        try:
            images = self.client.images.list(name=name_filter)
            return [
                {
                    "id": image.id,
                    "tags": image.tags,
                    "created": image.attrs.get("Created"),
                    "size": image.attrs.get("Size"),
                }
                for image in images
            ]
        except Exception as e:
            logger.error("Failed to list Docker images", error=str(e))
            return []

    def remove_image(self, image_name: str, force: bool = False) -> bool:
        """
        Remove Docker image.

        Args:
            image_name: Name of the image to remove
            force: Force removal

        Returns:
            bool: True if successful
        """
        if not self.client:
            return False

        try:
            self.client.images.remove(image_name, force=force)
            logger.info("Docker image removed", image_name=image_name)
            return True
        except Exception as e:
            logger.error(
                "Failed to remove Docker image", image_name=image_name, error=str(e)
            )
            return False
