#!/bin/bash

# JomMCP Download Testing Script
# Tests all download methods and sources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="test_downloads"
GITHUB_USER="amanasmuei"  # Actual GitHub user
GITHUB_REPO="JomMCP"  # Actual repository

# Download sources to test
DOWNLOAD_SOURCES=(
    "https://github.com/${GITHUB_USER}/${GITHUB_REPO}/archive/refs/heads/main.zip"
    "https://codeload.github.com/${GITHUB_USER}/${GITHUB_REPO}/zip/refs/heads/main"
    "https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/zipball/main"
    "https://github.com/${GITHUB_USER}/${GITHUB_REPO}/archive/refs/heads/main.tar.gz"
)

# Install scripts to test
INSTALL_SCRIPTS=(
    "scripts/web-install.sh"
    "scripts/download-install.sh"
    "scripts/install.sh"
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
                                              
    🧪 JomMCP Download Testing Suite
    Testing all download methods and sources
EOF
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup test environment
setup_test_env() {
    log_step "Setting up test environment..."
    
    # Clean and create test directory
    rm -rf "$TEST_DIR"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    log_success "Test environment ready: $TEST_DIR"
}

# Test URL accessibility
test_url_accessibility() {
    log_step "Testing URL accessibility..."
    
    local failed_urls=()
    
    for url in "${DOWNLOAD_SOURCES[@]}"; do
        log_info "Testing: $url"
        
        if command_exists curl; then
            if curl -s --head "$url" | head -n 1 | grep -q "200\|302"; then
                log_success "✓ Accessible: $url"
            else
                log_error "✗ Failed: $url"
                failed_urls+=("$url")
            fi
        elif command_exists wget; then
            if wget --spider -q "$url" 2>/dev/null; then
                log_success "✓ Accessible: $url"
            else
                log_error "✗ Failed: $url"
                failed_urls+=("$url")
            fi
        else
            log_warning "No download tool available (curl/wget)"
            return 1
        fi
    done
    
    if [ ${#failed_urls[@]} -eq 0 ]; then
        log_success "All URLs are accessible"
        return 0
    else
        log_error "Failed URLs: ${#failed_urls[@]}"
        return 1
    fi
}

# Test download with curl
test_curl_download() {
    log_step "Testing curl downloads..."
    
    if ! command_exists curl; then
        log_warning "curl not available, skipping curl tests"
        return 0
    fi
    
    local test_count=0
    local success_count=0
    
    for url in "${DOWNLOAD_SOURCES[@]}"; do
        ((test_count++))
        local filename="curl_test_${test_count}.zip"
        
        log_info "Downloading with curl: $url"
        
        if curl -L --fail --silent -o "$filename" "$url" 2>/dev/null; then
            if [ -f "$filename" ] && [ -s "$filename" ]; then
                log_success "✓ Downloaded: $filename ($(du -h "$filename" | cut -f1))"
                ((success_count++))
                rm "$filename"
            else
                log_error "✗ Empty file: $filename"
            fi
        else
            log_error "✗ Download failed: $url"
        fi
    done
    
    log_info "curl results: $success_count/$test_count successful"
    return 0
}

# Test download with wget
test_wget_download() {
    log_step "Testing wget downloads..."
    
    if ! command_exists wget; then
        log_warning "wget not available, skipping wget tests"
        return 0
    fi
    
    local test_count=0
    local success_count=0
    
    for url in "${DOWNLOAD_SOURCES[@]}"; do
        ((test_count++))
        local filename="wget_test_${test_count}.zip"
        
        log_info "Downloading with wget: $url"
        
        if wget -q -O "$filename" "$url" 2>/dev/null; then
            if [ -f "$filename" ] && [ -s "$filename" ]; then
                log_success "✓ Downloaded: $filename ($(du -h "$filename" | cut -f1))"
                ((success_count++))
                rm "$filename"
            else
                log_error "✗ Empty file: $filename"
            fi
        else
            log_error "✗ Download failed: $url"
        fi
    done
    
    log_info "wget results: $success_count/$test_count successful"
    return 0
}

# Test archive extraction
test_extraction() {
    log_step "Testing archive extraction..."
    
    # Download a test archive
    local test_url="${DOWNLOAD_SOURCES[0]}"
    local test_file="extraction_test.zip"
    
    log_info "Downloading test archive..."
    if command_exists curl; then
        curl -L --fail --silent -o "$test_file" "$test_url"
    elif command_exists wget; then
        wget -q -O "$test_file" "$test_url"
    else
        log_error "No download tool available"
        return 1
    fi
    
    if [ ! -f "$test_file" ] || [ ! -s "$test_file" ]; then
        log_error "Failed to download test archive"
        return 1
    fi
    
    # Test ZIP extraction
    if command_exists unzip; then
        log_info "Testing ZIP extraction..."
        if unzip -q "$test_file" -d "zip_extract_test/"; then
            if [ -d "zip_extract_test" ] && [ "$(ls -A zip_extract_test)" ]; then
                log_success "✓ ZIP extraction successful"
                rm -rf "zip_extract_test"
            else
                log_error "✗ ZIP extraction failed (empty directory)"
            fi
        else
            log_error "✗ ZIP extraction failed"
        fi
    else
        log_warning "unzip not available, skipping ZIP extraction test"
    fi
    
    rm -f "$test_file"
    
    # Test TAR.GZ extraction
    local tar_url="${DOWNLOAD_SOURCES[3]}"  # TAR.GZ URL
    local tar_file="extraction_test.tar.gz"
    
    log_info "Downloading TAR.GZ test archive..."
    if command_exists curl; then
        curl -L --fail --silent -o "$tar_file" "$tar_url"
    elif command_exists wget; then
        wget -q -O "$tar_file" "$tar_url"
    fi
    
    if [ -f "$tar_file" ] && [ -s "$tar_file" ]; then
        if command_exists tar; then
            log_info "Testing TAR.GZ extraction..."
            if tar -xzf "$tar_file" -C "tar_extract_test/" 2>/dev/null; then
                if [ -d "tar_extract_test" ] && [ "$(ls -A tar_extract_test)" ]; then
                    log_success "✓ TAR.GZ extraction successful"
                    rm -rf "tar_extract_test"
                else
                    log_error "✗ TAR.GZ extraction failed (empty directory)"
                fi
            else
                log_error "✗ TAR.GZ extraction failed"
            fi
        else
            log_warning "tar not available, skipping TAR.GZ extraction test"
        fi
        rm -f "$tar_file"
    fi
    
    return 0
}

# Test install scripts syntax
test_install_scripts() {
    log_step "Testing install scripts syntax..."
    
    cd ..  # Go back to project root
    
    for script in "${INSTALL_SCRIPTS[@]}"; do
        if [ -f "$script" ]; then
            log_info "Testing syntax: $script"
            
            # Test bash syntax
            if bash -n "$script" 2>/dev/null; then
                log_success "✓ Syntax valid: $script"
            else
                log_error "✗ Syntax error: $script"
            fi
            
            # Check if executable
            if [ -x "$script" ]; then
                log_success "✓ Executable: $script"
            else
                log_warning "⚠ Not executable: $script"
            fi
        else
            log_error "✗ Script not found: $script"
        fi
    done
    
    cd "$TEST_DIR"  # Go back to test directory
    return 0
}

# Test GitHub API
test_github_api() {
    log_step "Testing GitHub API..."
    
    local api_url="https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}"
    
    if command_exists curl; then
        log_info "Testing GitHub API access..."
        local response=$(curl -s "$api_url")
        
        if echo "$response" | grep -q '"name"'; then
            log_success "✓ GitHub API accessible"
            
            # Test releases API
            local releases_url="$api_url/releases/latest"
            local releases_response=$(curl -s "$releases_url")
            
            if echo "$releases_response" | grep -q '"tag_name"'; then
                log_success "✓ GitHub Releases API accessible"
            else
                log_warning "⚠ No releases found or releases API not accessible"
            fi
        else
            log_error "✗ GitHub API not accessible or repository not found"
        fi
    else
        log_warning "curl not available, skipping GitHub API test"
    fi
    
    return 0
}

# Test CDN access
test_cdn_access() {
    log_step "Testing CDN access..."
    
    local jsdelivr_url="https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/README.md"
    
    if command_exists curl; then
        log_info "Testing jsDelivr CDN..."
        if curl -s --head "$jsdelivr_url" | head -n 1 | grep -q "200"; then
            log_success "✓ jsDelivr CDN accessible"
        else
            log_warning "⚠ jsDelivr CDN not accessible"
        fi
    else
        log_warning "curl not available, skipping CDN test"
    fi
    
    return 0
}

# Cleanup test environment
cleanup_test_env() {
    log_step "Cleaning up test environment..."
    
    cd ..
    rm -rf "$TEST_DIR"
    
    log_success "Test environment cleaned up"
}

# Print test summary
print_summary() {
    echo ""
    echo -e "${GREEN}🎉 Download testing completed!${NC}"
    echo ""
    echo -e "${CYAN}📋 Test Summary:${NC}"
    echo -e "  ${BLUE}• URL accessibility test${NC}"
    echo -e "  ${BLUE}• curl download test${NC}"
    echo -e "  ${BLUE}• wget download test${NC}"
    echo -e "  ${BLUE}• Archive extraction test${NC}"
    echo -e "  ${BLUE}• Install scripts syntax test${NC}"
    echo -e "  ${BLUE}• GitHub API test${NC}"
    echo -e "  ${BLUE}• CDN access test${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "  ${BLUE}1. Fix any failed tests${NC}"
    echo -e "  ${BLUE}2. Update download URLs if needed${NC}"
    echo -e "  ${BLUE}3. Test the actual installation process${NC}"
    echo -e "  ${BLUE}4. Create GitHub releases for distribution${NC}"
}

# Main function
main() {
    print_banner
    
    log_info "Starting JomMCP download testing..."
    echo ""
    
    setup_test_env
    test_url_accessibility
    test_curl_download
    test_wget_download
    test_extraction
    test_install_scripts
    test_github_api
    test_cdn_access
    cleanup_test_env
    print_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "JomMCP Download Testing Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "This script tests:"
        echo "  - URL accessibility"
        echo "  - Download methods (curl, wget)"
        echo "  - Archive extraction"
        echo "  - Install script syntax"
        echo "  - GitHub API access"
        echo "  - CDN availability"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
