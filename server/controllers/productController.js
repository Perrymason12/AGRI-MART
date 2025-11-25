import Product from '../models/Product.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'agri-mart/products',
      resource_type: 'image'
    });
    // Delete local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, type, popular, inStock, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (popular !== undefined) query.popular = popular === 'true';
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate('createdBy', 'firstName lastName');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Add product
export const addProduct = async (req, res) => {
  try {
    const { userId } = req;
    const { title, description, category, type, popular, sizes, prices, stock } = req.body;
    
    // Find user in database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate required fields
    if (!title || !description || !category || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Parse sizes and prices
    let priceMap = new Map();
    let stockMap = new Map();
    
    if (sizes && prices) {
      const sizeArray = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      const priceArray = Array.isArray(prices) ? prices : JSON.parse(prices);
      const stockArray = stock ? (Array.isArray(stock) ? stock : JSON.parse(stock)) : [];
      
      sizeArray.forEach((size, index) => {
        priceMap.set(size, parseFloat(priceArray[index]));
        if (stockArray[index] !== undefined) {
          stockMap.set(size, parseInt(stockArray[index]));
        }
      });
    }
    
    // Upload images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = file.path;
        const imageUrl = await uploadImageToCloudinary(filePath);
        imageUrls.push(imageUrl);
      }
    }
    
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    // Create product
    const product = await Product.create({
      title,
      description,
      images: imageUrls,
      price: Object.fromEntries(priceMap),
      sizes: Array.from(priceMap.keys()),
      stock: Object.fromEntries(stockMap),
      category,
      type,
      popular: popular === 'true' || popular === true,
      inStock: true,
      createdBy: user._id
    });
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { title, description, category, type, popular, sizes, prices, stock, inStock } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the creator or owner
    const user = await User.findOne({ clerkId: userId });
    if (product.createdBy.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (type) product.type = type;
    if (popular !== undefined) product.popular = popular === 'true' || popular === true;
    if (inStock !== undefined) product.inStock = inStock === 'true' || inStock === true;
    
    // Update prices and sizes
    if (sizes && prices) {
      const sizeArray = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      const priceArray = Array.isArray(prices) ? prices : JSON.parse(prices);
      const stockArray = stock ? (Array.isArray(stock) ? stock : JSON.parse(stock)) : [];
      
      let priceMap = new Map();
      let stockMap = new Map();
      
      sizeArray.forEach((size, index) => {
        priceMap.set(size, parseFloat(priceArray[index]));
        if (stockArray[index] !== undefined) {
          stockMap.set(size, parseInt(stockArray[index]));
        }
      });
      
      product.price = Object.fromEntries(priceMap);
      product.sizes = Array.from(priceMap.keys());
      product.stock = Object.fromEntries(stockMap);
    }
    
    // Update images if new ones are provided
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const filePath = file.path;
        const imageUrl = await uploadImageToCloudinary(filePath);
        imageUrls.push(imageUrl);
      }
      // Merge with existing images or replace
      product.images = [...product.images, ...imageUrls].slice(0, 4);
    }
    
    await product.save();
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the creator or admin
    const user = await User.findOne({ clerkId: userId });
    if (product.createdBy.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Toggle stock
export const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the creator or admin
    const user = await User.findOne({ clerkId: userId });
    if (product.createdBy.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    product.inStock = !product.inStock;
    await product.save();
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Toggle stock error:', error);
    res.status(500).json({ message: 'Error toggling stock', error: error.message });
  }
};

// Bulk upload products
export const bulkUpload = async (req, res) => {
  try {
    const { userId } = req;
    const { products } = req.body; // Array of product data
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Invalid products data' });
    }
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const uploadedProducts = [];
    
    for (const productData of products) {
      const { title, description, category, type, popular, sizes, prices, stock } = productData;
      
      if (!title || !description || !category || !type) {
        continue; // Skip invalid products
      }
      
      // Parse sizes and prices
      let priceMap = new Map();
      let stockMap = new Map();
      
      if (sizes && prices) {
        sizes.forEach((size, index) => {
          priceMap.set(size, parseFloat(prices[index]));
          if (stock && stock[index] !== undefined) {
            stockMap.set(size, parseInt(stock[index]));
          }
        });
      }
      
      // Use first available image or placeholder
      const imageUrls = productData.images || ['https://via.placeholder.com/400'];
      
      const product = await Product.create({
        title,
        description,
        images: imageUrls,
        price: Object.fromEntries(priceMap),
        sizes: Array.from(priceMap.keys()),
        stock: Object.fromEntries(stockMap),
        category,
        type,
        popular: popular || false,
        inStock: true,
        createdBy: user._id
      });
      
      uploadedProducts.push(product);
    }
    
    res.json({
      success: true,
      count: uploadedProducts.length,
      products: uploadedProducts
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Error bulk uploading products', error: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, category, type } = req.query;
    
    const query = {};
    
    if (q) {
      query.$text = { $search: q };
    }
    if (category) query.category = category;
    if (type) query.type = type;
    
    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName')
      .limit(50);
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

