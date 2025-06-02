#!/bin/bash

# JomMCP Platform - Domain Setup Script
# Configures nginx with custom domain and SSL settings

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

prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local response
    
    while true; do
        read -p "$prompt [y/n] (default: $default): " response
        response=${response:-$default}
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local response
    
    read -p "$prompt (default: $default): " response
    response=${response:-$default}
    eval "$var_name='$response'"
}

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

log_info "JomMCP Platform - Domain Setup"
echo ""

# Get domain configuration
prompt_input "Enter your domain name" "localhost" "DOMAIN_NAME"

# Determine if SSL should be enabled
ENABLE_SSL=false
if [ "$DOMAIN_NAME" != "localhost" ] && [ "$DOMAIN_NAME" != "127.0.0.1" ]; then
    if prompt_yes_no "Enable SSL/HTTPS for $DOMAIN_NAME?" "y"; then
        ENABLE_SSL=true
    fi
fi

# Set URLs based on SSL configuration
if [ "$ENABLE_SSL" = true ]; then
    DOMAIN_URL="https://$DOMAIN_NAME"
    WS_DOMAIN_URL="wss://$DOMAIN_NAME"
    log_info "SSL enabled - using HTTPS"
else
    DOMAIN_URL="http://$DOMAIN_NAME"
    WS_DOMAIN_URL="ws://$DOMAIN_NAME"
    log_info "SSL disabled - using HTTP"
fi

# Create or update .env file
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    log_info "Creating .env file from template..."
    cp .env.example "$ENV_FILE"
fi

log_info "Updating environment configuration..."

# Update domain settings in .env file
sed -i.bak "s|^DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN_NAME|" "$ENV_FILE"
sed -i.bak "s|^DOMAIN_URL=.*|DOMAIN_URL=$DOMAIN_URL|" "$ENV_FILE"
sed -i.bak "s|^WS_DOMAIN_URL=.*|WS_DOMAIN_URL=$WS_DOMAIN_URL|" "$ENV_FILE"
sed -i.bak "s|^ENABLE_SSL=.*|ENABLE_SSL=$ENABLE_SSL|" "$ENV_FILE"

# Update frontend URLs
sed -i.bak "s|^NEXT_PUBLIC_API_BASE_URL=.*|NEXT_PUBLIC_API_BASE_URL=$DOMAIN_URL|" "$ENV_FILE"
sed -i.bak "s|^NEXT_PUBLIC_WS_BASE_URL=.*|NEXT_PUBLIC_WS_BASE_URL=$WS_DOMAIN_URL|" "$ENV_FILE"

# Clean up backup file
rm -f "$ENV_FILE.bak"

log_success "Environment configuration updated!"

# Generate nginx configuration based on domain
log_info "Configuring nginx for domain: $DOMAIN_NAME"

NGINX_CONF_DIR="infrastructure/nginx/conf.d"
DOMAIN_CONF="$NGINX_CONF_DIR/domain.conf"

# Create domain-specific nginx configuration
if [ "$DOMAIN_NAME" = "localhost" ] || [ "$DOMAIN_NAME" = "127.0.0.1" ]; then
    log_info "Using localhost configuration"
    # Remove any existing domain.conf to use localhost.conf
    rm -f "$DOMAIN_CONF"
else
    log_info "Creating custom domain configuration"

    # Create custom domain configuration from template
    cp "$NGINX_CONF_DIR/jommcp.conf" "$DOMAIN_CONF"

    # Replace placeholder domain with actual domain
    sed -i.bak "s/DOMAIN_NAME_PLACEHOLDER/$DOMAIN_NAME/g" "$DOMAIN_CONF"
    rm -f "$DOMAIN_CONF.bak"

    # If SSL is disabled, comment out the HTTPS server block
    if [ "$ENABLE_SSL" = false ]; then
        log_info "Disabling HTTPS server block (SSL disabled)"
        sed -i.bak '/# HTTPS server/,/^}$/s/^/# /' "$DOMAIN_CONF"
        rm -f "$DOMAIN_CONF.bak"
    fi

    log_success "Custom domain configuration created: $DOMAIN_CONF"
fi

# Handle SSL certificate generation
if [ "$ENABLE_SSL" = true ]; then
    log_info "SSL is enabled. Checking for certificates..."
    
    SSL_CERT="infrastructure/nginx/ssl/cert.pem"
    SSL_KEY="infrastructure/nginx/ssl/key.pem"
    
    if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
        log_warning "SSL certificates not found."
        
        if prompt_yes_no "Generate self-signed certificates for development?" "y"; then
            log_info "Generating SSL certificates..."
            DOMAIN_NAME="$DOMAIN_NAME" ./scripts/generate-ssl-cert.sh
        else
            log_warning "Please provide your own SSL certificates:"
            log_warning "  - Certificate: $SSL_CERT"
            log_warning "  - Private Key: $SSL_KEY"
        fi
    else
        log_success "SSL certificates found"
    fi
fi

# Update hosts file for local development
if [ "$DOMAIN_NAME" != "localhost" ] && [ "$DOMAIN_NAME" != "127.0.0.1" ]; then
    log_info "For local development, you may need to add this to your /etc/hosts file:"
    log_warning "127.0.0.1 $DOMAIN_NAME"
    
    if prompt_yes_no "Add entry to /etc/hosts automatically?" "n"; then
        if grep -q "$DOMAIN_NAME" /etc/hosts; then
            log_info "Entry already exists in /etc/hosts"
        else
            echo "127.0.0.1 $DOMAIN_NAME" | sudo tee -a /etc/hosts
            log_success "Added $DOMAIN_NAME to /etc/hosts"
        fi
    fi
fi

log_success "Domain setup completed!"
echo ""
log_info "Configuration summary:"
log_info "  Domain: $DOMAIN_NAME"
log_info "  URL: $DOMAIN_URL"
log_info "  WebSocket URL: $WS_DOMAIN_URL"
log_info "  SSL Enabled: $ENABLE_SSL"
echo ""
log_info "Next steps:"
log_info "1. Start the platform: docker-compose up -d"
log_info "2. Access your platform at: $DOMAIN_URL"
log_info "3. Check nginx status: docker-compose logs nginx"

if [ "$ENABLE_SSL" = true ]; then
    log_warning "Note: If using self-signed certificates, your browser will show a security warning."
    log_warning "This is normal for development. Click 'Advanced' and 'Proceed to $DOMAIN_NAME'."
fi
