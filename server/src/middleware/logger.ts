import { Request, Response, NextFunction } from 'express';
import pino, { Logger } from 'pino';

export const logger: Logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const buildLoggerMiddleware = (baseLogger: Logger = logger) => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const child = baseLogger.child({ method: req.method, url: req.originalUrl });
  (req as any).logger = child;

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const diff = Number(process.hrtime.bigint() - start) / 1e6;
    child.info(
      { statusCode: res.statusCode, responseTime: diff },
      'request completed',
    );
  });

  res.on('error', (err) => {
    const diff = Number(process.hrtime.bigint() - start) / 1e6;
    child.error({ err, responseTime: diff }, 'request error');
  });

  next();
};

export const loggerMiddleware = buildLoggerMiddleware();
