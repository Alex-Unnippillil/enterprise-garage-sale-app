import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
};

