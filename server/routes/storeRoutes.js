import express from 'express';
import { getStoresForUser, submitOrUpdateRating } from '../controllers/storeController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Available for NORMAL_USER (and ADMIN for viewing)
router.use(verifyToken);

router.get('/', getStoresForUser);
router.post('/:storeId/rate', requireRole(['NORMAL_USER']), submitOrUpdateRating);

export default router;
