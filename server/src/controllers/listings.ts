import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middleware/asyncHandler";

const prisma = new PrismaClient();

export const getListings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const listings = await prisma.listing.findMany();
    res.json(listings);
  }
);

export const getListing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id: Number(id) },
    });
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  }
);

export const createListing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description, price } = req.body;
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: Number(price),
      },
    });
    res.status(201).json(listing);
  }
);

export const updateListing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

export const deleteListing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await prisma.listing.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }
);
