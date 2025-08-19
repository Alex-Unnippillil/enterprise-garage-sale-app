import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';

const createFavoriteSchema = z.object({
  propertyId: z.number(),
});

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId: req.user?.id },
    });
    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }
    const favorites = await prisma.favorite.findMany({
      where: { tenantId: tenant.id },
      include: { property: true },
    });
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

export const getFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const favorite = await prisma.favorite.findUnique({
      where: { id: Number(id) },
      include: { property: true },
    });
    if (!favorite) {
      res.status(404).json({ message: 'Favorite not found' });
      return;
    }
    res.json(favorite);
  } catch (err) {
    next(err);
  }
};

export const createFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = createFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId: req.user?.id },
    });
    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        tenantId: tenant.id,
        propertyId: parsed.data.propertyId,
      },
      include: { property: true },
    });

    res.status(201).json(favorite);
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ message: 'Favorite already exists' });
      return;
    }
    next(err);
  }
};

export const deleteFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.favorite.delete({ where: { id: Number(id) } });
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    next(err);
  }
};
