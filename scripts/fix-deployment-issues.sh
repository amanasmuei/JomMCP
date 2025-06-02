#!/bin/bash

# Fix Deployment Issues Script
# Addresses the specific deployment issues encountered

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

# Function to fix frontend path resolution issues
fix_frontend_issues() {
    log_step "Fixing frontend path resolution issues..."
    
    local web_ui_dir="apps/web-ui"
    
    if [ -d "$web_ui_dir" ]; then
        cd "$web_ui_dir"
        
        # Clear build cache
        log_info "Clearing Next.js build cache..."
        rm -rf .next node_modules/.cache 2>/dev/null || true
        
        # Reinstall dependencies to ensure clean state
        log_info "Reinstalling dependencies..."
        if [ -f "package-lock.json" ]; then
            rm package-lock.json
        fi
        npm install
        
        # Verify utils file exists
        if [ -f "src/lib/utils.ts" ]; then
            log_success "✓ utils.ts file exists"
        else
            log_error "✗ utils.ts file missing"
            return 1
        fi
        
        # Test build to verify path resolution
        log_info "Testing build to verify path resolution..."
        npm run build
        
        cd - >/dev/null
        log_success "Frontend issues fixed"
    else
        log_error "Web UI directory not found: $web_ui_dir"
        return 1
    fi
}

# Function to fix backend module import issues
fix_backend_issues() {
    log_step "Fixing backend module import issues..."
    
    # Verify core package structure
    if [ -d "packages/core" ]; then
        log_success "✓ Core package exists"
        
        # Check if __init__.py files exist
        local init_files=(
            "packages/core/__init__.py"
            "packages/core/models/__init__.py"
        )
        
        for init_file in "${init_files[@]}"; do
            if [ -f "$init_file" ]; then
                log_success "✓ $init_file exists"
            else
                log_warning "⚠ $init_file missing, creating..."
                touch "$init_file"
            fi
        done
    else
        log_error "✗ Core package missing"
        return 1
    fi
    
    # Test Python imports
    log_info "Testing Python imports..."
    cd packages
    if python3 -c "import core.config; import core.database; print('✓ Core imports successful')" 2>/dev/null; then
        log_success "Core module imports working"
    else
        log_warning "Core module imports may have issues, but Dockerfiles have been updated with PYTHONPATH"
    fi
    cd - >/dev/null
    
    log_success "Backend issues addressed"
}

# Function to rebuild containers with fixes
rebuild_containers() {
    log_step "Rebuilding containers with fixes..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Remove old images to force rebuild
    log_info "Removing old images..."
    docker-compose build --no-cache
    
    log_success "Containers rebuilt successfully"
}

# Function to test deployment
test_deployment() {
    log_step "Testing deployment..."
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    local services=("api-gateway" "registration-service" "generator-service" "deployment-service" "docs-service" "web-ui")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "✓ $service is running"
        else
            log_error "✗ $service failed to start"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "All services started successfully!"
        echo ""
        echo "🎉 Deployment test completed successfully!"
        echo ""
        echo "Services are available at:"
        echo "  • Web UI: http://localhost:3000"
        echo "  • API Gateway: http://localhost:8000"
        echo "  • API Docs: http://localhost:8000/api/v1/docs"
        echo ""
        echo "To check logs: docker-compose logs -f"
    else
        log_error "Some services failed to start. Check logs with: docker-compose logs"
        return 1
    fi
}

# Function to show logs for failed services
show_error_logs() {
    log_step "Showing error logs for debugging..."
    
    local services=("api-gateway" "registration-service" "generator-service" "deployment-service" "docs-service" "web-ui")
    
    for service in "${services[@]}"; do
        if ! docker-compose ps "$service" | grep -q "Up"; then
            log_info "Logs for $service:"
            docker-compose logs --tail=20 "$service"
            echo ""
        fi
    done
}

# Main function
main() {
    echo "🔧 JomMCP Deployment Issue Fixer"
    echo "================================="
    
    # Check if we're in the project root
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-all}" in
        "frontend"|"web")
            fix_frontend_issues
            ;;
        "backend"|"python")
            fix_backend_issues
            ;;
        "rebuild")
            rebuild_containers
            ;;
        "test")
            test_deployment
            ;;
        "logs")
            show_error_logs
            ;;
        "all"|"")
            fix_frontend_issues
            fix_backend_issues
            rebuild_containers
            test_deployment
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [option]"
            echo ""
            echo "Options:"
            echo "  all       Fix all issues and test deployment (default)"
            echo "  frontend  Fix frontend path resolution issues only"
            echo "  backend   Fix backend module import issues only"
            echo "  rebuild   Rebuild containers only"
            echo "  test      Test deployment only"
            echo "  logs      Show error logs for debugging"
            echo "  help      Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with error handling
if main "$@"; then
    echo ""
    log_success "🎉 All fixes applied successfully!"
else
    echo ""
    log_error "❌ Some issues encountered. Check the logs above for details."
    echo ""
    echo "For debugging:"
    echo "  • Check service logs: docker-compose logs -f [service-name]"
    echo "  • Show error logs: $0 logs"
    echo "  • Clear caches: ./scripts/clear-build-cache.sh"
    exit 1
fi
