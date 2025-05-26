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

## 📈 Phase 2 Implementation Status

### ✅ Completed Features

#### Backend API Development
- [x] **FastAPI Backend**: Complete FastAPI implementation with SQLAlchemy models
- [x] **Database Schema**: Full database models for API registration, MCP servers, deployments, and user management
- [x] **Registration Service**: Complete API registration and management endpoints
- [x] **Generator Service**: MCP server code generation endpoints with background tasks
- [x] **Deployment Service**: Container orchestration and deployment management
- [x] **Documentation Service**: NEW - Auto-generate API documentation in multiple formats

#### API Gateway & Routing
- [x] **API Gateway**: Unified API endpoint with request routing to all microservices
- [x] **Authentication Middleware**: JWT-based authentication with refresh tokens
- [x] **Rate Limiting**: Request rate limiting and burst protection
- [x] **Health Checks**: Individual and aggregate service health monitoring

#### WebSocket Integration
- [x] **Real-time Updates**: WebSocket connections for status updates during generation and deployment
- [x] **Connection Management**: Centralized WebSocket connection manager
- [x] **User-specific Channels**: Per-user and per-resource WebSocket channels

#### Security Implementation
- [x] **JWT Authentication**: Access and refresh token implementation
- [x] **Password Security**: Bcrypt password hashing
- [x] **Data Encryption**: Sensitive credential encryption at rest
- [x] **Authorization Middleware**: Role-based access control

#### Database & Models
- [x] **Complete Schema**: All database models with proper relationships
- [x] **Migrations**: Database migration system with Alembic
- [x] **Cascade Deletions**: Proper foreign key relationships and cascade behavior
- [x] **Async Support**: Full async/await database operations

#### Configuration Management
- [x] **Centralized Config**: Comprehensive configuration management
- [x] **Environment Variables**: Production-ready environment configuration
- [x] **Service Settings**: Individual service configuration options
- [x] **Documentation Settings**: NEW - Documentation generation configuration

#### Testing Framework
- [x] **Integration Tests**: Comprehensive Phase 2 integration test suite
- [x] **Database Tests**: Model and relationship testing
- [x] **Security Tests**: Authentication and encryption testing
- [x] **Service Tests**: Individual service testing

#### Docker & Deployment
- [x] **Docker Compose**: Complete multi-service Docker setup
- [x] **Service Containers**: Individual Dockerfiles for each service
- [x] **Volume Management**: Persistent data storage configuration
- [x] **Network Configuration**: Service-to-service communication

### 🔄 Architecture Highlights

#### Microservices Design
- **5 Independent Services**: Registration, Generator, Deployment, Documentation, API Gateway
- **Service Isolation**: Each service has its own codebase and can be deployed independently
- **Unified API**: Single API gateway endpoint for all client interactions
- **Health Monitoring**: Individual and aggregate health check endpoints

#### Real-time Features
- **WebSocket Support**: Real-time status updates for long-running operations
- **Background Tasks**: Async task processing for generation and deployment
- **Status Tracking**: Comprehensive status tracking throughout workflows

#### Security & Scalability
- **JWT Authentication**: Stateless authentication with refresh token rotation
- **Rate Limiting**: Protection against abuse with configurable limits
- **Data Encryption**: Sensitive data encrypted at rest
- **Horizontal Scaling**: Services designed for horizontal scaling

### 🎯 Next Steps

The Phase 2 backend implementation is now complete and ready for:

1. **Frontend Integration**: Connect the Next.js frontend to the API gateway
2. **End-to-End Testing**: Test complete workflows from UI to deployment
3. **Performance Optimization**: Load testing and performance tuning
4. **Production Deployment**: Deploy to production environment
5. **Monitoring Setup**: Configure comprehensive monitoring and alerting

### 🚀 Getting Started with Phase 2

```bash
# Start all services
docker-compose up -d

# Check service health
curl http://localhost:8000/api/v1/health/all

# Access API documentation
open http://localhost:8000/api/v1/docs

# Run Phase 2 tests
pytest tests/test_phase2_integration.py -v
```

### 📖 API Usage Examples

#### 1. Register an API

```bash
curl -X POST "http://localhost:8000/api/v1/registrations" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "description": "A sample API",
    "base_url": "https://api.example.com",
    "api_type": "rest",
    "authentication_type": "api_key"
  }'
```

#### 2. Generate MCP Server

```bash
curl -X POST "http://localhost:8000/api/v1/generation" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "api_registration_id": "<registration-id>",
    "name": "My MCP Server",
    "description": "Generated MCP server"
  }'
```

#### 3. Deploy MCP Server

```bash
curl -X POST "http://localhost:8000/api/v1/deployments" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_server_id": "<server-id>",
    "name": "my-deployment",
    "replicas": 2
  }'
```

#### 4. Generate Documentation

```bash
curl -X POST "http://localhost:8000/api/v1/docs/generate" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_server_id": "<server-id>",
    "format": "html",
    "include_examples": true
  }'
```
