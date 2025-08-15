import express from 'express';
import request from 'supertest';
import { notFound } from '../middleware/not-found';
import { errorHandler } from '../middleware/error-handler';

describe('notFound middleware', () => {
  it('returns 404 for unknown routes', async () => {
    const app = express();
    app.get('/known', (_req, res) => {
      res.json({ ok: true });
    });
    app.use(notFound);
    app.use(errorHandler);

    const res = await request(app).get('/unknown');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Route not found' });
  });
});
