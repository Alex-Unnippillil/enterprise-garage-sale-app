import { Request, Response, NextFunction } from "express";
import { createUserSchema, updateUserSchema } from "../validators/user-validators";
import { formatLocation } from "../utils/format-location";
import prisma from "../utils/prisma";


export const getTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (
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

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
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

    const updateTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateTenant);
  } catch (error) {
    next(error);
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { tenants: { some: { cognitoId } } },
      include: {
        location: true,
      },
    });

    const residencesWithFormattedLocation = await Promise.all(
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

    res.json(residencesWithFormattedLocation);
  } catch (err) {
    next(err);
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err) {
    next(err);
  }
};
