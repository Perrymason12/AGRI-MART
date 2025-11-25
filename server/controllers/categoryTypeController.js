import CategoryType from '../models/CategoryType.js';
import User from '../models/User.js';

// Get all categories and types
export const getCategoriesAndTypes = async (req, res) => {
  try {
    const { kind } = req.query; // Optional filter by 'category' or 'type'
    
    const query = kind ? { kind } : {};
    
    const items = await CategoryType.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ name: 1 });
    
    // Separate categories and types
    const categories = items.filter(item => item.kind === 'category');
    const types = items.filter(item => item.kind === 'type');
    
    res.json({
      success: true,
      categories,
      types,
      all: items
    });
  } catch (error) {
    console.error('Get categories/types error:', error);
    res.status(500).json({ message: 'Error fetching categories and types', error: error.message });
  }
};

// Add category or type
export const addCategoryType = async (req, res) => {
  try {
    const { userId } = req;
    const { name, kind, description } = req.body;
    
    if (!name || !kind) {
      return res.status(400).json({ message: 'Name and kind are required' });
    }
    
    if (!['category', 'type'].includes(kind)) {
      return res.status(400).json({ message: 'Kind must be either "category" or "type"' });
    }
    
    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already exists
    const existing = await CategoryType.findOne({ name: name.trim(), kind });
    if (existing) {
      return res.status(400).json({ message: `${kind === 'category' ? 'Category' : 'Type'} "${name}" already exists` });
    }
    
    // Create new category/type
    const categoryType = await CategoryType.create({
      name: name.trim(),
      kind,
      description: description?.trim() || '',
      createdBy: user._id
    });
    
    res.status(201).json({
      success: true,
      categoryType
    });
  } catch (error) {
    console.error('Add category/type error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This category/type already exists' });
    }
    res.status(500).json({ message: 'Error adding category/type', error: error.message });
  }
};

// Update category or type
export const updateCategoryType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const categoryType = await CategoryType.findById(id);
    if (!categoryType) {
      return res.status(404).json({ message: 'Category/Type not found' });
    }
    
    // If name is being changed, check for duplicates
    if (name && name.trim() !== categoryType.name) {
      const existing = await CategoryType.findOne({ 
        name: name.trim(), 
        kind: categoryType.kind,
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({ message: `${categoryType.kind === 'category' ? 'Category' : 'Type'} "${name}" already exists` });
      }
      categoryType.name = name.trim();
    }
    
    if (description !== undefined) {
      categoryType.description = description.trim();
    }
    
    await categoryType.save();
    
    res.json({
      success: true,
      categoryType
    });
  } catch (error) {
    console.error('Update category/type error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This category/type already exists' });
    }
    res.status(500).json({ message: 'Error updating category/type', error: error.message });
  }
};

// Delete category or type
export const deleteCategoryType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryType = await CategoryType.findById(id);
    if (!categoryType) {
      return res.status(404).json({ message: 'Category/Type not found' });
    }
    
    // Check if any products are using this category/type
    const Product = (await import('../models/Product.js')).default;
    const productCount = await Product.countDocuments({
      $or: [
        { category: categoryType.name },
        { type: categoryType.name }
      ]
    });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete. ${productCount} product(s) are using this ${categoryType.kind}.` 
      });
    }
    
    await CategoryType.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: `${categoryType.kind === 'category' ? 'Category' : 'Type'} deleted successfully`
    });
  } catch (error) {
    console.error('Delete category/type error:', error);
    res.status(500).json({ message: 'Error deleting category/type', error: error.message });
  }
};

