# Security Setup

## Environment Variables

- `TOTP_ISSUER` – Optional issuer string used when generating MFA TOTP secrets. Defaults to `enterprise-garage-sale-app`.

## Multi-Factor Authentication (MFA)

1. Call `POST /api/mfa/setup` with the user id to receive a TOTP secret.
2. Register the secret with an authenticator app and verify by posting a token to `POST /api/mfa/verify`.
3. Subsequent logins must include a valid MFA token when a secret is present.

## Role Based Access Control (RBAC)

Roles and permissions are defined in `shared/types/auth.ts`. Use the `requirePermission` middleware to protect routes server-side.
