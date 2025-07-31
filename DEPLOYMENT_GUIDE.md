# 🚀 Complete Deployment Guide

This guide provides step-by-step instructions for deploying the Rentiful real estate application to both local development and production environments.

## 📋 Prerequisites

### Local Development
- Node.js 18+ 
- npm or yarn
- PostgreSQL database with PostGIS extension
- Git

### Production Deployment
- AWS Account
- Domain name (optional)
- SSL certificate (for production)

## 🏠 Local Development Setup

### 1. Quick Start (Automated)

```bash
# Clone the repository
git clone <your-repo-url>
cd enterprise-garage-sale

# Run the automated setup script
./deploy.sh
```

### 2. Manual Setup

```bash
# Install all dependencies
npm run install:all

# Set up environment variables (see Environment Variables section)
# Set up database (see Database Setup section)

# Start development servers
npm run dev
```

### 3. Environment Variables

Create the following environment files:

**Client (`client/.env.local`):**
```env
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Server (`server/.env`):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/rentiful"
PORT=3002
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
```

### 4. Database Setup

```bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
cd ..
```

## 🌐 AWS Production Deployment

### Step 1: AWS Services Setup

#### 1.1 AWS Cognito User Pool

1. **Go to AWS Cognito Console**
2. **Create User Pool:**
   - Sign-in options: Email
   - User name requirements: Allow email addresses
   - Password policy: Custom (minimum 8 characters)
   - MFA: Optional
   - User account recovery: Enabled

3. **Add Custom Attributes:**
   - Go to "Sign-up experience" → "Custom attributes"
   - Add: `custom:role` (String, Required)

4. **Create App Client:**
   - App client name: `rentiful-client`
   - Generate client secret
   - Note down: User Pool ID, Client ID

#### 1.2 RDS PostgreSQL Database

1. **Create RDS Instance:**
   - Engine: PostgreSQL
   - Instance class: db.t3.micro (free tier)
   - Storage: 20 GB
   - Multi-AZ: No (for development)

2. **Configure Security Group:**
   - Create security group: `rentiful-db-sg`
   - Add inbound rule: PostgreSQL (port 5432)

3. **Enable PostGIS Extension:**
   ```sql
   CREATE EXTENSION postgis;
   CREATE EXTENSION postgis_topology;
   ```

#### 1.3 S3 Bucket for Images

1. **Create S3 Bucket:**
   - Bucket name: `rentiful-property-images`
   - Region: Same as other services
   - Block public access: Uncheck (for image access)

2. **Configure CORS:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User:**
   - User name: `rentiful-s3-user`
   - Attach S3 access policy
   - Generate access keys

### Step 2: Backend Deployment (EC2)

#### 2.1 Launch EC2 Instance

1. **Instance Configuration:**
   - AMI: Amazon Linux 2023
   - Instance type: t2.micro (free tier)
   - Key pair: Create new
   - Security group: Create new

2. **Security Group Rules:**
   - SSH: Port 22, Source: Your IP
   - HTTP: Port 80, Source: 0.0.0.0/0
   - HTTPS: Port 443, Source: 0.0.0.0/0
   - Custom TCP: Port 3002, Source: 0.0.0.0/0

#### 2.2 Install Dependencies

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PostgreSQL client
sudo yum install postgresql15 -y

# Install PM2
npm install -g pm2
```

#### 2.3 Deploy Backend Code

```bash
# Clone repository
git clone <your-repo-url>
cd real-estate-prod/server

# Install dependencies
npm install

# Create environment file
nano .env
# Add your environment variables

# Set up database
npx prisma generate
npx prisma db push
npx prisma db seed

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Frontend Deployment (AWS Amplify)

#### 3.1 Prepare Repository

```bash
# Push code to GitHub
git add .
git commit -m "Production ready"
git push origin main
```

#### 3.2 Deploy to Amplify

1. **Go to AWS Amplify Console**
2. **Create New App:**
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select main branch

3. **Configure Build Settings:**
   - The `amplify.yml` file is already configured
   - Amplify will automatically detect Next.js

4. **Set Environment Variables:**
   In Amplify Console → App settings → Environment variables:
   ```
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_user_pool_id
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_API_BASE_URL=https://your-ec2-ip:3002
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

5. **Deploy:**
   - Click "Save and deploy"
   - Wait for build to complete

### Step 4: Domain and SSL Setup

#### 4.1 Configure Domain (Optional)

1. **Route 53 Setup:**
   - Create hosted zone for your domain
   - Update nameservers with domain registrar
   - Create A record pointing to your EC2 instance

2. **SSL Certificate:**
   - Go to AWS Certificate Manager
   - Request certificate for your domain
   - Validate via DNS or email
   - Attach to your EC2 instance

## 🔧 Available Commands

### Root Directory
```bash
npm run dev          # Start both client and server
npm run build        # Build both client and server
npm run install:all  # Install all dependencies
```

### Client Directory
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Server Directory
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run seed         # Seed the database
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check connection string
   psql -h your-rds-endpoint -U postgres -d rentiful
   ```

2. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Authentication Issues**
   - Verify Cognito configuration
   - Check environment variables
   - Ensure custom attributes are set

4. **S3 Upload Issues**
   - Check IAM permissions
   - Verify bucket CORS settings
   - Validate access keys

5. **EC2 Instance Issues**
   - Check security group rules
   - Verify application logs
   - Monitor system resources

### Useful Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart all

# Check database connection
psql -h your-rds-endpoint -U postgres -d rentiful

# Monitor system resources
top
htop
df -h
```

## 📊 Monitoring and Logging

### CloudWatch Setup

1. **Create Log Group:**
   - Name: `rentiful-logs`
   - Retention: 30 days

2. **Set up Alarms:**
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Database connections (>80%)

### Application Monitoring

```bash
# Monitor application logs
pm2 logs

# Monitor system resources
htop

# Check application status
pm2 status
```

## 🔒 Security Best Practices

### Database Security
- Use strong passwords
- Enable encryption at rest
- Regular security updates
- Backup strategy

### Application Security
- Environment variables for secrets
- Input validation
- Rate limiting
- CORS configuration

### AWS Security
- IAM roles instead of access keys
- Security groups with minimal access
- Regular security audits
- Enable CloudTrail

## 📈 Scaling Considerations

### Horizontal Scaling
1. **Load Balancer:** Use Application Load Balancer
2. **Auto Scaling:** Configure auto scaling groups
3. **Database:** Consider read replicas
4. **Caching:** Implement Redis for caching

### Performance Optimization
1. **CDN:** Use CloudFront for static assets
2. **Database:** Optimize queries and indexes
3. **Images:** Implement image optimization
4. **Caching:** Add Redis for session storage

## 💰 Cost Optimization

1. **Reserved Instances:** For predictable workloads
2. **Spot Instances:** For non-critical workloads
3. **S3 Lifecycle:** Configure object lifecycle
4. **CloudWatch:** Monitor costs and usage

## 🚀 Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security groups configured
- [ ] Application tested thoroughly
- [ ] Performance optimized
- [ ] Documentation updated

## 📞 Support

For issues and questions:
- Check AWS documentation
- Review application logs
- Monitor CloudWatch metrics
- Contact AWS support if needed

---

**Note**: This deployment guide assumes a production-ready setup. For development, you can use simpler configurations and free tier services. 