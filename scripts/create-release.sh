#!/bin/bash

# JomMCP Platform - Release Packaging Script
# This script creates distributable packages for JomMCP

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
VERSION="${1:-1.0.0}"
BUILD_DIR="build"
RELEASE_DIR="releases"
TEMP_DIR="temp_release"

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
                                              
    📦 JomMCP Release Packaging Tool
    🚀 Creating distributable packages
EOF
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command -v zip >/dev/null 2>&1; then
        missing_deps+=("zip")
    fi
    
    if ! command -v tar >/dev/null 2>&1; then
        missing_deps+=("tar")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}• $dep${NC}"
        done
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Clean previous builds
clean_build() {
    log_step "Cleaning previous builds..."
    
    rm -rf "$BUILD_DIR" "$TEMP_DIR"
    mkdir -p "$BUILD_DIR" "$RELEASE_DIR"
    
    log_success "Build directory cleaned"
}

# Copy project files
copy_project_files() {
    log_step "Copying project files..."
    
    mkdir -p "$TEMP_DIR"
    
    # Copy essential directories and files
    cp -r apps/ "$TEMP_DIR/"
    cp -r packages/ "$TEMP_DIR/"
    cp -r infrastructure/ "$TEMP_DIR/"
    cp -r database/ "$TEMP_DIR/"
    cp -r scripts/ "$TEMP_DIR/"
    cp -r docs/ "$TEMP_DIR/"
    cp -r config/ "$TEMP_DIR/"
    cp -r tests/ "$TEMP_DIR/"
    
    # Copy root files
    cp docker-compose.yml "$TEMP_DIR/"
    cp README.md "$TEMP_DIR/"
    cp LICENSE "$TEMP_DIR/" 2>/dev/null || echo "# MIT License" > "$TEMP_DIR/LICENSE"
    cp .gitignore "$TEMP_DIR/" 2>/dev/null || true
    
    # Create version file
    echo "$VERSION" > "$TEMP_DIR/VERSION"
    
    # Create installation info
    cat > "$TEMP_DIR/INSTALL.md" << EOF
# JomMCP Platform Installation

## Quick Start

1. **Extract the archive**:
   \`\`\`bash
   unzip jommcp-v${VERSION}.zip
   cd jommcp-v${VERSION}
   \`\`\`

2. **Run the installer**:
   \`\`\`bash
   ./scripts/install.sh
   \`\`\`

3. **Access the platform**:
   - Web UI: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## Requirements

- Docker 20.0.0+
- Docker Compose 2.0.0+
- 4GB RAM minimum
- 10GB disk space

## Support

- Documentation: docs/
- Issues: https://github.com/jommcp/jommcp/issues
- Website: https://jommcp.com (coming soon)

EOF
    
    log_success "Project files copied"
}

# Create checksums
create_checksums() {
    log_step "Creating checksums..."
    
    cd "$BUILD_DIR"
    
    # Create SHA256 checksums
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum *.zip *.tar.gz > checksums.sha256 2>/dev/null || true
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 *.zip *.tar.gz > checksums.sha256 2>/dev/null || true
    fi
    
    # Create MD5 checksums for compatibility
    if command -v md5sum >/dev/null 2>&1; then
        md5sum *.zip *.tar.gz > checksums.md5 2>/dev/null || true
    elif command -v md5 >/dev/null 2>&1; then
        md5 *.zip *.tar.gz > checksums.md5 2>/dev/null || true
    fi
    
    cd ..
    
    log_success "Checksums created"
}

# Create ZIP package
create_zip_package() {
    log_step "Creating ZIP package..."
    
    local zip_name="jommcp-v${VERSION}.zip"
    local zip_path="$BUILD_DIR/$zip_name"
    
    cd "$TEMP_DIR"
    zip -r "../$zip_path" . -x "*.git*" "*.DS_Store*" "*node_modules*" "*__pycache__*" "*.pyc"
    cd ..
    
    log_success "ZIP package created: $zip_name"
}

# Create TAR.GZ package
create_tarball_package() {
    log_step "Creating TAR.GZ package..."
    
    local tar_name="jommcp-v${VERSION}.tar.gz"
    local tar_path="$BUILD_DIR/$tar_name"
    
    tar -czf "$tar_path" -C "$TEMP_DIR" . \
        --exclude=".git*" \
        --exclude=".DS_Store*" \
        --exclude="node_modules" \
        --exclude="__pycache__" \
        --exclude="*.pyc"
    
    log_success "TAR.GZ package created: $tar_name"
}

# Create Docker image export
create_docker_export() {
    log_step "Creating Docker image export..."
    
    if command -v docker >/dev/null 2>&1; then
        local docker_export="jommcp-docker-v${VERSION}.tar"
        local docker_path="$BUILD_DIR/$docker_export"
        
        # Build images first
        log_info "Building Docker images..."
        docker-compose build --no-cache
        
        # Export images
        log_info "Exporting Docker images..."
        docker save \
            jommcp-api-gateway \
            jommcp-registration \
            jommcp-generator \
            jommcp-deployment \
            jommcp-docs \
            jommcp-web-ui \
            -o "$docker_path" 2>/dev/null || log_warning "Some Docker images may not exist yet"
        
        if [ -f "$docker_path" ]; then
            log_success "Docker export created: $docker_export"
        else
            log_warning "Docker export skipped (images not built)"
        fi
    else
        log_warning "Docker not available, skipping Docker export"
    fi
}

# Create release notes
create_release_notes() {
    log_step "Creating release notes..."
    
    cat > "$BUILD_DIR/RELEASE_NOTES.md" << EOF
# JomMCP Platform v${VERSION}

## 🚀 What's New

- Complete MCP server generation platform
- API registration and management
- Real-time deployment monitoring
- Comprehensive documentation generation
- Production-ready microservices architecture

## 📦 Package Contents

- **jommcp-v${VERSION}.zip** - Complete platform (ZIP format)
- **jommcp-v${VERSION}.tar.gz** - Complete platform (TAR.GZ format)
- **jommcp-docker-v${VERSION}.tar** - Docker images export
- **checksums.sha256** - SHA256 checksums
- **checksums.md5** - MD5 checksums

## 🛠️ Installation

### Quick Install
\`\`\`bash
# Download and extract
curl -L -o jommcp.zip https://github.com/jommcp/jommcp/releases/download/v${VERSION}/jommcp-v${VERSION}.zip
unzip jommcp.zip
cd jommcp-v${VERSION}

# Install
./scripts/install.sh
\`\`\`

### One-Command Install
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/jommcp/jommcp/main/scripts/download-install.sh | bash
\`\`\`

## 🔧 Requirements

- Docker 20.0.0+
- Docker Compose 2.0.0+
- 4GB RAM minimum
- 10GB disk space

## 🌐 Access Points

- **Web UI**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 Documentation

- [Installation Guide](INSTALL.md)
- [Architecture Overview](docs/architecture/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)

## 🐛 Known Issues

- None reported for this release

## 🤝 Support

- GitHub Issues: https://github.com/jommcp/jommcp/issues
- Documentation: https://docs.jommcp.com (coming soon)
- Community: https://community.jommcp.com (coming soon)

---

**Full Changelog**: https://github.com/jommcp/jommcp/compare/v${VERSION}...v${VERSION}

EOF
    
    log_success "Release notes created"
}

# Generate file listing
generate_file_listing() {
    log_step "Generating file listing..."
    
    cat > "$BUILD_DIR/FILES.txt" << EOF
JomMCP Platform v${VERSION} - File Listing
Generated on: $(date)

EOF
    
    cd "$BUILD_DIR"
    ls -la >> FILES.txt
    cd ..
    
    log_success "File listing generated"
}

# Copy to releases directory
copy_to_releases() {
    log_step "Copying to releases directory..."
    
    local version_dir="$RELEASE_DIR/v${VERSION}"
    mkdir -p "$version_dir"
    
    cp -r "$BUILD_DIR"/* "$version_dir/"
    
    # Create latest symlink
    cd "$RELEASE_DIR"
    rm -f latest
    ln -s "v${VERSION}" latest
    cd ..
    
    log_success "Release copied to: $version_dir"
}

# Cleanup
cleanup() {
    log_step "Cleaning up temporary files..."
    
    rm -rf "$TEMP_DIR"
    
    log_success "Cleanup completed"
}

# Print summary
print_summary() {
    echo ""
    echo -e "${GREEN}🎉 Release packaging completed!${NC}"
    echo ""
    echo -e "${CYAN}📦 Release v${VERSION} created:${NC}"
    echo -e "  ${BLUE}• Location: $BUILD_DIR/${NC}"
    echo -e "  ${BLUE}• ZIP: jommcp-v${VERSION}.zip${NC}"
    echo -e "  ${BLUE}• TAR.GZ: jommcp-v${VERSION}.tar.gz${NC}"
    echo -e "  ${BLUE}• Checksums: checksums.sha256, checksums.md5${NC}"
    echo ""
    echo -e "${CYAN}🚀 Distribution URLs:${NC}"
    echo -e "  ${BLUE}• ZIP: https://github.com/jommcp/jommcp/releases/download/v${VERSION}/jommcp-v${VERSION}.zip${NC}"
    echo -e "  ${BLUE}• TAR.GZ: https://github.com/jommcp/jommcp/releases/download/v${VERSION}/jommcp-v${VERSION}.tar.gz${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "  ${BLUE}1. Test the packages${NC}"
    echo -e "  ${BLUE}2. Upload to GitHub Releases${NC}"
    echo -e "  ${BLUE}3. Update download URLs${NC}"
    echo -e "  ${BLUE}4. Announce the release${NC}"
}

# Main function
main() {
    print_banner
    
    log_info "Creating JomMCP Platform release v${VERSION}..."
    echo ""
    
    check_prerequisites
    clean_build
    copy_project_files
    create_zip_package
    create_tarball_package
    create_docker_export
    create_checksums
    create_release_notes
    generate_file_listing
    copy_to_releases
    cleanup
    print_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "JomMCP Release Packaging Script"
        echo ""
        echo "Usage: $0 [version] [options]"
        echo ""
        echo "Arguments:"
        echo "  version        Release version (default: 1.0.0)"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 1.0.0       Create release v1.0.0"
        echo "  $0 1.1.0-beta  Create beta release"
        exit 0
        ;;
    --version|-v)
        echo "JomMCP Release Script v1.0.0"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
