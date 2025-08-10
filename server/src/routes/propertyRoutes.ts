import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../services/propertyService";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const properties = await getProperties(req.query);
    res.json(properties);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const property = await getProperty(Number(req.params.id));
    res.json(property);
  })
);

router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  asyncHandler(async (req, res) => {
    const newProperty = await createProperty(
      req.body,
      req.files as Express.Multer.File[]
    );
    res.status(201).json(newProperty);
  })
);

export default router;
