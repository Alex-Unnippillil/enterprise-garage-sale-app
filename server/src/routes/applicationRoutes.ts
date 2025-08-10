import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
} from "../controllers/applicationControllers";
import { validateBody, validateQuery } from "../middleware/validationMiddleware";
import {
  applicationSchema,
  applicationStatusSchema,
  applicationListQuerySchema,
} from "../validation/applicationSchema";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["tenant"]),
  validateBody(applicationSchema),
  createApplication
);
router.put(
  "/:id/status",
  authMiddleware(["manager"]),
  validateBody(applicationStatusSchema),
  updateApplicationStatus
);
router.get(
  "/",
  authMiddleware(["manager", "tenant"]),
  validateQuery(applicationListQuerySchema),
  listApplications
);

export default router;
