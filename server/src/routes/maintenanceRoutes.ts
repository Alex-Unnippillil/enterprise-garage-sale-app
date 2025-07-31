import express from "express";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequestById,
  assignMaintenanceRequest,
  completeMaintenanceRequest,
  uploadMaintenancePhotos,
} from "../controllers/maintenanceControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Maintenance routes
router.post("/", authMiddleware(["tenant", "manager"]), createMaintenanceRequest);
router.get("/", authMiddleware(["tenant", "manager"]), getMaintenanceRequests);
router.get("/:id", authMiddleware(["tenant", "manager"]), getMaintenanceRequestById);
router.put("/:id", authMiddleware(["tenant", "manager"]), updateMaintenanceRequest);
router.delete("/:id", authMiddleware(["tenant", "manager"]), deleteMaintenanceRequest);
router.put("/:id/assign", authMiddleware(["manager"]), assignMaintenanceRequest);
router.put("/:id/complete", authMiddleware(["manager"]), completeMaintenanceRequest);
router.post("/:id/photos", authMiddleware(["tenant", "manager"]), uploadMaintenancePhotos);

export default router; 