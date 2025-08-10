import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../config";

interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: jwtConfig.algorithms,
      }) as DecodedToken;

      const userRole = decoded["custom:role"] || "";

      if (!decoded.sub || !decoded.exp || !userRole) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      req.user = {
        id: decoded.sub,
        role: userRole,
      };

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }
    } catch (err) {
      console.error("Failed to verify token:", err);
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next();
  };
};
