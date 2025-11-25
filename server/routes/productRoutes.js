import express from 'express';
import { authenticateUser, isOwner } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  bulkUpload,
  searchProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Owner/Admin routes
router.post('/', authenticateUser, isOwner, upload.array('images', 4), addProduct);
router.put('/:id', authenticateUser, isOwner, upload.array('images', 4), updateProduct);
router.delete('/:id', authenticateUser, isOwner, deleteProduct);
router.patch('/:id/toggle-stock', authenticateUser, isOwner, toggleStock);
router.post('/bulk-upload', authenticateUser, isOwner, upload.array('images', 20), bulkUpload);

export default router;

