# Quick Start Guide for Developers

This guide will help you get the Rentiful application running on your local machine for development.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Git
- AWS CLI (optional, for S3 file uploads)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/enterprise-garage-sale.git
cd enterprise-garage-sale
```

### 2. Install Dependencies

```bash
# Install all dependencies (client, server, and root)
npm run install:all
```

### 3. Set Up Environment Variables

#### Client Environment (client/.env.local)

```bash
# Copy the example file
cp client/env.example client/.env.local

# Edit the file with your values
nano client/.env.local
```

**Required variables:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-cognito-user-pool-id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your-cognito-user-pool-client-id
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

#### Server Environment (server/.env)

```bash
# Copy the example file
cp server/env.example server/.env

# Edit the file with your values
nano server/.env
```

**Required variables:**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/rentiful_db"
PORT=3002
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

### 4. Set Up Database

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL website](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE rentiful_db;
CREATE USER rentiful_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rentiful_db TO rentiful_user;
\q
```

#### Run Database Migrations

```bash
cd server
npm run prisma:generate
npx prisma migrate deploy
npx prisma db seed
cd ..
```

### 5. Start Development Servers

#### Option 1: Start Both Servers (Recommended)

```bash
# Start both client and server in development mode
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3002

#### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Verify Installation

1. **Frontend**: Open http://localhost:3000
   - You should see the Rentiful landing page
   - Test the search functionality

2. **Backend**: Open http://localhost:3002
   - You should see: `{"message":"Rentiful API is running!","version":"1.0.0","environment":"development"}`

3. **Health Check**: Open http://localhost:3002/health
   - You should see a health status response

## Development Workflow

### Code Structure

```
enterprise-garage-sale/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities and config
│   │   └── state/        # State management
│   └── public/           # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── prisma/       # Database schema
│   └── prisma/
├── infrastructure/        # Terraform IaC
└── scripts/              # Deployment scripts
```

### Common Development Tasks

#### 1. Database Changes

```bash
# Create a new migration
cd server
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

#### 2. API Development

```bash
# Add new route
# 1. Create controller in server/src/controllers/
# 2. Create route in server/src/routes/
# 3. Import and use in server/src/index.ts
```

#### 3. Frontend Development

```bash
# Add new page
# 1. Create file in client/src/app/
# 2. Export as default React component
# 3. Next.js will auto-route based on file structure
```

#### 4. Component Development

```bash
# Create new component
# 1. Create file in client/src/components/
# 2. Use TypeScript interfaces
# 3. Follow existing component patterns
```

### Testing

#### Run All Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Run tests in watch mode
npm test -- --watch
```

#### Run Specific Tests

```bash
# Backend specific test
cd server && npm test -- --grep "user"

# Frontend specific test
cd client && npm test -- --testNamePattern="Button"
```

### Code Quality

#### Linting

```bash
# Backend linting
cd server && npm run lint

# Frontend linting
cd client && npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

#### Type Checking

```bash
# Backend type checking
cd server && npx tsc --noEmit

# Frontend type checking
cd client && npx tsc --noEmit
```

## AWS Services Setup (Optional)

For full functionality, you'll need AWS services:

### 1. AWS Cognito (Authentication)

1. Go to AWS Console → Cognito
2. Create User Pool
3. Create App Client
4. Update environment variables

### 2. AWS S3 (File Storage)

1. Go to AWS Console → S3
2. Create bucket
3. Configure CORS
4. Update environment variables

### 3. Mapbox (Maps)

1. Go to [Mapbox](https://www.mapbox.com/)
2. Create account
3. Get access token
4. Update environment variables

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U rentiful_user -d rentiful_db
```

#### 2. Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3002

# Kill process
kill -9 <PID>
```

#### 3. Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma Issues

```bash
# Regenerate Prisma client
cd server
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Debug Mode

#### Backend Debug

```bash
# Start with debug logging
cd server
DEBUG=* npm run dev
```

#### Frontend Debug

```bash
# Start with debug mode
cd client
NODE_ENV=development npm run dev
```

## Useful Commands

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database operations
cd server && npx prisma studio
cd server && npx prisma migrate dev
cd server && npx prisma generate

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Next Steps

1. **Read the Documentation**: Check `ENTERPRISE_DEPLOYMENT.md` for production setup
2. **Explore the Codebase**: Familiarize yourself with the project structure
3. **Set Up AWS Services**: Configure Cognito, S3, and other services
4. **Join the Team**: Connect with other developers and DevOps team

## Support

- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issues for bugs
- **Questions**: Ask in team chat or create discussions
- **Code Review**: Submit pull requests for review

---

**Happy Coding! 🚀** 