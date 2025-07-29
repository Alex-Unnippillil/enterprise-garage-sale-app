# 🚀 AWS Deployment Guide

This guide will walk you through deploying the Rentiful real estate application on AWS services.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name (optional but recommended)
- SSL certificate (for production)

## 🏗 AWS Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel/      │◄──►│   (EC2)         │◄──►│   (RDS)         │
│   Netlify)      │    │   Node.js       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   AWS S3        │
                       │   (File Storage)│
                       └─────────────────┘
```

## 🔐 Step 1: AWS Cognito Setup

### 1.1 Create User Pool

1. Go to AWS Cognito Console
2. Click "Create user pool"
3. Configure sign-in experience:
   - **Sign-in options**: Email
   - **User name requirements**: Allow email addresses
   - **Password policy**: Custom (minimum 8 characters)
   - **MFA**: Optional
   - **User account recovery**: Enabled

4. Configure security features:
   - **App client**: Create app client
   - **App client name**: `rentiful-client`
   - **App client secret**: Generate client secret

5. Review and create

### 1.2 Configure App Client

1. Go to "App integration" tab
2. Note down:
   - User Pool ID
   - App Client ID
   - App Client Secret

### 1.3 Add Custom Attributes

1. Go to "Sign-up experience" → "Custom attributes"
2. Add custom attribute:
   - **Name**: `custom:role`
   - **Type**: String
   - **Required**: Yes

## 🗄 Step 2: RDS Database Setup

### 2.1 Create RDS Instance

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose "Standard create"
4. Select "PostgreSQL"
5. Choose "Free tier" (for development) or "Production"
6. Configure settings:
   - **DB instance identifier**: `rentiful-db`
   - **Master username**: `postgres`
   - **Master password**: Generate strong password
   - **DB instance class**: `db.t3.micro` (free tier)
   - **Storage**: 20 GB (free tier)
   - **Multi-AZ deployment**: No (for development)

### 2.2 Configure Security Group

1. Create new security group: `rentiful-db-sg`
2. Add inbound rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your EC2 security group

### 2.3 Enable PostGIS Extension

1. Connect to your database
2. Run the following SQL:
   ```sql
   CREATE EXTENSION postgis;
   CREATE EXTENSION postgis_topology;
   ```

## ☁️ Step 3: S3 Bucket Setup

### 3.1 Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `rentiful-property-images`
   - **Region**: Same as your other services
   - **Block all public access**: Uncheck (for image access)
   - **Bucket versioning**: Disabled

### 3.2 Configure CORS

Add this CORS configuration to your bucket:

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

### 3.3 Create IAM User for S3 Access

1. Go to IAM Console
2. Create new user: `rentiful-s3-user`
3. Attach policy for S3 access
4. Generate access keys

## 🖥 Step 4: EC2 Instance Setup

### 4.1 Launch EC2 Instance

1. Go to AWS EC2 Console
2. Click "Launch instances"
3. Configure:
   - **Name**: `rentiful-server`
   - **AMI**: Amazon Linux 2023
   - **Instance type**: `t2.micro` (free tier)
   - **Key pair**: Create new key pair
   - **Security group**: Create new security group

### 4.2 Configure Security Group

Create security group `rentiful-server-sg` with rules:

- **SSH**: Port 22, Source: Your IP
- **HTTP**: Port 80, Source: 0.0.0.0/0
- **HTTPS**: Port 443, Source: 0.0.0.0/0
- **Custom TCP**: Port 3002, Source: 0.0.0.0/0

### 4.3 Install Dependencies

SSH into your EC2 instance and run:

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PostgreSQL client
sudo yum install postgresql15 -y

# Install PM2 for process management
npm install -g pm2
```

### 4.4 Deploy Backend Code

1. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd real-estate-prod-master/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   nano .env
   ```

4. Add environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/rentiful"
   PORT=3002
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=rentiful-property-images
   ```

5. Set up database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

6. Start the application:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🌐 Step 5: Frontend Deployment

### 5.1 Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-ec2-ip:3002
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_user_pool_id
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

### 5.2 Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
4. Add environment variables (same as Vercel)

## 🔧 Step 6: Domain and SSL Setup

### 6.1 Configure Domain (Optional)

1. Go to Route 53 Console
2. Create hosted zone for your domain
3. Update nameservers with your domain registrar
4. Create A record pointing to your EC2 instance

### 6.2 SSL Certificate

1. Go to AWS Certificate Manager
2. Request certificate for your domain
3. Validate via DNS or email
4. Attach to your EC2 instance

## 📊 Step 7: Monitoring and Logging

### 7.1 CloudWatch Setup

1. Create CloudWatch log group: `rentiful-logs`
2. Configure log retention policy
3. Set up alarms for:
   - High CPU usage
   - High memory usage
   - Database connections

### 7.2 Application Monitoring

```bash
# Monitor application logs
pm2 logs

# Monitor system resources
htop

# Check application status
pm2 status
```

## 🔒 Step 8: Security Best Practices

### 8.1 Database Security

1. Use strong passwords
2. Enable encryption at rest
3. Regular security updates
4. Backup strategy

### 8.2 Application Security

1. Environment variables for secrets
2. Input validation
3. Rate limiting
4. CORS configuration

### 8.3 AWS Security

1. IAM roles instead of access keys
2. Security groups with minimal access
3. Regular security audits
4. Enable CloudTrail

## 🚀 Step 9: Production Checklist

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

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check security group rules
   - Verify connection string
   - Ensure database is running

2. **S3 Upload Failed**
   - Verify IAM permissions
   - Check bucket CORS settings
   - Validate access keys

3. **Cognito Authentication Issues**
   - Verify user pool configuration
   - Check app client settings
   - Validate custom attributes

4. **EC2 Instance Issues**
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

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Application Load Balancer
2. **Auto Scaling**: Configure auto scaling groups
3. **Database**: Consider read replicas
4. **Caching**: Implement Redis for caching

### Performance Optimization

1. **CDN**: Use CloudFront for static assets
2. **Database**: Optimize queries and indexes
3. **Images**: Implement image optimization
4. **Caching**: Add Redis for session storage

## 💰 Cost Optimization

1. **Reserved Instances**: For predictable workloads
2. **Spot Instances**: For non-critical workloads
3. **S3 Lifecycle**: Configure object lifecycle
4. **CloudWatch**: Monitor costs and usage

## 📞 Support

For issues and questions:
- Check AWS documentation
- Review application logs
- Monitor CloudWatch metrics
- Contact AWS support if needed

---

**Note**: This deployment guide assumes a production-ready setup. For development, you can use simpler configurations and free tier services. 