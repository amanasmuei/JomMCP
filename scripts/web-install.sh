#!/bin/bash

# JomMCP Platform - Web Installation Script
# This script can be hosted anywhere and provides one-command installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="JomMCP"
VERSION="1.0.0"
INSTALL_DIR="jommcp"

# Download sources (multiple mirrors for reliability)
DOWNLOAD_SOURCES=(
    "https://github.com/amanasmuei/JomMCP/archive/refs/heads/main.zip"
    "https://codeload.github.com/amanasmuei/JomMCP/zip/refs/heads/main"
    "https://api.github.com/repos/amanasmuei/JomMCP/zipball/main"
)

# Backup/mirror sources (can be updated when hosting is available)
BACKUP_SOURCES=(
    "https://cdn.jsdelivr.net/gh/amanasmuei/JomMCP@main/releases/jommcp-latest.zip"
    "https://releases.jommcp.com/latest/jommcp-latest.zip"
    "https://raw.githubusercontent.com/amanasmuei/JomMCP/main/releases/jommcp-latest.zip"
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
                                              
    🚀 Transform your APIs into AI-ready MCP servers
    🌐 One-command web installation
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
    local warnings=()
    
    # Essential dependencies
    if ! command_exists curl && ! command_exists wget; then
        missing_deps+=("curl or wget")
    fi
    
    if ! command_exists unzip; then
        missing_deps+=("unzip")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        missing_deps+=("Docker Compose")
    fi
    
    # Optional but recommended
    if ! command_exists git; then
        warnings+=("Git (recommended for updates)")
    fi
    
    # Display missing dependencies
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}• $dep${NC}"
        done
        echo ""
        log_info "Quick installation commands:"
        echo -e "  ${BLUE}# Ubuntu/Debian:${NC}"
        echo -e "  ${BLUE}sudo apt-get update && sudo apt-get install -y curl unzip docker.io docker-compose${NC}"
        echo ""
        echo -e "  ${BLUE}# macOS (with Homebrew):${NC}"
        echo -e "  ${BLUE}brew install docker docker-compose${NC}"
        echo ""
        echo -e "  ${BLUE}# Or install Docker Desktop: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    # Display warnings
    if [ ${#warnings[@]} -ne 0 ]; then
        log_warning "Optional dependencies missing:"
        for warning in "${warnings[@]}"; do
            echo -e "  ${YELLOW}• $warning${NC}"
        done
        echo ""
    fi
    
    log_success "All required prerequisites are installed"
}

# Download file with retry logic
download_with_retry() {
    local url="$1"
    local output="$2"
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Download attempt $attempt/$max_attempts: $url"
        
        if command_exists curl; then
            if curl -L --fail --silent --show-error -o "$output" "$url"; then
                return 0
            fi
        elif command_exists wget; then
            if wget -q -O "$output" "$url"; then
                return 0
            fi
        fi
        
        ((attempt++))
        if [ $attempt -le $max_attempts ]; then
            log_warning "Download failed, retrying in 2 seconds..."
            sleep 2
        fi
    done
    
    return 1
}

# Try multiple download sources
download_jommcp() {
    log_step "Downloading JomMCP Platform..."
    
    # Check if already exists
    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Directory '$INSTALL_DIR' already exists"
        read -p "Do you want to remove it and download fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            log_info "Using existing directory"
            return 0
        fi
    fi
    
    local downloaded=false
    local temp_file="jommcp-download.zip"
    
    # Try primary sources
    log_info "Trying primary download sources..."
    for source in "${DOWNLOAD_SOURCES[@]}"; do
        if download_with_retry "$source" "$temp_file"; then
            log_success "Downloaded from: $source"
            downloaded=true
            break
        fi
    done
    
    # Try backup sources if primary failed
    if [ "$downloaded" = false ]; then
        log_warning "Primary sources failed, trying backup sources..."
        for source in "${BACKUP_SOURCES[@]}"; do
            if download_with_retry "$source" "$temp_file"; then
                log_success "Downloaded from backup: $source"
                downloaded=true
                break
            fi
        done
    fi
    
    if [ "$downloaded" = false ]; then
        log_error "All download sources failed!"
        echo ""
        log_info "Manual installation options:"
        echo -e "  ${BLUE}1. Visit: https://github.com/amanasmuei/JomMCP${NC}"
        echo -e "  ${BLUE}2. Download ZIP manually and extract${NC}"
        echo -e "  ${BLUE}3. Clone with Git: git clone https://github.com/amanasmuei/JomMCP.git${NC}"
        exit 1
    fi
    
    # Extract the archive
    log_step "Extracting archive..."
    if unzip -q "$temp_file"; then
        # Handle different folder naming conventions
        if [ -d "JomMCP-main" ]; then
            mv "JomMCP-main" "$INSTALL_DIR"
        elif [ -d "jommcp-main" ]; then
            mv "jommcp-main" "$INSTALL_DIR"
        elif [ -d "jommcp" ]; then
            # Already correctly named
            true
        else
            # Find any directory that looks like jommcp or JomMCP
            local extracted_dir=$(find . -maxdepth 1 -type d -name "*[Jj]om[Mm][Cc][Pp]*" | head -1)
            if [ -n "$extracted_dir" ]; then
                mv "$extracted_dir" "$INSTALL_DIR"
            else
                log_error "Could not find extracted directory"
                exit 1
            fi
        fi
        rm "$temp_file"
        log_success "Archive extracted successfully"
    else
        log_error "Failed to extract archive"
        exit 1
    fi
}

# Run installation
run_installation() {
    log_step "Running JomMCP installation..."
    
    cd "$INSTALL_DIR"
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    # Check which install script to use
    if [ -f "scripts/install.sh" ]; then
        log_info "Running main installation script..."
        ./scripts/install.sh
    else
        log_error "Installation script not found!"
        log_info "Please run the setup manually:"
        echo -e "  ${BLUE}cd $INSTALL_DIR${NC}"
        echo -e "  ${BLUE}docker-compose up -d${NC}"
        exit 1
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
    echo -e "  ${BLUE}• View logs:      cd $INSTALL_DIR && docker-compose logs -f${NC}"
    echo -e "  ${BLUE}• Stop services:  cd $INSTALL_DIR && docker-compose down${NC}"
    echo -e "  ${BLUE}• Restart:        cd $INSTALL_DIR && docker-compose restart${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Ready to transform your APIs into MCP servers!${NC}"
    echo -e "${YELLOW}   Mari ubah API anda menjadi MCP server yang siap untuk AI!${NC}"
    echo ""
    echo -e "${CYAN}📖 Next Steps:${NC}"
    echo -e "  ${BLUE}1. Open http://localhost:3000 in your browser${NC}"
    echo -e "  ${BLUE}2. Register your first API${NC}"
    echo -e "  ${BLUE}3. Generate your MCP server${NC}"
    echo -e "  ${BLUE}4. Deploy and start using with AI assistants${NC}"
}

# Main function
main() {
    print_banner
    
    log_info "Starting JomMCP Platform web installation..."
    echo ""
    
    check_prerequisites
    download_jommcp
    run_installation
    print_completion
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "JomMCP Web Installation Script"
        echo ""
        echo "Usage: curl -fsSL [URL] | bash"
        echo "   or: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --version, -v  Show version information"
        echo ""
        echo "This script will:"
        echo "  1. Check prerequisites (Docker, curl, unzip)"
        echo "  2. Download JomMCP from multiple sources"
        echo "  3. Extract and install the platform"
        echo "  4. Start all services"
        echo ""
        echo "Requirements:"
        echo "  - Docker 20.0.0+"
        echo "  - Docker Compose 2.0.0+"
        echo "  - curl or wget"
        echo "  - unzip"
        echo "  - 4GB RAM minimum"
        echo "  - 10GB disk space"
        exit 0
        ;;
    --version|-v)
        echo "JomMCP Web Installation Script v${VERSION}"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
