#!/bin/bash

# 🚀 Rentiful Deployment Script
# This script helps set up the project for both local development and AWS Amplify deployment

set -e

echo "🏠 Rentiful - Real Estate Management Platform"
echo "=============================================="

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    print_success "All dependencies installed successfully"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Create client .env.local if it doesn't exist
    if [ ! -f "client/.env.local" ]; then
        cat > client/.env.local << EOF
# AWS Cognito Configuration
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_user_pool_id_here
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_AWS_REGION=us-east-1

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
EOF
        print_success "Created client/.env.local"
    else
        print_warning "client/.env.local already exists"
    fi
    
    # Create server .env if it doesn't exist
    if [ ! -f "server/.env" ]; then
        cat > server/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/rentiful"

# Server Configuration
PORT=3002
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=your_bucket_name_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
EOF
        print_success "Created server/.env"
    else
        print_warning "server/.env already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd server
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push
    
    # Seed database
    print_status "Seeding database..."
    npx prisma db seed
    
    cd ..
    
    print_success "Database setup completed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build server
    cd server
    npm run build
    cd ..
    
    # Build client
    cd client
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Start development servers
start_dev() {
    print_status "Starting development servers..."
    
    # Start both client and server concurrently
    npm run dev
}

# Show deployment instructions
show_deployment_instructions() {
    echo ""
    echo "🚀 Deployment Instructions"
    echo "=========================="
    echo ""
    echo "📋 Local Development:"
    echo "1. Update environment variables in client/.env.local and server/.env"
    echo "2. Ensure PostgreSQL is running"
    echo "3. Run: npm run dev"
    echo ""
    echo "🌐 AWS Amplify Deployment:"
    echo "1. Push code to GitHub"
    echo "2. Set up AWS Cognito User Pool"
    echo "3. Set up RDS PostgreSQL database"
    echo "4. Set up S3 bucket for images"
    echo "5. Deploy backend to EC2/ECS"
    echo "6. Connect repository to AWS Amplify"
    echo "7. Set environment variables in Amplify Console"
    echo ""
    echo "📚 For detailed instructions, see README.md and DEPLOYMENT.md"
}

# Main script
main() {
    echo "Starting deployment setup..."
    
    # Check prerequisites
    check_node
    check_npm
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Setup database (optional - user can skip if database not ready)
    read -p "Do you want to set up the database now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    else
        print_warning "Database setup skipped. You can run it later with: cd server && npx prisma db push && npx prisma db seed"
    fi
    
    # Build application
    build_application
    
    # Show deployment instructions
    show_deployment_instructions
    
    print_success "Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update environment variables in client/.env.local and server/.env"
    echo "2. Set up your database and update DATABASE_URL"
    echo "3. Configure AWS services (Cognito, S3, RDS)"
    echo "4. Run 'npm run dev' to start development servers"
}

# Run main function
main "$@" 