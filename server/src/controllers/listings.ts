import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

export const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany();
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id: Number(id) },
    });
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: Number(price),
      },
    });
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;
    const listing = await prisma.listing.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price: Number(price),
      },
    });
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.listing.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
