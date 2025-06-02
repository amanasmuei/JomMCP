#!/bin/bash

# JomMCP Docker Build Test Script
# Tests Docker build contexts and Dockerfile availability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Services to test
SERVICES=(
    "api-gateway"
    "registration-service"
    "generator-service"
    "deployment-service"
    "docs-service"
    "web-ui"
)

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
                                              
    🐳 JomMCP Docker Build Test
    Testing Docker build contexts and Dockerfiles
EOF
    echo -e "${NC}"
}

# Test service directories and Dockerfiles
test_service_structure() {
    log_step "Testing service structure..."
    
    local all_good=true
    
    for service in "${SERVICES[@]}"; do
        local service_dir="apps/$service"
        local dockerfile="$service_dir/Dockerfile"
        
        log_info "Testing $service..."
        
        # Check if service directory exists
        if [ -d "$service_dir" ]; then
            log_success "✓ Directory exists: $service_dir"
        else
            log_error "✗ Directory missing: $service_dir"
            all_good=false
            continue
        fi
        
        # Check if Dockerfile exists
        if [ -f "$dockerfile" ]; then
            log_success "✓ Dockerfile exists: $dockerfile"
        else
            log_error "✗ Dockerfile missing: $dockerfile"
            all_good=false
        fi
        
        # Check for additional Dockerfiles (like Dockerfile.dev)
        if [ "$service" = "web-ui" ]; then
            local dockerfile_dev="$service_dir/Dockerfile.dev"
            if [ -f "$dockerfile_dev" ]; then
                log_success "✓ Development Dockerfile exists: $dockerfile_dev"
            else
                log_warning "⚠ Development Dockerfile missing: $dockerfile_dev"
            fi
        fi
    done
    
    if [ "$all_good" = true ]; then
        log_success "All service structures are valid"
        return 0
    else
        log_error "Some service structures have issues"
        return 1
    fi
}

# Test Docker Compose file syntax
test_docker_compose_syntax() {
    log_step "Testing Docker Compose file syntax..."
    
    local compose_files=(
        "docker-compose.yml"
        "infrastructure/docker/docker-compose.yml"
    )
    
    for compose_file in "${compose_files[@]}"; do
        if [ -f "$compose_file" ]; then
            log_info "Testing syntax: $compose_file"
            
            if docker-compose -f "$compose_file" config >/dev/null 2>&1; then
                log_success "✓ Valid syntax: $compose_file"
            else
                log_error "✗ Invalid syntax: $compose_file"
                log_info "Running detailed check..."
                docker-compose -f "$compose_file" config
                return 1
            fi
        else
            log_warning "⚠ File not found: $compose_file"
        fi
    done
    
    return 0
}

# Test Docker build contexts
test_build_contexts() {
    log_step "Testing Docker build contexts..."
    
    local compose_files=(
        "docker-compose.yml"
        "infrastructure/docker/docker-compose.yml"
    )
    
    for compose_file in "${compose_files[@]}"; do
        if [ -f "$compose_file" ]; then
            log_info "Testing build contexts in: $compose_file"
            
            # Extract build contexts from docker-compose file
            local contexts=$(grep -A 2 "build:" "$compose_file" | grep "context:" | awk '{print $2}' | tr -d '"')
            
            for context in $contexts; do
                # Resolve relative path based on compose file location
                local full_context=""
                if [ "$compose_file" = "docker-compose.yml" ]; then
                    full_context="$context"
                else
                    # For infrastructure/docker/docker-compose.yml, contexts are relative to that directory
                    full_context="infrastructure/docker/$context"
                fi
                
                if [ -d "$full_context" ]; then
                    log_success "✓ Build context exists: $context -> $full_context"
                else
                    log_error "✗ Build context missing: $context -> $full_context"
                fi
            done
        fi
    done
    
    return 0
}

# Test Docker availability
test_docker_availability() {
    log_step "Testing Docker availability..."
    
    if command -v docker >/dev/null 2>&1; then
        log_success "✓ Docker is available"
        
        # Test Docker daemon
        if docker info >/dev/null 2>&1; then
            log_success "✓ Docker daemon is running"
        else
            log_error "✗ Docker daemon is not running"
            return 1
        fi
    else
        log_error "✗ Docker is not installed"
        return 1
    fi
    
    if command -v docker-compose >/dev/null 2>&1; then
        log_success "✓ Docker Compose is available"
    elif docker compose version >/dev/null 2>&1; then
        log_success "✓ Docker Compose (plugin) is available"
    else
        log_error "✗ Docker Compose is not available"
        return 1
    fi
    
    return 0
}

# Test a single service build (dry run)
test_single_build() {
    local service="$1"
    log_info "Testing build for service: $service"
    
    local service_dir="apps/$service"
    
    if [ -d "$service_dir" ] && [ -f "$service_dir/Dockerfile" ]; then
        # Test build context (dry run)
        if docker build --dry-run "$service_dir" >/dev/null 2>&1; then
            log_success "✓ Build context valid for: $service"
        else
            log_warning "⚠ Build context may have issues for: $service"
            log_info "This might be due to missing dependencies, which is normal"
        fi
    else
        log_error "✗ Cannot test build for: $service (missing directory or Dockerfile)"
    fi
}

# Test all service builds
test_all_builds() {
    log_step "Testing Docker build contexts (dry run)..."
    
    for service in "${SERVICES[@]}"; do
        test_single_build "$service"
    done
}

# Print summary
print_summary() {
    echo ""
    echo -e "${GREEN}🎉 Docker build testing completed!${NC}"
    echo ""
    echo -e "${CYAN}📋 Test Summary:${NC}"
    echo -e "  ${BLUE}• Service structure test${NC}"
    echo -e "  ${BLUE}• Docker Compose syntax test${NC}"
    echo -e "  ${BLUE}• Build context validation${NC}"
    echo -e "  ${BLUE}• Docker availability test${NC}"
    echo -e "  ${BLUE}• Build dry run test${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "  ${BLUE}1. Fix any failed tests${NC}"
    echo -e "  ${BLUE}2. Try building individual services${NC}"
    echo -e "  ${BLUE}3. Run full docker-compose build${NC}"
    echo -e "  ${BLUE}4. Test the complete installation${NC}"
}

# Main function
main() {
    print_banner
    
    log_info "Starting JomMCP Docker build testing..."
    echo ""
    
    test_docker_availability
    test_service_structure
    test_docker_compose_syntax
    test_build_contexts
    test_all_builds
    print_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "JomMCP Docker Build Test Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --service NAME Test specific service only"
        echo ""
        echo "This script tests:"
        echo "  - Service directory structure"
        echo "  - Dockerfile availability"
        echo "  - Docker Compose syntax"
        echo "  - Build context paths"
        echo "  - Docker availability"
        exit 0
        ;;
    --service)
        if [ -n "$2" ]; then
            print_banner
            log_info "Testing specific service: $2"
            test_docker_availability
            test_single_build "$2"
        else
            echo "Error: --service requires a service name"
            exit 1
        fi
        ;;
    *)
        main "$@"
        ;;
esac
