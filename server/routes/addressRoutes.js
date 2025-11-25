import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';

const router = express.Router();

// All address routes require authentication
router.use(authenticateUser);

router.get('/', getAddresses);
router.get('/:id', getAddressById);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/set-default', setDefaultAddress);

export default router;

