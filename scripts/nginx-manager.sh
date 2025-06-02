#!/bin/bash

# JomMCP Platform - Nginx Management Script
# Provides easy management of nginx service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check if nginx container is running
check_nginx_running() {
    if docker-compose ps nginx | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to test nginx configuration
test_config() {
    log_info "Testing nginx configuration..."
    
    if check_nginx_running; then
        if docker-compose exec nginx nginx -t; then
            log_success "Nginx configuration is valid"
            return 0
        else
            log_error "Nginx configuration has errors"
            return 1
        fi
    else
        log_warning "Nginx container is not running. Starting temporarily to test config..."
        docker-compose up -d nginx
        sleep 5
        
        if docker-compose exec nginx nginx -t; then
            log_success "Nginx configuration is valid"
            return 0
        else
            log_error "Nginx configuration has errors"
            return 1
        fi
    fi
}

# Function to reload nginx
reload_nginx() {
    log_info "Reloading nginx configuration..."
    
    if check_nginx_running; then
        if docker-compose exec nginx nginx -s reload; then
            log_success "Nginx configuration reloaded successfully"
        else
            log_error "Failed to reload nginx configuration"
            return 1
        fi
    else
        log_warning "Nginx container is not running. Starting nginx..."
        docker-compose up -d nginx
        log_success "Nginx started"
    fi
}

# Function to show nginx status
show_status() {
    log_info "Nginx service status:"
    echo ""
    
    if check_nginx_running; then
        log_success "Nginx is running"
        
        # Show container details
        docker-compose ps nginx
        echo ""
        
        # Show nginx processes
        log_info "Nginx processes:"
        docker-compose exec nginx ps aux | grep nginx
        echo ""
        
        # Show listening ports
        log_info "Listening ports:"
        docker-compose exec nginx netstat -tlnp | grep nginx || true
        
    else
        log_warning "Nginx is not running"
    fi
}

# Function to show nginx logs
show_logs() {
    local follow="$1"
    
    if [ "$follow" = "follow" ]; then
        log_info "Following nginx logs (Ctrl+C to stop)..."
        docker-compose logs -f nginx
    else
        log_info "Recent nginx logs:"
        docker-compose logs --tail=50 nginx
    fi
}

# Function to restart nginx
restart_nginx() {
    log_info "Restarting nginx..."
    
    docker-compose restart nginx
    
    # Wait for nginx to be ready
    sleep 5
    
    if check_nginx_running; then
        log_success "Nginx restarted successfully"
    else
        log_error "Failed to restart nginx"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "JomMCP Platform - Nginx Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  test      Test nginx configuration"
    echo "  reload    Reload nginx configuration"
    echo "  restart   Restart nginx service"
    echo "  status    Show nginx status"
    echo "  logs      Show recent nginx logs"
    echo "  follow    Follow nginx logs in real-time"
    echo "  start     Start nginx service"
    echo "  stop      Stop nginx service"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 test           # Test configuration"
    echo "  $0 reload         # Reload after config changes"
    echo "  $0 logs           # View recent logs"
    echo "  $0 follow         # Follow logs in real-time"
}

# Main script logic
case "${1:-help}" in
    "test")
        test_config
        ;;
    "reload")
        if test_config; then
            reload_nginx
        else
            log_error "Configuration test failed. Not reloading."
            exit 1
        fi
        ;;
    "restart")
        restart_nginx
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "follow")
        show_logs "follow"
        ;;
    "start")
        log_info "Starting nginx..."
        docker-compose up -d nginx
        log_success "Nginx started"
        ;;
    "stop")
        log_info "Stopping nginx..."
        docker-compose stop nginx
        log_success "Nginx stopped"
        ;;
    "help"|*)
        show_help
        ;;
esac
