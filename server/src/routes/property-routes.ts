import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/property-controllers';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth-middleware';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../utils/s3-upload';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', authMiddleware(['manager']), upload.array('photos'), createProperty);
router.put('/:id', authMiddleware(['manager']), updateProperty);
router.delete('/:id', authMiddleware(['manager']), deleteProperty);

export default router;
