import express from "express";
import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/tenantControllers";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/:cognitoId", authMiddleware(["tenant"]), getTenant);
router.put("/:cognitoId", authMiddleware(["tenant"]), updateTenant);
router.post("/", authMiddleware(["tenant"]), createTenant);
router.get(
  "/:cognitoId/current-residences",
  authMiddleware(["tenant"]),
  getCurrentResidences
);
router.post(
  "/:cognitoId/favorites/:propertyId",
  authMiddleware(["tenant"]),
  addFavoriteProperty
);
router.delete(
  "/:cognitoId/favorites/:propertyId",
  authMiddleware(["tenant"]),
  removeFavoriteProperty
);

export default router;
