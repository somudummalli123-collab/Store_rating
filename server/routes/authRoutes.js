import express from 'express';
import { login, signup, logout, updatePassword, getProfile } from '../controllers/authController.js';
import { validateUserRegistration } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', validateUserRegistration, signup);
router.post('/logout', verifyToken, logout);
router.post('/update-password', verifyToken, updatePassword);
router.get('/me', verifyToken, getProfile);

export default router;
