const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['recharge', 'food-purchase', 'refund', 'adjustment'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'net-banking', 'cash', 'admin-adjustment'],
    required: function() {
      return this.type === 'credit';
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Generate transaction ID before saving
TransactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.transactionId = `TXN${dateStr}${timeStr}${randomNum}`;
  }
  next();
});

// Index for efficient queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);