# MCP Hub Platform

A comprehensive platform for automatically generating and deploying MCP (Model Context Protocol) servers from user-provided APIs.

## Overview

The MCP Hub platform enables users to:
- Register and configure their APIs (REST, GraphQL, etc.)
- Automatically generate MCP server code that wraps these APIs as MCP tools
- Deploy and manage generated MCP servers
- Monitor and manage running servers
- Get documentation on connecting servers to MCP clients like Claude

## Architecture

### Core Components

1. **Core Module** - Shared domain models, utilities, and common functionality
2. **Registration Service** - API registration, validation, and configuration management
3. **Generator Service** - Dynamic MCP server code generation
4. **Deployment Service** - Container orchestration and server lifecycle management
5. **Web UI** - React-based user interface for platform management

### Technology Stack

- **Backend**: Python 3.11+, FastAPI, Python MCP SDK
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Container Orchestration**: Docker, Kubernetes
- **Frontend**: Next.js 14+ with TypeScript (App Router)
- **Security**: FastAPI Security, python-jose for JWT, encrypted credential storage
- **Monitoring**: FastAPI metrics, Prometheus integration

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Poetry or pip (for Python dependency management)

### Development Setup

1. Clone the repository
2. Start infrastructure services:
   ```bash
   docker-compose up -d postgres redis
   ```
3. Set up Python environment and install dependencies:
   ```bash
   # Using Poetry (recommended)
   poetry install
   poetry shell

   # Or using pip
   pip install -r requirements.txt
   ```
4. Run services:
   ```bash
   # Registration service
   cd registration-service
   uvicorn app.main:app --reload --port 8081

   # Generator service
   cd generator-service
   uvicorn app.main:app --reload --port 8082

   # Deployment service
   cd deployment-service
   uvicorn app.main:app --reload --port 8083
   ```
5. Start the web UI:
   ```bash
   cd web-ui
   npm install
   npm run dev
   ```

## Project Structure

```
mcp-hub-platform/
├── core/                    # Shared domain models and utilities
├── registration-service/    # API registration and management
├── generator-service/       # MCP server code generation
├── deployment-service/      # Container orchestration
├── web-ui/                 # React frontend
├── docs/                   # Documentation
└── docker-compose.yml     # Development infrastructure
```

## Security Considerations

- All API credentials are encrypted at rest using AES-256
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Network isolation for generated MCP servers
- Rate limiting and request validation

## Scalability Features

- Microservices architecture with independent scaling
- Container-based deployment with Kubernetes support
- Async processing for code generation and deployment
- Database connection pooling and caching
- Load balancing for generated MCP servers

## Contributing

Please read our [Contributing Guide](docs/contributing.md) for development guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
