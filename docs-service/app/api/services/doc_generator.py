"""
Documentation generation service.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader, Template
import markdown
from markdown.extensions import codehilite, tables, toc

from core.models.api_registration import APIRegistration, APIType
from core.models.mcp_server import MCPServer
from core.config import settings

logger = structlog.get_logger()


class DocumentationGenerator:
    """Service for generating documentation from MCP servers and API specifications."""

    def __init__(self):
        self.docs_base_dir = Path(settings.docs.output_directory)
        self.docs_base_dir.mkdir(parents=True, exist_ok=True)

        # Setup Jinja2 environment
        template_dir = Path(__file__).parent / "templates"
        template_dir.mkdir(exist_ok=True)
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(template_dir)), autoescape=True
        )

        # Markdown processor
        self.markdown_processor = markdown.Markdown(
            extensions=["codehilite", "tables", "toc", "fenced_code"]
        )

    async def generate_documentation(
        self,
        mcp_server: MCPServer,
        api_registration: APIRegistration,
        format: str = "markdown",
        include_examples: bool = True,
        include_schemas: bool = True,
    ) -> Dict[str, Any]:
        """
        Generate documentation for an MCP server.

        Args:
            mcp_server: MCP server instance
            api_registration: API registration
            format: Documentation format (markdown, html, json)
            include_examples: Include API examples
            include_schemas: Include data schemas

        Returns:
            Dict[str, Any]: Generation result
        """
        try:
            logger.info(
                "Starting documentation generation",
                server_id=mcp_server.id,
                server_name=mcp_server.name,
                format=format,
            )

            # Create server-specific documentation directory
            server_docs_dir = self.docs_base_dir / str(mcp_server.id)
            server_docs_dir.mkdir(exist_ok=True)

            # Prepare documentation data
            doc_data = await self._prepare_documentation_data(
                mcp_server, api_registration, include_examples, include_schemas
            )

            # Generate documentation based on format
            if format == "markdown":
                content = await self._generate_markdown_docs(doc_data)
                file_path = server_docs_dir / "README.md"
            elif format == "html":
                content = await self._generate_html_docs(doc_data)
                file_path = server_docs_dir / "index.html"
            elif format == "json":
                content = json.dumps(doc_data, indent=2, default=str)
                file_path = server_docs_dir / "api_docs.json"
            else:
                raise ValueError(f"Unsupported format: {format}")

            # Write documentation to file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

            # Save metadata
            metadata = {
                "server_id": str(mcp_server.id),
                "format": format,
                "generated_at": datetime.utcnow().isoformat(),
                "file_path": str(file_path),
                "include_examples": include_examples,
                "include_schemas": include_schemas,
            }

            metadata_path = server_docs_dir / "metadata.json"
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)

            logger.info(
                "Documentation generation completed",
                server_id=mcp_server.id,
                file_path=str(file_path),
            )

            return {
                "success": True,
                "file_path": str(file_path),
                "format": format,
                "metadata": metadata,
            }

        except Exception as e:
            logger.error(
                "Documentation generation failed", server_id=mcp_server.id, error=str(e)
            )
            return {"success": False, "error": str(e)}

    async def get_documentation_status(self, server_id: UUID) -> Dict[str, Any]:
        """
        Get documentation status for a server.

        Args:
            server_id: MCP server ID

        Returns:
            Dict[str, Any]: Documentation status
        """
        server_docs_dir = self.docs_base_dir / str(server_id)
        metadata_path = server_docs_dir / "metadata.json"

        if not metadata_path.exists():
            return {
                "status": "not_generated",
                "message": "Documentation has not been generated",
            }

        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)

            # Check if documentation file exists
            file_path = Path(metadata["file_path"])
            if not file_path.exists():
                return {"status": "error", "message": "Documentation file not found"}

            return {
                "status": "ready",
                "format": metadata["format"],
                "generated_at": metadata["generated_at"],
                "url": f"/docs/{server_id}/view",
                "message": "Documentation is ready",
            }

        except Exception as e:
            logger.error("Failed to get documentation status", error=str(e))
            return {
                "status": "error",
                "message": f"Failed to read documentation metadata: {str(e)}",
            }

    async def get_documentation_content(
        self, server_id: UUID, format: str = "html"
    ) -> Optional[str]:
        """
        Get documentation content for a server.

        Args:
            server_id: MCP server ID
            format: Requested format

        Returns:
            Optional[str]: Documentation content
        """
        server_docs_dir = self.docs_base_dir / str(server_id)

        # Determine file path based on format
        if format == "html":
            file_path = server_docs_dir / "index.html"
            # If HTML doesn't exist, try to convert from markdown
            if not file_path.exists():
                md_path = server_docs_dir / "README.md"
                if md_path.exists():
                    with open(md_path, "r", encoding="utf-8") as f:
                        md_content = f.read()
                    return self.markdown_processor.convert(md_content)
        elif format == "markdown":
            file_path = server_docs_dir / "README.md"
        elif format == "json":
            file_path = server_docs_dir / "api_docs.json"
        else:
            return None

        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error("Failed to read documentation content", error=str(e))
            return None

    async def delete_documentation(self, server_id: UUID) -> bool:
        """
        Delete documentation for a server.

        Args:
            server_id: MCP server ID

        Returns:
            bool: True if successful
        """
        try:
            server_docs_dir = self.docs_base_dir / str(server_id)
            if server_docs_dir.exists():
                import shutil

                shutil.rmtree(server_docs_dir)
            return True
        except Exception as e:
            logger.error("Failed to delete documentation", error=str(e))
            return False

    async def _prepare_documentation_data(
        self,
        mcp_server: MCPServer,
        api_registration: APIRegistration,
        include_examples: bool,
        include_schemas: bool,
    ) -> Dict[str, Any]:
        """
        Prepare data for documentation generation.

        Args:
            mcp_server: MCP server instance
            api_registration: API registration
            include_examples: Include API examples
            include_schemas: Include data schemas

        Returns:
            Dict[str, Any]: Documentation data
        """
        doc_data = {
            "metadata": {
                "title": f"{mcp_server.name} - MCP Server Documentation",
                "description": mcp_server.description or "Generated MCP Server",
                "version": "1.0.0",
                "server_name": mcp_server.name,
                "api_type": api_registration.api_type.value,
                "base_url": api_registration.base_url,
                "generated_at": datetime.utcnow().isoformat(),
            },
            "overview": {
                "description": mcp_server.description
                or "This MCP server provides access to the underlying API.",
                "api_name": api_registration.name,
                "api_description": api_registration.description or "",
                "authentication": api_registration.authentication_type.value,
            },
            "endpoints": [],
            "schemas": {},
            "examples": [],
        }

        # Extract API specification data
        if api_registration.specification:
            spec = api_registration.specification

            if api_registration.api_type == APIType.REST:
                doc_data["endpoints"] = self._extract_rest_endpoints(
                    spec, include_examples
                )
                if include_schemas:
                    doc_data["schemas"] = self._extract_schemas(spec)
            elif api_registration.api_type == APIType.GRAPHQL:
                doc_data["schema"] = self._extract_graphql_schema(spec)
                if include_examples:
                    doc_data["examples"] = self._generate_graphql_examples(spec)

        # Add MCP-specific information
        doc_data["mcp_info"] = {
            "server_id": str(mcp_server.id),
            "docker_image": (
                f"{mcp_server.docker_image_name}:{mcp_server.docker_image_tag}"
                if mcp_server.docker_image_name
                else None
            ),
            "config": mcp_server.mcp_config or {},
        }

        return doc_data

    def _extract_rest_endpoints(
        self, spec: Dict[str, Any], include_examples: bool
    ) -> List[Dict[str, Any]]:
        """Extract REST API endpoints from OpenAPI specification."""
        endpoints = []

        if "paths" in spec:
            for path, path_item in spec["paths"].items():
                for method, operation in path_item.items():
                    if method.lower() in [
                        "get",
                        "post",
                        "put",
                        "delete",
                        "patch",
                        "options",
                        "head",
                    ]:
                        endpoint = {
                            "method": method.upper(),
                            "path": path,
                            "summary": operation.get("summary", ""),
                            "description": operation.get("description", ""),
                            "parameters": operation.get("parameters", []),
                            "request_body": operation.get("requestBody"),
                            "responses": operation.get("responses", {}),
                        }

                        if include_examples:
                            endpoint["examples"] = self._generate_rest_examples(
                                path, method, operation
                            )

                        endpoints.append(endpoint)

        return endpoints

    def _extract_schemas(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Extract data schemas from API specification."""
        schemas = {}

        if "components" in spec and "schemas" in spec["components"]:
            schemas = spec["components"]["schemas"]
        elif "definitions" in spec:  # OpenAPI 2.0
            schemas = spec["definitions"]

        return schemas

    def _extract_graphql_schema(self, spec: Dict[str, Any]) -> str:
        """Extract GraphQL schema definition."""
        return spec.get("schema", "")

    def _generate_rest_examples(
        self, path: str, method: str, operation: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate REST API examples."""
        examples = []

        # Basic curl example
        curl_example = f"curl -X {method.upper()} '{path}'"

        if method.lower() in ["post", "put", "patch"] and operation.get("requestBody"):
            curl_example += " \\\n  -H 'Content-Type: application/json' \\\n  -d '{}'"

        examples.append(
            {
                "title": f"{method.upper()} {path}",
                "language": "bash",
                "code": curl_example,
            }
        )

        return examples

    def _generate_graphql_examples(self, spec: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate GraphQL examples."""
        examples = []

        # Basic query example
        examples.append(
            {
                "title": "Basic Query",
                "language": "graphql",
                "code": "query {\n  # Add your query here\n}",
            }
        )

        return examples

    async def _generate_markdown_docs(self, doc_data: Dict[str, Any]) -> str:
        """Generate Markdown documentation."""
        template = self.jinja_env.get_template("markdown_template.md")
        return template.render(**doc_data)

    async def _generate_html_docs(self, doc_data: Dict[str, Any]) -> str:
        """Generate HTML documentation."""
        template = self.jinja_env.get_template("html_template.html")
        return template.render(**doc_data)
