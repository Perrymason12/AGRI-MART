import express from 'express';
import { authenticateUser, isOwner } from '../middleware/auth.js';
import {
  getCategoriesAndTypes,
  addCategoryType,
  updateCategoryType,
  deleteCategoryType
} from '../controllers/categoryTypeController.js';

const router = express.Router();

// Public route - get all categories and types
router.get('/', getCategoriesAndTypes);

// Owner/Admin routes
router.post('/', authenticateUser, isOwner, addCategoryType);
router.put('/:id', authenticateUser, isOwner, updateCategoryType);
router.delete('/:id', authenticateUser, isOwner, deleteCategoryType);

export default router;

