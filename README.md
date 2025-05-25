# MCP Hub Platform

A comprehensive platform for automatically generating and deploying Model Context Protocol (MCP) servers from existing APIs.

## Overview

The MCP Hub Platform enables developers to quickly transform their existing APIs into MCP-compatible servers that can be used with AI assistants like Claude. The platform provides:

- **API Registration**: Register and validate your existing APIs
- **Automatic Code Generation**: Generate optimized MCP server code
- **Container Deployment**: Deploy servers to Docker/Kubernetes
- **Monitoring & Management**: Track performance and manage deployments
- **Real-time Updates**: WebSocket-based live status updates

## Architecture

The platform follows a microservices architecture with the following components:

### Core Services

1. **Registration Service** (Port 8081)
   - User authentication and management
   - API registration and validation
   - Credential management with encryption

2. **Generator Service** (Port 8082)
   - MCP server code generation
   - Template-based code creation
   - Docker image building

3. **Deployment Service** (Port 8083)
   - Container orchestration
   - Kubernetes deployment management
   - Health monitoring and scaling

4. **Web UI** (Port 3000)
   - Next.js-based user interface
   - Real-time status updates
   - API and deployment management

### Infrastructure

- **PostgreSQL**: Primary database for all services
- **Redis**: Caching and session management
- **Docker**: Containerization platform
- **Kubernetes**: Container orchestration (optional)

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Security**: FastAPI Security with JWT
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Monitoring**: Prometheus + Structured Logging

### Frontend
- **Framework**: Next.js 14+ with TypeScript (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Real-time**: WebSocket connections
- **Testing**: Jest + React Testing Library

### DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

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
