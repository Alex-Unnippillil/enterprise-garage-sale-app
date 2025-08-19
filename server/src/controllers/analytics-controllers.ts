import { Request, Response, NextFunction } from 'express';
import { getManagerAnalytics } from '../services/analytics-service';

export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const analytics = await getManagerAnalytics(cognitoId);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};
