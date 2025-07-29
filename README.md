# 🏠 Rentiful - Scalable Real Estate Application

A modern, full-stack real estate application built with Next.js, Node.js, and AWS services. This enterprise-grade rental apartment application provides a complete solution for property managers and tenants.

## 🚀 Features

### For Property Managers
- **Property Management**: Create, edit, and manage property listings
- **Application Processing**: Review and manage tenant applications
- **Lease Management**: Handle lease agreements and payments
- **Analytics Dashboard**: Track property performance and occupancy rates
- **File Upload**: Upload property images to AWS S3

### For Tenants
- **Property Search**: Advanced search with filters and map view
- **Favorites**: Save and manage favorite properties
- **Application System**: Apply for properties with detailed forms
- **Lease Management**: View current leases and payment history
- **Dashboard**: Personal dashboard for managing applications and residences

### Core Features
- **Real-time Search**: Location-based property search with advanced filters
- **Interactive Maps**: Mapbox integration for property location visualization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: Secure AWS Cognito authentication with role-based access
- **File Management**: AWS S3 integration for image storage
- **Database**: PostgreSQL with PostGIS for location data

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management with RTK Query
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling with Zod validation
- **Mapbox GL** - Interactive maps

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database with PostGIS extension
- **AWS SDK** - AWS service integration

### AWS Services
- **AWS Cognito** - User authentication and authorization
- **AWS S3** - File storage for property images
- **AWS EC2** - Server hosting
- **AWS RDS** - Database hosting
- **AWS API Gateway** - API management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
real-estate-prod-master/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── (auth)/    # Authentication pages
│   │   │   ├── (dashboard)/ # Dashboard pages
│   │   │   └── (nondashboard)/ # Public pages
│   │   ├── components/    # Reusable components
│   │   ├── state/         # Redux store and API
│   │   ├── types/         # TypeScript definitions
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Server entry point
│   └── prisma/            # Database schema and migrations
└── README.md              # Project documentation
```

## 🗄 Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Manager**: Property managers with Cognito authentication
- **Tenant**: Property tenants with Cognito authentication
- **Property**: Property listings with detailed information
- **Location**: Geographic location data with PostGIS
- **Application**: Tenant applications for properties
- **Lease**: Lease agreements between tenants and properties
- **Payment**: Payment tracking for leases

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ with PostGIS extension
- AWS Account with configured services
- npm or yarn package manager

### Environment Variables

Create `.env` files in both `client/` and `server/` directories:

#### Client (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

#### Server (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/realestate"
PORT=3002
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-prod-master
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the development servers**
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend server (in a new terminal)
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3002

## 🏗 Architecture Overview

### Frontend Architecture
- **App Router**: Next.js 15 App Router for file-based routing
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Authentication**: AWS Amplify for Cognito integration
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **REST API**: Express.js with structured routes
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT token validation with Cognito
- **File Storage**: AWS S3 for image uploads
- **Middleware**: Role-based access control

### Database Design
- **PostgreSQL**: Primary database with PostGIS for location data
- **Relationships**: Proper foreign key relationships
- **Indexes**: Optimized for search queries
- **Enums**: Structured data types for consistency

## 🔐 Authentication & Authorization

The application uses AWS Cognito for user authentication with role-based access:

- **Tenants**: Can view properties, apply for rentals, manage applications
- **Managers**: Can manage properties, review applications, handle leases

### Authentication Flow
1. User signs up/signs in through Cognito
2. Role is assigned during registration
3. JWT tokens are used for API authentication
4. Middleware validates tokens and roles

## 🗺 Location & Search Features

- **Geographic Search**: PostGIS integration for location-based queries
- **Advanced Filters**: Price, beds, baths, amenities, property type
- **Map Integration**: Mapbox GL for interactive property maps
- **Real-time Updates**: Instant search results with Redux state management

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Tailwind CSS**: Utility-first styling
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Touch-friendly**: Optimized for mobile interactions
- **Progressive Enhancement**: Works on all devices

## 🚀 Deployment

### AWS Deployment
1. **EC2 Instance**: Deploy the Node.js backend
2. **RDS Database**: PostgreSQL with PostGIS
3. **S3 Bucket**: File storage for images
4. **CloudFront**: CDN for static assets
5. **Route 53**: Domain management

### Environment Setup
- Configure AWS services (Cognito, S3, RDS)
- Set up environment variables
- Run database migrations
- Deploy frontend to Vercel/Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built following the tutorial by [Ed Roh](https://www.youtube.com/watch?v=X1zCAPLvMtw)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Maps from [Mapbox](https://www.mapbox.com/) 