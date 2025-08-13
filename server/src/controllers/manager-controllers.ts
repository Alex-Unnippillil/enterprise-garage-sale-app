import { Request, Response, NextFunction } from "express";
import { createUserSchema, updateUserSchema } from "../validators/user-validators";
import { formatLocation } from "../utils/format-location";
import prisma from "../utils/prisma";
import { createUserSchema, updateUserSchema } from "../validators/user-validators";
import { formatLocation } from "../utils/format-location";


export const getManager = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const createManager = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }
    const { cognitoId, name, email, phoneNumber } = parsed.data;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error) {
    next(error);
  }
};

export const updateManager = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }
    const { name, email, phoneNumber } = parsed.data;

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error) {
    next(error);
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: {
        location: true,
      },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const { longitude, latitude } = await formatLocation(
          property.location.id
        );

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      })
    );

    res.json(propertiesWithFormattedLocation);
  } catch (err) {
    next(err);
  }
};
