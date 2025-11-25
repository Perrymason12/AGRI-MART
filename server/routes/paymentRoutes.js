import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus
} from '../controllers/paymentController.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateUser);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/status/:paymentIntentId', getPaymentStatus);

export default router;

