# JomMCP Testing Guide

This directory contains comprehensive test suites for the JomMCP platform, organized by testing type and scope.

## 📁 Test Structure

```
tests/
├── unit/                  # Unit tests for individual components
├── integration/          # Integration tests for service interactions
├── e2e/                 # End-to-end workflow tests
└── performance/         # Performance and load tests
```

## 🧪 Test Categories

### Unit Tests (`tests/unit/`)
- Test individual functions, classes, and modules in isolation
- Fast execution, no external dependencies
- High coverage of business logic

### Integration Tests (`tests/integration/`)
- Test interactions between services
- Database integration tests
- API endpoint testing
- Service communication validation

### End-to-End Tests (`tests/e2e/`)
- Complete workflow testing
- User journey validation
- Production readiness tests
- Cross-service functionality

### Performance Tests (`tests/performance/`)
- Load testing
- Stress testing
- Memory and CPU profiling
- Scalability validation

## 🚀 Running Tests

### Run All Tests
```bash
pytest tests/ -v
```

### Run Specific Test Categories
```bash
# Unit tests only
pytest tests/unit/ -v

# Integration tests only
pytest tests/integration/ -v

# End-to-end tests only
pytest tests/e2e/ -v

# Performance tests only
pytest tests/performance/ -v
```

### Run with Coverage
```bash
# Generate coverage report
pytest --cov=apps --cov=packages --cov-report=html tests/

# View coverage report
open htmlcov/index.html
```

### Run Production Readiness Tests
```bash
python tests/e2e/PRODUCTION_READINESS_TEST.py
```

## 📊 Test Configuration

Test configuration is managed through:
- `config/testing/pytest.ini` - Pytest configuration
- `tests/conftest.py` - Shared test fixtures and configuration
- Environment variables for test-specific settings

## 🎯 Testing Standards

### Test Naming Convention
- Test files: `test_*.py`
- Test functions: `test_*`
- Test classes: `Test*`

### Test Organization
- One test file per module being tested
- Group related tests in test classes
- Use descriptive test names that explain the scenario

### Test Quality Guidelines
- **Arrange-Act-Assert** pattern
- One assertion per test (when possible)
- Use meaningful test data
- Mock external dependencies
- Clean up test data

## 🔧 Writing Tests

### Example Unit Test
```python
import pytest
from apps.api_gateway.main import create_app

def test_health_endpoint():
    """Test that health endpoint returns 200 OK"""
    app = create_app()
    client = TestClient(app)
    
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Example Integration Test
```python
import pytest
from httpx import AsyncClient
from apps.registration_service.main import app

@pytest.mark.asyncio
async def test_user_registration_flow():
    """Test complete user registration workflow"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register user
        response = await client.post("/api/v1/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass123!"
        })
        
        assert response.status_code == 201
        assert "access_token" in response.json()
```

## 🐛 Debugging Tests

### Run Tests with Debug Output
```bash
pytest tests/ -v -s --tb=short
```

### Run Specific Test
```bash
pytest tests/unit/test_specific.py::test_function_name -v
```

### Run Tests with PDB Debugger
```bash
pytest tests/ --pdb
```

## 📈 Continuous Integration

Tests are automatically run in CI/CD pipeline:
- On every pull request
- On merge to main branch
- Daily scheduled runs for performance tests

### CI Test Commands
```bash
# Fast test suite for PR validation
pytest tests/unit/ tests/integration/ -v --maxfail=5

# Full test suite for release validation
pytest tests/ -v --cov=apps --cov=packages
```

## 🎯 Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: All user workflows covered
- **Performance**: Key endpoints benchmarked

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Testing Best Practices](../docs/architecture/testing-guidelines.md)
