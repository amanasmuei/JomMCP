#!/bin/bash

# JomMCP Platform - Comprehensive Health Check Script
# Verifies all services and components are working correctly

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
TIMEOUT=10
VERBOSE=false
CHECK_PERFORMANCE=false

# Service definitions
declare -A SERVICES=(
    ["API Gateway"]="http://localhost:8000/health"
    ["Registration Service"]="http://localhost:8081/api/v1/health"
    ["Generator Service"]="http://localhost:8082/api/v1/health"
    ["Deployment Service"]="http://localhost:8083/api/v1/health"
    ["Documentation Service"]="http://localhost:8084/api/v1/health"
    ["Web UI"]="http://localhost:3000"
)

declare -A DATABASES=(
    ["PostgreSQL"]="localhost:5432"
    ["Redis"]="localhost:6379"
)

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔍 $1${NC}"; }

# Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════╗
    ║                🏥 JomMCP Health Check                   ║
    ║                                                          ║
    ║        Comprehensive system health verification          ║
    ║        Pemeriksaan kesihatan sistem yang menyeluruh     ║
    ╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -p|--performance)
                CHECK_PERFORMANCE=true
                shift
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help
show_help() {
    echo "JomMCP Health Check Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -v, --verbose      Enable verbose output"
    echo "  -p, --performance  Include performance checks"
    echo "  -t, --timeout SEC  Set timeout for checks (default: 10)"
    echo "  -h, --help         Show this help message"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check HTTP service
check_http_service() {
    local name="$1"
    local url="$2"
    local start_time=$(date +%s%N)
    
    if [ "$VERBOSE" = true ]; then
        log_info "Checking $name at $url"
    fi
    
    local response=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    local response_body="${response%???}"
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    case $http_code in
        200|201|204)
            log_success "$name is healthy (${duration}ms)"
            if [ "$VERBOSE" = true ] && [ -n "$response_body" ]; then
                echo -e "  ${BLUE}Response: $response_body${NC}"
            fi
            return 0
            ;;
        000)
            log_error "$name is unreachable"
            return 1
            ;;
        *)
            log_warning "$name returned HTTP $http_code"
            if [ "$VERBOSE" = true ] && [ -n "$response_body" ]; then
                echo -e "  ${YELLOW}Response: $response_body${NC}"
            fi
            return 1
            ;;
    esac
}

# Check database connectivity
check_database() {
    local name="$1"
    local host_port="$2"
    local host="${host_port%:*}"
    local port="${host_port#*:}"
    
    if [ "$VERBOSE" = true ]; then
        log_info "Checking $name at $host:$port"
    fi
    
    if timeout "$TIMEOUT" bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        log_success "$name is accessible"
        return 0
    else
        log_error "$name is not accessible"
        return 1
    fi
}

# Check Docker containers
check_docker_containers() {
    log_step "Checking Docker containers..."
    
    if ! command_exists docker; then
        log_warning "Docker not found, skipping container checks"
        return 1
    fi
    
    local containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=mcp-hub" 2>/dev/null || echo "")
    
    if [ -z "$containers" ]; then
        log_warning "No JomMCP containers found"
        return 1
    fi
    
    echo -e "${CYAN}Container Status:${NC}"
    echo "$containers"
    
    local running_count=$(docker ps -q --filter "name=mcp-hub" | wc -l)
    log_success "$running_count JomMCP containers are running"
    
    return 0
}

# Check system resources
check_system_resources() {
    log_step "Checking system resources..."
    
    # Check disk space
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_warning "Disk usage is high: ${disk_usage}%"
    else
        log_success "Disk usage is normal: ${disk_usage}%"
    fi
    
    # Check memory usage
    if command_exists free; then
        local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$mem_usage" -gt 90 ]; then
            log_warning "Memory usage is high: ${mem_usage}%"
        else
            log_success "Memory usage is normal: ${mem_usage}%"
        fi
    fi
    
    # Check load average
    if [ -f /proc/loadavg ]; then
        local load_avg=$(cat /proc/loadavg | awk '{print $1}')
        local cpu_count=$(nproc)
        local load_percentage=$(echo "$load_avg * 100 / $cpu_count" | bc -l 2>/dev/null | cut -d. -f1)
        
        if [ "$load_percentage" -gt 80 ]; then
            log_warning "System load is high: ${load_avg}"
        else
            log_success "System load is normal: ${load_avg}"
        fi
    fi
}

