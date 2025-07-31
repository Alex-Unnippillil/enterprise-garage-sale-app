import { Request, Response } from "express";
import { PrismaClient, MessageStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, receiverId, receiverType, propertyId } = req.body;
    const senderId = req.user?.id;
    const senderType = req.user?.userRole?.toLowerCase() || "tenant";

    if (!content || !receiverId || !receiverType) {
      res.status(400).json({ message: "Content, receiverId, and receiverType are required" });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        senderType,
        receiverId,
        receiverType,
        status: MessageStatus.Sent,
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        title: "New Message",
        message: `You have a new message from ${senderType === "tenant" ? "your tenant" : "your property manager"}`,
        type: "Message",
        userId: receiverId,
        userType: receiverType,
        actionUrl: `/messages/${senderId}`,
      },
    });

    res.json(message);
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userRole?.toLowerCase() || "tenant";

    // Get all conversations for the user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        senderTenant: {
          select: { name: true, email: true },
        },
        receiverTenant: {
          select: { name: true, email: true },
        },
        senderManager: {
          select: { name: true, email: true },
        },
        receiverManager: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["senderId", "receiverId"],
    });

    // Group conversations by the other participant
    const conversationMap = new Map();
    conversations.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUserType = message.senderId === userId ? message.receiverType : message.senderType;
      
      if (!conversationMap.has(otherUserId)) {
        const otherUser = message.senderId === userId 
          ? (message.receiverTenant || message.receiverManager)
          : (message.senderTenant || message.senderManager);
        
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userType: otherUserType,
          name: otherUser?.name || "Unknown User",
          email: otherUser?.email || "",
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0, // Will be calculated separately
        });
      }
    });

    // Get unread counts for each conversation
    for (const [otherUserId, conversation] of conversationMap) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          status: MessageStatus.Sent,
        },
      });
      conversation.unreadCount = unreadCount;
    }

    res.json(Array.from(conversationMap.values()));
  } catch (error: any) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: conversationId },
          { senderId: conversationId, receiverId: userId },
        ],
      },
      include: {
        senderTenant: {
          select: { name: true, email: true },
        },
        receiverTenant: {
          select: { name: true, email: true },
        },
        senderManager: {
          select: { name: true, email: true },
        },
        receiverManager: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: parseInt(limit as string),
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: conversationId,
        receiverId: userId,
        status: MessageStatus.Sent,
      },
      data: {
        status: MessageStatus.Read,
        readAt: new Date(),
      },
    });

    res.json(messages);
  } catch (error: any) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message || message.receiverId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: {
        status: MessageStatus.Read,
        readAt: new Date(),
      },
    });

    res.json(updatedMessage);
  } catch (error: any) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark message as read" });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message || message.senderId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await prisma.message.delete({
      where: { id: parseInt(messageId) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        status: MessageStatus.Sent,
      },
    });

    res.json({ unreadCount });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
}; 