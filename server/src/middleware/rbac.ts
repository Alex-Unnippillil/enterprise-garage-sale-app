import { Request, Response, NextFunction } from 'express';
import { Role, permissions } from '../../../shared/types/auth';

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role as Role | undefined;

    if (!role) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const allowed = permissions[role]?.includes(permission);
    if (!allowed) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};
