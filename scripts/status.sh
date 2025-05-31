#!/bin/bash

# JomMCP Platform - Quick Status Check
# Provides a quick overview of service status

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if service is running
check_service() {
    local name="$1"
    local url="$2"
    local timeout=5
    
    if curl -s --max-time "$timeout" "$url" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $name${NC}"
        return 1
    fi
}

# Check database connectivity
check_database() {
    local name="$1"
    local host="$2"
    local port="$3"
    
    if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "  ${GREEN}✅ $name${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $name${NC}"
        return 1
    fi
}

# Main status check
echo -e "${CYAN}"
cat << "EOF"
    ╔══════════════════════════════════════════════════════════╗
    ║                  🚀 JomMCP Status                       ║
    ╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}🌐 Web Services:${NC}"
check_service "Web UI" "http://localhost:3000"
check_service "API Gateway" "http://localhost:8000/health"
check_service "Registration Service" "http://localhost:8081/api/v1/health"
check_service "Generator Service" "http://localhost:8082/api/v1/health"
check_service "Deployment Service" "http://localhost:8083/api/v1/health"
check_service "Documentation Service" "http://localhost:8084/api/v1/health"

echo ""
echo -e "${BLUE}💾 Databases:${NC}"
check_database "PostgreSQL" "localhost" "5432"
check_database "Redis" "localhost" "6379"

echo ""
echo -e "${BLUE}🐳 Docker Containers:${NC}"
if command -v docker >/dev/null 2>&1; then
    running_containers=$(docker ps --filter "name=jommcp" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null)
    if [ -n "$running_containers" ]; then
        echo "$running_containers" | while read line; do
            if [[ $line == *"Up"* ]]; then
                echo -e "  ${GREEN}✅ $line${NC}"
            else
                echo -e "  ${YELLOW}⚠️  $line${NC}"
            fi
        done
    else
        echo -e "  ${YELLOW}⚠️  No JomMCP containers found${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  Docker not available${NC}"
fi

echo ""
echo -e "${BLUE}📋 Quick Links:${NC}"
echo -e "  ${CYAN}🌐 Web UI:        http://localhost:3000${NC}"
echo -e "  ${CYAN}📚 API Docs:      http://localhost:8000/docs${NC}"
echo -e "  ${CYAN}🔍 Health Check:  http://localhost:8000/health${NC}"
echo -e "  ${CYAN}📊 Monitoring:    http://localhost:3001 (if enabled)${NC}"

echo ""
echo -e "${YELLOW}💡 Tip: Run './scripts/health-check.sh' for detailed diagnostics${NC}"
