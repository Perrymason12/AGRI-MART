import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    type: Map,
    of: Number,
    required: true
  },
  sizes: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  popular: {
    type: Boolean,
    default: false,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true,
    index: true
  },
  stock: {
    type: Map,
    of: Number,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ category: 1, type: 1 });
productSchema.index({ inStock: 1, popular: 1 });
productSchema.index({ title: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;

