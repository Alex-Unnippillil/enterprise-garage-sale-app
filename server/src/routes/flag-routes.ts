import express from 'express';
import { getFlags, updateFlag } from '../controllers/flag-controllers';

const router = express.Router();

router.get('/', getFlags);
router.put('/:name', updateFlag);

export default router;
