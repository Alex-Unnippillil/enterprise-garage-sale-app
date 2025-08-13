import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'crypto';

describe('auth middleware', () => {
  const baseEnv = {
    DATABASE_URL: 'https://example.com',
    GEOCODE_USER_AGENT: 'test-agent',
    COGNITO_AUDIENCE: 'test-audience',
    COGNITO_ISSUER: 'test-issuer',
    AWS_REGION: 'us-east-1',
    S3_BUCKET_NAME: 'bucket',
    AWS_ACCESS_KEY_ID: 'key',
    AWS_SECRET_ACCESS_KEY: 'secret',
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...baseEnv };
  });

  it('allows access with RS256 token when public key is provided', async () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    process.env.COGNITO_JWT_PUBLIC_KEY = publicKey
      .export({ type: 'pkcs1', format: 'pem' })
      .toString();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { authMiddleware } = require('../middleware/auth-middleware');
    const app = express();
    app.get('/', authMiddleware(['tenant']), (_req, res) => res.status(200).json({ ok: true }));

    const token = jwt.sign({ sub: 'user', 'custom:role': 'tenant' }, privateKey, {
      algorithm: 'RS256',
      audience: baseEnv.COGNITO_AUDIENCE,
      issuer: baseEnv.COGNITO_ISSUER,
    });

    const res = await request(app).get('/').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('allows access with HS256 token when secret is provided', async () => {
    process.env.JWT_SECRET = 'shhh';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { authMiddleware } = require('../middleware/auth-middleware');
    const app = express();
    app.get('/', authMiddleware(['tenant']), (_req, res) => res.status(200).json({ ok: true }));

    const token = jwt.sign({ sub: 'user', 'custom:role': 'tenant' }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      audience: baseEnv.COGNITO_AUDIENCE,
      issuer: baseEnv.COGNITO_ISSUER,
    });

    const res = await request(app).get('/').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
