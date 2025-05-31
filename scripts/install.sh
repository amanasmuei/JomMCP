#!/bin/bash

# JomMCP Platform - Automated Installation Script
# This script provides a one-command setup for the JomMCP platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
     ___                 __  __  _____ _____  
    |_  |               |  \/  |/  __ \  _  | 
      | | ___  _ __ ___ | .  . || /  \/ |_| | 
      | |/ _ \| '_ ` _ \| |\/| || |   |  ___| 
  /\__/ / (_) | | | | | | |  | || \__/\ |     
  \____/ \___/|_| |_| |_\_|  |_/ \____/_|     
                                              
    🚀 Transform your APIs into AI-ready MCP servers
    Mari ubah API anda menjadi MCP server yang siap untuk AI
EOF
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing_deps=()
    
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
    
    # Check curl
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}• $dep${NC}"
        done
        echo ""
        log_info "Please install the missing dependencies and run this script again."
        log_info "Installation guides:"
        echo -e "  ${BLUE}• Docker: https://docs.docker.com/get-docker/${NC}"
        echo -e "  ${BLUE}• Git: https://git-scm.com/downloads${NC}"
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Detect installation method
detect_installation() {
    if [ -f "docker-compose.yml" ] || [ -f "infrastructure/docker/docker-compose.yml" ]; then
        echo "existing"
    else
        echo "fresh"
    fi
}

# Clone repository
clone_repository() {
    log_step "Cloning JomMCP repository..."
    
    local repo_url="https://github.com/jommcp/jommcp.git"
    local target_dir="jommcp"
    
    if [ -d "$target_dir" ]; then
        log_warning "Directory '$target_dir' already exists"
        read -p "Do you want to remove it and clone fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$target_dir"
        else
            log_info "Using existing directory"
            cd "$target_dir"
            return
        fi
    fi
    
    git clone "$repo_url" "$target_dir"
    cd "$target_dir"
    log_success "Repository cloned successfully"
}

# Setup environment
setup_environment() {
    log_step "Setting up environment configuration..."
    
    # Create environment files if they don't exist
    if [ ! -f ".env" ]; then
        log_info "Creating environment configuration..."
        cat > .env << EOF
# JomMCP Platform Configuration
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
        log_success "Environment configuration created"
    else
        log_info "Environment configuration already exists"
    fi
}

# Start services
start_services() {
    log_step "Starting JomMCP services..."
    
    # Use the correct docker-compose file path
    local compose_file="docker-compose.yml"
    if [ -f "infrastructure/docker/docker-compose.yml" ]; then
        compose_file="infrastructure/docker/docker-compose.yml"
    fi
    
    log_info "Using compose file: $compose_file"
    
    # Start services
    docker-compose -f "$compose_file" up -d
    
    log_success "Services started successfully"
}

# Wait for services
wait_for_services() {
    log_step "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Checking services... (attempt $attempt/$max_attempts)"
        
        # Check if API Gateway is responding
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            log_success "API Gateway is ready"
            break
        fi
        
        sleep 5
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_warning "Services are taking longer than expected to start"
        log_info "You can check the status with: docker-compose logs"
    fi
}

# Verify installation
verify_installation() {
    log_step "Verifying installation..."
    
    local services=(
        "http://localhost:8000/health:API Gateway"
        "http://localhost:8081/api/v1/health:Registration Service"
        "http://localhost:3000:Web UI"
    )
    
    local all_healthy=true
    
    for service in "${services[@]}"; do
        local url="${service%%:*}"
        local name="${service##*:}"
        
        if curl -s "$url" >/dev/null 2>&1; then
            log_success "$name is healthy"
        else
            log_warning "$name is not responding"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "All services are healthy!"
    else
        log_warning "Some services may need more time to start"
    fi
}

# Print completion message
print_completion() {
    echo ""
    echo -e "${GREEN}🎉 JomMCP Platform installation completed!${NC}"
    echo ""
    echo -e "${CYAN}📋 Quick Access:${NC}"
    echo -e "  ${BLUE}🌐 Web UI:        http://localhost:3000${NC}"
    echo -e "  ${BLUE}📚 API Docs:      http://localhost:8000/docs${NC}"
    echo -e "  ${BLUE}🔍 Health Check:  http://localhost:8000/health${NC}"
    echo ""
    echo -e "${CYAN}🛠️  Useful Commands:${NC}"
    echo -e "  ${BLUE}• View logs:      docker-compose logs -f${NC}"
    echo -e "  ${BLUE}• Stop services:  docker-compose down${NC}"
    echo -e "  ${BLUE}• Restart:        docker-compose restart${NC}"
    echo -e "  ${BLUE}• Health check:   ./scripts/health-check.sh${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Ready to transform your APIs into MCP servers!${NC}"
    echo -e "${YELLOW}   Mari ubah API anda menjadi MCP server yang siap untuk AI!${NC}"
}

# Main installation function
main() {
    print_banner
    
    log_info "Starting JomMCP Platform installation..."
    echo ""
    
    check_prerequisites
    
    local install_type=$(detect_installation)
    
    if [ "$install_type" = "fresh" ]; then
        clone_repository
    else
        log_info "Using existing installation directory"
    fi
    
    setup_environment
    start_services
    wait_for_services
    verify_installation
    print_completion
}

# Run main function
main "$@"
