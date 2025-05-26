# Contributing to MCP Hub Platform

Thank you for your interest in contributing to the MCP Hub Platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Standards](#development-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see [Development Setup](#development-setup))
4. Create a new branch for your feature or bugfix
5. Make your changes
6. Test your changes thoroughly
7. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Poetry (recommended) or pip

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/mcp-hub.git
   cd mcp-hub
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Install Python dependencies:**
   ```bash
   # Using Poetry (recommended)
   poetry install
   poetry shell

   # Or using pip
   pip install -r requirements.txt
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the services:**
   ```bash
   # Terminal 1: Registration service
   cd registration-service
   uvicorn app.main:app --reload --port 8081

   # Terminal 2: Generator service
   cd generator-service
   uvicorn app.main:app --reload --port 8082

   # Terminal 3: Deployment service
   cd deployment-service
   uvicorn app.main:app --reload --port 8083

   # Terminal 4: Web UI
   cd web-ui
   npm install
   npm run dev
   ```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix issues in the codebase
- **Feature development**: Add new functionality
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve tests
- **Performance improvements**: Optimize existing code
- **Security enhancements**: Improve security measures

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions about your proposed change
2. **Create an issue**: For significant changes, create an issue to discuss the approach
3. **Get feedback**: Engage with maintainers and community members

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the coding standards (see [Development Standards](#development-standards))
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes:**
   ```bash
   # Run tests
   pytest
   
   # Run linting
   black .
   isort .
   flake8
   
   # Type checking
   mypy .
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request:**
   - Use the PR template
   - Provide a clear description of changes
   - Link related issues
   - Add screenshots for UI changes

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No merge conflicts
- [ ] PR description is clear and complete

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Environment details**: OS, Python version, Docker version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Error messages**: Full error messages and stack traces
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've considered
- **Additional context**: Any other relevant information

## Development Standards

### Code Style

- **Python**: Follow PEP 8, use Black for formatting
- **TypeScript**: Follow project ESLint configuration
- **Imports**: Use isort for import organization
- **Type hints**: Required for all Python functions
- **Docstrings**: Use Google-style docstrings

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=core --cov=registration_service --cov=generator_service --cov=deployment_service

# Run specific test file
pytest tests/test_integration.py

# Run tests with specific markers
pytest -m "not slow"
```

### Test Guidelines

- Write tests for all new functionality
- Maintain or improve test coverage
- Use descriptive test names
- Include both unit and integration tests
- Mock external dependencies appropriately

## Documentation

### Types of Documentation

- **Code documentation**: Docstrings and inline comments
- **API documentation**: OpenAPI/Swagger specs
- **User guides**: How-to guides and tutorials
- **Architecture docs**: Technical design documents

### Documentation Standards

- Keep documentation up-to-date with code changes
- Use clear, concise language
- Include code examples where helpful
- Test documentation examples

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing documentation first

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for contributing to MCP Hub Platform! 🚀
