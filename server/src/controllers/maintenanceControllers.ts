import { Request, Response } from "express";
import { PrismaClient, MaintenanceStatus, MaintenancePriority } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createMaintenanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      priority,
      propertyId,
      scheduledDate,
      estimatedCost,
    } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.userRole?.toLowerCase() || "tenant";

    if (!title || !description || !propertyId) {
      res.status(400).json({ message: "Title, description, and propertyId are required" });
      return;
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        priority: priority || MaintenancePriority.Medium,
        propertyId: parseInt(propertyId),
        tenantCognitoId: userType === "tenant" ? userId : null,
        managerCognitoId: userType === "manager" ? userId : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    // Create notification for property manager
    if (userType === "tenant") {
      const property = await prisma.property.findUnique({
        where: { id: parseInt(propertyId) },
        include: { manager: true },
      });

      if (property?.manager) {
        await prisma.notification.create({
          data: {
            title: "New Maintenance Request",
            message: `New maintenance request: ${title}`,
            type: "Maintenance",
            userId: property.manager.cognitoId,
            userType: "manager",
            actionUrl: `/maintenance/${maintenanceRequest.id}`,
          },
        });
      }
    }

    res.json(maintenanceRequest);
  } catch (error: any) {
    console.error("Create maintenance request error:", error);
    res.status(500).json({ message: "Failed to create maintenance request" });
  }
};

export const getMaintenanceRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userRole?.toLowerCase() || "tenant";
    const { status, priority, propertyId, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (propertyId) whereClause.propertyId = parseInt(propertyId as string);

    if (userType === "tenant") {
      whereClause.tenantCognitoId = userId;
    } else if (userType === "manager") {
      whereClause.managerCognitoId = userId;
    }

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.maintenanceRequest.count({
      where: whereClause,
    });

    res.json({
      maintenanceRequests,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error("Get maintenance requests error:", error);
    res.status(500).json({ message: "Failed to fetch maintenance requests" });
  }
};

export const getMaintenanceRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    if (!maintenanceRequest) {
      res.status(404).json({ message: "Maintenance request not found" });
      return;
    }

    // Check if user has access to this maintenance request
    if (
      maintenanceRequest.tenantCognitoId !== userId &&
      maintenanceRequest.managerCognitoId !== userId
    ) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.json(maintenanceRequest);
  } catch (error: any) {
    console.error("Get maintenance request error:", error);
    res.status(500).json({ message: "Failed to fetch maintenance request" });
  }
};

export const updateMaintenanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      scheduledDate,
      estimatedCost,
    } = req.body;
    const userId = req.user?.id;

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!maintenanceRequest) {
      res.status(404).json({ message: "Maintenance request not found" });
      return;
    }

    // Check if user has permission to update
    if (
      maintenanceRequest.tenantCognitoId !== userId &&
      maintenanceRequest.managerCognitoId !== userId
    ) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        priority,
        status,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    res.json(updatedRequest);
  } catch (error: any) {
    console.error("Update maintenance request error:", error);
    res.status(500).json({ message: "Failed to update maintenance request" });
  }
};

export const deleteMaintenanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!maintenanceRequest) {
      res.status(404).json({ message: "Maintenance request not found" });
      return;
    }

    // Only the creator can delete the request
    if (
      maintenanceRequest.tenantCognitoId !== userId &&
      maintenanceRequest.managerCognitoId !== userId
    ) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await prisma.maintenanceRequest.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete maintenance request error:", error);
    res.status(500).json({ message: "Failed to delete maintenance request" });
  }
};

export const assignMaintenanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        managerCognitoId: assignedTo,
        status: MaintenanceStatus.InProgress,
      },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    // Create notification for assigned manager
    await prisma.notification.create({
      data: {
        title: "Maintenance Request Assigned",
        message: `You have been assigned a maintenance request: ${maintenanceRequest.title}`,
        type: "Maintenance",
        userId: assignedTo,
        userType: "manager",
        actionUrl: `/maintenance/${id}`,
      },
    });

    res.json(maintenanceRequest);
  } catch (error: any) {
    console.error("Assign maintenance request error:", error);
    res.status(500).json({ message: "Failed to assign maintenance request" });
  }
};

export const completeMaintenanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { completionNotes } = req.body;

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: MaintenanceStatus.Completed,
        completedDate: new Date(),
      },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    // Create notification for tenant
    if (maintenanceRequest.tenantCognitoId) {
      await prisma.notification.create({
        data: {
          title: "Maintenance Completed",
          message: `Your maintenance request has been completed: ${maintenanceRequest.title}`,
          type: "Maintenance",
          userId: maintenanceRequest.tenantCognitoId,
          userType: "tenant",
          actionUrl: `/maintenance/${id}`,
        },
      });
    }

    res.json(maintenanceRequest);
  } catch (error: any) {
    console.error("Complete maintenance request error:", error);
    res.status(500).json({ message: "Failed to complete maintenance request" });
  }
};

export const uploadMaintenancePhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: `maintenance/${id}/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      })
    );

    // Update maintenance request with new photos
    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        photos: {
          push: photoUrls,
        },
      },
      include: {
        property: {
          include: {
            location: true,
          },
        },
        tenant: true,
        manager: true,
      },
    });

    res.json(maintenanceRequest);
  } catch (error: any) {
    console.error("Upload maintenance photos error:", error);
    res.status(500).json({ message: "Failed to upload photos" });
  }
}; 