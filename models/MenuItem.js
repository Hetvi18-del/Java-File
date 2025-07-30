const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    maxlength: 500
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: String
  }],
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'very-hot', 'none'],
    default: 'none'
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  availableTime: {
    start: { type: String }, // e.g., "08:00"
    end: { type: String }    // e.g., "22:00"
  },
  quantity: {
    type: Number,
    default: 100 // Available quantity for the day
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
MenuItemSchema.index({ category: 1, isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);