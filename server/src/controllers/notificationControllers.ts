import { Request, Response } from "express";
import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const whereClause: any = {
      userId,
    };

    if (type) {
      whereClause.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.notification.count({
      where: whereClause,
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification || notification.userId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(updatedNotification);
  } catch (error: any) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification || notification.userId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      message,
      type,
      userId,
      userType,
      actionUrl,
      metadata,
    } = req.body;

    if (!title || !message || !type || !userId || !userType) {
      res.status(400).json({ message: "Title, message, type, userId, and userType are required" });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type as NotificationType,
        userId,
        userType,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    res.json(notification);
  } catch (error: any) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
}; 