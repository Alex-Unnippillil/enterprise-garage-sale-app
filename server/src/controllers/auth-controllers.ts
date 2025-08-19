import { Request, Response, NextFunction } from 'express';
import { authenticator } from 'otplib';
import prisma from '../utils/prisma';

const issuer = process.env.TOTP_ISSUER || 'enterprise-garage-sale-app';

export const setupMfa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;
    const secret = authenticator.generateSecret();
    await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });
    const otpauth = authenticator.keyuri(String(userId), issuer, secret);
    res.json({ secret, otpauth });
  } catch (err) {
    next(err);
  }
};

export const verifyMfa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      res.status(400).json({ message: 'MFA not setup' });
      return;
    }
    const isValid = authenticator.check(token, user.mfaSecret);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }
    res.json({ message: 'MFA verified' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, password, token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.password !== password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (user.mfaSecret) {
      if (!token || !authenticator.check(token, user.mfaSecret)) {
        res.status(401).json({ message: 'Invalid MFA token' });
        return;
      }
    }
    res.json({ message: 'Logged in' });
  } catch (err) {
    next(err);
  }
};
