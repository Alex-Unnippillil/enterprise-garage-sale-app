import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, JwtHeader, SigningKeyCallback, VerifyErrors } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

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

const client = jwksClient({
  jwksUri: `${process.env.COGNITO_ISSUER}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

const getKey = (header: JwtHeader, callback: SigningKeyCallback): void => {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) {
      callback(err, undefined);
      return;
    }
    if (!key) {
      callback(new Error("Signing key not found"), undefined);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

export const authMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decoded = await new Promise<DecodedToken>((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            algorithms: ["RS256"],
            audience: process.env.COGNITO_AUDIENCE,
            issuer: process.env.COGNITO_ISSUER,
          },
          (err: VerifyErrors | null, decodedToken: unknown) => {
            if (err || !decodedToken || typeof decodedToken === "string") {
              return reject(err);
            }
            resolve(decodedToken as DecodedToken);
          }
        );
      });

      const userRole = decoded["custom:role"]?.toLowerCase() || "";
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }

      req.user = {
        id: decoded.sub,
        role: userRole,
      };

      next();
    } catch (err) {
      console.error("Failed to verify token:", err);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
