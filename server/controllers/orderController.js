import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId, paymentMethod, paymentIntentId } = req.body;
    
    if (!addressId) {
      return res.status(400).json({ message: 'Address is required' });
    }
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get address
    const address = await Address.findOne({ _id: addressId, userId: user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Get cart
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate totals
    let amount = 0;
    const orderItems = [];
    const shippingFee = 10; // $10 shipping fee
    const taxRate = 0.02; // 2% tax
    
    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      if (!product || !product.inStock) {
        return res.status(400).json({ 
          message: `Product ${product?.title || 'Unknown'} is out of stock` 
        });
      }
      
      // Check stock
      const stock = product.stock.get(cartItem.size);
      if (stock !== undefined && stock < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title} (${cartItem.size})` 
        });
      }
      
      const price = product.price.get(cartItem.size);
      if (!price) {
        return res.status(400).json({ 
          message: `Invalid size ${cartItem.size} for ${product.title}` 
        });
      }
      
      const itemTotal = price * cartItem.quantity;
      amount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        price: price
      });
      
      // Update stock
      if (stock !== undefined) {
        product.stock.set(cartItem.size, stock - cartItem.quantity);
        if (product.stock.get(cartItem.size) === 0) {
          product.inStock = false;
        }
        await product.save();
      }
    }
    
    const tax = amount * taxRate;
    const totalAmount = amount + shippingFee + tax;
    
    // Determine payment status
    let paymentStatus = 'pending';
    let isPaid = false;
    
    if (paymentMethod === 'stripe' || paymentMethod === 'card') {
      if (paymentIntentId) {
        paymentStatus = 'paid';
        isPaid = true;
      }
    } else if (paymentMethod === 'COD') {
      paymentStatus = 'pending';
      isPaid = false;
    }
    
    // Create order
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      address: address._id,
      amount,
      shippingFee,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus,
      isPaid,
      stripePaymentIntentId: paymentIntentId || null,
      status: 'pending'
    });
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    // Populate order for email
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('address');
    
    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(populatedOrder, user, address);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }
    
    res.status(201).json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const orders = await Order.find({ userId: user._id })
      .populate('items.product')
      .populate('address')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get all orders (owner/admin)
export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('items.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const order = await Order.findById(id)
      .populate('items.product')
      .populate('address');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is owner/admin
    if (order.userId.toString() !== user._id.toString() && user.role !== 'owner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status (owner/admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('address')
      .populate('userId', 'firstName lastName email');
    
    res.json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Get dashboard data (owner/admin)
export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get all orders
    const orders = await Order.find()
      .populate('items.product')
      .populate('address')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Calculate totals
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    res.json({
      success: true,
      dashboard: {
        orders,
        totalOrders,
        totalRevenue: revenue
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

