#!/bin/bash

# JomMCP Platform - Development Environment Setup
# Sets up the development environment with all dependencies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PYTHON_VERSION="3.11"
NODE_VERSION="18"
SKIP_DEPS=false
FORCE_REINSTALL=false

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔧 $1${NC}"; }

# Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════╗
    ║              🛠️  JomMCP Development Setup               ║
    ║                                                          ║
    ║        Setting up development environment                ║
    ║        Menyediakan persekitaran pembangunan             ║
    ╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --force)
                FORCE_REINSTALL=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help
show_help() {
    echo "JomMCP Development Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-deps    Skip dependency installation"
    echo "  --force        Force reinstall of dependencies"
    echo "  -h, --help     Show this help message"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Python
    if ! command_exists python3; then
        missing_deps+=("Python 3.11+")
    else
        local python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)" 2>/dev/null; then
            missing_deps+=("Python 3.11+ (current: $python_version)")
        fi
    fi
    
    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js 18+")
    else
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            missing_deps+=("Node.js 18+ (current: v$node_version)")
        fi
    fi
    
    # Check npm
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    # Check Docker
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        missing_deps+=("Docker Compose")
    fi
    
    # Check Git
    if ! command_exists git; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}• $dep${NC}"
        done
        echo ""
        log_info "Installation guides:"
        echo -e "  ${BLUE}• Python: https://python.org/downloads/${NC}"
        echo -e "  ${BLUE}• Node.js: https://nodejs.org/${NC}"
        echo -e "  ${BLUE}• Docker: https://docs.docker.com/get-docker/${NC}"
        echo -e "  ${BLUE}• Git: https://git-scm.com/downloads${NC}"
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Setup Python environment
setup_python_env() {
    log_step "Setting up Python environment..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ] || [ "$FORCE_REINSTALL" = true ]; then
        if [ -d "venv" ] && [ "$FORCE_REINSTALL" = true ]; then
            log_info "Removing existing virtual environment..."
            rm -rf venv
        fi
        
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    else
        log_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    log_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install Python dependencies
    if [ "$SKIP_DEPS" = false ]; then
        log_info "Installing Python dependencies..."
        pip install -r config/requirements.txt
        
        # Install development dependencies
        if [ -f "config/requirements-dev.txt" ]; then
            pip install -r config/requirements-dev.txt
        fi
        
        log_success "Python dependencies installed"
    else
        log_info "Skipping Python dependency installation"
    fi
}

# Setup Node.js environment
setup_node_env() {
    log_step "Setting up Node.js environment..."
    
    cd apps/web-ui
    
    if [ "$SKIP_DEPS" = false ]; then
        if [ "$FORCE_REINSTALL" = true ] && [ -d "node_modules" ]; then
            log_info "Removing existing node_modules..."
            rm -rf node_modules package-lock.json
        fi
        
        log_info "Installing Node.js dependencies..."
        npm install
        
        log_success "Node.js dependencies installed"
    else
        log_info "Skipping Node.js dependency installation"
    fi
    
    cd ../..
}

# Setup environment configuration
setup_environment_config() {
    log_step "Setting up environment configuration..."
    
    # Create main .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        log_info "Creating main environment configuration..."
        cat > .env << EOF
# JomMCP Platform Development Configuration
ENVIRONMENT=development
DEBUG=true

# Database Configuration
DATABASE_URL=postgresql+asyncpg://mcphub:mcphub_dev_password@localhost:5432/mcphub
POSTGRES_DB=mcphub
POSTGRES_USER=mcphub
POSTGRES_PASSWORD=mcphub_dev_password

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Configuration
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# Service Ports
API_GATEWAY_PORT=8000
REGISTRATION_SERVICE_PORT=8081
GENERATOR_SERVICE_PORT=8082
DEPLOYMENT_SERVICE_PORT=8083
DOCS_SERVICE_PORT=8084
WEB_UI_PORT=3000

# Frontend Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
EOF
        log_success "Main environment configuration created"
    else
        log_info "Main environment configuration already exists"
    fi
    
    # Create frontend .env.local if it doesn't exist
    if [ ! -f "apps/web-ui/.env.local" ]; then
        log_info "Creating frontend environment configuration..."
        cat > apps/web-ui/.env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
EOF
        log_success "Frontend environment configuration created"
    else
        log_info "Frontend environment configuration already exists"
    fi
    
    # Create development config directory structure
    mkdir -p config/development
    mkdir -p config/production
    mkdir -p config/testing
}

# Setup database
setup_database() {
    log_step "Setting up database..."
    
    # Start database services
    log_info "Starting database services..."
    
    local compose_file="docker-compose.yml"
    if [ -f "infrastructure/docker/docker-compose.yml" ]; then
        compose_file="infrastructure/docker/docker-compose.yml"
    fi
    
    docker-compose -f "$compose_file" up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$compose_file" exec -T postgres pg_isready -U mcphub >/dev/null 2>&1; then
            log_success "Database is ready"
            break
        fi
        
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_warning "Database is taking longer than expected to start"
    fi
}

# Setup development tools
setup_dev_tools() {
    log_step "Setting up development tools..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install pre-commit hooks if available
    if [ -f ".pre-commit-config.yaml" ]; then
        log_info "Installing pre-commit hooks..."
        pre-commit install
        log_success "Pre-commit hooks installed"
    fi
    
    # Create useful development scripts
    mkdir -p scripts/dev
    
    # Create quick status check script
    cat > scripts/dev/status.sh << 'EOF'
#!/bin/bash
echo "🔍 JomMCP Development Status"
echo ""
echo "Services:"
curl -s http://localhost:8000/health && echo "✅ API Gateway" || echo "❌ API Gateway"
curl -s http://localhost:8081/api/v1/health && echo "✅ Registration Service" || echo "❌ Registration Service"
curl -s http://localhost:3000 >/dev/null && echo "✅ Web UI" || echo "❌ Web UI"
echo ""
echo "Database:"
docker-compose exec -T postgres pg_isready -U mcphub && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
docker-compose exec -T redis redis-cli ping && echo "✅ Redis" || echo "❌ Redis"
EOF
    chmod +x scripts/dev/status.sh
    
    log_success "Development tools configured"
}

# Print completion message
print_completion() {
    echo ""
    log_success "Development environment setup completed!"
    echo ""
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo -e "  ${BLUE}1. Start services:    ./scripts/start-dev.sh${NC}"
    echo -e "  ${BLUE}2. Check health:      ./scripts/health-check.sh${NC}"
    echo -e "  ${BLUE}3. Quick status:      ./scripts/dev/status.sh${NC}"
    echo -e "  ${BLUE}4. Open Web UI:       http://localhost:3000${NC}"
    echo ""
    echo -e "${CYAN}🛠️  Development Commands:${NC}"
    echo -e "  ${BLUE}• Activate Python env: source venv/bin/activate${NC}"
    echo -e "  ${BLUE}• Run tests:          pytest tests/${NC}"
    echo -e "  ${BLUE}• Format code:        black . && isort .${NC}"
    echo -e "  ${BLUE}• Type check:         mypy .${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Happy coding! Selamat mengkod!${NC}"
}

# Main setup function
main() {
    parse_args "$@"
    print_banner
    
    log_info "Setting up JomMCP development environment..."
    echo ""
    
    check_prerequisites
    setup_environment_config
    setup_python_env
    setup_node_env
    setup_database
    setup_dev_tools
    print_completion
}

# Run main function
main "$@"
