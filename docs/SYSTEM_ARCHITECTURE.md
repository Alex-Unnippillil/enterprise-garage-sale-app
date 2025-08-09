# System Architecture

## Tech Stack
- **Client:** Next.js (React + TypeScript) with Tailwind CSS for styling.
- **Server:** Node.js with Express and Prisma ORM, written in TypeScript.
- **Database:** PostgreSQL accessed via Prisma.
- **Storage & Integrations:** AWS S3 for file storage, JWT for authentication, Axios for HTTP requests.

## High-Level Data Flow
1. Users interact with the **client** application in the browser.
2. The client makes RESTful requests to the **server** API.
3. The server validates requests, applies business logic, and uses **Prisma** to read/write data in **PostgreSQL**.
4. Assets such as images are uploaded to **AWS S3**; references are stored in the database.
5. Responses are returned to the client to update the user interface.

## Module Boundaries
- **client/**: front‑end Next.js app responsible for user experience and UI state.
- **server/**: back‑end Express API handling authentication, business rules, and data persistence.
- **docs/**: project‑wide documentation and guidelines.

## Coding Conventions
### Naming
- Use **camelCase** for variables and functions.
- Use **PascalCase** for React components, classes, and TypeScript interfaces.
- File names follow **kebab-case** (e.g., `user-profile.tsx`).

### Testing
- Use **Jest** for unit and integration tests.
- Place tests alongside source files in `__tests__` directories.
- Strive for **>80%** code coverage and follow Arrange‑Act‑Assert structure.
- Execute tests with `npm test` in each package; run Playwright for end‑to‑end testing when applicable.

### Linting
- Use **ESLint** with the TypeScript plugin across all packages.
- Run `npm run lint` before committing to ensure consistent style.
- Fix auto-fixable issues with `--fix` and address remaining warnings manually.
