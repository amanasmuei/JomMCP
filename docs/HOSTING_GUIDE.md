# JomMCP Hosting Guide

This guide explains how to host JomMCP download scripts and pages for URL-based installation.

## 🌐 Hosting Options

### 1. GitHub Pages (Free)

Host the download page using GitHub Pages:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source: "Deploy from a branch"
   - Choose branch: `main` and folder: `/docs`

2. **Access URLs**:
   - Download page: `https://yourusername.github.io/jommcp/download.html`
   - Install script: `https://raw.githubusercontent.com/yourusername/jommcp/main/scripts/web-install.sh`

### 2. GitHub Raw Files (Free)

Use GitHub's raw file hosting for scripts:

```bash
# One-command install
curl -fsSL https://raw.githubusercontent.com/yourusername/jommcp/main/scripts/web-install.sh | bash
```

### 3. CDN Hosting (Free)

Use jsDelivr CDN for faster global access:

```bash
# Via jsDelivr CDN
curl -fsSL https://cdn.jsdelivr.net/gh/yourusername/jommcp@main/scripts/web-install.sh | bash
```

### 4. Custom Domain

If you have a custom domain:

1. **Set up CNAME**:
   - Create `docs/CNAME` file with your domain
   - Example: `download.jommcp.com`

2. **Access URLs**:
   - Download page: `https://download.jommcp.com/download.html`
   - Install script: `https://download.jommcp.com/scripts/web-install.sh`

## 📦 Creating Releases

### Automated Release Creation

Use the release script to create distributable packages:

```bash
# Create release v1.0.0
./scripts/create-release.sh 1.0.0

# This creates:
# - build/jommcp-v1.0.0.zip
# - build/jommcp-v1.0.0.tar.gz
# - build/checksums.sha256
# - build/RELEASE_NOTES.md
```

### GitHub Releases

1. **Create a release on GitHub**:
   - Go to Releases → Create a new release
   - Tag: `v1.0.0`
   - Title: `JomMCP Platform v1.0.0`
   - Upload the files from `build/` directory

2. **Update download URLs**:
   ```bash
   # Latest release URLs
   https://github.com/yourusername/jommcp/releases/latest/download/jommcp-latest.zip
   https://github.com/yourusername/jommcp/releases/latest/download/jommcp-latest.tar.gz
   ```

## 🔧 Customizing Download Scripts

### Update Download Sources

Edit `scripts/web-install.sh` to add your hosting URLs:

```bash
# Primary sources
DOWNLOAD_SOURCES=(
    "https://github.com/yourusername/jommcp/archive/refs/heads/main.zip"
    "https://yourdomain.com/releases/jommcp-latest.zip"
)

# Backup sources
BACKUP_SOURCES=(
    "https://cdn.jsdelivr.net/gh/yourusername/jommcp@main/releases/jommcp-latest.zip"
    "https://backup.yourdomain.com/jommcp-latest.zip"
)
```

### Custom Branding

Update the banner and messages in the scripts:

```bash
# In scripts/web-install.sh
PROJECT_NAME="Your Project Name"
VERSION="1.0.0"

# Update the ASCII banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    Your Custom Banner Here
EOF
    echo -e "${NC}"
}
```

## 🚀 Deployment Automation

### GitHub Actions

Create `.github/workflows/release.yml`:

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Release Package
        run: |
          chmod +x scripts/create-release.sh
          ./scripts/create-release.sh ${GITHUB_REF#refs/tags/}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            build/*.zip
            build/*.tar.gz
            build/checksums.*
            build/RELEASE_NOTES.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Automatic Updates

Set up automatic script updates:

```bash
# In scripts/web-install.sh, add version checking
check_for_updates() {
    local latest_version=$(curl -s https://api.github.com/repos/yourusername/jommcp/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
    if [ "$latest_version" != "v$VERSION" ]; then
        log_info "New version available: $latest_version"
        log_info "Current version: v$VERSION"
    fi
}
```

## 📊 Analytics and Monitoring

### Download Tracking

Add download analytics to your scripts:

```bash
# In scripts/web-install.sh
track_download() {
    # Simple analytics (optional)
    curl -s "https://api.yourdomain.com/analytics/download" \
         -d "version=$VERSION&os=$(uname -s)" \
         >/dev/null 2>&1 || true
}
```

### Health Monitoring

Monitor your hosting endpoints:

```bash
# Check if download sources are available
check_download_health() {
    for source in "${DOWNLOAD_SOURCES[@]}"; do
        if curl -s --head "$source" | head -n 1 | grep -q "200 OK"; then
            echo "✅ $source"
        else
            echo "❌ $source"
        fi
    done
}
```

## 🔒 Security Considerations

### Script Integrity

1. **Use HTTPS only** for all download URLs
2. **Provide checksums** for verification
3. **Sign releases** with GPG (optional)

### Checksum Verification

Add checksum verification to install scripts:

```bash
# In scripts/web-install.sh
verify_checksum() {
    local file="$1"
    local expected_checksum="$2"
    
    if command -v sha256sum >/dev/null 2>&1; then
        local actual_checksum=$(sha256sum "$file" | cut -d' ' -f1)
        if [ "$actual_checksum" = "$expected_checksum" ]; then
            log_success "Checksum verified"
            return 0
        else
            log_error "Checksum mismatch!"
            return 1
        fi
    fi
}
```

## 📝 Testing

### Test Download Scripts

```bash
# Test the download script locally
bash scripts/web-install.sh

# Test with different tools
curl -fsSL file://$(pwd)/scripts/web-install.sh | bash
wget -qO- file://$(pwd)/scripts/web-install.sh | bash
```

### Test Hosting

```bash
# Test GitHub raw files
curl -I https://raw.githubusercontent.com/yourusername/jommcp/main/scripts/web-install.sh

# Test GitHub Pages
curl -I https://yourusername.github.io/jommcp/download.html
```

## 🎯 Best Practices

1. **Multiple mirrors** - Always provide backup download sources
2. **Graceful fallbacks** - Handle failures gracefully
3. **Clear error messages** - Help users troubleshoot issues
4. **Version management** - Keep track of releases and updates
5. **Documentation** - Maintain clear installation instructions
6. **Testing** - Test all download methods regularly

## 📞 Support

If you need help with hosting setup:

1. Check the [GitHub Issues](https://github.com/jommcp/jommcp/issues)
2. Review the [Documentation](docs/)
3. Contact the community (coming soon)

---

**Made with ❤️ by the JomMCP Team**
