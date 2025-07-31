import express from "express";
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getPropertyReviews,
  getAverageRating,
  verifyReview
} from "../controllers/reviewControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/property/:propertyId", getPropertyReviews);
router.get("/property/:propertyId/average", getAverageRating);

// Protected routes
router.get("/", authMiddleware(["tenant", "manager"]), getReviews);
router.get("/:id", authMiddleware(["tenant", "manager"]), getReview);
router.post("/", authMiddleware(["tenant"]), createReview);
router.put("/:id", authMiddleware(["tenant"]), updateReview);
router.delete("/:id", authMiddleware(["tenant"]), deleteReview);
router.patch("/:id/verify", authMiddleware(["manager"]), verifyReview);

export default router; 