# Performance checks
check_performance() {
    log_step "Running performance checks..."
    
    # API Gateway response time
    local api_start=$(date +%s%N)
    curl -s http://localhost:8000/health >/dev/null 2>&1
    local api_end=$(date +%s%N)
    local api_time=$(( (api_end - api_start) / 1000000 ))
    
    if [ "$api_time" -lt 100 ]; then
        log_success "API Gateway response time: ${api_time}ms (excellent)"
    elif [ "$api_time" -lt 500 ]; then
        log_success "API Gateway response time: ${api_time}ms (good)"
    else
        log_warning "API Gateway response time: ${api_time}ms (slow)"
    fi
    
    # Database connection time
    if command_exists psql; then
        local db_start=$(date +%s%N)
        PGPASSWORD=mcphub_dev_password psql -h localhost -U mcphub -d mcphub -c "SELECT 1;" >/dev/null 2>&1
        local db_end=$(date +%s%N)
        local db_time=$(( (db_end - db_start) / 1000000 ))
        
        if [ "$db_time" -lt 50 ]; then
            log_success "Database connection time: ${db_time}ms (excellent)"
        elif [ "$db_time" -lt 200 ]; then
            log_success "Database connection time: ${db_time}ms (good)"
        else
            log_warning "Database connection time: ${db_time}ms (slow)"
        fi
    fi
}

# Generate health report
generate_report() {
    local total_checks="$1"
    local passed_checks="$2"
    local failed_checks="$3"
    
    echo ""
    log_step "Health Check Summary"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    Health Report                         ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Total Checks:     ${YELLOW}$total_checks${NC}"
    echo -e "${CYAN}║${NC} Passed:           ${GREEN}$passed_checks${NC}"
    echo -e "${CYAN}║${NC} Failed:           ${RED}$failed_checks${NC}"
    
    local health_percentage=$(( passed_checks * 100 / total_checks ))
    echo -e "${CYAN}║${NC} Health Score:     ${YELLOW}${health_percentage}%${NC}"
    
    if [ "$health_percentage" -ge 90 ]; then
        echo -e "${CYAN}║${NC} Status:           ${GREEN}Excellent${NC}"
    elif [ "$health_percentage" -ge 70 ]; then
        echo -e "${CYAN}║${NC} Status:           ${YELLOW}Good${NC}"
    else
        echo -e "${CYAN}║${NC} Status:           ${RED}Needs Attention${NC}"
    fi
    
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    
    if [ "$failed_checks" -gt 0 ]; then
        echo ""
        log_info "Troubleshooting tips:"
        echo -e "  ${BLUE}• Check service logs: docker-compose logs${NC}"
        echo -e "  ${BLUE}• Restart services: docker-compose restart${NC}"
        echo -e "  ${BLUE}• Check ports: netstat -tulpn | grep -E '(8000|8081|3000)'${NC}"
    fi
}

# Main health check function
main() {
    parse_args "$@"
    print_banner
    
    log_info "Starting comprehensive health check..."
    echo ""
    
    local total_checks=0
    local passed_checks=0
    local failed_checks=0
    
    # Check HTTP services
    log_step "Checking HTTP services..."
    for service in "${!SERVICES[@]}"; do
        ((total_checks++))
        if check_http_service "$service" "${SERVICES[$service]}"; then
            ((passed_checks++))
        else
            ((failed_checks++))
        fi
    done
    echo ""
    
    # Check databases
    log_step "Checking databases..."
    for db in "${!DATABASES[@]}"; do
        ((total_checks++))
        if check_database "$db" "${DATABASES[$db]}"; then
            ((passed_checks++))
        else
            ((failed_checks++))
        fi
    done
    echo ""
    
    # Check Docker containers
    ((total_checks++))
    if check_docker_containers; then
        ((passed_checks++))
    else
        ((failed_checks++))
    fi
    echo ""
    
    # Check system resources
    check_system_resources
    echo ""
    
    # Performance checks
    if [ "$CHECK_PERFORMANCE" = true ]; then
        check_performance
        echo ""
    fi
    
    # Generate report
    generate_report "$total_checks" "$passed_checks" "$failed_checks"
    
    # Exit with appropriate code
    if [ "$failed_checks" -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
