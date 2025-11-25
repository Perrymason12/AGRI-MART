import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// Make GET /api/cart public so clients can safely request an empty cart
// without being signed in. Protect mutation routes.
router.get('/', getCart);

router.post('/add', authenticateUser, addToCart);
router.put('/update', authenticateUser, updateCartItem);
router.delete('/remove/:productId/:size', authenticateUser, removeFromCart);
router.delete('/clear', authenticateUser, clearCart);

export default router;

