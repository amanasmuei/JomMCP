#!/bin/bash

# Clear Build Cache Script
# Clears build caches for all services to resolve deployment issues

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

# Function to clear Next.js cache
clear_nextjs_cache() {
    log_step "Clearing Next.js build cache..."
    
    local web_ui_dir="apps/web-ui"
    
    if [ -d "$web_ui_dir" ]; then
        cd "$web_ui_dir"
        
        # Remove Next.js cache directories
        if [ -d ".next" ]; then
            log_info "Removing .next directory..."
            rm -rf .next
            log_success "Removed .next directory"
        fi
        
        # Remove node_modules/.cache
        if [ -d "node_modules/.cache" ]; then
            log_info "Removing node_modules/.cache..."
            rm -rf node_modules/.cache
            log_success "Removed node_modules/.cache"
        fi
        
        # Clear npm cache
        if command -v npm >/dev/null 2>&1; then
            log_info "Clearing npm cache..."
            npm cache clean --force
            log_success "Cleared npm cache"
        fi
        
        cd - >/dev/null
    else
        log_warning "Web UI directory not found: $web_ui_dir"
    fi
}

# Function to clear Docker build cache
clear_docker_cache() {
    log_step "Clearing Docker build cache..."
    
    if command -v docker >/dev/null 2>&1; then
        # Remove dangling images
        log_info "Removing dangling Docker images..."
        docker image prune -f
        
        # Remove build cache
        log_info "Removing Docker build cache..."
        docker builder prune -f
        
        log_success "Cleared Docker build cache"
    else
        log_warning "Docker not found, skipping Docker cache cleanup"
    fi
}

# Function to clear Python cache
clear_python_cache() {
    log_step "Clearing Python cache..."
    
    # Find and remove __pycache__ directories
    log_info "Removing __pycache__ directories..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    
    # Find and remove .pyc files
    log_info "Removing .pyc files..."
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    # Find and remove .pyo files
    log_info "Removing .pyo files..."
    find . -name "*.pyo" -delete 2>/dev/null || true
    
    log_success "Cleared Python cache"
}

# Function to clear all caches
clear_all_caches() {
    log_step "Clearing all build caches..."
    
    clear_nextjs_cache
    clear_python_cache
    clear_docker_cache
    
    log_success "All caches cleared successfully!"
}

# Main function
main() {
    echo "🧹 JomMCP Build Cache Cleaner"
    echo "=============================="
    
    # Check if we're in the project root
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-all}" in
        "nextjs"|"frontend"|"web")
            clear_nextjs_cache
            ;;
        "docker")
            clear_docker_cache
            ;;
        "python"|"backend")
            clear_python_cache
            ;;
        "all"|"")
            clear_all_caches
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [option]"
            echo ""
            echo "Options:"
            echo "  all       Clear all caches (default)"
            echo "  nextjs    Clear Next.js build cache only"
            echo "  docker    Clear Docker build cache only"
            echo "  python    Clear Python cache only"
            echo "  help      Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Cache cleanup completed! You can now try rebuilding your services."
    echo ""
    echo "Next steps:"
    echo "  1. Rebuild containers: docker-compose build --no-cache"
    echo "  2. Start services: docker-compose up -d"
    echo "  3. Check logs: docker-compose logs -f"
}

# Run main function
main "$@"
