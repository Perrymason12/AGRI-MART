import { body, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Product validation
export const validateProduct = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('sizes').isArray().withMessage('Sizes must be an array'),
  body('prices').isArray().withMessage('Prices must be an array'),
  handleValidationErrors
];

// Address validation
export const validateAddress = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  handleValidationErrors
];

// Order validation
export const validateOrder = [
  body('addressId').notEmpty().withMessage('Address ID is required'),
  body('paymentMethod').isIn(['COD', 'stripe', 'card']).withMessage('Invalid payment method'),
  handleValidationErrors
];

// Cart validation
export const validateCartItem = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('size').trim().notEmpty().withMessage('Size is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

