#!/bin/bash

# BuildFlow Deployment Script
# This script deploys the BuildFlow platform to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
NAMESPACE="buildflow-${ENVIRONMENT}"
REGISTRY="ghcr.io/your-org"
VERSION=${2:-latest}

echo -e "${GREEN}🚀 Starting BuildFlow deployment to ${ENVIRONMENT}${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ docker is not installed or not in PATH${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${YELLOW}📦 Creating namespace ${NAMESPACE}${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Build and push Docker images
echo -e "${YELLOW}🐳 Building and pushing Docker images${NC}"

# Backend
echo -e "${YELLOW}Building backend image...${NC}"
docker build -f docker/backend.Dockerfile -t ${REGISTRY}/buildflow-backend:${VERSION} ./backend
docker push ${REGISTRY}/buildflow-backend:${VERSION}

# Frontend
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -f docker/frontend.Dockerfile -t ${REGISTRY}/buildflow-frontend:${VERSION} ./frontend
docker push ${REGISTRY}/buildflow-frontend:${VERSION}

# Admin Dashboard
echo -e "${YELLOW}Building admin dashboard image...${NC}"
docker build -f docker/admin.Dockerfile -t ${REGISTRY}/buildflow-admin:${VERSION} ./admin-dashboard
docker push ${REGISTRY}/buildflow-admin:${VERSION}

# Apply Kubernetes configurations
echo -e "${YELLOW}📋 Applying Kubernetes configurations${NC}"

# Apply secrets and config maps
kubectl apply -f k8s/config.yaml -n ${NAMESPACE}

# Apply database deployments
kubectl apply -f k8s/database.yaml -n ${NAMESPACE}

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s

# Apply application deployments
kubectl apply -f k8s/deployments.yaml -n ${NAMESPACE}

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available deployment/buildflow-backend -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/buildflow-frontend -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/buildflow-admin -n ${NAMESPACE} --timeout=300s

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
kubectl run migration-job --image=${REGISTRY}/buildflow-backend:${VERSION} --rm -i --restart=Never -n ${NAMESPACE} -- \
  npx prisma migrate deploy

# Seed database if needed
if [ "${ENVIRONMENT}" = "staging" ]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    kubectl run seed-job --image=${REGISTRY}/buildflow-backend:${VERSION} --rm -i --restart=Never -n ${NAMESPACE} -- \
      npm run db:seed
fi

# Check deployment status
echo -e "${YELLOW}📊 Checking deployment status...${NC}"
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

# Health check
echo -e "${YELLOW}🏥 Performing health checks...${NC}"
BACKEND_POD=$(kubectl get pods -l app=buildflow-backend -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
kubectl exec ${BACKEND_POD} -n ${NAMESPACE} -- curl -f http://localhost:5001/health

echo -e "${GREEN}✅ BuildFlow deployment to ${ENVIRONMENT} completed successfully!${NC}"
echo -e "${GREEN}🌐 Application URLs:${NC}"
echo -e "   Frontend: https://app.buildflow.com"
echo -e "   Admin: https://admin.buildflow.com"
echo -e "   API: https://api.buildflow.com"
echo -e "   API Docs: https://api.buildflow.com/api-docs"
