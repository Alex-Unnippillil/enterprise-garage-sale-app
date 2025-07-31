import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all reviews (with pagination and filtering)
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, propertyId, rating, verified } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (propertyId) where.propertyId = Number(propertyId);
    if (rating) where.rating = Number(rating);
    if (verified !== undefined) where.isVerified = verified === 'true';

    const reviews = await prisma.review.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({ where });

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get a single review
export const getReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// Create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const tenantCognitoId = req.user?.cognitoId;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if tenant has already reviewed this property
    const existingReview = await prisma.review.findFirst({
      where: {
        propertyId: Number(propertyId),
        tenantCognitoId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this property' });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        propertyId: Number(propertyId),
        tenantCognitoId
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update property average rating
    await updatePropertyRating(Number(propertyId));

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const tenantCognitoId = req.user?.cognitoId;

    const review = await prisma.review.findUnique({
      where: { id: Number(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.tenantCognitoId !== tenantCognitoId) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        rating: Number(rating),
        comment
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update property average rating
    await updatePropertyRating(review.propertyId);

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantCognitoId = req.user?.cognitoId;

    const review = await prisma.review.findUnique({
      where: { id: Number(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.tenantCognitoId !== tenantCognitoId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({
      where: { id: Number(id) }
    });

    // Update property average rating
    await updatePropertyRating(review.propertyId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get reviews for a specific property
export const getPropertyReviews = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { propertyId: Number(propertyId) };
    if (rating) where.rating = Number(rating);

    const reviews = await prisma.review.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({ where });

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    res.status(500).json({ error: 'Failed to fetch property reviews' });
  }
};

// Get average rating for a property
export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const result = await prisma.review.aggregate({
      where: { propertyId: Number(propertyId) },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ error: 'Failed to fetch average rating' });
  }
};

// Verify a review (manager only)
export const verifyReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: Number(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: { isVerified: true },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error verifying review:', error);
    res.status(500).json({ error: 'Failed to verify review' });
  }
};

// Helper function to update property average rating
async function updatePropertyRating(propertyId: number) {
  const result = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      averageRating: result._avg.rating || 0,
      numberOfReviews: result._count.rating
    }
  });
} 