# 🚀 Quick Setup Guide

This guide will help you get the Rentiful real estate application running locally and deployed to AWS Amplify.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (for local development)
- AWS Account (for production deployment)

## 🏠 Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd enterprise-garage-sale

# Run the automated setup script
./deploy.sh
```

### 2. Manual Setup (if script doesn't work)

```bash
# Install all dependencies
npm run install:all

# Create environment files
# Copy the examples below to client/.env.local and server/.env
```

### 3. Environment Variables

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

### 5. Start Development Servers

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3002

## 🌐 AWS Amplify Deployment

### 1. Prepare Your Repository

```bash
# Push your code to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Set Up AWS Services

#### AWS Cognito
1. Go to AWS Cognito Console
2. Create User Pool with email sign-in
3. Add custom attribute `custom:role` (String, Required)
4. Create App Client
5. Note down User Pool ID and Client ID

#### RDS Database
1. Create PostgreSQL RDS instance
2. Enable PostGIS extension
3. Note down connection details

#### S3 Bucket
1. Create S3 bucket for property images
2. Configure CORS settings
3. Create IAM user with S3 access

### 3. Deploy to AWS Amplify

1. **Connect to Amplify Console**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Configure Environment Variables**
   In Amplify Console → App settings → Environment variables:
   ```
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_user_pool_id
   NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

3. **Deploy Backend**
   - Deploy your server to EC2 or ECS
   - Update `NEXT_PUBLIC_API_BASE_URL` to point to your backend

### 4. Alternative: Deploy Backend to EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone and deploy
git clone <your-repo-url>
cd real-estate-prod/server
npm install
nano .env  # Add your environment variables
npx prisma generate
npx prisma db push
npx prisma db seed
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

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
   psql -h localhost -U postgres -d rentiful
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

4. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 3002
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3002 | xargs kill -9
   ```

### Useful Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart all

# Monitor system resources
top
htop
df -h
```

## 📚 Additional Resources

- [README.md](./README.md) - Detailed project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete AWS deployment guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints
- [TESTING.md](./TESTING.md) - Testing guidelines

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the detailed documentation
3. Check the GitHub issues
4. Contact the development team

---

**Note**: This is a production-ready application. For development, you can use simpler configurations and free tier services. 