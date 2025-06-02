# 🌐 JomMCP Platform - Nginx & Domain Setup Guide

This guide provides comprehensive instructions for setting up nginx with custom domain support for your JomMCP platform.

## 🚀 Quick Start

### 1. Automated Domain Setup

The easiest way to configure your domain:

```bash
# Run the interactive domain setup script
./scripts/setup-domain.sh

# Follow the prompts to configure:
# ✅ Domain name (e.g., jommcp.example.com)
# ✅ SSL/HTTPS settings
# ✅ Environment variables
# ✅ Nginx configuration
# ✅ SSL certificates (if needed)
```

### 2. Start with Nginx

```bash
# Start all services including nginx
docker-compose up -d

# Check nginx status
./scripts/nginx-manager.sh status

# View nginx logs
./scripts/nginx-manager.sh logs
```

### 3. Access Your Platform

- **HTTP**: `http://your-domain.com`
- **HTTPS**: `https://your-domain.com` (if SSL enabled)
- **Localhost**: `http://localhost` (default)

## 📋 Manual Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Domain Configuration
DOMAIN_NAME=your-domain.com
DOMAIN_URL=https://your-domain.com
WS_DOMAIN_URL=wss://your-domain.com
ENABLE_SSL=true

# Nginx Ports
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# Frontend URLs (automatically configured)
NEXT_PUBLIC_API_BASE_URL=${DOMAIN_URL}
NEXT_PUBLIC_WS_BASE_URL=${WS_DOMAIN_URL}
```

### SSL Certificate Setup

#### Option 1: Self-Signed Certificates (Development)

```bash
# Generate self-signed certificates
./scripts/generate-ssl-cert.sh

# Certificates will be created in:
# - infrastructure/nginx/ssl/cert.pem
# - infrastructure/nginx/ssl/key.pem
# - infrastructure/nginx/ssl/dhparam.pem
```

#### Option 2: Production Certificates

```bash
# Place your certificates in:
cp your-cert.pem infrastructure/nginx/ssl/cert.pem
cp your-key.pem infrastructure/nginx/ssl/key.pem

# Set proper permissions
chmod 644 infrastructure/nginx/ssl/cert.pem
chmod 600 infrastructure/nginx/ssl/key.pem
```

## 🔧 Nginx Management

### Service Management

```bash
# Check nginx status
./scripts/nginx-manager.sh status

# Test configuration
./scripts/nginx-manager.sh test

# Reload configuration
./scripts/nginx-manager.sh reload

# Restart nginx
./scripts/nginx-manager.sh restart

# View logs
./scripts/nginx-manager.sh logs

