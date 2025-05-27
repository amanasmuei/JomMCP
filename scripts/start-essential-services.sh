#!/bin/bash

# JomMCP Platform Essential Services Startup Script
# This script starts only the essential services needed for login/authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f ".env" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting JomMCP Essential Services..."

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    print_status "Activated virtual environment"
else
    print_error "Virtual environment not found. Please run the full setup script first."
    exit 1
fi

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd):$(pwd)/packages"

# Start API Gateway (Port 8000)
print_status "Starting API Gateway on port 8000..."
cd apps/api-gateway
python run.py &
API_GATEWAY_PID=$!
cd ../..

# Wait a moment for API Gateway to start
sleep 3

# Start Registration Service (Port 8001)
print_status "Starting Registration Service on port 8001..."
cd apps/registration-service
python run.py &
REGISTRATION_PID=$!
cd ../..

# Wait for services to initialize
sleep 5

# Check if services are running
if ps -p $API_GATEWAY_PID > /dev/null 2>&1; then
    print_success "API Gateway started successfully (PID: $API_GATEWAY_PID)"
else
    print_error "API Gateway failed to start"
fi

if ps -p $REGISTRATION_PID > /dev/null 2>&1; then
    print_success "Registration Service started successfully (PID: $REGISTRATION_PID)"
else
    print_error "Registration Service failed to start"
fi

print_success "Essential services are running!"
print_status "Services:"
print_status "  - API Gateway: http://localhost:8000"
print_status "  - Registration Service: http://localhost:8001"
print_status ""
print_status "You can now test login functionality."
print_status "To stop services, run: pkill -f 'python run.py'"

# Save PIDs for cleanup
echo $API_GATEWAY_PID > /tmp/api_gateway.pid
echo $REGISTRATION_PID > /tmp/registration_service.pid

print_status "PIDs saved to /tmp/ for cleanup"
print_status "Press Ctrl+C to stop monitoring..."

# Monitor services
while true; do
    sleep 10
    if ! ps -p $API_GATEWAY_PID > /dev/null 2>&1; then
        print_error "API Gateway has stopped!"
        break
    fi
    if ! ps -p $REGISTRATION_PID > /dev/null 2>&1; then
        print_error "Registration Service has stopped!"
        break
    fi
done
