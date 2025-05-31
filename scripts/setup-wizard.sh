#!/bin/bash

# JomMCP Platform - Interactive Setup Wizard
# Guides users through customized installation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration variables
ENVIRONMENT="development"
DATABASE_PASSWORD=""
JWT_SECRET=""
API_GATEWAY_PORT=8000
WEB_UI_PORT=3000
ENABLE_MONITORING=true
ENABLE_SSL=false

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
    ║                  🧙‍♂️ JomMCP Setup Wizard                  ║
    ║                                                          ║
    ║     Interactive setup for the JomMCP Platform           ║
    ║     Mari setup JomMCP dengan mudah dan interaktif       ║
    ╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Prompt for user input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -e "${CYAN}$prompt${NC}"
    if [ -n "$default" ]; then
        echo -e "${YELLOW}Default: $default${NC}"
    fi
    read -p "> " input
    
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    eval "$var_name='$input'"
}

# Yes/No prompt
prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    
    while true; do
        echo -e "${CYAN}$prompt${NC}"
        if [ "$default" = "y" ]; then
            read -p "> (Y/n): " yn
            yn=${yn:-y}
        else
            read -p "> (y/N): " yn
            yn=${yn:-n}
        fi
        
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Environment selection
select_environment() {
    log_step "Environment Configuration"
    echo ""
    echo -e "${CYAN}Select your deployment environment:${NC}"
    echo "1) Development (recommended for testing)"
    echo "2) Production (for live deployment)"
    echo ""
    
    while true; do
        read -p "Enter choice (1-2): " choice
        case $choice in
            1)
                ENVIRONMENT="development"
                log_success "Selected: Development environment"
                break
                ;;
            2)
                ENVIRONMENT="production"
                log_success "Selected: Production environment"
                break
                ;;
            *)
                log_error "Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done
    echo ""
}

# Database configuration
configure_database() {
    log_step "Database Configuration"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        prompt_with_default "Enter database password (leave empty for auto-generated):" "" "DATABASE_PASSWORD"
        if [ -z "$DATABASE_PASSWORD" ]; then
            DATABASE_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
            log_info "Generated secure database password"
        fi
    else
        DATABASE_PASSWORD="mcphub_dev_password"
        log_info "Using default development database password"
    fi
    echo ""
}

# Security configuration
configure_security() {
    log_step "Security Configuration"
    echo ""
    
    prompt_with_default "Enter JWT secret key (leave empty for auto-generated):" "" "JWT_SECRET"
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        log_info "Generated secure JWT secret key"
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if prompt_yes_no "Enable SSL/HTTPS?" "n"; then
            ENABLE_SSL=true
            log_success "SSL/HTTPS will be enabled"
        fi
    fi
    echo ""
}

# Port configuration
configure_ports() {
    log_step "Port Configuration"
    echo ""
    
    prompt_with_default "API Gateway port:" "8000" "API_GATEWAY_PORT"
    prompt_with_default "Web UI port:" "3000" "WEB_UI_PORT"
    
    # Validate ports
    if ! [[ "$API_GATEWAY_PORT" =~ ^[0-9]+$ ]] || [ "$API_GATEWAY_PORT" -lt 1024 ] || [ "$API_GATEWAY_PORT" -gt 65535 ]; then
        log_warning "Invalid API Gateway port. Using default: 8000"
        API_GATEWAY_PORT=8000
    fi
    
    if ! [[ "$WEB_UI_PORT" =~ ^[0-9]+$ ]] || [ "$WEB_UI_PORT" -lt 1024 ] || [ "$WEB_UI_PORT" -gt 65535 ]; then
        log_warning "Invalid Web UI port. Using default: 3000"
        WEB_UI_PORT=3000
    fi
    
    log_success "Ports configured: API Gateway ($API_GATEWAY_PORT), Web UI ($WEB_UI_PORT)"
    echo ""
}

