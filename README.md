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

The client reads the API base URL from the `NEXT_PUBLIC_API_URL` environment variable.
If not set, it defaults to `http://localhost:3001`.
Set this variable in `.env.local` or your deployment environment.

### Server

```bash
cd server
npm install
npm run dev
```

The API will run on <http://localhost:3001> by default.

### Required Environment Variables

The server requires the following environment variables. Copy `.env.example` and adjust values as needed.

- `PORT` – Port for the Express API.
- `DATABASE_URL` – PostgreSQL connection string.
- `GEOCODE_USER_AGENT` – User agent for geocoding requests.
- `COGNITO_JWT_PUBLIC_KEY` or `JWT_SECRET` – Key used to verify JWT tokens.
- `COGNITO_AUDIENCE` – Expected JWT audience.
- `COGNITO_ISSUER` – JWT issuer URL.
- `AWS_REGION` – AWS region used for S3.
- `S3_BUCKET_NAME` – S3 bucket for property photos.
- `AWS_ACCESS_KEY_ID` – AWS access key.
- `AWS_SECRET_ACCESS_KEY` – AWS secret key.

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

## Contributing

We welcome community contributions! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) guide for information on branching, committing, and running tests. By participating in this project you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Further Reading

- [API Documentation](API_DOCUMENTATION.md)
- [Setup Guide](SETUP_GUIDE.md)
