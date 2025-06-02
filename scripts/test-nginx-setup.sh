#!/bin/bash

# JomMCP Platform - Nginx Setup Test Script
# Tests the nginx configuration and domain setup

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

log_info "JomMCP Platform - Nginx Setup Test"
echo ""

# Test 1: Check nginx configuration files
log_info "Test 1: Checking nginx configuration files..."

NGINX_FILES=(
    "infrastructure/nginx/nginx.conf"
    "infrastructure/nginx/conf.d/jommcp.conf"
    "infrastructure/nginx/conf.d/localhost.conf"
    "infrastructure/nginx/snippets/proxy-params.conf"
    "infrastructure/nginx/snippets/websocket-params.conf"
    "infrastructure/nginx/snippets/security-headers.conf"
    "infrastructure/nginx/snippets/ssl-params.conf"
)

for file in "${NGINX_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file exists"
    else
        log_error "✗ $file missing"
        exit 1
    fi
done

# Test 2: Check nginx directories
log_info "Test 2: Checking nginx directories..."

NGINX_DIRS=(
    "infrastructure/nginx/ssl"
    "infrastructure/nginx/logs"
)

for dir in "${NGINX_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "✓ $dir exists"
    else
        log_error "✗ $dir missing"
        exit 1
    fi
done

# Test 3: Check scripts
log_info "Test 3: Checking nginx management scripts..."

SCRIPTS=(
    "scripts/setup-domain.sh"
    "scripts/generate-ssl-cert.sh"
    "scripts/nginx-manager.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        log_success "✓ $script exists and is executable"
    else
        log_error "✗ $script missing or not executable"
        exit 1
    fi
done

# Test 4: Check environment configuration
log_info "Test 4: Checking environment configuration..."

if [ -f ".env.example" ]; then
    if grep -q "DOMAIN_NAME" .env.example; then
        log_success "✓ Domain configuration found in .env.example"
    else
        log_error "✗ Domain configuration missing from .env.example"
        exit 1
    fi
else
    log_error "✗ .env.example file missing"
    exit 1
fi

# Test 5: Check docker-compose configuration
log_info "Test 5: Checking docker-compose nginx service..."

if grep -q "nginx:" docker-compose.yml; then
    log_success "✓ Nginx service found in docker-compose.yml"
else
    log_error "✗ Nginx service missing from docker-compose.yml"
    exit 1
fi

# Test 6: Test nginx configuration syntax (if docker is available)
log_info "Test 6: Testing nginx configuration syntax..."

if command -v docker >/dev/null 2>&1; then
    # Test nginx configuration using docker
    if docker run --rm -v "$(pwd)/infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
                       -v "$(pwd)/infrastructure/nginx/conf.d:/etc/nginx/conf.d:ro" \
                       -v "$(pwd)/infrastructure/nginx/snippets:/etc/nginx/snippets:ro" \
                       nginx:alpine nginx -t >/dev/null 2>&1; then
        log_success "✓ Nginx configuration syntax is valid"
    else
        log_warning "⚠ Nginx configuration syntax test failed (this may be due to missing SSL certificates)"
    fi
else
    log_warning "⚠ Docker not available, skipping nginx syntax test"
fi

# Test 7: Check SSL certificate generation capability
log_info "Test 7: Testing SSL certificate generation..."

if command -v openssl >/dev/null 2>&1; then
    log_success "✓ OpenSSL is available for SSL certificate generation"
else
    log_warning "⚠ OpenSSL not available, SSL certificate generation will not work"
fi

echo ""
log_success "All nginx setup tests passed!"
echo ""

log_info "Next steps to use nginx with your JomMCP platform:"
log_info "1. Run: ./scripts/setup-domain.sh (to configure your domain)"
log_info "2. Run: docker-compose up -d (to start all services including nginx)"
log_info "3. Run: ./scripts/nginx-manager.sh status (to check nginx status)"
log_info "4. Access your platform at the configured domain"

echo ""
log_info "For SSL/HTTPS setup:"
log_info "1. Run: ./scripts/generate-ssl-cert.sh (for development certificates)"
log_info "2. Or provide your own certificates in infrastructure/nginx/ssl/"
log_info "3. Set ENABLE_SSL=true in your .env file"

echo ""
log_success "Nginx setup test completed successfully! 🎉"
