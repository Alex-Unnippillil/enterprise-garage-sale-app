import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'crypto';

const setCommonEnv = () => {
  process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
  process.env.GEOCODE_USER_AGENT = 'test-agent';
  process.env.COGNITO_AUDIENCE = 'test-aud';
  process.env.COGNITO_ISSUER = 'test-iss';
  process.env.AWS_REGION = 'us-east-1';
  process.env.S3_BUCKET_NAME = 'bucket';
  process.env.AWS_ACCESS_KEY_ID = 'key';
  process.env.AWS_SECRET_ACCESS_KEY = 'secret';
};

afterEach(() => {
  delete process.env.COGNITO_JWT_PUBLIC_KEY;
  delete process.env.JWT_SECRET;
  delete process.env.DATABASE_URL;
  delete process.env.GEOCODE_USER_AGENT;
  delete process.env.COGNITO_AUDIENCE;
  delete process.env.COGNITO_ISSUER;
  delete process.env.AWS_REGION;
  delete process.env.S3_BUCKET_NAME;
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  jest.resetModules();
});

describe('authMiddleware', () => {
  it('verifies token using RS256 when public key is provided', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    setCommonEnv();
    process.env.COGNITO_JWT_PUBLIC_KEY = publicKey;

    const { authMiddleware } = require('../middleware/auth-middleware');

    const token = jwt.sign({ sub: 'user1', 'custom:role': 'admin' }, privateKey, {
      algorithm: 'RS256',
      audience: process.env.COGNITO_AUDIENCE,
      issuer: process.env.COGNITO_ISSUER,
    });

    const app = express();
    app.get('/protected', authMiddleware(['admin']), (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('verifies token using HS256 when secret is provided', async () => {
    setCommonEnv();
    process.env.JWT_SECRET = 'supersecret';

    const { authMiddleware } = require('../middleware/auth-middleware');

    const token = jwt.sign({ sub: 'user1', 'custom:role': 'admin' }, process.env.JWT_SECRET!, {
      algorithm: 'HS256',
      audience: process.env.COGNITO_AUDIENCE,
      issuer: process.env.COGNITO_ISSUER,
    });

    const app = express();
    app.get('/protected', authMiddleware(['admin']), (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('prioritizes RS256 when both public key and secret are provided', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    setCommonEnv();
    process.env.COGNITO_JWT_PUBLIC_KEY = publicKey;
    process.env.JWT_SECRET = 'supersecret';

    const { authMiddleware } = require('../middleware/auth-middleware');

    const token = jwt.sign({ sub: 'user1', 'custom:role': 'admin' }, privateKey, {
      algorithm: 'RS256',
      audience: process.env.COGNITO_AUDIENCE,
      issuer: process.env.COGNITO_ISSUER,
    });

    const app = express();
    app.get('/protected', authMiddleware(['admin']), (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
