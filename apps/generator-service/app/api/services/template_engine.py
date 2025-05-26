"""
Template engine for generating MCP server code.
"""

import os
from pathlib import Path
from typing import Any, Dict, List

import structlog
from jinja2 import Environment, FileSystemLoader, select_autoescape

logger = structlog.get_logger()


class TemplateEngine:
    """Template engine for code generation using Jinja2."""
    
    def __init__(self, templates_dir: str = "templates"):
        """
        Initialize template engine.
        
        Args:
            templates_dir: Directory containing templates
        """
        self.templates_dir = Path(templates_dir)
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True,
        )
        
        # Create default templates if they don't exist
        self._create_default_templates()
    
    async def generate_from_template(
        self,
        template_name: str,
        output_directory: str,
        variables: Dict[str, Any]
    ) -> List[str]:
        """
        Generate code from template.
        
        Args:
            template_name: Name of the template to use
            output_directory: Output directory for generated files
            variables: Variables to pass to template
            
        Returns:
            List[str]: List of generated file paths
        """
        output_path = Path(output_directory)
        output_path.mkdir(parents=True, exist_ok=True)
        
        generated_files = []
        
        try:
            # Get template directory
            template_dir = self.templates_dir / template_name
            if not template_dir.exists():
                raise FileNotFoundError(f"Template '{template_name}' not found")
            
            # Process all template files
            for template_file in template_dir.rglob("*.j2"):
                # Calculate relative path
                rel_path = template_file.relative_to(template_dir)
                
                # Remove .j2 extension for output file
                output_file_path = output_path / str(rel_path)[:-3]
                output_file_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Render template
                template_rel_path = template_file.relative_to(self.templates_dir)
                template = self.env.get_template(str(template_rel_path))
                rendered_content = template.render(**variables)
                
                # Write rendered content
                with open(output_file_path, 'w', encoding='utf-8') as f:
                    f.write(rendered_content)
                
                generated_files.append(str(output_file_path))
                logger.debug("Generated file", file=str(output_file_path))
            
            # Copy non-template files
            for file_path in template_dir.rglob("*"):
                if file_path.is_file() and not file_path.name.endswith('.j2'):
                    rel_path = file_path.relative_to(template_dir)
                    output_file_path = output_path / rel_path
                    output_file_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Copy file
                    import shutil
                    shutil.copy2(file_path, output_file_path)
                    generated_files.append(str(output_file_path))
            
            logger.info(
                "Template generation completed",
                template=template_name,
                files_generated=len(generated_files)
            )
            
            return generated_files
            
        except Exception as e:
            logger.error("Template generation failed", error=str(e))
            raise
    
    def _create_default_templates(self) -> None:
        """Create default templates if they don't exist."""
        # Create REST API server template
        rest_template_dir = self.templates_dir / "rest_api_server"
        rest_template_dir.mkdir(parents=True, exist_ok=True)
        
        # Main server file
        main_py_template = rest_template_dir / "main.py.j2"
        if not main_py_template.exists():
            main_py_content = '''"""
Generated MCP Server for {{ api_name }}
{{ api_description }}
"""

import asyncio
import json
from typing import Any, Dict, List, Optional

from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    ListToolsResult,
    Tool,
    TextContent,
)
import httpx
import structlog

logger = structlog.get_logger()

# Server configuration
SERVER_NAME = "{{ server_name }}"
SERVER_VERSION = "1.0.0"
API_BASE_URL = "{{ base_url }}"

# Authentication configuration
AUTH_TYPE = "{{ authentication_type }}"
{% if credentials %}
CREDENTIALS = {{ credentials | tojson }}
{% else %}
CREDENTIALS = {}
{% endif %}

class {{ server_name.replace(' ', '').replace('-', '') }}MCPServer:
    """MCP Server for {{ api_name }}."""
    
    def __init__(self):
        self.server = Server(SERVER_NAME)
        self.client = httpx.AsyncClient()
        self._setup_tools()
    
    def _setup_tools(self):
        """Setup MCP tools based on API specification."""
        
        @self.server.list_tools()
        async def list_tools() -> List[Tool]:
            """List available tools."""
            return [
                Tool(
                    name="api_call",
                    description="Make a call to the {{ api_name }} API",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "endpoint": {
                                "type": "string",
                                "description": "API endpoint path"
                            },
                            "method": {
                                "type": "string",
                                "enum": ["GET", "POST", "PUT", "DELETE"],
                                "default": "GET",
                                "description": "HTTP method"
                            },
                            "params": {
                                "type": "object",
                                "description": "Query parameters"
                            },
                            "data": {
                                "type": "object",
                                "description": "Request body data"
                            }
                        },
                        "required": ["endpoint"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
            """Handle tool calls."""
            if name == "api_call":
                return await self._handle_api_call(arguments)
            else:
                raise ValueError(f"Unknown tool: {name}")
    
    async def _handle_api_call(self, arguments: Dict[str, Any]) -> CallToolResult:
        """Handle API call tool."""
        try:
            endpoint = arguments.get("endpoint", "")
            method = arguments.get("method", "GET").upper()
            params = arguments.get("params", {})
            data = arguments.get("data", {})
            
            # Construct full URL
            url = f"{API_BASE_URL.rstrip('/')}/{endpoint.lstrip('/')}"
            
            # Prepare headers
            headers = {"User-Agent": f"{SERVER_NAME}/{SERVER_VERSION}"}
            
            # Add authentication
            if AUTH_TYPE == "bearer_token" and "token" in CREDENTIALS:
                headers["Authorization"] = f"Bearer {CREDENTIALS['token']}"
            elif AUTH_TYPE == "api_key" and "api_key" in CREDENTIALS:
                header_name = CREDENTIALS.get("header_name", "X-API-Key")
                headers[header_name] = CREDENTIALS["api_key"]
            
            # Make request
            response = await self.client.request(
                method=method,
                url=url,
                params=params,
                json=data if data else None,
                headers=headers
            )
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            result = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "data": response_data
            }
            
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=json.dumps(result, indent=2)
                    )
                ]
            )
            
        except Exception as e:
            logger.error("API call failed", error=str(e))
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"Error: {str(e)}"
                    )
                ],
                isError=True
            )
    
    async def run(self):
        """Run the MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name=SERVER_NAME,
                    server_version=SERVER_VERSION,
                    capabilities=self.server.get_capabilities(
                        notification_options=None,
                        experimental_capabilities={}
                    )
                )
            )

async def main():
    """Main entry point."""
    server = {{ server_name.replace(' ', '').replace('-', '') }}MCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
'''
            with open(main_py_template, 'w', encoding='utf-8') as f:
                f.write(main_py_content)
        
        # Dockerfile template
        dockerfile_template = rest_template_dir / "Dockerfile.j2"
        if not dockerfile_template.exists():
            dockerfile_content = '''FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD python -c "import sys; sys.exit(0)"

# Run the server
CMD ["python", "main.py"]
'''
            with open(dockerfile_template, 'w', encoding='utf-8') as f:
                f.write(dockerfile_content)
        
        # Requirements template
        requirements_template = rest_template_dir / "requirements.txt.j2"
        if not requirements_template.exists():
            requirements_content = '''mcp>=1.0.0
httpx>=0.25.0
structlog>=23.0.0
'''
            with open(requirements_template, 'w', encoding='utf-8') as f:
                f.write(requirements_content)
