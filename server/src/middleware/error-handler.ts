import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const errorHandler = (
  err: any,
  req: Request & { id?: string },
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  logger.error({ err, reqId: req.id });
  res.status(status).json({ message });
};

