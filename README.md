# Enterprise Garage Sale App

## Overview
This repository contains an enterprise-grade real estate marketplace that lets users list and browse properties. It is split into a **Next.js** client for the user interface and an **Express** API backed by **PostgreSQL** via **Prisma**.

## Tech Stack
- **Client:** Next.js (React + TypeScript) styled with Tailwind CSS
- **Server:** Node.js, Express, and Prisma ORM (TypeScript)
- **Database:** PostgreSQL
- **Storage & Auth:** AWS S3 for media, JWT tokens via AWS Cognito

## Architecture
Users interact with the Next.js client, which makes REST calls to the Express server. The server applies business logic, reads and writes data through Prisma, and stores media assets in S3. See [System Architecture](docs/SYSTEM_ARCHITECTURE.md) for more details.

## Quick Start
### Prerequisites
- Node.js 18+
- npm
- PostgreSQL
- Required environment variables (see [Setup Guide](SETUP_GUIDE.md))

### Client
```bash
cd client
npm install
npm run dev
```
Open <http://localhost:3000> in your browser.

The client reads the API URL from the `NEXT_PUBLIC_API_URL` environment variable. If not set, it defaults to `http://localhost:3001`.

### Server
```bash
cd server
npm install
npm run dev
```
The API will run on <http://localhost:3001> by default.

## Testing
- **Client:**
  ```bash
  cd client
  npm test          # unit tests
  npm run test:e2e  # end-to-end tests
  ```
- **Server:**
  ```bash
  cd server
  npm test
  ```
For detailed testing strategies, see [TESTING.md](TESTING.md).

## Deployment Notes
The application is designed for AWS deployment using services such as Cognito for authentication and S3 for asset storage. Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step production guidance.

## Further Reading
- [API Documentation](API_DOCUMENTATION.md)
- [Setup Guide](SETUP_GUIDE.md)

