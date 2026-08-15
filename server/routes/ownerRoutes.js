import express from 'express';
import { getOwnerDashboard } from '../controllers/ownerController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole(['STORE_OWNER']));

router.get('/dashboard', getOwnerDashboard);

export default router;
