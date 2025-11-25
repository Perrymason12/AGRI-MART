import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Helper function to get or create user
const getOrCreateUser = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  console.log('getOrCreateUser called with userId:', userId);
  
  let user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    try {
      console.log('User not found in database, fetching from Clerk...');
      
      // Check if CLERK_SECRET_KEY is set
      if (!process.env.CLERK_SECRET_KEY) {
        console.error('CLERK_SECRET_KEY is not set in environment variables');
        throw new Error('Clerk secret key not configured');
      }
      
      // Get user from Clerk
      const clerk = clerkClient();
      
      if (!clerk) {
        throw new Error('Clerk client not initialized');
      }
      
      console.log('Fetching user from Clerk API...');
      const clerkUser = await clerk.users.getUser(userId);
      
      if (!clerkUser) {
        throw new Error('User not found in Clerk');
      }
      
      console.log('Clerk user fetched:', {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName
      });
      
      // Create new user in database
      console.log('Creating user in database...');
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || '',
        role: clerkUser.publicMetadata?.role || 'user',
        isOwner: clerkUser.publicMetadata?.isOwner || false
      });
      
      console.log('User created successfully in database:', user._id);
    } catch (error) {
      console.error('Error creating user from Clerk:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.statusCode || error.code);
      console.error('Error stack:', error.stack);
      
      // Try to create a minimal user as fallback if Clerk API fails
      // This allows the app to continue working even if Clerk is temporarily unavailable
      try {
        console.log('Attempting to create minimal user as fallback...');
        user = await User.create({
          clerkId: userId,
          email: `user_${userId}@temp.local`, // Temporary email
          firstName: '',
          lastName: '',
          imageUrl: '',
          role: 'user',
          isOwner: false
        });
        console.log('Minimal user created as fallback:', user._id);
        console.warn('User created without Clerk data. User should sync with Clerk later via /users/me endpoint.');
      } catch (fallbackError) {
        console.error('Fallback user creation also failed:', fallbackError);
        
        // Provide more specific error messages
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.statusCode === 401) {
          throw new Error('Clerk API authentication failed. Check CLERK_SECRET_KEY in .env file.');
        } else if (error.message?.includes('404') || error.message?.includes('not found') || error.statusCode === 404) {
          throw new Error('User not found in Clerk. User may have been deleted.');
        } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to Clerk API. Check your internet connection and Clerk service status.');
        } else if (fallbackError.code === 11000) {
          // MongoDB duplicate key error - user might have been created between checks
          console.log('User might already exist, trying to find again...');
          user = await User.findOne({ clerkId: userId });
          if (user) {
            console.log('Found existing user after duplicate key error');
            return user;
          }
          throw new Error('User creation failed: duplicate key error and user not found on retry.');
        } else {
          throw new Error(`Failed to create user: ${error.message || error.toString()}`);
        }
      }
    }
  } else {
    console.log('User found in database:', user._id);
  }
  
  return user;
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req;

    // If no authenticated user, return an empty cart for guest users
    if (!userId) {
      return res.json({
        success: true,
        cart: { items: [] }
      });
    }

    // Get or create user if they don't exist
    const user = await getOrCreateUser(userId);

    let cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId: user._id, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, quantity = 1 } = req.body;
    
    console.log('Add to cart request:', { userId, productId, size, quantity });
    
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and size are required' });
    }
    
    // Get or create user if they don't exist
    let user;
    try {
      user = await getOrCreateUser(userId);
    } catch (userError) {
      console.error('Error getting/creating user:', userError);
      return res.status(500).json({ message: 'Failed to get or create user', error: userError.message });
    }
    
    // Validate product ID format
    if (!productId || typeof productId !== 'string') {
      console.error('Invalid productId type:', typeof productId, productId);
      return res.status(400).json({ message: 'Product ID is required and must be a string' });
    }

    // Check if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('Invalid MongoDB ObjectId format:', productId);
      return res.status(400).json({ 
        message: 'Invalid product ID format. Product ID must be a valid MongoDB ObjectId.',
        receivedId: productId,
        hint: 'Make sure you are using the correct product ID from the database.'
      });
    }

    // Verify product exists and is in stock
    let product;
    try {
      product = await Product.findById(productId);
    } catch (productError) {
      console.error('Error finding product:', productError);
      console.error('ProductId that caused error:', productId);
      return res.status(400).json({ 
        message: 'Error finding product', 
        error: productError.message,
        productId: productId
      });
    }
    
    if (!product) {
      console.error('Product not found with ID:', productId);
      return res.status(404).json({ 
        message: 'Product not found',
        productId: productId
      });
    }
    
    if (!product.inStock) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }
    
    // Check if sizes is an array and includes the size
    if (!Array.isArray(product.sizes)) {
      console.error('Product sizes is not an array:', product.sizes);
      return res.status(400).json({ message: 'Product sizes data is invalid' });
    }
    
    if (!product.sizes.includes(size)) {
      return res.status(400).json({ message: `Invalid size "${size}" for this product. Available sizes: ${product.sizes.join(', ')}` });
    }
    
    // Check stock availability - handle both Map and object formats
    let stock;
    if (product.stock instanceof Map) {
      stock = product.stock.get(size);
    } else if (product.stock && typeof product.stock === 'object') {
      stock = product.stock[size];
    }
    
    if (stock !== undefined && stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${stock}, Requested: ${quantity}` });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = await Cart.create({ userId: user._id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        size,
        quantity
      });
    }
    
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error adding to cart', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, quantity } = req.body;
    
    console.log('Update cart item request:', { userId, productId, size, quantity });
    
    if (!productId || !size || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID, size, and quantity are required' });
    }
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }
    
    // Get or create user if they don't exist
    let user;
    try {
      user = await getOrCreateUser(userId);
    } catch (userError) {
      console.error('Error getting/creating user:', userError);
      return res.status(500).json({ message: 'Failed to get or create user', error: userError.message });
    }
    
    // Get or create cart if it doesn't exist
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({ userId: user._id, items: [] });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );
    
    if (itemIndex === -1) {
      // If item doesn't exist and quantity is 0, that's fine (already removed)
      if (quantity === 0) {
        const updatedCart = await Cart.findById(cart._id).populate('items.productId');
        return res.json({
          success: true,
          cart: updatedCart,
          message: 'Item already removed from cart'
        });
      }
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
      console.log('Removing item from cart');
    } else {
      // Update quantity
      // Check stock availability
      const product = await Product.findById(productId);
      if (product) {
        let stock;
        if (product.stock instanceof Map) {
          stock = product.stock.get(size);
        } else if (product.stock && typeof product.stock === 'object') {
          stock = product.stock[size];
        }
        
        if (stock !== undefined && stock < quantity) {
          return res.status(400).json({ message: `Insufficient stock. Available: ${stock}, Requested: ${quantity}` });
        }
      }
      cart.items[itemIndex].quantity = quantity;
      console.log('Updating item quantity to:', quantity);
    }
    
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error updating cart item', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size } = req.params;
    
    // Get or create user if they don't exist
    const user = await getOrCreateUser(userId);
    
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    );
    
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req;
    
    // Get or create user if they don't exist
    const user = await getOrCreateUser(userId);
    
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

