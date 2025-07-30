const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500
  },
  aspects: {
    taste: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    quantity: { type: Number, min: 1, max: 5 },
    presentation: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 }
  },
  images: [{
    type: String
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  adminResponse: {
    message: { type: String, maxlength: 300 },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: { type: Date }
  },
  isHelpful: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Ensure one feedback per user per menu item per order
FeedbackSchema.index({ user: 1, order: 1, menuItem: 1 }, { unique: true });
FeedbackSchema.index({ menuItem: 1, status: 1, createdAt: -1 });
FeedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);