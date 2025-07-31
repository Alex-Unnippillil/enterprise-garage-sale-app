import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';
import { addMonths, addDays, addYears } from 'date-fns';

const router = express.Router();
const prisma = new PrismaClient();

// Get all scheduled maintenance for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let scheduledMaintenance;
    
    if (userRole === 'manager') {
      // Managers can see all scheduled maintenance
      scheduledMaintenance = await prisma.scheduledMaintenance.findMany({
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          },
          tasks: {
            orderBy: {
              dueDate: 'desc'
            }
          }
        },
        orderBy: {
          nextDue: 'asc'
        }
      });
    } else {
      // Tenants can only see scheduled maintenance for their properties
      const tenantProperties = await prisma.lease.findMany({
        where: {
          tenant: {
            cognitoId: userId
          }
        },
        select: {
          propertyId: true
        }
      });

      const propertyIds = tenantProperties.map(lease => lease.propertyId);

      scheduledMaintenance = await prisma.scheduledMaintenance.findMany({
        where: {
          propertyId: { in: propertyIds }
        },
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          },
          tasks: {
            orderBy: {
              dueDate: 'desc'
            }
          }
        },
        orderBy: {
          nextDue: 'asc'
        }
      });
    }

    res.json({ scheduledMaintenance });
  } catch (error) {
    console.error('Error fetching scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled maintenance' });
  }
});

// Create new scheduled maintenance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      title,
      description,
      propertyId,
      frequency,
      interval,
      nextDue,
      estimatedCost,
      priority,
      category,
      assignedTo,
      notes
    } = req.body;

    const scheduledMaintenance = await prisma.scheduledMaintenance.create({
      data: {
        title,
        description,
        propertyId: parseInt(propertyId),
        frequency,
        interval: parseInt(interval),
        nextDue: new Date(nextDue),
        estimatedCost: parseFloat(estimatedCost),
        priority,
        category,
        assignedTo,
        notes,
        isActive: true,
        createdById: userId,
        createdAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ scheduledMaintenance });
  } catch (error) {
    console.error('Error creating scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to create scheduled maintenance' });
  }
});

// Get specific scheduled maintenance
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const maintenanceId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const scheduledMaintenance = await prisma.scheduledMaintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        completedTasks: {
          orderBy: {
            dueDate: 'desc'
          }
        }
      }
    });

    if (!scheduledMaintenance) {
      return res.status(404).json({ error: 'Scheduled maintenance not found' });
    }

    // Check access permissions for tenants
    if (userRole !== 'manager') {
      const tenantProperties = await prisma.lease.findMany({
        where: {
          tenantId: userId
        },
        select: {
          propertyId: true
        }
      });

      const propertyIds = tenantProperties.map(lease => lease.propertyId);
      if (!propertyIds.includes(scheduledMaintenance.propertyId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ scheduledMaintenance });
  } catch (error) {
    console.error('Error fetching scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled maintenance' });
  }
});

// Update scheduled maintenance
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const maintenanceId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const {
      title,
      description,
      frequency,
      interval,
      nextDue,
      estimatedCost,
      priority,
      category,
      assignedTo,
      notes,
      isActive
    } = req.body;

    const existingMaintenance = await prisma.scheduledMaintenance.findUnique({
      where: { id: maintenanceId }
    });

    if (!existingMaintenance) {
      return res.status(404).json({ error: 'Scheduled maintenance not found' });
    }

    // Only managers can update scheduled maintenance
    if (userRole !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedMaintenance = await prisma.scheduledMaintenance.update({
      where: { id: maintenanceId },
      data: {
        title,
        description,
        frequency,
        interval: parseInt(interval),
        nextDue: new Date(nextDue),
        estimatedCost: parseFloat(estimatedCost),
        priority,
        category,
        assignedTo,
        notes,
        isActive: isActive === 'true',
        updatedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ scheduledMaintenance: updatedMaintenance });
  } catch (error) {
    console.error('Error updating scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to update scheduled maintenance' });
  }
});

// Mark scheduled maintenance as complete
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const maintenanceId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { notes, cost } = req.body;

    const scheduledMaintenance = await prisma.scheduledMaintenance.findUnique({
      where: { id: maintenanceId }
    });

    if (!scheduledMaintenance) {
      return res.status(404).json({ error: 'Scheduled maintenance not found' });
    }

    // Only managers can mark maintenance as complete
    if (userRole !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create a completed task record
    const completedTask = await prisma.scheduledMaintenanceTask.create({
      data: {
        scheduledMaintenanceId: maintenanceId,
        dueDate: scheduledMaintenance.nextDue,
        completedDate: new Date(),
        status: 'completed',
        notes,
        cost: cost ? parseFloat(cost) : null,
        performedBy: userId
      }
    });

    // Calculate next due date based on frequency
    let nextDueDate = new Date(scheduledMaintenance.nextDue);
    switch (scheduledMaintenance.frequency) {
      case 'monthly':
        nextDueDate = addMonths(nextDueDate, scheduledMaintenance.interval);
        break;
      case 'quarterly':
        nextDueDate = addMonths(nextDueDate, scheduledMaintenance.interval * 3);
        break;
      case 'yearly':
        nextDueDate = addYears(nextDueDate, scheduledMaintenance.interval);
        break;
      case 'custom':
        nextDueDate = addDays(nextDueDate, scheduledMaintenance.interval);
        break;
    }

    // Update the scheduled maintenance with new due date and last performed
    const updatedMaintenance = await prisma.scheduledMaintenance.update({
      where: { id: maintenanceId },
      data: {
        lastPerformed: new Date(),
        nextDue: nextDueDate,
        updatedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        completedTasks: {
          orderBy: {
            dueDate: 'desc'
          }
        }
      }
    });

    res.json({ 
      scheduledMaintenance: updatedMaintenance,
      completedTask 
    });
  } catch (error) {
    console.error('Error completing scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to complete scheduled maintenance' });
  }
});

// Delete scheduled maintenance
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const maintenanceId = parseInt(req.params.id);
    const userRole = req.user?.role;

    const scheduledMaintenance = await prisma.scheduledMaintenance.findUnique({
      where: { id: maintenanceId }
    });

    if (!scheduledMaintenance) {
      return res.status(404).json({ error: 'Scheduled maintenance not found' });
    }

    // Only managers can delete scheduled maintenance
    if (userRole !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete associated tasks first
    await prisma.scheduledMaintenanceTask.deleteMany({
      where: { scheduledMaintenanceId: maintenanceId }
    });

    // Delete the scheduled maintenance
    await prisma.scheduledMaintenance.delete({
      where: { id: maintenanceId }
    });

    res.json({ message: 'Scheduled maintenance deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled maintenance:', error);
    res.status(500).json({ error: 'Failed to delete scheduled maintenance' });
  }
});

// Get scheduled maintenance statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let stats;
    
    if (userRole === 'manager') {
      stats = await prisma.scheduledMaintenance.groupBy({
        by: ['category'],
        _count: {
          id: true
        }
      });
    } else {
      const tenantProperties = await prisma.lease.findMany({
        where: {
          tenantId: userId
        },
        select: {
          propertyId: true
        }
      });

      const propertyIds = tenantProperties.map(lease => lease.propertyId);

      stats = await prisma.scheduledMaintenance.groupBy({
        by: ['category'],
        where: {
          propertyId: { in: propertyIds }
        },
        _count: {
          id: true
        }
      });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching scheduled maintenance stats:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled maintenance statistics' });
  }
});

export default router; 