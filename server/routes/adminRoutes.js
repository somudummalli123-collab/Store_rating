import express from 'express';
import {
  getDashboardStats,
  createStore,
  createUser,
  getStores,
  getUsers,
  getUserDetails
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateAdminUserCreation, validateStoreCreation } from '../middleware/validation.js';

const router = express.Router();

// Require ADMIN role for all routes in this file
router.use(verifyToken, requireRole(['ADMIN']));

router.get('/stats', getDashboardStats);
router.post('/stores', validateStoreCreation, createStore);
router.post('/users', validateAdminUserCreation, createUser);
router.get('/stores', getStores);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);

export default router;
