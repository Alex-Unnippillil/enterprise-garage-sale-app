import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property-controllers";
import multer from "multer";
import { authMiddleware } from "../middleware/auth-middleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);
router.put("/:id", authMiddleware(["manager"]), updateProperty);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);

export default router;
