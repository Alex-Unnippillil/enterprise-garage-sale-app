import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';

describe('authMiddleware', () => {
  const app = express();
  app.get('/protected', authMiddleware(['admin']), (req, res) => {
    res.status(200).json({ user: req.user });
  });

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('allows access with a valid token', async () => {
    const token = jwt.sign({ sub: '123', 'custom:role': 'admin' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('123');
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ sub: '123', 'custom:role': 'admin' }, process.env.JWT_SECRET!, { expiresIn: -1 });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token expired');
  });

  it('rejects a tampered token', async () => {
    const token = jwt.sign({ sub: '123', 'custom:role': 'admin' }, 'wrong-secret', { expiresIn: '1h' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });
});
