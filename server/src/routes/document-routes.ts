import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth-middleware';
import { virusScan } from '../middleware/virus-scan';
import { uploadDocument, getDocumentUrl } from '../controllers/document-controllers';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/', authMiddleware(['manager', 'tenant']), upload.single('file'), virusScan, uploadDocument);
router.get('/:id/url', authMiddleware(['manager', 'tenant']), getDocumentUrl);

export default router;
