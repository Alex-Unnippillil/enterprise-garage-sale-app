import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (req.logger) {
    req.logger.error({ err }, 'unhandled error');
  } else {
    console.error(err);
    if (err && err.stack) {
      console.error(err.stack);
    }
  }
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
};

