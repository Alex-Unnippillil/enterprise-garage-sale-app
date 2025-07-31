import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Get all documents for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let documents;
    
    if (userRole === 'manager') {
      // Managers can see all documents
      documents = await prisma.document.findMany({
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    } else {
      // Tenants can only see documents related to their properties or public documents
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

      documents = await prisma.document.findMany({
        where: {
          OR: [
            { propertyId: { in: propertyIds } },
            { isPublic: true }
          ]
        },
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    }

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload a new document
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description, category, type, isPublic, propertyId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const document = await prisma.document.create({
      data: {
        name,
        description,
        type,
        category,
        filePath: file.path,
        fileName: file.filename,
        fileSize: file.size,
        isPublic: isPublic === 'true',
        propertyId: propertyId ? parseInt(propertyId) : null,
        uploadedById: userId,
        uploadedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get a specific document
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check access permissions
    if (userRole !== 'manager') {
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
      const hasAccess = document.propertyId && propertyIds.includes(document.propertyId);

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Download a document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check access permissions
    if (userRole !== 'manager') {
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
      const hasAccess = document.isPublic || 
                       (document.propertyId && propertyIds.includes(document.propertyId));

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    // Send file
    res.sendFile(document.filePath, { root: '.' });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Update document metadata
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { name, description, category, type, isPublic } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Only the uploader or a manager can update the document
    if (document.uploadedById !== userId && req.user?.role !== 'manager') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        name,
        description,
        category,
        type,
        isPublic: isPublic === 'true'
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Only the uploader or a manager can delete the document
    if (document.uploadedById !== userId && req.user?.role !== 'manager') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete the file from storage
    const fs = require('fs');
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let stats;
    
    if (userRole === 'manager') {
      stats = await prisma.document.groupBy({
        by: ['category'],
        _count: {
          id: true
        }
      });
    } else {
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

      stats = await prisma.document.groupBy({
        by: ['category'],
        where: {
          OR: [
            { propertyId: { in: propertyIds } },
            { isPublic: true }
          ]
        },
        _count: {
          id: true
        }
      });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
});

export default router; 