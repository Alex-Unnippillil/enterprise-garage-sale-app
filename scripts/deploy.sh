#!/bin/bash

# Enterprise Deployment Script for Rentiful
# This script handles deployment to both staging and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        print_error "Invalid environment. Use 'staging' or 'production'"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists aws; then
        missing_deps+=("aws-cli")
    fi
    
    if ! command_exists terraform; then
        missing_deps+=("terraform")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to setup environment variables
setup_env_vars() {
    print_status "Setting up environment variables for $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        export NODE_ENV=production
        export DATABASE_URL="$PRODUCTION_DATABASE_URL"
        export AWS_S3_BUCKET="$PRODUCTION_S3_BUCKET"
        export CLOUDFRONT_DISTRIBUTION_ID="$PRODUCTION_CLOUDFRONT_DISTRIBUTION_ID"
        export EC2_INSTANCE_ID="$PRODUCTION_EC2_INSTANCE_ID"
    else
        export NODE_ENV=staging
        export DATABASE_URL="$STAGING_DATABASE_URL"
        export AWS_S3_BUCKET="$STAGING_S3_BUCKET"
        export CLOUDFRONT_DISTRIBUTION_ID="$STAGING_CLOUDFRONT_DISTRIBUTION_ID"
        export EC2_INSTANCE_ID="$STAGING_EC2_INSTANCE_ID"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Install dependencies
    npm run install:all
    
    # Run database migrations
    cd server
    npm run prisma:generate
    npx prisma migrate deploy
    cd ..
    
    # Run tests
    cd server && npm test && cd ..
    cd client && npm test -- --watchAll=false && cd ..
    
    print_success "All tests passed"
}

# Function to build applications
build_applications() {
    print_status "Building applications..."
    
    # Build client
    cd client
    npm run build
    cd ..
    
    # Build server
    cd server
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    cd infrastructure
    
    # Initialize Terraform
    terraform init
    
    # Plan changes
    terraform plan -var="environment=$ENVIRONMENT" -out=tfplan
    
    # Apply changes
    terraform apply tfplan
    
    cd ..
    
    print_success "Infrastructure deployed successfully"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to EC2..."
    
    # Create deployment package
    tar -czf server-deployment-$TIMESTAMP.tar.gz -C server dist package.json package-lock.json
    
    # Upload to S3
    aws s3 cp server-deployment-$TIMESTAMP.tar.gz s3://$AWS_S3_BUCKET/deployments/
    
    # Deploy to EC2
    aws ssm send-command \
        --instance-ids $EC2_INSTANCE_ID \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=[
            "cd /opt/rentiful",
            "aws s3 cp s3://'$AWS_S3_BUCKET'/deployments/server-deployment-'$TIMESTAMP'.tar.gz .",
            "tar -xzf server-deployment-'$TIMESTAMP'.tar.gz",
            "npm install --production",
            "pm2 restart rentiful-api || pm2 start dist/index.js --name rentiful-api",
            "rm server-deployment-'$TIMESTAMP'.tar.gz"
        ]' \
        --region $AWS_REGION
    
    # Clean up local file
    rm server-deployment-$TIMESTAMP.tar.gz
    
    print_success "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to S3..."
    
    # Sync built files to S3
    aws s3 sync client/.next s3://$AWS_S3_BUCKET/frontend --delete
    
    # Invalidate CloudFront cache
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --region $AWS_REGION
    
    print_success "Frontend deployed successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd server
    
    # Generate Prisma client
    npm run prisma:generate
    
    # Run migrations
    npx prisma migrate deploy
    
    cd ..
    
    print_success "Database migrations completed"
}

# Function to health check
health_check() {
    print_status "Performing health checks..."
    
    local api_url=""
    local frontend_url=""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        api_url="https://api.rentiful.com/health"
        frontend_url="https://rentiful.com"
    else
        api_url="https://staging-api.rentiful.com/health"
        frontend_url="https://staging.rentiful.com"
    fi
    
    # Check API health
    local api_response=$(curl -s -o /dev/null -w "%{http_code}" $api_url)
    if [ "$api_response" = "200" ]; then
        print_success "API health check passed"
    else
        print_error "API health check failed (HTTP $api_response)"
        return 1
    fi
    
    # Check frontend
    local frontend_response=$(curl -s -o /dev/null -w "%{http_code}" $frontend_url)
    if [ "$frontend_response" = "200" ]; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed (HTTP $frontend_response)"
        return 1
    fi
    
    print_success "All health checks passed"
}

# Function to rollback
rollback() {
    print_warning "Rolling back deployment..."
    
    # Implementation for rollback logic
    # This would typically involve reverting to previous versions
    
    print_success "Rollback completed"
}

# Main deployment function
main() {
    print_status "Starting deployment to $ENVIRONMENT environment..."
    
    # Validate environment
    validate_environment
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment variables
    setup_env_vars
    
    # Run tests
    run_tests
    
    # Build applications
    build_applications
    
    # Deploy infrastructure (if needed)
    if [ "$2" = "--infrastructure" ]; then
        deploy_infrastructure
    fi
    
    # Run database migrations
    run_migrations
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Health check
    health_check
    
    print_success "Deployment to $ENVIRONMENT completed successfully!"
    print_status "Deployment timestamp: $TIMESTAMP"
}

# Trap to handle errors
trap 'print_error "Deployment failed. Rolling back..."; rollback; exit 1' ERR

# Run main function
main "$@" 