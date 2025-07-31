import express from "express";
import {
  createViewing,
  getViewings,
  getViewing,
  updateViewing,
  cancelViewing,
  confirmViewing,
  getAvailableSlots,
  createVirtualTour,
  getVirtualTours,
  scheduleFollowUp
} from "../controllers/bookingControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Viewing management
router.get("/viewings", authMiddleware(["tenant", "manager"]), getViewings);
router.get("/viewings/:id", authMiddleware(["tenant", "manager"]), getViewing);
router.post("/viewings", authMiddleware(["tenant"]), createViewing);
router.put("/viewings/:id", authMiddleware(["tenant", "manager"]), updateViewing);
router.delete("/viewings/:id", authMiddleware(["tenant", "manager"]), cancelViewing);
router.patch("/viewings/:id/confirm", authMiddleware(["manager"]), confirmViewing);

// Available slots
router.get("/slots/:propertyId", getAvailableSlots);

// Virtual tours
router.get("/virtual-tours", getVirtualTours);
router.post("/virtual-tours", authMiddleware(["manager"]), createVirtualTour);

// Follow-up scheduling
router.post("/follow-up", authMiddleware(["manager"]), scheduleFollowUp);

export default router; 