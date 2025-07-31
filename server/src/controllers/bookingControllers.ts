import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a viewing request
export const createViewing = async (req: Request, res: Response) => {
  try {
    const { propertyId, preferredDate, preferredTime, notes, contactPreference } = req.body;
    const tenantCognitoId = req.user?.cognitoId;

    // Validate property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
      include: { manager: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ error: 'Property is not available for viewing' });
    }

    // Check for conflicting viewings
    const conflictingViewing = await prisma.viewing.findFirst({
      where: {
        propertyId: Number(propertyId),
        preferredDate: new Date(preferredDate),
        preferredTime,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    if (conflictingViewing) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const viewing = await prisma.viewing.create({
      data: {
        propertyId: Number(propertyId),
        tenantCognitoId,
        managerCognitoId: property.managerCognitoId,
        preferredDate: new Date(preferredDate),
        preferredTime,
        notes,
        contactPreference,
        status: 'Pending'
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Viewing request created successfully',
      viewing
    });
  } catch (error) {
    console.error('Error creating viewing:', error);
    res.status(500).json({ error: 'Failed to create viewing' });
  }
};

// Get all viewings for a user
export const getViewings = async (req: Request, res: Response) => {
  try {
    const { status, propertyId, page = 1, limit = 10 } = req.query;
    const userId = req.user?.cognitoId;
    const userType = req.user?.role;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (propertyId) where.propertyId = Number(propertyId);

    // Filter based on user type
    if (userType === 'tenant') {
      where.tenantCognitoId = userId;
    } else if (userType === 'manager') {
      where.managerCognitoId = userId;
    }

    const viewings = await prisma.viewing.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.viewing.count({ where });

    res.json({
      viewings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching viewings:', error);
    res.status(500).json({ error: 'Failed to fetch viewings' });
  }
};

// Get a single viewing
export const getViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.cognitoId;

    const viewing = await prisma.viewing.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true,
            description: true,
            pricePerMonth: true,
            amenities: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    // Check if user has permission to view this
    if (viewing.tenantCognitoId !== userId && viewing.managerCognitoId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(viewing);
  } catch (error) {
    console.error('Error fetching viewing:', error);
    res.status(500).json({ error: 'Failed to fetch viewing' });
  }
};

// Update viewing
export const updateViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { preferredDate, preferredTime, notes, contactPreference } = req.body;
    const userId = req.user?.cognitoId;

    const viewing = await prisma.viewing.findUnique({
      where: { id: Number(id) }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    // Check permissions
    if (viewing.tenantCognitoId !== userId && viewing.managerCognitoId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow updates if viewing is pending
    if (viewing.status !== 'Pending') {
      return res.status(400).json({ error: 'Cannot update confirmed or cancelled viewing' });
    }

    const updatedViewing = await prisma.viewing.update({
      where: { id: Number(id) },
      data: {
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        preferredTime,
        notes,
        contactPreference
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      message: 'Viewing updated successfully',
      viewing: updatedViewing
    });
  } catch (error) {
    console.error('Error updating viewing:', error);
    res.status(500).json({ error: 'Failed to update viewing' });
  }
};

// Cancel viewing
export const cancelViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.cognitoId;

    const viewing = await prisma.viewing.findUnique({
      where: { id: Number(id) }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    // Check permissions
    if (viewing.tenantCognitoId !== userId && viewing.managerCognitoId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow cancellation if viewing is pending or confirmed
    if (viewing.status === 'Cancelled') {
      return res.status(400).json({ error: 'Viewing is already cancelled' });
    }

    const updatedViewing = await prisma.viewing.update({
      where: { id: Number(id) },
      data: {
        status: 'Cancelled',
        cancellationReason: reason,
        cancelledAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      message: 'Viewing cancelled successfully',
      viewing: updatedViewing
    });
  } catch (error) {
    console.error('Error cancelling viewing:', error);
    res.status(500).json({ error: 'Failed to cancel viewing' });
  }
};

// Confirm viewing (manager only)
export const confirmViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { confirmedDate, confirmedTime, notes } = req.body;
    const managerCognitoId = req.user?.cognitoId;

    const viewing = await prisma.viewing.findUnique({
      where: { id: Number(id) }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    if (viewing.managerCognitoId !== managerCognitoId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (viewing.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only confirm pending viewings' });
    }

    const updatedViewing = await prisma.viewing.update({
      where: { id: Number(id) },
      data: {
        status: 'Confirmed',
        confirmedDate: confirmedDate ? new Date(confirmedDate) : viewing.preferredDate,
        confirmedTime: confirmedTime || viewing.preferredTime,
        managerNotes: notes,
        confirmedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      message: 'Viewing confirmed successfully',
      viewing: updatedViewing
    });
  } catch (error) {
    console.error('Error confirming viewing:', error);
    res.status(500).json({ error: 'Failed to confirm viewing' });
  }
};

// Get available time slots for a property
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const selectedDate = new Date(date as string);
    const dayOfWeek = selectedDate.getDay();

    // Define available time slots (9 AM to 6 PM, Monday to Friday)
    const availableSlots = [];
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      for (let hour = 9; hour <= 18; hour++) {
        availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        availableSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    // Get booked slots for this date
    const bookedViewings = await prisma.viewing.findMany({
      where: {
        propertyId: Number(propertyId),
        preferredDate: selectedDate,
        status: { in: ['Pending', 'Confirmed'] }
      },
      select: { preferredTime: true }
    });

    const bookedTimes = bookedViewings.map(v => v.preferredTime);

    // Filter out booked slots
    const availableTimes = availableSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({
      date: selectedDate,
      availableSlots: availableTimes,
      bookedSlots: bookedTimes
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
};

// Create virtual tour
export const createVirtualTour = async (req: Request, res: Response) => {
  try {
    const { propertyId, tourUrl, description, isActive = true } = req.body;
    const managerCognitoId = req.user?.cognitoId;

    // Verify property belongs to manager
    const property = await prisma.property.findFirst({
      where: {
        id: Number(propertyId),
        managerCognitoId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found or access denied' });
    }

    const virtualTour = await prisma.virtualTour.create({
      data: {
        propertyId: Number(propertyId),
        tourUrl,
        description,
        isActive,
        createdBy: managerCognitoId
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Virtual tour created successfully',
      virtualTour
    });
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    res.status(500).json({ error: 'Failed to create virtual tour' });
  }
};

// Get virtual tours
export const getVirtualTours = async (req: Request, res: Response) => {
  try {
    const { propertyId, isActive } = req.query;

    const where: any = {};
    if (propertyId) where.propertyId = Number(propertyId);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const virtualTours = await prisma.virtualTour.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ virtualTours });
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tours' });
  }
};

// Schedule follow-up
export const scheduleFollowUp = async (req: Request, res: Response) => {
  try {
    const { viewingId, followUpDate, followUpTime, notes, type } = req.body;
    const managerCognitoId = req.user?.cognitoId;

    const viewing = await prisma.viewing.findUnique({
      where: { id: Number(viewingId) }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    if (viewing.managerCognitoId !== managerCognitoId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const followUp = await prisma.followUp.create({
      data: {
        viewingId: Number(viewingId),
        followUpDate: new Date(followUpDate),
        followUpTime,
        notes,
        type,
        scheduledBy: managerCognitoId,
        status: 'Scheduled'
      },
      include: {
        viewing: {
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
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Follow-up scheduled successfully',
      followUp
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    res.status(500).json({ error: 'Failed to schedule follow-up' });
  }
}; 