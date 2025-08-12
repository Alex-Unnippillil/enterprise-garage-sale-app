import request from 'supertest';
import express from 'express';

describe('property search', () => {
  const app = express();
  app.get('/properties', (req, res) => {
    const { q } = req.query;
    if (q === 'match') {
      res.json([{ name: 'Match' }]);
    } else {
      res.json([]);
    }
  });

  it('returns matching properties', async () => {
    const res = await request(app).get('/properties').query({ q: 'match' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Match' }]);
  });

  it('returns empty array when no match', async () => {
    const res = await request(app).get('/properties').query({ q: 'none' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
