import express from 'express';
import { getMessages } from '../controllers/message-controllers';
import { authMiddleware } from '../middleware/auth-middleware';

const router = express.Router();

router.get('/:conversationId', authMiddleware(['tenant', 'manager']), getMessages);

export default router;
