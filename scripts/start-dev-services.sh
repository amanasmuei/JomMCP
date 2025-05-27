#!/bin/bash

# JomMCP Platform Development Services Startup Script
# This script starts all backend services for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url/health" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] && [ ! -f "infrastructure/docker/docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Navigate to project root if needed
if [ -f "infrastructure/docker/docker-compose.yml" ]; then
    cd infrastructure/docker
fi

print_status "Starting JomMCP Platform Development Services..."

# Start database services if not running
print_status "Starting database services..."
docker-compose up -d postgres redis

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
sleep 5

# Navigate back to project root for Python services
cd ../..

# Check Python environment
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_status "Installing Python dependencies..."
pip install -r config/requirements.txt

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd):$(pwd)/packages"

# Start services in background
print_status "Starting backend services..."

# API Gateway (Port 8000)
if check_port 8000; then
    print_status "Starting API Gateway on port 8000..."
    cd apps/api-gateway
    python run.py &
    API_GATEWAY_PID=$!
    cd ../..
    sleep 3
else
    print_warning "Port 8000 is already in use, skipping API Gateway"
fi

# Registration Service (Port 8001)
if check_port 8001; then
    print_status "Starting Registration Service on port 8001..."
    cd apps/registration-service
    python run.py &
    REGISTRATION_PID=$!
    cd ../..
    sleep 3
else
    print_warning "Port 8001 is already in use, skipping Registration Service"
fi

# Generator Service (Port 8002)
if check_port 8002; then
    print_status "Starting Generator Service on port 8002..."
    cd apps/generator-service
    python run.py &
    GENERATOR_PID=$!
    cd ../..
    sleep 3
else
    print_warning "Port 8002 is already in use, skipping Generator Service"
fi

# Deployment Service (Port 8003)
if check_port 8003; then
    print_status "Starting Deployment Service on port 8003..."
    cd apps/deployment-service
    python run.py &
    DEPLOYMENT_PID=$!
    cd ../..
    sleep 3
else
    print_warning "Port 8003 is already in use, skipping Deployment Service"
fi

# Docs Service (Port 8004)
if check_port 8004; then
    print_status "Starting Documentation Service on port 8004..."
    cd apps/docs-service
    python run.py &
    DOCS_PID=$!
    cd ../..
    sleep 3
else
    print_warning "Port 8004 is already in use, skipping Documentation Service"
fi

# Wait for services to be ready
print_status "Checking service health..."

# Check API Gateway
if [ ! -z "$API_GATEWAY_PID" ]; then
    wait_for_service "http://localhost:8000" "API Gateway"
fi

print_success "Backend services started successfully!"
print_status "Services running:"
print_status "  - API Gateway: http://localhost:8000"
print_status "  - Registration Service: http://localhost:8001"
print_status "  - Generator Service: http://localhost:8002"
print_status "  - Deployment Service: http://localhost:8003"
print_status "  - Documentation Service: http://localhost:8004"
print_status "  - Database: localhost:5432"
print_status "  - Redis: localhost:6379"

print_status "To stop services, run: pkill -f 'python run.py'"
print_status "Frontend should be started separately with: cd apps/web-ui && npm run dev"

# Keep script running to maintain services
print_status "Press Ctrl+C to stop all services..."
wait
