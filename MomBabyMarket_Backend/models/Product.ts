import mongoose, { Schema, Document } from 'mongoose';

// Interface cho TypeScript
export interface IProduct extends Document {
  id: number;
  title: string;
  imageUrl: string;
  articleUrl: string;
  localImagePath: string;
  source: string;
  platform: string;
  crawledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const ProductSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: 'text' // Text index for search
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  articleUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid article URL format'
    }
  },
  localImagePath: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid source URL format'
    }
  },
  platform: {
    type: String,
    required: true,
    enum: ['website', 'facebook', 'instagram'],
    default: 'website'
  },
  crawledAt: {
    type: Date,
    required: true,
    index: true // Index for crawledAt queries
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  versionKey: false
});

// Compound indexes for optimization
ProductSchema.index({ crawledAt: -1, platform: 1 }); // Sort by crawledAt desc, filter by platform
ProductSchema.index({ title: 'text', source: 1 }); // Text search with source filter
ProductSchema.index({ source: 1, crawledAt: -1 }); // Group by source, sort by crawledAt

// Virtual field to get formatted crawled date
ProductSchema.virtual('crawledAtFormatted').get(function() {
  return this.crawledAt.toISOString();
});

// Static method to find products by date range
ProductSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    crawledAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ crawledAt: -1 });
};

// Static method to find products by platform
ProductSchema.statics.findByPlatform = function(platform: string) {
  return this.find({ platform }).sort({ crawledAt: -1 });
};

// Static method to search products by title
ProductSchema.statics.searchByTitle = function(searchText: string) {
  return this.find({
    $text: { $search: searchText }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware for validation
ProductSchema.pre('save', function(next) {
  // Ensure crawledAt is a valid date
  if (!this.crawledAt || isNaN(this.crawledAt.getTime())) {
    this.crawledAt = new Date();
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
