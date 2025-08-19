import request from 'supertest';
import express from 'express';

describe('Property API placeholder', () => {
  const app = express();
  app.use(express.json());

  it('responds to get', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBeDefined();
  });
});
