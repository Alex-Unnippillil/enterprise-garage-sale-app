import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/property-controllers";
import multer from "multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../utils/s3-upload";

const storage = multer.memoryStorage();
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
