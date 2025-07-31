# 🏢 Enterprise Real Estate Management Platform

A scalable, enterprise-grade full-stack web application for real estate management with comprehensive features for property managers and tenants.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - AWS Cognito integration
- **Property Management** - CRUD operations with advanced search
- **Payment Processing** - Stripe integration for rent payments
- **Messaging System** - Real-time tenant-manager communication
- **Maintenance Requests** - Complete maintenance workflow
- **Notifications** - Real-time notification system
- **Analytics Dashboard** - Comprehensive reporting for managers
- **Document Management** - Secure file storage and sharing
- **Virtual Tours** - 360° property viewing
- **Viewing Scheduling** - Property viewing management

### Technical Features
- **Modern Frontend** - Next.js 14 with TypeScript
- **Scalable Backend** - Node.js with Express
- **Database** - PostgreSQL with Prisma ORM
- **Cloud Infrastructure** - AWS services integration
- **CI/CD** - GitHub Actions automation
- **Infrastructure as Code** - Terraform configuration
- **Security** - Rate limiting, CORS, Helmet
- **Monitoring** - Comprehensive logging and error tracking

## 🏗️ Architecture

```
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utilities and configurations
│   │   ├── state/        # Redux Toolkit store
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── prisma/       # Database schema
│   └── terraform/        # Infrastructure as Code
├── infrastructure/        # AWS Infrastructure
│   ├── terraform/        # Terraform configurations
│   └── scripts/          # Deployment scripts
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Stripe Elements** - Payment processing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **AWS SDK** - Cloud service integration
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Cloud Services
- **AWS Cognito** - User authentication
- **AWS S3** - File storage
- **AWS RDS** - Database hosting
- **AWS EC2** - Backend hosting
- **AWS Amplify** - Frontend hosting
- **AWS CloudFront** - CDN
- **AWS Route 53** - DNS management

### DevOps
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipelines
- **Docker** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS CLI configured
- Terraform installed

### 1. Clone Repository
```bash
git clone https://github.com/your-org/enterprise-real-estate.git
cd enterprise-real-estate
```

### 2. Environment Setup
```bash
# Copy environment templates
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# Install dependencies
npm run install:all
```

### 3. Database Setup
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Development
```bash
# Start development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3002
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your-client-id
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/real_estate_db"

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket

# Authentication
JWT_SECRET=your-jwt-secret
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key

# Server Configuration
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Deployment

### 1. Infrastructure Setup
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### 2. Backend Deployment
```bash
cd server
npm run build
npm run deploy
```

### 3. Frontend Deployment
```bash
cd client
npm run build
npm run deploy
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/signout` - User logout

### Property Endpoints
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/process` - Process payment
- `GET /api/payments/history` - Payment history
- `GET /api/payments/upcoming` - Upcoming payments

### Messaging Endpoints
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:conversationId` - Get messages
- `PUT /api/messages/read/:messageId` - Mark as read

### Maintenance Endpoints
- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance` - List maintenance requests
- `PUT /api/maintenance/:id` - Update maintenance request
- `PUT /api/maintenance/:id/complete` - Complete request

## 🔒 Security Features

- **Rate Limiting** - API protection against abuse
- **CORS Configuration** - Cross-origin request handling
- **Helmet.js** - Security headers
- **Input Validation** - Request sanitization
- **JWT Authentication** - Secure token-based auth
- **AWS IAM** - Role-based access control
- **SSL/TLS** - Encrypted communication

## 📈 Monitoring & Analytics

- **Application Logs** - Comprehensive logging system
- **Error Tracking** - Sentry integration
- **Performance Monitoring** - AWS CloudWatch
- **Database Monitoring** - RDS performance insights
- **User Analytics** - Google Analytics integration

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run frontend tests
cd client && npm run test

# Run backend tests
cd server && npm run test

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Architecture Overview](./docs/architecture.md)
- [Contributing Guidelines](./docs/contributing.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/enterprise-real-estate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/enterprise-real-estate/discussions)
- **Email**: support@your-company.com

## 🏆 Acknowledgments

- AWS for cloud infrastructure
- Vercel for Next.js hosting
- Stripe for payment processing
- Prisma for database management
- Tailwind CSS for styling
- Shadcn/ui for components

---

**Built with ❤️ for the modern real estate industry** 