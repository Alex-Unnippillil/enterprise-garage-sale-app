import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from "../controllers/messageControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Message routes
router.post("/send", authMiddleware(["tenant", "manager"]), sendMessage);
router.get("/conversations", authMiddleware(["tenant", "manager"]), getConversations);
router.get("/:conversationId", authMiddleware(["tenant", "manager"]), getMessages);
router.put("/read/:messageId", authMiddleware(["tenant", "manager"]), markAsRead);
router.delete("/:messageId", authMiddleware(["tenant", "manager"]), deleteMessage);
router.get("/unread/count", authMiddleware(["tenant", "manager"]), getUnreadCount);

export default router; 