import express from "express";
import { body, param } from "express-validator";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
} from "../controllers/managerControllers";
import { validate } from "../middleware/validationMiddleware";

const router = express.Router();

router.get(
  "/:cognitoId",
  [param("cognitoId").isString().notEmpty(), validate],
  getManager
);
router.put(
  "/:cognitoId",
  [
    param("cognitoId").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("phoneNumber").isString().notEmpty(),
    validate,
  ],
  updateManager
);
router.get(
  "/:cognitoId/properties",
  [param("cognitoId").isString().notEmpty(), validate],
  getManagerProperties
);
router.post(
  "/",
  [
    body("cognitoId").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("phoneNumber").isString().notEmpty(),
    validate,
  ],
  createManager
);

export default router;
