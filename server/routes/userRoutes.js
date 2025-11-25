import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getUser,
  createOrUpdateUser,
  updateUser,
  getAllUsers
} from '../controllers/userController.js';

const router = express.Router();

// Get current user
router.get('/me', authenticateUser, getUser);

// Create or update user (called after Clerk signup)
router.post('/sync', authenticateUser, createOrUpdateUser);

// Update user
router.put('/update', authenticateUser, updateUser);

// Get all users (admin only)
router.get('/all', authenticateUser, getAllUsers);

export default router;

