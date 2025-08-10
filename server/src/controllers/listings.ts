import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CacheEntry {
  data: any;
  total: number;
  timestamp: number;
}

const CACHE_TTL = 60 * 1000; // 60 seconds
const cache = new Map<string, CacheEntry>();

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "asc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      100
    );
    const min = minPrice !== undefined ? Number(minPrice) : undefined;
    const max = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if ((min !== undefined && isNaN(min)) || (max !== undefined && isNaN(max))) {
      res.status(400).json({ message: "Invalid price filter" });
      return;
    }

    const cacheKey = JSON.stringify({
      q,
      min,
      max,
      sortBy,
      order,
      page: pageNum,
      limit: limitNum,
    });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.set({
        "X-Total-Count": cached.total.toString(),
        "X-Page-Count": Math.ceil(cached.total / limitNum).toString(),
        "X-Current-Page": pageNum.toString(),
      });
      res.json(cached.data);
      return;
    }

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: "insensitive" } },
        { description: { contains: q as string, mode: "insensitive" } },
      ];
    }
    if (min !== undefined || max !== undefined) {
      where.price = {};
      if (min !== undefined) where.price.gte = min;
      if (max !== undefined) where.price.lte = max;
    }

    const skip = (pageNum - 1) * limitNum;
    const [listings, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order },
      }),
      prisma.listing.count({ where }),
    ]);

    res.set({
      "X-Total-Count": total.toString(),
      "X-Page-Count": Math.ceil(total / limitNum).toString(),
      "X-Current-Page": pageNum.toString(),
    });

    cache.set(cacheKey, { data: listings, total, timestamp: Date.now() });

    res.json(listings);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving listings: ${error.message}` });
  }
};

export const getListing = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving listing: ${error.message}` });
  }
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const priceNum = Number(price);
    if (!title || !description || isNaN(priceNum) || priceNum <= 0) {
      res.status(400).json({ message: "Invalid listing data" });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: priceNum,
      },
    });
    cache.clear();
    res.status(201).json(listing);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating listing: ${error.message}` });
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;
    const priceNum = Number(price);
    if (!title || !description || isNaN(priceNum) || priceNum <= 0) {
      res.status(400).json({ message: "Invalid listing data" });
      return;
    }

    const listing = await prisma.listing.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price: priceNum,
      },
    });
    cache.clear();
    res.json(listing);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating listing: ${error.message}` });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.listing.delete({ where: { id: Number(id) } });
    cache.clear();
    res.status(204).send();
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error deleting listing: ${error.message}` });
  }
};
