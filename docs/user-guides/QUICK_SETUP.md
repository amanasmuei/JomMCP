# 🚀 JomMCP Quick Setup Guide

**Get your JomMCP Platform running in under 5 minutes!**  
*Mari jalankan Platform JomMCP dalam masa kurang dari 5 minit!*

## 📋 Prerequisites

Before starting, ensure you have:

- **Docker & Docker Compose** - [Install Guide](https://docs.docker.com/get-docker/)
- **Git** - [Install Guide](https://git-scm.com/downloads)
- **curl** (usually pre-installed on most systems)

## ⚡ Method 1: One-Command Setup (Recommended)

The fastest way to get started:

```bash
# 🎯 Automated installation
curl -fsSL https://raw.githubusercontent.com/jommcp/jommcp/main/scripts/install.sh | bash

# 🌐 Open the platform
open http://localhost:3000
```

**What this does:**
- ✅ Checks prerequisites
- ✅ Clones the repository
- ✅ Sets up environment configuration
- ✅ Starts all services with Docker
- ✅ Verifies installation

## 🛠️ Method 2: Interactive Setup Wizard

For customized installation with guided configuration:

```bash
# Clone the repository
git clone https://github.com/jommcp/jommcp.git
cd jommcp

# Run the interactive setup wizard
./scripts/setup-wizard.sh
```

The wizard will guide you through:
- 🔧 Environment selection (development/production)
- 🔐 Security configuration
- 🌐 Port configuration
- 📊 Optional features (monitoring, SSL)

## 🐳 Method 3: Simple Docker Setup

If you prefer Docker Compose directly:

```bash
# Clone and start
git clone https://github.com/jommcp/jommcp.git
cd jommcp

# Start all services
docker-compose up -d

# Check status
./scripts/status.sh
```

## 🔧 Method 4: Development Setup

For contributors and developers:

```bash
# Clone the repository
git clone https://github.com/jommcp/jommcp.git
cd jommcp

# Run development setup
./scripts/dev-setup.sh

# Start development services
./scripts/start-dev.sh

# Verify installation
./scripts/health-check.sh
```

## 🧪 Verify Your Installation

After setup, verify everything is working:

```bash
# Quick status check
./scripts/status.sh

# Comprehensive health check
./scripts/health-check.sh

# Run integration tests
./scripts/test-setup.sh
```

## 📱 Access Your Platform

Once setup is complete, access these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Web UI** | http://localhost:3000 | Main user interface |
| 📚 **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| 🔍 **Health Check** | http://localhost:8000/health | System health status |
| 📊 **Monitoring** | http://localhost:3001 | Grafana dashboards (if enabled) |

## 🛠️ Useful Commands

```bash
# View service logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Update to latest version
git pull && docker-compose pull && docker-compose up -d
```

## 🔧 Troubleshooting

### Services Not Starting

```bash
# Check Docker is running
docker info

# Check port conflicts
netstat -tulpn | grep -E '(8000|8081|3000|5432|6379)'

# View detailed logs
docker-compose logs [service-name]
```

### Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U mcphub

# Reset database
docker-compose down -v
docker-compose up -d
```

### Permission Issues

```bash
# Fix script permissions
chmod +x scripts/*.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

## 🎯 Next Steps

After successful setup:

1. **📖 Read the User Guide** - [User Guide](USER_GUIDE.md)
2. **🔐 Configure Authentication** - Set up user accounts
3. **📝 Register Your First API** - Transform an API to MCP server
4. **🚀 Deploy Your MCP Server** - Make it available for AI assistants

## 🆘 Getting Help

If you encounter issues:

- 📖 Check our [Troubleshooting Guide](TROUBLESHOOTING.md)
- 🐛 Report issues on [GitHub Issues](https://github.com/jommcp/jommcp/issues)
- 💬 Join our community (Coming Soon)
- 📧 Contact support: support@jommcp.com

## 🎉 Success!

You're now ready to transform your APIs into AI-ready MCP servers!

**Mari mula mengubah API anda menjadi MCP server yang siap untuk AI!** 🚀
