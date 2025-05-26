# JomMCP Deployment Guide

This guide covers deployment options for the JomMCP platform across different environments and platforms.

## 📁 Deployment Structure

```
infrastructure/
├── docker/                # Docker configurations
│   ├── docker-compose.yml # Development environment
│   ├── docker-compose.prod.yml # Production environment
│   └── alembic.ini        # Database migration config
├── kubernetes/            # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── services/
│   └── deployments/
├── terraform/             # Infrastructure as Code
│   ├── aws/
│   ├── gcp/
│   └── azure/
└── helm/                  # Helm charts
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services for development
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Stop all services
docker-compose -f infrastructure/docker/docker-compose.yml down
```

### Production Environment

```bash
# Start production environment
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Scale specific services
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d --scale registration-service=3

# Health check
curl http://localhost:8000/api/v1/health/all
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.x (optional)

### Quick Deployment

```bash
# Create namespace
kubectl create namespace jommcp

# Apply all manifests
kubectl apply -f infrastructure/kubernetes/ -n jommcp

# Check deployment status
kubectl get pods -n jommcp
kubectl get services -n jommcp
```

### Using Helm

```bash
# Add JomMCP Helm repository
helm repo add jommcp https://charts.jommcp.com
helm repo update

# Install with default values
helm install jommcp jommcp/jommcp -n jommcp --create-namespace

# Install with custom values
helm install jommcp jommcp/jommcp -n jommcp --create-namespace -f values.yaml
```

### Custom Values Example

```yaml
# values.yaml
replicaCount:
  apiGateway: 2
  registrationService: 3
  generatorService: 2

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

database:
  enabled: true
  persistence:
    size: 20Gi

redis:
  enabled: true
  persistence:
    size: 5Gi
```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### EKS (Elastic Kubernetes Service)

```bash
# Create EKS cluster using terraform
cd infrastructure/terraform/aws
terraform init
terraform plan
terraform apply

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name jommcp-cluster

# Deploy application
kubectl apply -f ../../kubernetes/ -n jommcp
```

#### ECS (Elastic Container Service)

```bash
# Deploy using AWS CLI
aws ecs create-cluster --cluster-name jommcp-cluster

# Deploy services
aws ecs create-service --cluster jommcp-cluster --service-name api-gateway \
  --task-definition jommcp-api-gateway:1 --desired-count 2
```

### Google Cloud Platform

#### GKE (Google Kubernetes Engine)

```bash
# Create GKE cluster
gcloud container clusters create jommcp-cluster \
  --zone=us-central1-a \
  --num-nodes=3

# Get credentials
gcloud container clusters get-credentials jommcp-cluster --zone=us-central1-a

# Deploy application
kubectl apply -f infrastructure/kubernetes/ -n jommcp
```

### Azure Deployment

#### AKS (Azure Kubernetes Service)

```bash
# Create resource group
az group create --name jommcp-rg --location eastus

# Create AKS cluster
az aks create --resource-group jommcp-rg --name jommcp-cluster \
  --node-count 3 --enable-addons monitoring --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group jommcp-rg --name jommcp-cluster

# Deploy application
kubectl apply -f infrastructure/kubernetes/ -n jommcp
```

## 🔧 Configuration Management

### Environment Variables

Environment-specific configurations are managed through:

- **Development**: `config/development/.env`
- **Production**: `config/production/.env`
- **Testing**: `config/testing/.env`

### Secret Management

#### Kubernetes Secrets

```bash
# Create secrets from environment file
kubectl create secret generic jommcp-secrets \
  --from-env-file=config/production/.env -n jommcp

# Or create individual secrets
kubectl create secret generic database-secret \
  --from-literal=username=mcphub \
  --from-literal=password=your-secure-password -n jommcp
```

#### External Secret Management

Integration with external secret management systems:

- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Secret Manager**
- **HashiCorp Vault**

## 📊 Monitoring and Observability

### Prometheus and Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

### Application Metrics

JomMCP exposes metrics at:
- API Gateway: `http://localhost:8000/metrics`
- Registration Service: `http://localhost:8081/metrics`
- Generator Service: `http://localhost:8082/metrics`

### Logging

Centralized logging with ELK Stack:

```bash
# Deploy Elasticsearch, Logstash, and Kibana
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install logstash elastic/logstash -n logging
```

## 🔒 Security Considerations

### Network Security

- **Ingress Controllers**: NGINX, Traefik, or cloud-native
- **TLS Termination**: Automatic certificate management with cert-manager
- **Network Policies**: Kubernetes NetworkPolicies for micro-segmentation

### Container Security

- **Image Scanning**: Vulnerability scanning with Trivy or Clair
- **Runtime Security**: Falco for runtime threat detection
- **RBAC**: Role-Based Access Control for Kubernetes

### Secrets Management

- **Encryption at Rest**: Encrypt etcd and persistent volumes
- **Secrets Rotation**: Automatic rotation of database credentials
- **Service Mesh**: Istio or Linkerd for mTLS between services

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --name jommcp-cluster
          kubectl apply -f infrastructure/kubernetes/ -n jommcp
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

deploy:
  stage: deploy
  script:
    - kubectl apply -f infrastructure/kubernetes/ -n jommcp
  only:
    - main
```

## 🔄 Deployment Strategies

### Rolling Updates

```yaml
# deployment.yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

### Blue-Green Deployment

```bash
# Deploy to green environment
kubectl apply -f infrastructure/kubernetes/green/ -n jommcp

# Switch traffic
kubectl patch service api-gateway -p '{"spec":{"selector":{"version":"green"}}}' -n jommcp
```

### Canary Deployment

```yaml
# Using Istio for canary deployment
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: api-gateway
spec:
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: api-gateway
        subset: canary
  - route:
    - destination:
        host: api-gateway
        subset: stable
      weight: 90
    - destination:
        host: api-gateway
        subset: canary
      weight: 10
```

## 🔧 Troubleshooting

### Common Issues

#### Pod Startup Issues

```bash
# Check pod status
kubectl get pods -n jommcp

# Describe problematic pod
kubectl describe pod <pod-name> -n jommcp

# Check logs
kubectl logs <pod-name> -n jommcp --previous
```

#### Service Connectivity Issues

```bash
# Test service connectivity
kubectl exec -it <pod-name> -n jommcp -- curl http://service-name:port/health

# Check service endpoints
kubectl get endpoints -n jommcp

# Check network policies
kubectl get networkpolicies -n jommcp
```

#### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -it <api-gateway-pod> -n jommcp -- \
  psql postgresql://username:password@postgres:5432/mcphub

# Check database logs
kubectl logs postgres-pod -n jommcp
```

### Performance Troubleshooting

```bash
# Resource usage
kubectl top pods -n jommcp
kubectl top nodes

# Horizontal Pod Autoscaler status
kubectl get hpa -n jommcp

# Check resource quotas
kubectl describe resourcequota -n jommcp
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Helm Documentation](https://helm.sh/docs/)
- [Terraform Documentation](https://terraform.io/docs/)
- [JomMCP Architecture Guide](../architecture/)
