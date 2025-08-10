import express from "express";
import { body, param } from "express-validator";
import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/tenantControllers";
import { validate } from "../middleware/validationMiddleware";

const router = express.Router();

router.get(
  "/:cognitoId",
  [param("cognitoId").isString().notEmpty(), validate],
  getTenant
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
  updateTenant
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
  createTenant
);
router.get(
  "/:cognitoId/current-residences",
  [param("cognitoId").isString().notEmpty(), validate],
  getCurrentResidences
);
router.post(
  "/:cognitoId/favorites/:propertyId",
  [
    param("cognitoId").isString().notEmpty(),
    param("propertyId").isInt().toInt(),
    validate,
  ],
  addFavoriteProperty
);
router.delete(
  "/:cognitoId/favorites/:propertyId",
  [
    param("cognitoId").isString().notEmpty(),
    param("propertyId").isInt().toInt(),
    validate,
  ],
  removeFavoriteProperty
);

export default router;
