#!/bin/bash

# JomMCP Platform - SSL Certificate Generator
# Generates self-signed SSL certificates for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSL_DIR="infrastructure/nginx/ssl"
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"
CERT_DAYS=365

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

log_info "Generating SSL certificate for domain: $DOMAIN_NAME"

# Generate private key
log_info "Generating private key..."
openssl genrsa -out "$SSL_DIR/key.pem" 2048

# Generate certificate signing request
log_info "Generating certificate signing request..."
openssl req -new -key "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.csr" -subj "/C=MY/ST=Kuala Lumpur/L=Kuala Lumpur/O=JomMCP Platform/OU=Development/CN=$DOMAIN_NAME"

# Generate self-signed certificate
log_info "Generating self-signed certificate..."
openssl x509 -req -in "$SSL_DIR/cert.csr" -signkey "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem" -days $CERT_DAYS -extensions v3_req -extfile <(
cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = MY
ST = Kuala Lumpur
L = Kuala Lumpur
O = JomMCP Platform
OU = Development
CN = $DOMAIN_NAME

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN_NAME
DNS.2 = www.$DOMAIN_NAME
DNS.3 = localhost
DNS.4 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

# Generate Diffie-Hellman parameters (optional but recommended)
log_info "Generating Diffie-Hellman parameters (this may take a while)..."
openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048

# Clean up CSR file
rm "$SSL_DIR/cert.csr"

# Set appropriate permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"
chmod 644 "$SSL_DIR/dhparam.pem"

log_success "SSL certificates generated successfully!"
log_info "Certificate files:"
log_info "  - Certificate: $SSL_DIR/cert.pem"
log_info "  - Private Key: $SSL_DIR/key.pem"
log_info "  - DH Params: $SSL_DIR/dhparam.pem"
log_info "  - Valid for: $CERT_DAYS days"

log_warning "These are self-signed certificates for development only!"
log_warning "For production, use proper certificates from a trusted CA."

# Display certificate information
log_info "Certificate details:"
openssl x509 -in "$SSL_DIR/cert.pem" -text -noout | grep -E "(Subject:|DNS:|IP Address:|Not Before|Not After)"

log_success "SSL certificate generation completed!"
echo ""
log_info "To use SSL with your JomMCP platform:"
log_info "1. Set ENABLE_SSL=true in your .env file"
log_info "2. Set DOMAIN_NAME=$DOMAIN_NAME in your .env file"
log_info "3. Restart the nginx service: docker-compose restart nginx"
