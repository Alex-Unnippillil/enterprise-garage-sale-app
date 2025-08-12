# Enterprise Garage Sale App

A full-stack application for browsing and managing real estate listings. The project is split into a **server** (Express + Prisma) and a **client** (Next.js).

## Documentation
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Testing Guide](TESTING.md)

## Local Development

### Server
1. Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The API runs on `PORT` (default: `3002`).

### Client
1. Navigate to the client directory and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The client is served at [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Server
Create a `.env` file in `server/` with the following variables:
- `DATABASE_URL` – PostgreSQL connection string
- `PORT` – Port for the API (defaults to `3002`)
- `AWS_REGION` – AWS region for S3
- `S3_BUCKET_NAME` – S3 bucket name for file uploads
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` – AWS credentials with S3 permissions

### Client
Create a `.env.local` file in `client/` with the following variables:
- `NEXT_PUBLIC_API_BASE_URL` – Base URL for the server API
- `NEXT_PUBLIC_API_URL` – Optional alternative API URL
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` – Mapbox access token for map features
- `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID` – AWS Cognito User Pool ID
- `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID` – Cognito App Client ID

## Testing

Run end-to-end tests from the `client` directory:
```bash
cd client
npm run test:e2e
```

Additional testing details and strategies are available in the [testing guide](TESTING.md).
