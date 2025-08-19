import { Request, Response, NextFunction } from 'express';
import { getAllFlags } from '../utils/feature-flags';

declare global {
  namespace Express {
    interface Request {
      flags?: Record<string, boolean>;
    }
  }
}

export const featureFlagsMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    req.flags = await getAllFlags();
  } catch {
    req.flags = {};
  }
  next();
};
