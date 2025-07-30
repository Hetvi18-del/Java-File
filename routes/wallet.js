const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    
    res.json({
      success: true,
      balance: user.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Recharge wallet
// @route   POST /api/wallet/recharge
// @access  Private
router.post('/recharge', protect, [
  body('amount').isFloat({ min: 10, max: 5000 }).withMessage('Amount must be between ₹10 and ₹5000'),
  body('paymentMethod').isIn(['card', 'upi', 'net-banking']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, paymentMethod } = req.body;
    
    // In a real application, you would integrate with a payment gateway here
    // For demo purposes, we'll simulate a successful payment
    
    // Update user wallet balance
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    
    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'credit',
      amount: amount,
      description: `Wallet recharge via ${paymentMethod}`,
      category: 'recharge',
      paymentMethod: paymentMethod,
      balanceAfter: user.walletBalance,
      status: 'completed'
    });
    
    res.json({
      success: true,
      message: 'Wallet recharged successfully',
      data: {
        transaction: transaction,
        newBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const { type, category, limit = 20, page = 1 } = req.query;
    
    let query = { user: req.user.id };
    if (type) query.type = type;
    if (category) query.category = category;
    
    const transactions = await Transaction.find(query)
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single transaction
// @route   GET /api/wallet/transactions/:id
// @access  Private
router.get('/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('order', 'orderNumber status items totalAmount')
      .populate('user', 'name email studentId');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user owns the transaction or is admin
    if (transaction.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'debit',
          category: 'food-purchase',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSpent: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: stats,
        monthlySpending: monthlySpending
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes

// @desc    Get all transactions (Admin)
// @route   GET /api/wallet/admin/transactions
// @access  Private/Admin
router.get('/admin/transactions', protect, admin, async (req, res) => {
  try {
    const { type, category, user, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (user) query.user = user;
    
    const transactions = await Transaction.find(query)
      .populate('user', 'name email studentId')
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Manual wallet adjustment (Admin)
// @route   POST /api/wallet/admin/adjust
// @access  Private/Admin
router.post('/admin/adjust', protect, admin, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: -10000, max: 10000 }).withMessage('Amount must be between -₹10000 and ₹10000'),
  body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, amount, type, reason } = req.body;
    
    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if debit amount is available
    if (type === 'debit' && targetUser.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Update wallet balance
    const adjustmentAmount = type === 'credit' ? amount : -amount;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: adjustmentAmount } },
      { new: true }
    );
    
    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      type: type,
      amount: amount,
      description: `Admin adjustment: ${reason}`,
      category: 'adjustment',
      paymentMethod: 'admin-adjustment',
      balanceAfter: updatedUser.walletBalance,
      status: 'completed'
    });
    
    res.json({
      success: true,
      message: 'Wallet adjusted successfully',
      data: {
        transaction: transaction,
        newBalance: updatedUser.walletBalance
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get wallet statistics (Admin)
// @route   GET /api/wallet/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Transaction.aggregate([
      {
        $facet: {
          todayTransactions: [
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: '$type', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
          ],
          totalWalletBalance: [
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
            { $group: { _id: null, totalBalance: { $sum: { $arrayElemAt: ['$userInfo.walletBalance', 0] } } } }
          ],
          rechargeStats: [
            { $match: { category: 'recharge' } },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
          ],
          spendingStats: [
            { $match: { category: 'food-purchase' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, amount: { $sum: '$amount' } } },
            { $sort: { '_id': -1 } },
            { $limit: 7 }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;