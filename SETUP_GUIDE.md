# Real Estate Application Setup & Testing Guide

This guide provides step-by-step instructions to set up and test the real estate application locally and on AWS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [AWS Services Setup](#aws-services-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (for local development)
- **AWS CLI** (for AWS deployment)

### AWS Account Requirements
- AWS Account with appropriate permissions
- Access to AWS Console
- AWS CLI configured with credentials

## Local Development Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd real-estate-prod-master

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Step 2: Set Up Local Database

```bash
# Install PostgreSQL locally (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
# Windows: Start from Services
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE real_estate_dev;
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Step 3: Environment Variables Setup

Create the following environment files:

**`client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_USER_POOL_ID=your_cognito_user_pool_id
NEXT_PUBLIC_IDENTITY_POOL_ID=your_cognito_identity_pool_id
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**`server/.env`:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate_dev"

# JWT
JWT_SECRET=your_jwt_secret_key_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 Configuration
S3_BUCKET_NAME=your-s3-bucket-name
S3_REGION=us-east-1

# Server
PORT=3001
NODE_ENV=development
```

## AWS Services Setup

### Step 1: AWS Cognito Setup

1. **Create User Pool:**
   - Go to AWS Cognito Console
   - Click "Create user pool"
   - Choose "Cognito user pool"
   - Configure sign-in experience:
     - Username: Email
     - Password requirements: Custom
   - Configure security requirements:
     - MFA: Optional
     - User account recovery: Enabled
   - Configure sign-up experience:
     - Self-service sign-up: Enabled
     - Cognito-assisted verification: Enabled
   - Message delivery: Email
   - App integration:
     - User pool name: `real-estate-user-pool`
     - Initial app client: Create app client
     - App client name: `real-estate-client`
     - Client secret: Generate client secret
   - Review and create

2. **Create Identity Pool:**
   - Go to "Identity pools"
   - Click "Create identity pool"
   - Identity pool name: `real-estate-identity-pool`
   - Enable access to unauthenticated identities: No
   - Authentication providers:
     - Cognito tab: Select your user pool and app client
   - Create roles for authenticated users
   - Review and create

3. **Update IAM Roles:**
   - Go to IAM Console
   - Find the authenticated role created for your identity pool
   - Attach policies for S3 access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:GetObject",
             "s3:PutObject",
             "s3:DeleteObject"
           ],
           "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
         }
       ]
     }
     ```

### Step 2: AWS S3 Setup

1. **Create S3 Bucket:**
   - Go to S3 Console
   - Click "Create bucket"
   - Bucket name: `your-real-estate-bucket-name`
   - Region: Choose your preferred region
   - Block all public access: Uncheck (for image access)
   - Bucket versioning: Disabled
   - Default encryption: SSE-S3
   - Create bucket

2. **Configure CORS:**
   - Select your bucket
   - Go to "Permissions" tab
   - Click "Edit" in CORS section
   - Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### Step 3: AWS RDS Setup

1. **Create RDS Instance:**
   - Go to RDS Console
   - Click "Create database"
   - Choose "Standard create"
   - Engine type: PostgreSQL
   - Version: 15.x
   - Template: Free tier (for development)
   - Settings:
     - DB instance identifier: `real-estate-db`
     - Master username: `postgres`
     - Master password: `your_secure_password`
   - Instance configuration: Default
   - Storage: Default
   - Connectivity:
     - Public access: Yes (for development)
     - VPC security group: Create new
   - Database authentication: Password authentication
   - Create database

2. **Install PostGIS Extension:**
   ```sql
   -- Connect to your RDS instance
   psql -h your-rds-endpoint -U postgres -d postgres
   
   -- Create PostGIS extension
   CREATE EXTENSION IF NOT EXISTS postgis;
   
   -- Verify installation
   SELECT PostGIS_Version();
   ```

### Step 4: Update Environment Variables

After setting up AWS services, update your environment files with the actual values:

**`client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your_actual_client_id
NEXT_PUBLIC_USER_POOL_ID=your_actual_user_pool_id
NEXT_PUBLIC_IDENTITY_POOL_ID=your_actual_identity_pool_id
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**`server/.env`:**
```env
# Database (use RDS endpoint for production)
DATABASE_URL="postgresql://postgres:your_password@your-rds-endpoint:5432/postgres"

# JWT
JWT_SECRET=your_secure_jwt_secret_key

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# S3 Configuration
S3_BUCKET_NAME=your-actual-s3-bucket-name
S3_REGION=us-east-1

# Server
PORT=3001
NODE_ENV=development
```

## Database Setup

### Step 1: Run Database Migrations

```bash
# Navigate to server directory
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (if you have seed data)
npx prisma db seed
```

### Step 2: Verify Database Schema

```bash
# Open Prisma Studio to verify schema
npx prisma studio
```

## Running the Application

### Step 1: Start Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The server should start on `http://localhost:3001`

### Step 2: Start Frontend Application

```bash
# Navigate to client directory
cd client

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The application should start on `http://localhost:3000`

### Step 3: Verify Application

1. Open `http://localhost:3000` in your browser
2. You should see the landing page
3. Test the authentication flow:
   - Click "Sign In" or "Sign Up"
   - Create a test account
   - Verify you can log in and out

## Testing the Application

### Step 1: Run Backend Tests

```bash
# Navigate to server directory
cd server

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

### Step 2: Run Frontend Tests

```bash
# Navigate to client directory
cd client

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Step 3: Run End-to-End Tests

```bash
# Navigate to client directory
cd client

# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Step 4: Manual Testing Checklist

#### Authentication Testing
- [ ] User registration with email verification
- [ ] User login with email/password
- [ ] Password reset functionality
- [ ] User logout
- [ ] Role-based access (tenant vs manager)

#### Property Management Testing
- [ ] View property listings
- [ ] Search and filter properties
- [ ] View property details
- [ ] Submit property applications (tenants)
- [ ] Create/edit properties (managers)

#### Application Management Testing
- [ ] Submit rental applications
- [ ] View application status
- [ ] Process applications (managers)
- [ ] Accept/reject applications

#### Payment System Testing
- [ ] View payment history
- [ ] Track upcoming payments
- [ ] Mark payments as paid
- [ ] Generate payment reports

#### Analytics Testing
- [ ] View manager dashboard
- [ ] Check revenue analytics
- [ ] View occupancy rates
- [ ] Export reports

### Step 5: Performance Testing

```bash
# Navigate to server directory
cd server

# Run load tests (if configured)
npm run test:load

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/properties"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql

# Test database connection
psql -h localhost -U postgres -d real_estate_dev
```

#### 2. AWS Credentials Issues
```bash
# Configure AWS CLI
aws configure

# Test AWS credentials
aws sts get-caller-identity
```

#### 3. CORS Issues
- Ensure your server CORS configuration includes `http://localhost:3000`
- Check browser console for CORS errors
- Verify API endpoints are accessible

#### 4. Authentication Issues
- Verify Cognito configuration in environment variables
- Check browser console for authentication errors
- Ensure user pool and identity pool are properly configured

#### 5. S3 Upload Issues
- Verify S3 bucket permissions
- Check CORS configuration
- Ensure AWS credentials have S3 access

#### 6. Environment Variable Issues
```bash
# Check environment variables are loaded
# Frontend
echo $NEXT_PUBLIC_API_URL

# Backend
echo $DATABASE_URL
```

### Debug Mode

#### Frontend Debug
```bash
# Start with debug logging
NODE_ENV=development DEBUG=* npm run dev
```

#### Backend Debug
```bash
# Start with debug logging
DEBUG=* npm run dev
```

### Logs and Monitoring

#### Check Application Logs
```bash
# Frontend logs (browser console)
# Backend logs (terminal where server is running)
# Database logs (PostgreSQL logs)
```

#### Monitor Performance
```bash
# Check memory usage
top -p $(pgrep node)

# Check disk usage
df -h

# Check network connections
netstat -an | grep :3001
```

## Next Steps

### Production Deployment
1. Set up production AWS services
2. Configure domain and SSL certificates
3. Set up CI/CD pipeline
4. Configure monitoring and logging
5. Set up backup and disaster recovery

### Scaling Considerations
1. Implement caching (Redis)
2. Set up CDN for static assets
3. Configure auto-scaling groups
4. Implement database read replicas
5. Set up load balancing

### Security Hardening
1. Implement rate limiting
2. Set up WAF (Web Application Firewall)
3. Configure security groups properly
4. Implement API key management
5. Set up audit logging

## Support

If you encounter issues during setup or testing:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all AWS services are properly configured
5. Test each component individually

For additional help, refer to:
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Testing Guide](TESTING.md)
- [README](README.md) 