import express from 'express';
import request from 'supertest';
import { PassThrough } from 'stream';
import pino from 'pino';
import { buildLoggerMiddleware } from '../middleware/logger';

describe('logger middleware', () => {
  it('attaches logger to request and logs handler output', async () => {
    const stream = new PassThrough();
    const logs: string[] = [];
    stream.on('data', (chunk) => logs.push(chunk.toString()));

    const app = express();
    const testLogger = pino(stream);
    app.use(buildLoggerMiddleware(testLogger));
    app.get('/test', (req, res) => {
      req.logger.info('handler reached');
      res.json({ ok: true });
    });

    await request(app).get('/test').expect(200);

    const combined = logs.join('');
    expect(combined).toContain('handler reached');
    expect(combined).toContain('/test');
  });
});
