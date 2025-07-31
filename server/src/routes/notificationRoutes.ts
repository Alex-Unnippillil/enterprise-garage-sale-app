import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
} from "../controllers/notificationControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Notification routes
router.get("/", authMiddleware(["tenant", "manager"]), getNotifications);
router.put("/read/:id", authMiddleware(["tenant", "manager"]), markAsRead);
router.put("/read-all", authMiddleware(["tenant", "manager"]), markAllAsRead);
router.delete("/:id", authMiddleware(["tenant", "manager"]), deleteNotification);
router.get("/unread/count", authMiddleware(["tenant", "manager"]), getUnreadCount);
router.post("/", authMiddleware(["manager"]), createNotification);

export default router; 