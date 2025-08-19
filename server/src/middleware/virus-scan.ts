import type { Request, Response, NextFunction } from 'express';
import NodeClam from 'clamscan';

let clamPromise: Promise<any> | null = null;

const getClam = async () => {
  if (!clamPromise) {
    const clamscan = new NodeClam();
    clamPromise = clamscan.init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: Number(process.env.CLAMAV_PORT) || 3310,
      },
    });
  }
  return clamPromise;
};

export const virusScan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const clam = await getClam();
    const files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else if (req.files && typeof req.files === 'object') {
      files.push(...Object.values(req.files).flat());
    } else if (req.file) {
      files.push(req.file);
    }

    for (const file of files) {
      const { isInfected } = await clam.scanBuffer(file.buffer);
      if (isInfected) {
        res.status(400).json({ message: 'File failed virus scan' });
        return;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
