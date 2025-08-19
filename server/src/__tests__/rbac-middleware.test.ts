import express from 'express';
import request from 'supertest';

const setEnv = () => {
  process.env.DATABASE_URL = 'postgres://test';
  process.env.GEOCODE_USER_AGENT = 'agent';
  process.env.COGNITO_AUDIENCE = 'aud';
  process.env.COGNITO_ISSUER = 'iss';
  process.env.JWT_SECRET = 'jwtsecret';
  process.env.AWS_REGION = 'us-east-1';
  process.env.S3_BUCKET_NAME = 'bucket';
  process.env.AWS_ACCESS_KEY_ID = 'key';
  process.env.AWS_SECRET_ACCESS_KEY = 'secret';
  process.env.CLIENT_ORIGIN = 'http://localhost';
};

setEnv();
import '../middleware/auth-middleware';
import { requirePermission } from '../middleware/rbac';

describe('RBAC middleware', () => {
  const app = express();

  app.get(
    '/manage',
    (req, _res, next) => {
      req.user = { id: '1', role: 'manager' } as any;
      next();
    },
    requirePermission('manage_listings'),
    (_req, res) => {
      res.json({ ok: true });
    },
  );

  app.get(
    '/tenant',
    (req, _res, next) => {
      req.user = { id: '1', role: 'tenant' } as any;
      next();
    },
    requirePermission('manage_listings'),
    (_req, res) => {
      res.json({ ok: true });
    },
  );

  app.get('/anon', requirePermission('view_listings'), (_req, res) => {
    res.json({ ok: true });
  });

  afterAll(() => {
    delete process.env.DATABASE_URL;
    delete process.env.GEOCODE_USER_AGENT;
    delete process.env.COGNITO_AUDIENCE;
    delete process.env.COGNITO_ISSUER;
    delete process.env.AWS_REGION;
    delete process.env.S3_BUCKET_NAME;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.CLIENT_ORIGIN;
  });

  it('allows access when role has permission', async () => {
    const res = await request(app).get('/manage');
    expect(res.status).toBe(200);
  });

  it('denies access when role lacks permission', async () => {
    const res = await request(app).get('/tenant');
    expect(res.status).toBe(403);
  });

  it('returns 401 when user missing', async () => {
    const res = await request(app).get('/anon');
    expect(res.status).toBe(401);
  });
});
