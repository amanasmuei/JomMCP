# JomMCP Platform - Nginx Configuration

This directory contains the nginx reverse proxy configuration for the JomMCP platform, providing domain-based routing, SSL/TLS support, and performance optimizations.

## 📁 Directory Structure

```
infrastructure/nginx/
├── nginx.conf              # Main nginx configuration
├── conf.d/                 # Server configurations
│   ├── jommcp.conf         # Production domain template
│   └── localhost.conf      # Development configuration
├── snippets/               # Reusable configuration snippets
│   ├── proxy-params.conf   # Common proxy settings
│   ├── websocket-params.conf # WebSocket proxy settings
│   ├── security-headers.conf # Security headers
│   └── ssl-params.conf     # SSL/TLS configuration
├── ssl/                    # SSL certificates directory
│   └── .gitkeep
├── logs/                   # Nginx log files
│   └── .gitkeep
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Basic Setup (Localhost)

For development with localhost:

```bash
# Start the platform with nginx
docker-compose up -d

# Access the platform
open http://localhost
```

### 2. Custom Domain Setup

For custom domain configuration:

```bash
# Run the domain setup script
./scripts/setup-domain.sh

# Follow the prompts to configure your domain
# The script will:
# - Update environment variables
# - Configure nginx for your domain
# - Generate SSL certificates (if needed)
# - Update hosts file (optional)
```

### 3. SSL Certificate Generation

For HTTPS support:

```bash
# Generate self-signed certificates for development
./scripts/generate-ssl-cert.sh

# Or provide your own certificates in infrastructure/nginx/ssl/
# - cert.pem (certificate file)
# - key.pem (private key file)
```

## 🔧 Configuration

### Environment Variables

Configure these variables in your `.env` file:

```bash
# Domain Configuration
DOMAIN_NAME=localhost                    # Your domain name
DOMAIN_URL=http://localhost             # Full domain URL
WS_DOMAIN_URL=ws://localhost            # WebSocket URL
NGINX_HTTP_PORT=80                      # HTTP port
NGINX_HTTPS_PORT=443                    # HTTPS port
ENABLE_SSL=false                        # Enable SSL/HTTPS

# Frontend URLs (automatically set by domain setup)
NEXT_PUBLIC_API_BASE_URL=${DOMAIN_URL}
NEXT_PUBLIC_WS_BASE_URL=${WS_DOMAIN_URL}
```

### Custom Domain Example

For a custom domain like `jommcp.example.com`:

```bash
DOMAIN_NAME=jommcp.example.com
DOMAIN_URL=https://jommcp.example.com
WS_DOMAIN_URL=wss://jommcp.example.com
ENABLE_SSL=true
```

## 🛣️ Routing Configuration

### Default Routes

| Path | Destination | Description |
|------|-------------|-------------|
| `/` | Web UI (port 3000) | Main application interface |
| `/api/*` | API Gateway (port 8000) | API endpoints |
| `/ws/*` | API Gateway (port 8000) | WebSocket connections |
| `/services/registration/*` | Registration Service (port 8081) | Direct service access |
| `/services/generator/*` | Generator Service (port 8082) | Direct service access |
| `/services/deployment/*` | Deployment Service (port 8083) | Direct service access |
| `/services/docs/*` | Docs Service (port 8084) | Direct service access |
| `/monitoring/prometheus/*` | Prometheus (port 9090) | Metrics monitoring |
| `/monitoring/grafana/*` | Grafana (port 3000) | Dashboard monitoring |

### Health Checks

- `/health` - Nginx health check
- `/nginx-status` - Nginx status (localhost only)
- `/debug/` - Debug information (development only)

## 🔒 Security Features

### Security Headers

- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Content-Security-Policy**: Content security policy
- **Permissions-Policy**: Feature permissions

### Rate Limiting

- **API endpoints**: 10 requests/second
- **Login endpoints**: 1 request/second
- **General requests**: 30 requests/second
- **Connection limit**: 20 connections per IP

### SSL/TLS Configuration

- **Protocols**: TLS 1.2, TLS 1.3
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: HTTP Strict Transport Security
- **OCSP Stapling**: Certificate validation

## 📊 Performance Optimizations

### Caching

- **Static assets**: 1 year cache (production)
- **API responses**: No cache by default
- **Development**: 1 hour cache for static assets

### Compression

- **Gzip**: Enabled for text-based content
- **Minimum size**: 10KB
- **Types**: HTML, CSS, JS, JSON, XML, SVG

### Connection Handling

- **Keep-alive**: Enabled
- **Worker processes**: Auto-detected
- **Worker connections**: 1024 per worker
- **Upstream keep-alive**: Enabled

## 🔧 Management Commands

### Nginx Operations

```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# View nginx logs
docker-compose logs nginx

# Follow nginx logs
docker-compose logs -f nginx
```

### SSL Certificate Management

```bash
# Generate new self-signed certificates
./scripts/generate-ssl-cert.sh

# Check certificate expiration
openssl x509 -in infrastructure/nginx/ssl/cert.pem -noout -dates

# View certificate details
openssl x509 -in infrastructure/nginx/ssl/cert.pem -text -noout
```

## 🐛 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   ```bash
   # Check if backend services are running
   docker-compose ps
   
   # Check service logs
   docker-compose logs api-gateway
   docker-compose logs web-ui
   ```

2. **SSL Certificate Errors**
   ```bash
   # Regenerate certificates
   ./scripts/generate-ssl-cert.sh
   
   # Check certificate files
   ls -la infrastructure/nginx/ssl/
   ```

3. **Domain Not Accessible**
   ```bash
   # Check hosts file (for local development)
   cat /etc/hosts | grep your-domain
   
   # Add to hosts file
   echo "127.0.0.1 your-domain.com" | sudo tee -a /etc/hosts
   ```

4. **Rate Limiting Issues**
   ```bash
   # Check nginx error logs
   docker-compose logs nginx | grep "limiting"
   
   # Adjust rate limits in nginx.conf if needed
   ```

### Debug Mode

Enable debug logging by modifying `nginx.conf`:

```nginx
error_log /var/log/nginx/error.log debug;
```

## 📝 Customization

### Adding Custom Routes

1. Edit `infrastructure/nginx/conf.d/jommcp.conf`
2. Add your custom location blocks
3. Reload nginx: `docker-compose exec nginx nginx -s reload`

### Custom Security Headers

1. Edit `infrastructure/nginx/snippets/security-headers.conf`
2. Add your custom headers
3. Reload nginx configuration

### Performance Tuning

1. Adjust worker processes in `nginx.conf`
2. Modify buffer sizes for your use case
3. Configure caching policies
4. Optimize upstream connections

## 🔗 Related Documentation

- [Docker Compose Configuration](../../docker-compose.yml)
- [Environment Configuration](../../.env.example)
- [SSL Certificate Generation](../../scripts/generate-ssl-cert.sh)
- [Domain Setup Script](../../scripts/setup-domain.sh)