# Follow logs in real-time
./scripts/nginx-manager.sh follow
```

### Configuration Files

| File | Purpose |
|------|---------|
| `infrastructure/nginx/nginx.conf` | Main nginx configuration |
| `infrastructure/nginx/conf.d/localhost.conf` | Localhost development |
| `infrastructure/nginx/conf.d/jommcp.conf` | Domain template |
| `infrastructure/nginx/conf.d/domain.conf` | Generated domain config |
| `infrastructure/nginx/snippets/` | Reusable config snippets |

## 🛣️ Routing & Endpoints

### Default Routes

| Path | Service | Port | Description |
|------|---------|------|-------------|
| `/` | Web UI | 3000 | Main application |
| `/api/*` | API Gateway | 8000 | API endpoints |
| `/ws/*` | API Gateway | 8000 | WebSocket connections |
| `/services/registration/*` | Registration | 8081 | User management |
| `/services/generator/*` | Generator | 8082 | Code generation |
| `/services/deployment/*` | Deployment | 8083 | Container management |
| `/services/docs/*` | Documentation | 8084 | API documentation |
| `/monitoring/prometheus/*` | Prometheus | 9090 | Metrics |
| `/monitoring/grafana/*` | Grafana | 3000 | Dashboards |

### Health & Debug Endpoints

- `/health` - Nginx health check
- `/nginx-status` - Nginx status (localhost only)
- `/debug/` - Debug information (development)

## 🔒 Security Features

### Security Headers

- **X-Frame-Options**: Clickjacking protection
- **X-XSS-Protection**: XSS protection
- **X-Content-Type-Options**: MIME sniffing prevention
- **Content-Security-Policy**: Content security
- **Strict-Transport-Security**: HTTPS enforcement

### Rate Limiting

- **API endpoints**: 10 requests/second
- **Login endpoints**: 1 request/second
- **General requests**: 30 requests/second
- **Connection limit**: 20 per IP

### SSL/TLS Configuration

- **Protocols**: TLS 1.2, TLS 1.3
- **Modern cipher suites**
- **HSTS enabled**
- **OCSP stapling**

## 🐛 Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway

```bash
# Check if services are running
docker-compose ps

# Check service logs
docker-compose logs api-gateway
docker-compose logs web-ui

# Restart services
docker-compose restart
```

#### 2. SSL Certificate Errors

```bash
# Regenerate certificates
./scripts/generate-ssl-cert.sh

# Check certificate files
ls -la infrastructure/nginx/ssl/

# Verify certificate
openssl x509 -in infrastructure/nginx/ssl/cert.pem -text -noout
```

#### 3. Domain Not Accessible

```bash
# For local development, add to /etc/hosts
echo "127.0.0.1 your-domain.com" | sudo tee -a /etc/hosts

# Check DNS resolution
nslookup your-domain.com

# Test connectivity
curl -I http://your-domain.com/health
```

#### 4. Configuration Errors

```bash
# Test nginx configuration
./scripts/nginx-manager.sh test

# Check nginx error logs
docker-compose logs nginx | grep error

# Validate configuration files
nginx -t -c infrastructure/nginx/nginx.conf
```

## 📊 Performance Optimization

### Caching

- **Static assets**: 1 year cache (production)
- **Development**: 1 hour cache
- **API responses**: No cache by default

### Compression

- **Gzip enabled** for text content
- **Minimum size**: 10KB
- **Types**: HTML, CSS, JS, JSON, XML

### Connection Handling

- **Keep-alive enabled**
- **Worker processes**: Auto-detected
- **Upstream keep-alive**: Enabled

## 🧪 Testing

### Test Nginx Setup

```bash
# Run comprehensive nginx tests
./scripts/test-nginx-setup.sh

# Test specific components
./scripts/nginx-manager.sh test
curl -I http://localhost/health
```

### Load Testing

```bash
# Test with curl
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/

# Test with ab (Apache Bench)
ab -n 1000 -c 10 http://localhost/

# Test with wrk
wrk -t12 -c400 -d30s http://localhost/
```

## 📚 Additional Resources

- [Nginx Configuration Reference](infrastructure/nginx/README.md)
- [SSL Certificate Management](scripts/generate-ssl-cert.sh)
- [Domain Setup Script](scripts/setup-domain.sh)
- [Docker Compose Configuration](docker-compose.yml)
- [Environment Configuration](.env.example)

## 🎯 Production Deployment

### Prerequisites

1. **Domain name** pointing to your server
2. **SSL certificates** from a trusted CA
3. **Firewall rules** for ports 80 and 443
4. **DNS configuration** properly set up

### Production Checklist

- [ ] Valid SSL certificates installed
- [ ] Domain DNS configured
- [ ] Firewall rules configured
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Log rotation configured

### Security Hardening

```bash
# Generate strong DH parameters
openssl dhparam -out infrastructure/nginx/ssl/dhparam.pem 4096

# Set proper file permissions
chmod 600 infrastructure/nginx/ssl/*.pem
chmod 644 infrastructure/nginx/ssl/cert.pem

# Enable fail2ban (if available)
sudo systemctl enable fail2ban
```

---

**🎉 Your JomMCP platform is now ready with professional nginx configuration and domain support!**
