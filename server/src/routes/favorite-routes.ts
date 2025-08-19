import express from 'express';
import {
  getFavorites,
  getFavorite,
  createFavorite,
  deleteFavorite,
} from '../controllers/favorite-controllers';

const router = express.Router();

router.get('/', getFavorites);
router.get('/:id', getFavorite);
router.post('/', createFavorite);
router.delete('/:id', deleteFavorite);

export default router;
