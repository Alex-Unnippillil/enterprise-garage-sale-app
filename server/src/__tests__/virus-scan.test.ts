import express from 'express';
import request from 'supertest';
import multer from 'multer';

jest.mock('clamscan', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue({
      scanBuffer: jest.fn().mockResolvedValue({ isInfected: true }),
    }),
  }));
});

import { virusScan } from '../middleware/virus-scan';

describe('virusScan middleware', () => {
  it('rejects infected files', async () => {
    const app = express();
    const upload = multer().single('file');
    app.post('/upload', upload, virusScan, (_req, res) => {
      res.status(200).send('ok');
    });

    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('dummy'), { filename: 'test.txt' });

    expect(res.status).toBe(400);
  });
});