# Optional features
configure_features() {
    log_step "Optional Features"
    echo ""
    
    if prompt_yes_no "Enable monitoring (Prometheus + Grafana)?" "y"; then
        ENABLE_MONITORING=true
        log_success "Monitoring will be enabled"
    else
        ENABLE_MONITORING=false
        log_info "Monitoring will be disabled"
    fi
    echo ""
}

# Generate configuration files
generate_config() {
    log_step "Generating configuration files..."
    
    # Create .env file
    cat > .env << EOF
# JomMCP Platform Configuration
# Generated by Setup Wizard on $(date)

# Environment
ENVIRONMENT=$ENVIRONMENT
DEBUG=$([ "$ENVIRONMENT" = "development" ] && echo "true" || echo "false")

# Database Configuration
DATABASE_URL=postgresql+asyncpg://mcphub:$DATABASE_PASSWORD@postgres:5432/mcphub
POSTGRES_DB=mcphub
POSTGRES_USER=mcphub
POSTGRES_PASSWORD=$DATABASE_PASSWORD

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# JWT Configuration
JWT_SECRET_KEY=$JWT_SECRET
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Configuration
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:$WEB_UI_PORT","http://localhost:$API_GATEWAY_PORT"]

# Service Ports
API_GATEWAY_PORT=$API_GATEWAY_PORT
REGISTRATION_SERVICE_PORT=8081
GENERATOR_SERVICE_PORT=8082
DEPLOYMENT_SERVICE_PORT=8083
DOCS_SERVICE_PORT=8084
WEB_UI_PORT=$WEB_UI_PORT

# Frontend Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:$API_GATEWAY_PORT
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:$API_GATEWAY_PORT

# Optional Features
ENABLE_MONITORING=$ENABLE_MONITORING
ENABLE_SSL=$ENABLE_SSL
EOF
    
    # Create frontend .env.local
    mkdir -p apps/web-ui
    cat > apps/web-ui/.env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:$API_GATEWAY_PORT
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:$API_GATEWAY_PORT
EOF
    
    log_success "Configuration files generated"
}

# Display configuration summary
show_summary() {
    echo ""
    log_step "Configuration Summary"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    Configuration Summary                 ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Environment:      ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "${CYAN}║${NC} API Gateway:      ${YELLOW}http://localhost:$API_GATEWAY_PORT${NC}"
    echo -e "${CYAN}║${NC} Web UI:           ${YELLOW}http://localhost:$WEB_UI_PORT${NC}"
    echo -e "${CYAN}║${NC} Database:         ${YELLOW}PostgreSQL (password set)${NC}"
    echo -e "${CYAN}║${NC} Monitoring:       ${YELLOW}$([ "$ENABLE_MONITORING" = true ] && echo "Enabled" || echo "Disabled")${NC}"
    echo -e "${CYAN}║${NC} SSL:              ${YELLOW}$([ "$ENABLE_SSL" = true ] && echo "Enabled" || echo "Disabled")${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Main wizard function
main() {
    print_banner
    
    log_info "Welcome to the JomMCP Platform Setup Wizard!"
    log_info "This wizard will guide you through the configuration process."
    echo ""
    
    if ! prompt_yes_no "Continue with interactive setup?" "y"; then
        log_info "Setup cancelled. You can run the quick install with: ./scripts/install.sh"
        exit 0
    fi
    
    echo ""
    select_environment
    configure_database
    configure_security
    configure_ports
    configure_features
    
    show_summary
    
    if prompt_yes_no "Proceed with this configuration?" "y"; then
        generate_config
        log_success "Setup wizard completed!"
        echo ""
        log_info "Next steps:"
        echo -e "  ${BLUE}1. Start services: ./scripts/start-dev.sh${NC}"
        echo -e "  ${BLUE}2. Check health:   ./scripts/health-check.sh${NC}"
        echo -e "  ${BLUE}3. Open Web UI:    http://localhost:$WEB_UI_PORT${NC}"
    else
        log_info "Setup cancelled. You can run the wizard again anytime."
    fi
}

# Run main function
main "$@"
