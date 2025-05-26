# JomMCP Development Guide

This guide covers development setup, coding standards, and best practices for contributing to the JomMCP platform.

## 🚀 Quick Development Setup

### Prerequisites

- **Python 3.11+** - [Download](https://python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Install Guide](https://docs.docker.com/get-docker/)
- **Git** - [Install Guide](https://git-scm.com/downloads)

### Environment Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/jommcp/jommcp.git
cd jommcp

# 2️⃣ Set up Python environment (choose one)
# Option A: Using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r config/requirements.txt

# Option B: Using conda
conda create -n jommcp python=3.11
conda activate jommcp
pip install -r config/requirements.txt

# Option C: Using poetry (recommended)
poetry install
poetry shell

# 3️⃣ Set up environment variables
cp config/development/.env.example config/development/.env
# Edit the .env file with your local settings

# 4️⃣ Start infrastructure services
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

# 5️⃣ Run database migrations
cd database/migrations
alembic upgrade head
cd ../..

# 6️⃣ Set up frontend
cd apps/web-ui
npm install
cd ../..
```

## 📁 Project Structure

Understanding the project organization:

```
jommcp/
├── 📁 apps/                       # Main applications
│   ├── api-gateway/               # Central routing and authentication
│   ├── registration-service/      # User and API management
│   ├── generator-service/         # MCP server generation
│   ├── deployment-service/        # Container orchestration
│   ├── docs-service/             # Documentation generation
│   └── web-ui/                   # React/Next.js frontend
│
├── 📁 packages/                   # Shared libraries
│   └── core/                     # Common utilities and models
│
├── 📁 infrastructure/             # Deployment configurations
├── 📁 database/                   # Database schemas and migrations
├── 📁 tests/                      # All test suites
├── 📁 scripts/                    # Development and build scripts
├── 📁 docs/                       # Project documentation
└── 📁 config/                     # Environment configurations
```

## 🏃‍♂️ Running the Application

### Start All Services

```bash
# Terminal 1: API Gateway
PYTHONPATH=packages:apps python apps/api-gateway/main.py

# Terminal 2: Registration Service
PYTHONPATH=packages:apps python apps/registration-service/run.py

# Terminal 3: Generator Service
PYTHONPATH=packages:apps python apps/generator-service/run.py

# Terminal 4: Deployment Service
PYTHONPATH=packages:apps python apps/deployment-service/run.py

# Terminal 5: Documentation Service
PYTHONPATH=packages:apps python apps/docs-service/run.py

# Terminal 6: Frontend
cd apps/web-ui && npm run dev
```

### Using Development Scripts

```bash
# Start all backend services
python scripts/dev/start_services.py

# Check service status
python scripts/dev/quick_service_status.py
```

### Using Docker (Alternative)

```bash
# Start all services with Docker
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Stop services
docker-compose -f infrastructure/docker/docker-compose.yml down
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test suites
pytest tests/unit/ -v          # Fast unit tests
pytest tests/integration/ -v   # Service integration tests
pytest tests/e2e/ -v          # End-to-end workflows

# Run with coverage
pytest --cov=apps --cov=packages --cov-report=html tests/

# Run specific test file
pytest tests/unit/test_api_gateway.py -v

# Run specific test function
pytest tests/unit/test_api_gateway.py::test_health_endpoint -v
```

### Writing Tests

#### Unit Test Example

```python
# tests/unit/test_registration_service.py
import pytest
from apps.registration_service.app.api.schemas.user import UserCreate
from packages.core.security import get_password_hash, verify_password

def test_password_hashing():
    """Test password hashing and verification"""
    password = "SecurePassword123!"
    hashed = get_password_hash(password)
    
    assert verify_password(password, hashed)
    assert not verify_password("wrong_password", hashed)

@pytest.mark.asyncio
async def test_user_creation():
    """Test user creation with valid data"""
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="SecurePass123!",
        full_name="Test User"
    )
    
    assert user_data.username == "testuser"
    assert user_data.email == "test@example.com"
```

#### Integration Test Example

```python
# tests/integration/test_api_flow.py
import pytest
from httpx import AsyncClient
from apps.api_gateway.main import app

@pytest.mark.asyncio
async def test_user_registration_flow():
    """Test complete user registration through API Gateway"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register new user
        response = await client.post("/api/v1/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "New User"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "newuser"
```

## 📝 Coding Standards

### Python Code Style

We follow PEP 8 with some modifications:

```python
# Use type hints
def get_user_by_id(user_id: int) -> Optional[User]:
    """Get user by ID with proper type hints."""
    return db.query(User).filter(User.id == user_id).first()

# Use descriptive variable names
user_registration_data = UserCreate(...)
api_registration_result = register_api(...)

# Use docstrings for functions
def generate_mcp_server(api_data: APIRegistration) -> MCPServerConfig:
    """
    Generate MCP server configuration from API registration.
    
    Args:
        api_data: The registered API information
        
    Returns:
        MCPServerConfig: Generated server configuration
        
    Raises:
        ValidationError: If API data is invalid
    """
    pass
```

### Code Organization

```python
# File structure for services
apps/service-name/
├── __init__.py
├── main.py                 # FastAPI app entry point
├── run.py                  # Development server runner
├── requirements.txt        # Service-specific dependencies
├── Dockerfile             # Container configuration
└── app/
    ├── __init__.py
    ├── main.py            # FastAPI application factory
    ├── middleware.py      # Custom middleware
    └── api/
        ├── __init__.py
        ├── dependencies.py # Dependency injection
        ├── schemas/       # Pydantic models
        ├── services/      # Business logic
        └── v1/           # API version endpoints
```

### Import Organization

```python
# Standard library imports
import os
import sys
from typing import Optional, List, Dict, Any

# Third-party imports
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import pytest

# Local package imports
from packages.core.config import settings
from packages.core.database import get_db
from packages.core.models.user import User

# Local app imports
from .dependencies import get_current_user
from .schemas.user import UserCreate, UserResponse
```

### TypeScript/React Code Style

```typescript
// Use proper TypeScript types
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

// Use functional components with hooks
const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.fullName}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

## 🔧 Development Tools

### Code Quality Tools

```bash
# Install development tools
pip install black isort flake8 mypy pre-commit

# Format code
black apps/ packages/ tests/
isort apps/ packages/ tests/

# Lint code
flake8 apps/ packages/ tests/
mypy apps/ packages/

# Set up pre-commit hooks
pre-commit install
```

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
```

### IDE Configuration

#### VS Code Settings

```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.formatting.provider": "black",
  "python.sortImports.args": ["--profile", "black"],
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm Settings

- Enable Black formatter
- Configure import optimization
- Set up code inspections for type hints
- Enable pytest as test runner

## 🐛 Debugging

### Local Debugging

```python
# Add debug prints
import logging
logging.basicConfig(level=logging.DEBUG)

logger = logging.getLogger(__name__)
logger.debug(f"Processing user {user_id}")

# Use pdb for interactive debugging
import pdb; pdb.set_trace()

# Use ipdb for enhanced debugging
import ipdb; ipdb.set_trace()
```

### Service Debugging

```bash
# Debug specific service
PYTHONPATH=packages:apps python -m pdb apps/api-gateway/main.py

# Run with debug logging
DEBUG=true PYTHONPATH=packages:apps python apps/api-gateway/main.py

# Debug with pytest
pytest tests/unit/test_file.py::test_function --pdb
```

### Frontend Debugging

```bash
# Start in development mode with debugging
cd apps/web-ui
npm run dev

# Run tests in watch mode
npm run test:watch

# Debug with browser developer tools
# Enable React Developer Tools extension
```

## 🔄 Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/api-generator-improvements

# Bug fix branches
git checkout -b bugfix/cors-headers-issue
git checkout -b bugfix/database-connection-timeout

# Documentation branches
git checkout -b docs/api-documentation-update
```

### Commit Messages

```bash
# Use conventional commits
git commit -m "feat: add user authentication service"
git commit -m "fix: resolve CORS headers configuration"
git commit -m "docs: update API documentation"
git commit -m "test: add integration tests for user registration"
git commit -m "refactor: reorganize service directory structure"
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** with tests
3. **Run full test suite** locally
4. **Update documentation** if needed
5. **Create pull request** with description
6. **Address review feedback**
7. **Merge after approval**

## 📚 Additional Resources

### Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)

### Learning Resources

- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [Async Programming in Python](https://realpython.com/async-io-python/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community

- [GitHub Discussions](https://github.com/jommcp/jommcp/discussions)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Issue Templates](../../.github/ISSUE_TEMPLATE/)

## 🎯 Next Steps

After setting up your development environment:

1. **Explore the codebase** - Start with `README.md` and browse the code
2. **Run the test suite** - Ensure everything works on your machine
3. **Pick an issue** - Look for "good first issue" labels
4. **Ask questions** - Use GitHub Discussions for help
5. **Submit your first PR** - Start with documentation or small improvements

Happy coding! 🚀
