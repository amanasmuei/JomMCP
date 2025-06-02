#!/bin/bash

# JomMCP Platform - URL Download & Installation Script
# This script downloads JomMCP from various sources and installs it

set -e  # Exit on any error

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

# Download sources (in order of preference)
GITHUB_REPO="https://github.com/amanasmuei/JomMCP"
GITHUB_ZIP="https://github.com/amanasmuei/JomMCP/archive/refs/heads/main.zip"
GITHUB_TARBALL="https://github.com/amanasmuei/JomMCP/archive/refs/heads/main.tar.gz"

# Alternative sources (for when GitHub is not available)
BACKUP_SOURCES=(
    "https://cdn.jsdelivr.net/gh/amanasmuei/JomMCP@main/releases/jommcp-latest.zip"
    "https://releases.jommcp.com/latest/jommcp-latest.zip"
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
    📥 One-command download and installation
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
    
    # Check download tools
    if ! command_exists curl && ! command_exists wget; then
        missing_deps+=("curl or wget")
    fi
    
    # Check extraction tools
    if ! command_exists unzip && ! command_exists tar; then
        missing_deps+=("unzip or tar")
    fi
    
    # Check Docker
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        missing_deps+=("Docker Compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}• $dep${NC}"
        done
        echo ""
        log_info "Installation guides:"
        echo -e "  ${BLUE}• Docker: https://docs.docker.com/get-docker/${NC}"
        echo -e "  ${BLUE}• curl: Usually pre-installed, or 'apt-get install curl'${NC}"
        echo -e "  ${BLUE}• unzip: 'apt-get install unzip' or 'yum install unzip'${NC}"
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Download file using available tool
download_file() {
    local url="$1"
    local output="$2"
    
    if command_exists curl; then
        curl -L -o "$output" "$url"
    elif command_exists wget; then
        wget -O "$output" "$url"
    else
        log_error "No download tool available (curl or wget)"
        return 1
    fi
}

# Try to download from GitHub
download_from_github() {
    log_info "Attempting to download from GitHub..."
    
    # Try ZIP first
    if download_file "$GITHUB_ZIP" "jommcp.zip" 2>/dev/null; then
        log_success "Downloaded ZIP from GitHub"
        return 0
    fi
    
    # Try tarball
    if download_file "$GITHUB_TARBALL" "jommcp.tar.gz" 2>/dev/null; then
        log_success "Downloaded tarball from GitHub"
        return 0
    fi
    
    return 1
}

# Try backup sources
download_from_backup() {
    log_info "Trying backup download sources..."
    
    for source in "${BACKUP_SOURCES[@]}"; do
        log_info "Trying: $source"
        if download_file "$source" "jommcp-backup.zip" 2>/dev/null; then
            log_success "Downloaded from backup source: $source"
            mv "jommcp-backup.zip" "jommcp.zip"
            return 0
        fi
    done
    
    return 1
}

# Extract downloaded archive
extract_archive() {
    log_step "Extracting archive..."
    
    if [ -f "jommcp.zip" ]; then
        if command_exists unzip; then
            unzip -q jommcp.zip
            # Handle GitHub's folder naming (jommcp-main)
            if [ -d "jommcp-main" ]; then
                mv jommcp-main "$INSTALL_DIR"
            elif [ -d "jommcp" ]; then
                # Already correctly named
                true
            else
                # Find the extracted directory
                local extracted_dir=$(find . -maxdepth 1 -type d -name "*jommcp*" | head -1)
                if [ -n "$extracted_dir" ]; then
                    mv "$extracted_dir" "$INSTALL_DIR"
                fi
            fi
            rm jommcp.zip
        else
            log_error "unzip not available for ZIP extraction"
            return 1
        fi
    elif [ -f "jommcp.tar.gz" ]; then
        if command_exists tar; then
            tar -xzf jommcp.tar.gz
            # Handle GitHub's folder naming
            if [ -d "jommcp-main" ]; then
                mv jommcp-main "$INSTALL_DIR"
            fi
            rm jommcp.tar.gz
        else
            log_error "tar not available for tarball extraction"
            return 1
        fi
    else
        log_error "No archive file found to extract"
        return 1
    fi
    
    log_success "Archive extracted successfully"
}

# Download JomMCP
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
    
    # Try GitHub first
    if download_from_github; then
        extract_archive
        return 0
    fi
    
    # Try backup sources
    log_warning "GitHub download failed, trying backup sources..."
    if download_from_backup; then
        extract_archive
        return 0
    fi
    
    # All downloads failed
    log_error "All download sources failed!"
    echo ""
    log_info "Manual installation options:"
    echo -e "  ${BLUE}1. Clone with Git: git clone $GITHUB_REPO${NC}"
    echo -e "  ${BLUE}2. Download ZIP: $GITHUB_ZIP${NC}"
    echo -e "  ${BLUE}3. Visit: $GITHUB_REPO${NC}"
    exit 1
}

# Run installation
run_installation() {
    log_step "Running JomMCP installation..."
    
    cd "$INSTALL_DIR"
    
    # Make install script executable
    chmod +x scripts/install.sh
    
    # Run the main installation script
    ./scripts/install.sh
}

# Main function
main() {
    print_banner
    
    log_info "Starting JomMCP Platform download and installation..."
    echo ""
    
    check_prerequisites
    download_jommcp
    run_installation
    
    echo ""
    log_success "JomMCP Platform installation completed!"
    echo -e "${CYAN}🌐 Access your platform at: http://localhost:3000${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "JomMCP Download & Install Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --version, -v  Show version information"
        echo ""
        echo "This script will:"
        echo "  1. Check prerequisites (Docker, curl/wget, unzip/tar)"
        echo "  2. Download JomMCP from GitHub or backup sources"
        echo "  3. Extract and install the platform"
        echo "  4. Start all services"
        exit 0
        ;;
    --version|-v)
        echo "JomMCP Download Script v${VERSION}"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
