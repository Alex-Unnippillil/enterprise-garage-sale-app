import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
      const secretOrPublicKey =
        process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || "";
      const decoded = jwt.verify(token, secretOrPublicKey) as DecodedToken;
      const userRole = (decoded["custom:role"] || "").toLowerCase();

      req.user = {
        id: decoded.sub,
        role: userRole,
      };

      const hasAccess = allowedRoles
        .map((role) => role.toLowerCase())
        .includes(userRole);
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
