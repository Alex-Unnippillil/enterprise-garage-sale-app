import { Request, Response } from "express";
import { PrismaClient, DocumentType } from "@prisma/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Get all documents with filtering
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type, propertyId, leaseId, signed } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type as DocumentType;
    if (propertyId) where.propertyId = Number(propertyId);
    if (leaseId) where.leaseId = Number(leaseId);
    if (signed !== undefined) where.isSigned = signed === 'true';

    const documents = await prisma.document.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { uploadedAt: 'desc' }
    });

    const total = await prisma.document.count({ where });

    res.json({
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Get a single document
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

// Upload documents
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { type, propertyId, leaseId, title } = req.body;
    const files = req.files as Express.Multer.File[];
    const uploadedBy = req.user?.cognitoId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedDocuments = [];

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.originalname}`;
      const key = `documents/${type}/${fileName}`;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy,
          type
        }
      });

      await s3Client.send(uploadCommand);

      // Save to database
      const document = await prisma.document.create({
        data: {
          title: title || file.originalname,
          type: type as DocumentType,
          fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`,
          fileName: file.originalname,
          fileSize: file.size,
          propertyId: propertyId ? Number(propertyId) : null,
          leaseId: leaseId ? Number(leaseId) : null,
          uploadedBy
        },
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          },
          lease: {
            select: {
              id: true,
              startDate: true,
              endDate: true
            }
          }
        }
      });

      uploadedDocuments.push(document);
    }

    res.status(201).json({
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      documents: uploadedDocuments
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

// Update document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        title,
        type: type as DocumentType
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from S3
    const key = document.fileUrl.split('.com/')[1];
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key
    });

    await s3Client.send(deleteCommand);

    // Delete from database
    await prisma.document.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Sign document
export const signDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signatureUrl } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        isSigned: true,
        signedAt: new Date(),
        signatureUrl
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
};

// Get documents by type
export const getDocumentsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const documents = await prisma.document.findMany({
      where: { type: type as DocumentType },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { uploadedAt: 'desc' }
    });

    const total = await prisma.document.count({
      where: { type: type as DocumentType }
    });

    res.json({
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents by type:', error);
    res.status(500).json({ error: 'Failed to fetch documents by type' });
  }
};

// Get documents by property
export const getDocumentsByProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { propertyId: Number(propertyId) };
    if (type) where.type = type as DocumentType;

    const documents = await prisma.document.findMany({
      where,
      include: {
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { uploadedAt: 'desc' }
    });

    const total = await prisma.document.count({ where });

    res.json({
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents by property:', error);
    res.status(500).json({ error: 'Failed to fetch documents by property' });
  }
};

// Get documents by lease
export const getDocumentsByLease = async (req: Request, res: Response) => {
  try {
    const { leaseId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { leaseId: Number(leaseId) };
    if (type) where.type = type as DocumentType;

    const documents = await prisma.document.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { uploadedAt: 'desc' }
    });

    const total = await prisma.document.count({ where });

    res.json({
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents by lease:', error);
    res.status(500).json({ error: 'Failed to fetch documents by lease' });
  }
}; 