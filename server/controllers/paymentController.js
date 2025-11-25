import Stripe from 'stripe';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.body;
    
    if (!addressId) {
      return res.status(400).json({ message: 'Address is required' });
    }
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get cart
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total
    let amount = 0;
    const shippingFee = 10;
    const taxRate = 0.02;
    
    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      if (!product || !product.inStock) {
        return res.status(400).json({ 
          message: `Product ${product?.title || 'Unknown'} is out of stock` 
        });
      }
      
      const price = product.price.get(cartItem.size);
      if (!price) {
        return res.status(400).json({ 
          message: `Invalid size ${cartItem.size} for ${product.title}` 
        });
      }
      
      amount += price * cartItem.quantity;
    }
    
    const tax = amount * taxRate;
    const totalAmount = Math.round((amount + shippingFee + tax) * 100); // Convert to cents
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        userId: user._id.toString(),
        addressId: addressId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount / 100
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Payment not completed', 
        status: paymentIntent.status 
      });
    }
    
    // Payment is confirmed, order will be created in orderController
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Error fetching payment status', error: error.message });
  }
};

