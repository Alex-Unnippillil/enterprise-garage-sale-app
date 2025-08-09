import { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

// Configure Cognito JWT verifier using environment variables
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
  clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID!,
  tokenUse: "id",
});

interface DecodedToken {
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
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const payload = (await verifier.verify(token)) as DecodedToken;
      const userRole = (payload["custom:role"] || "").toLowerCase();
      req.user = { id: payload.sub, role: userRole };

      if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};
