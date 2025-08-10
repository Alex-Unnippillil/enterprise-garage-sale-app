import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany();
    res.json(listings);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving listings: ${error.message}` });
  }
};

export const getListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = matchedData(req) as { id: number };
    const listing = await prisma.listing.findUnique({
      where: { id },
    });
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving listing: ${error.message}` });
  }
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = matchedData(req) as {
      title: string;
      description: string;
      price: number;
    };
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
      },
    });
    res.status(201).json(listing);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating listing: ${error.message}` });
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, title, description, price } = matchedData(req) as {
      id: number;
      title: string;
      description: string;
      price: number;
    };
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price,
      },
    });
    res.json(listing);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating listing: ${error.message}` });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = matchedData(req) as { id: number };
    await prisma.listing.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error deleting listing: ${error.message}` });
  }
};
