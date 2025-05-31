#!/bin/bash

# JomMCP Platform - Test Setup Verification
# Runs integration tests to verify the setup is working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TIMEOUT=30
VERBOSE=false

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🧪 $1${NC}"; }

# Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════╗
    ║                🧪 JomMCP Setup Tests                    ║
    ║                                                          ║
    ║        Integration tests for setup verification          ║
    ║        Ujian integrasi untuk pengesahan setup           ║
    ╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Test helper functions
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    ((TOTAL_TESTS++))
    
    if [ "$VERBOSE" = true ]; then
        log_info "Running test: $test_name"
    fi
    
    if $test_function; then
        log_success "$test_name"
        ((PASSED_TESTS++))
        return 0
    else
        log_error "$test_name"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Test: API Gateway Health
test_api_gateway_health() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8000/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: API Gateway Documentation
test_api_gateway_docs() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8000/docs" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Registration Service Health
test_registration_service_health() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8081/api/v1/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Generator Service Health
test_generator_service_health() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8082/api/v1/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Deployment Service Health
test_deployment_service_health() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8083/api/v1/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Documentation Service Health
test_docs_service_health() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:8084/api/v1/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Web UI Accessibility
test_web_ui_accessibility() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "http://localhost:3000" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ]
}

# Test: Database Connectivity
test_database_connectivity() {
    timeout "$TIMEOUT" bash -c "</dev/tcp/localhost/5432" 2>/dev/null
}

# Test: Redis Connectivity
test_redis_connectivity() {
    timeout "$TIMEOUT" bash -c "</dev/tcp/localhost/6379" 2>/dev/null
}

# Test: API Registration Endpoint
test_api_registration() {
    local test_data='{"name":"test-api","description":"Test API","base_url":"https://api.example.com","auth_type":"none"}'
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "http://localhost:8081/api/v1/apis" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    # Accept both 200 (success) and 422 (validation error) as the endpoint is working
    [ "$http_code" = "200" ] || [ "$http_code" = "422" ] || [ "$http_code" = "401" ]
}

# Test: CORS Configuration
test_cors_configuration() {
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        "http://localhost:8000/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    [ "$http_code" = "200" ] || [ "$http_code" = "204" ]
}

# Test: WebSocket Connection
test_websocket_connection() {
    # Simple test to check if WebSocket port is open
    timeout 5 bash -c "</dev/tcp/localhost/8000" 2>/dev/null
}

# Test: Docker Containers
test_docker_containers() {
    if ! command -v docker >/dev/null 2>&1; then
        return 1
    fi
    
    local running_containers=$(docker ps --filter "name=jommcp" -q | wc -l)
    [ "$running_containers" -gt 0 ]
}

# Test: Environment Configuration
test_environment_config() {
    [ -f ".env" ] || [ -f ".env.local" ]
}

# Test: Frontend Environment
test_frontend_environment() {
    [ -f "apps/web-ui/.env.local" ] || [ -f "apps/web-ui/.env" ]
}

# Performance Tests
test_api_response_time() {
    local start_time=$(date +%s%N)
    curl -s http://localhost:8000/health >/dev/null 2>&1
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    # Response time should be less than 1000ms
    [ "$duration" -lt 1000 ]
}

# Generate test report
generate_report() {
    echo ""
    log_step "Test Results Summary"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    Test Report                           ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Total Tests:      ${YELLOW}$TOTAL_TESTS${NC}"
    echo -e "${CYAN}║${NC} Passed:           ${GREEN}$PASSED_TESTS${NC}"
    echo -e "${CYAN}║${NC} Failed:           ${RED}$FAILED_TESTS${NC}"
    
    local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo -e "${CYAN}║${NC} Success Rate:     ${YELLOW}${success_rate}%${NC}"
    
    if [ "$success_rate" -ge 90 ]; then
        echo -e "${CYAN}║${NC} Status:           ${GREEN}Excellent${NC}"
    elif [ "$success_rate" -ge 70 ]; then
        echo -e "${CYAN}║${NC} Status:           ${YELLOW}Good${NC}"
    else
        echo -e "${CYAN}║${NC} Status:           ${RED}Needs Attention${NC}"
    fi
    
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    
    if [ "$FAILED_TESTS" -gt 0 ]; then
        echo ""
        log_warning "Some tests failed. This might indicate setup issues."
        log_info "Troubleshooting steps:"
        echo -e "  ${BLUE}1. Check if all services are running: ./scripts/status.sh${NC}"
        echo -e "  ${BLUE}2. View service logs: docker-compose logs${NC}"
        echo -e "  ${BLUE}3. Restart services: docker-compose restart${NC}"
        echo -e "  ${BLUE}4. Run health check: ./scripts/health-check.sh${NC}"
    else
        echo ""
        log_success "All tests passed! Your JomMCP setup is working correctly."
        echo -e "${YELLOW}🎉 Ready to start transforming APIs into MCP servers!${NC}"
    fi
}

# Main test function
main() {
    print_banner
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                echo "JomMCP Setup Test Script"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -v, --verbose      Enable verbose output"
                echo "  -t, --timeout SEC  Set timeout for tests (default: 30)"
                echo "  -h, --help         Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    log_info "Running integration tests to verify setup..."
    echo ""
    
    # Configuration Tests
    log_step "Configuration Tests"
    run_test "Environment Configuration" test_environment_config
    run_test "Frontend Environment" test_frontend_environment
    echo ""
    
    # Infrastructure Tests
    log_step "Infrastructure Tests"
    run_test "Database Connectivity" test_database_connectivity
    run_test "Redis Connectivity" test_redis_connectivity
    run_test "Docker Containers" test_docker_containers
    echo ""
    
    # Service Health Tests
    log_step "Service Health Tests"
    run_test "API Gateway Health" test_api_gateway_health
    run_test "Registration Service Health" test_registration_service_health
    run_test "Generator Service Health" test_generator_service_health
    run_test "Deployment Service Health" test_deployment_service_health
    run_test "Documentation Service Health" test_docs_service_health
    run_test "Web UI Accessibility" test_web_ui_accessibility
    echo ""
    
    # API Tests
    log_step "API Integration Tests"
    run_test "API Documentation" test_api_gateway_docs
    run_test "API Registration Endpoint" test_api_registration
    run_test "CORS Configuration" test_cors_configuration
    run_test "WebSocket Connection" test_websocket_connection
    echo ""
    
    # Performance Tests
    log_step "Performance Tests"
    run_test "API Response Time" test_api_response_time
    echo ""
    
    # Generate report
    generate_report
    
    # Exit with appropriate code
    if [ "$FAILED_TESTS" -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
