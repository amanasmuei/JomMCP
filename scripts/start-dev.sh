#!/bin/bash

# JomMCP Platform - Start Development Services
# Starts all services for development

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
DETACHED=false
SERVICES=""
MONITORING=false

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🚀 $1${NC}"; }

# Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════╗
    ║               🚀 Starting JomMCP Platform               ║
    ║                                                          ║
    ║              Development Environment                     ║
    ║              Persekitaran Pembangunan                   ║
    ╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--detached)
                DETACHED=true
                shift
                ;;
            -m|--monitoring)
                MONITORING=true
                shift
                ;;
            -s|--services)
                SERVICES="$2"
                shift 2
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
    echo "JomMCP Development Start Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --detached     Run services in detached mode"
    echo "  -m, --monitoring   Include monitoring services"
    echo "  -s, --services     Start specific services (comma-separated)"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Start all core services"
    echo "  $0 -d                        # Start in background"
    echo "  $0 -m                        # Include monitoring"
    echo "  $0 -s postgres,redis         # Start only database services"
}

# Check if Docker is available
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed or not in PATH"
        log_info "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        log_info "Please start Docker and try again"
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not available"
        log_info "Please install Docker Compose"
        exit 1
    fi
}

# Load environment variables
load_environment() {
    if [ -f ".env" ]; then
        log_info "Loading environment variables from .env"
        export $(cat .env | grep -v '^#' | xargs)
    else
        log_warning "No .env file found, using defaults"
    fi
}

# Start services
start_services() {
    log_step "Starting JomMCP services..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    local compose_args=""
    
    # Add detached flag if requested
    if [ "$DETACHED" = true ]; then
        compose_args="$compose_args -d"
    fi
    
    # Add monitoring profile if requested
    local profiles=""
    if [ "$MONITORING" = true ]; then
        profiles="--profile monitoring"
    fi
    
    # Start specific services or all services
    if [ -n "$SERVICES" ]; then
        log_info "Starting specific services: $SERVICES"
        $compose_cmd $profiles up $compose_args $(echo $SERVICES | tr ',' ' ')
    else
        log_info "Starting all core services..."
        $compose_cmd $profiles up $compose_args
    fi
    
    if [ "$DETACHED" = true ]; then
        log_success "Services started in background"
    fi
}

# Wait for services to be ready
wait_for_services() {
    if [ "$DETACHED" = true ]; then
        log_step "Waiting for services to be ready..."
        
        local max_attempts=60
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            log_info "Checking services... (attempt $attempt/$max_attempts)"
            
            # Check if API Gateway is responding
            if curl -s http://localhost:${API_GATEWAY_PORT:-8000}/health >/dev/null 2>&1; then
                log_success "API Gateway is ready"
                break
            fi
            
            sleep 5
            ((attempt++))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            log_warning "Services are taking longer than expected to start"
            log_info "Check logs with: docker-compose logs"
        fi
    fi
}

# Show service status
show_status() {
    if [ "$DETACHED" = true ]; then
        echo ""
        log_step "Service Status"
        
        # Run the status script if available
        if [ -f "scripts/status.sh" ]; then
            ./scripts/status.sh
        else
            # Fallback status check
            echo -e "${BLUE}🌐 Services:${NC}"
            curl -s http://localhost:${API_GATEWAY_PORT:-8000}/health >/dev/null && echo -e "  ${GREEN}✅ API Gateway${NC}" || echo -e "  ${RED}❌ API Gateway${NC}"
            curl -s http://localhost:${WEB_UI_PORT:-3000} >/dev/null && echo -e "  ${GREEN}✅ Web UI${NC}" || echo -e "  ${RED}❌ Web UI${NC}"
        fi
    fi
}

# Print useful information
print_info() {
    if [ "$DETACHED" = true ]; then
        echo ""
        echo -e "${CYAN}📋 Quick Access:${NC}"
        echo -e "  ${BLUE}🌐 Web UI:        http://localhost:${WEB_UI_PORT:-3000}${NC}"
        echo -e "  ${BLUE}📚 API Docs:      http://localhost:${API_GATEWAY_PORT:-8000}/docs${NC}"
        echo -e "  ${BLUE}🔍 Health Check:  http://localhost:${API_GATEWAY_PORT:-8000}/health${NC}"
        
        if [ "$MONITORING" = true ]; then
            echo -e "  ${BLUE}📊 Prometheus:    http://localhost:${PROMETHEUS_PORT:-9090}${NC}"
            echo -e "  ${BLUE}📈 Grafana:       http://localhost:${GRAFANA_PORT:-3001}${NC}"
        fi
        
        echo ""
        echo -e "${CYAN}🛠️  Useful Commands:${NC}"
        echo -e "  ${BLUE}• View logs:      docker-compose logs -f${NC}"
        echo -e "  ${BLUE}• Stop services:  docker-compose down${NC}"
        echo -e "  ${BLUE}• Restart:        docker-compose restart${NC}"
        echo -e "  ${BLUE}• Status check:   ./scripts/status.sh${NC}"
        echo -e "  ${BLUE}• Health check:   ./scripts/health-check.sh${NC}"
        
        echo ""
        echo -e "${YELLOW}🚀 JomMCP Platform is running!${NC}"
        echo -e "${YELLOW}   Platform JomMCP sedang berjalan!${NC}"
    else
        echo ""
        log_info "Services are running in foreground mode"
        log_info "Press Ctrl+C to stop all services"
    fi
}

# Cleanup function
cleanup() {
    if [ "$DETACHED" = false ]; then
        echo ""
        log_info "Stopping services..."
        docker-compose down
        log_success "Services stopped"
    fi
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main function
main() {
    parse_args "$@"
    print_banner
    
    log_info "Starting JomMCP Platform development environment..."
    echo ""
    
    check_docker
    load_environment
    start_services
    wait_for_services
    show_status
    print_info
    
    # If running in foreground, wait for user interrupt
    if [ "$DETACHED" = false ]; then
        wait
    fi
}

# Run main function
main "$@"
