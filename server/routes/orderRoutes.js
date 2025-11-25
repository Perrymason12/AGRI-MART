import express from 'express';
import { authenticateUser, isOwner } from '../middleware/auth.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardData,
  getUserOrders
} from '../controllers/orderController.js';

const router = express.Router();

// User routes
router.post('/', authenticateUser, createOrder);
router.get('/my-orders', authenticateUser, getUserOrders);
router.get('/:id', authenticateUser, getOrderById);

// Owner/Admin routes
router.get('/', authenticateUser, isOwner, getOrders);
router.patch('/:id/status', authenticateUser, isOwner, updateOrderStatus);
router.get('/dashboard/stats', authenticateUser, isOwner, getDashboardData);

export default router;

