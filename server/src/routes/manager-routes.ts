import express from "express";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
} from "../controllers/manager-controllers";
import { getAnalytics } from "../controllers/analytics-controllers";

const router = express.Router();

router.get("/:cognitoId", getManager);
router.put("/:cognitoId", updateManager);
router.get("/:cognitoId/properties", getManagerProperties);
router.get("/:cognitoId/analytics", getAnalytics);
router.post("/", createManager);

export default router;
