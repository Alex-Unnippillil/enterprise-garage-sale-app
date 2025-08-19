import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { uploadToS3, generateSignedUrl } from '../utils/s3';

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const { propertyId, leaseId } = req.body;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!propertyId && !leaseId) {
      res
        .status(400)
        .json({ message: 'propertyId or leaseId is required' });
      return;
    }

    const key = `documents/${Date.now()}-${file.originalname}`;
    const url = await uploadToS3(key, file.buffer, file.mimetype);

    const document = await prisma.document.create({
      data: {
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        propertyId: propertyId ? Number(propertyId) : undefined,
        leaseId: leaseId ? Number(leaseId) : undefined,
      },
    });

    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

export const getDocumentUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    const signedUrl = await generateSignedUrl(document.key);
    res.json({ url: signedUrl });
  } catch (err) {
    next(err);
  }
};
