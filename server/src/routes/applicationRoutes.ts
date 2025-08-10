import express from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
} from "../controllers/applicationControllers";
import { validate } from "../middleware/validationMiddleware";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["tenant"]),
  [
    body("applicationDate").isISO8601(),
    body("status").isIn(["Pending", "Approved", "Denied"]),
    body("propertyId").isInt().toInt(),
    body("tenantCognitoId").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("phoneNumber").isString().notEmpty(),
    body("message").optional().isString(),
    validate,
  ],
  createApplication
);
router.put(
  "/:id/status",
  authMiddleware(["manager"]),
  [
    param("id").isInt().toInt(),
    body("status").isIn(["Pending", "Approved", "Denied"]),
    validate,
  ],
  updateApplicationStatus
);
router.get(
  "/",
  authMiddleware(["manager", "tenant"]),
  [
    query("userId").optional().isString(),
    query("userType").optional().isIn(["tenant", "manager"]),
    validate,
  ],
  listApplications
);

export default router;
