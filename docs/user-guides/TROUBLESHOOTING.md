# 🔧 JomMCP Troubleshooting Guide

**Common issues and solutions for the JomMCP Platform**  
*Isu biasa dan penyelesaian untuk Platform JomMCP*

## 🚨 Quick Diagnostics

Run these commands to quickly identify issues:

```bash
# Check overall system health
./scripts/health-check.sh

# Check service status
./scripts/status.sh

# Run setup verification tests
./scripts/test-setup.sh
```

## 🐳 Docker Issues

### Docker Not Running

**Problem:** `Cannot connect to the Docker daemon`

**Solutions:**
```bash
# Start Docker service (Linux)
sudo systemctl start docker

# Start Docker Desktop (macOS/Windows)
# Open Docker Desktop application

# Verify Docker is running
docker info
```

### Port Conflicts

**Problem:** `Port already in use` or `Address already in use`

**Solutions:**
```bash
# Check what's using the ports
netstat -tulpn | grep -E '(8000|8081|3000|5432|6379)'

# Kill processes using the ports
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9

# Use different ports in .env file
API_GATEWAY_PORT=8100
WEB_UI_PORT=3100
```

### Docker Compose Issues

**Problem:** `docker-compose: command not found`

**Solutions:**
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Or use Docker Compose V2
docker compose up -d
```

## 🗄️ Database Issues

### PostgreSQL Connection Failed

**Problem:** `Connection refused` or `Database connection error`

**Solutions:**
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Reset database completely
docker-compose down -v
docker-compose up -d postgres
```

### Database Migration Issues

**Problem:** `Migration failed` or `Table doesn't exist`

**Solutions:**
```bash
# Run migrations manually
docker-compose exec api-gateway alembic upgrade head

# Reset and recreate database
docker-compose down -v
docker-compose up -d postgres
# Wait for postgres to be ready
sleep 10
docker-compose up -d
```

## 🌐 Service Connection Issues

### API Gateway Not Responding

**Problem:** `Connection refused` to http://localhost:8000

**Solutions:**
```bash
# Check API Gateway logs
docker-compose logs api-gateway

# Check if container is running
docker-compose ps api-gateway

# Restart API Gateway
docker-compose restart api-gateway

# Check environment variables
docker-compose exec api-gateway env | grep -E '(DATABASE|REDIS)'
```

### Web UI Not Loading

**Problem:** `This site can't be reached` at http://localhost:3000

**Solutions:**
```bash
# Check Web UI logs
docker-compose logs web-ui

# Check if Node.js dependencies are installed
docker-compose exec web-ui npm list

# Rebuild Web UI container
docker-compose build web-ui
docker-compose up -d web-ui

# Check frontend environment variables
cat apps/web-ui/.env.local
```

## 🔐 Authentication Issues

### JWT Token Issues

**Problem:** `Invalid token` or `Token expired`

**Solutions:**
```bash
# Check JWT configuration in .env
grep JWT .env

# Generate new JWT secret
openssl rand -hex 32

# Update .env file with new secret
JWT_SECRET_KEY=your-new-secret-here

# Restart services
docker-compose restart
```

### CORS Issues

**Problem:** `CORS policy` errors in browser

**Solutions:**
```bash
# Check CORS configuration
grep CORS .env

# Update CORS origins in .env
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000","http://your-domain.com"]

# Restart API Gateway
docker-compose restart api-gateway
```

## 📦 Dependency Issues

### Python Dependencies

**Problem:** `ModuleNotFoundError` or import errors

**Solutions:**
```bash
# Rebuild containers with latest dependencies
docker-compose build --no-cache

# Check Python version in container
docker-compose exec api-gateway python --version

# Install missing dependencies
docker-compose exec api-gateway pip install -r requirements.txt
```

### Node.js Dependencies

**Problem:** `Module not found` in Web UI

**Solutions:**
```bash
# Install dependencies in container
docker-compose exec web-ui npm install

# Clear npm cache
docker-compose exec web-ui npm cache clean --force

# Rebuild Web UI
docker-compose build web-ui --no-cache
```

## 🚀 Performance Issues

### Slow Response Times

**Problem:** Services responding slowly

**Solutions:**
```bash
# Check system resources
./scripts/health-check.sh --performance

# Check Docker resource limits
docker stats

# Increase Docker memory/CPU limits
# Edit Docker Desktop settings

# Check database performance
docker-compose exec postgres psql -U mcphub -c "SELECT * FROM pg_stat_activity;"
```

### High Memory Usage

**Problem:** System running out of memory

**Solutions:**
```bash
# Check memory usage
free -h
docker stats

# Restart services to free memory
docker-compose restart

# Reduce service replicas
docker-compose up -d --scale registration-service=1
```

## 🔧 Configuration Issues

### Environment Variables Not Loading

**Problem:** Services using default values instead of .env

**Solutions:**
```bash
# Check .env file exists
ls -la .env

# Verify .env format (no spaces around =)
cat .env | grep -v '^#' | grep '='

# Restart services to reload environment
docker-compose down
docker-compose up -d
```

### File Permission Issues

**Problem:** `Permission denied` errors

**Solutions:**
```bash
# Fix script permissions
chmod +x scripts/*.sh

# Fix file ownership (Linux)
sudo chown -R $USER:$USER .

# Fix Docker socket permissions (Linux)
sudo chmod 666 /var/run/docker.sock
```

## 🧪 Testing Issues

### Health Checks Failing

**Problem:** Health check scripts report failures

**Solutions:**
```bash
# Run verbose health check
./scripts/health-check.sh --verbose

# Check individual services
curl -v http://localhost:8000/health
curl -v http://localhost:8081/api/v1/health

# Check service logs for errors
docker-compose logs --tail=50
```

## 🆘 Getting More Help

### Collect Diagnostic Information

```bash
# Generate comprehensive diagnostic report
./scripts/health-check.sh --verbose > diagnostic-report.txt
docker-compose logs >> diagnostic-report.txt
docker-compose ps >> diagnostic-report.txt
```

### Reset Everything

If all else fails, complete reset:

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Remove all JomMCP containers and images
docker system prune -a --filter "label=com.jommcp"

# Start fresh
./scripts/install.sh
```

### Contact Support

If you're still having issues:

1. 📋 Run diagnostic report: `./scripts/health-check.sh --verbose`
2. 📝 Collect logs: `docker-compose logs > logs.txt`
3. 🐛 Create GitHub issue with diagnostic info
4. 💬 Join our community for help
5. 📧 Email support: support@jommcp.com

## 📚 Additional Resources

- [Quick Setup Guide](QUICK_SETUP.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](../api/)
- [Architecture Overview](../architecture/)

---

**Remember:** Most issues can be resolved by restarting services or checking logs. Don't hesitate to ask for help! 🤝
