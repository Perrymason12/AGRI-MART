import mongoose from 'mongoose';

const categoryTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  kind: {
    type: String,
    enum: ['category', 'type'],
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true
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

// Compound index to ensure unique name per kind
categoryTypeSchema.index({ name: 1, kind: 1 }, { unique: true });

const CategoryType = mongoose.model('CategoryType', categoryTypeSchema);

export default CategoryType;

