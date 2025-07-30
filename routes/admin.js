const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Transaction = require('../models/Transaction');
const Feedback = require('../models/Feedback');
const { protect, admin, generateToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private/Admin
router.post('/create-admin', protect, admin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create admin user
    user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    // Get various statistics
    const [
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      activeMenuItems,
      pendingOrders,
      completedOrdersToday,
      averageRating,
      totalFeedbacks,
      recentOrders,
      popularItems,
      revenueStats
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      MenuItem.countDocuments({ isAvailable: true }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ 
        createdAt: { $gte: today, $lt: tomorrow }, 
        status: 'completed' 
      }),
      Feedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Feedback.countDocuments(),
      Order.find({ createdAt: { $gte: today, $lt: tomorrow } })
        .populate('user', 'name studentId')
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.menuItem', totalQuantity: { $sum: '$items.quantity' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
        { $unwind: '$item' },
        { $project: { name: '$item.name', quantity: '$totalQuantity' } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id': -1 } },
        { $limit: 7 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          todayOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayRevenue: todayRevenue[0]?.total || 0,
          activeMenuItems,
          pendingOrders,
          completedOrdersToday,
          averageRating: averageRating[0]?.avgRating ? Math.round(averageRating[0].avgRating * 10) / 10 : 0,
          totalFeedbacks
        },
        recentOrders,
        popularItems,
        revenueStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { search, department, year, isActive, limit = 20, page = 1 } = req.query;
    
    let query = { role: 'student' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user statistics
    const [orderStats, transactionStats, feedbackStats] = await Promise.all([
      Order.aggregate([
        { $match: { user: user._id } },
        { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }}
      ]),
      Transaction.aggregate([
        { $match: { user: user._id } },
        { $group: {
          _id: '$type',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }}
      ]),
      Feedback.aggregate([
        { $match: { user: user._id } },
        { $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }}
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        user,
        stats: {
          orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 },
          transactions: transactionStats,
          feedback: feedbackStats[0] || { totalFeedbacks: 0, avgRating: 0 }
        }
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

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
router.patch('/users/:id/status', protect, admin, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const [
      orderTrends,
      revenueTrends,
      categoryStats,
      userGrowth,
      feedbackTrends,
      peakHours
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }},
        { $sort: { '_id': 1 } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }},
        { $sort: { '_id': 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'item' } },
        { $unwind: '$item' },
        { $group: {
          _id: '$item.category',
          orders: { $sum: 1 },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }}
      ]),
      User.aggregate([
        { $match: { role: 'student', createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 }
        }},
        { $sort: { '_id': 1 } }
      ]),
      Feedback.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          feedbacks: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }},
        { $sort: { '_id': 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id': 1 } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        orderTrends,
        revenueTrends,
        categoryStats,
        userGrowth,
        feedbackTrends,
        peakHours
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
router.get('/export/:type', protect, admin, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    let data = [];
    
    switch (type) {
      case 'orders':
        data = await Order.find(query)
          .populate('user', 'name email studentId')
          .populate('items.menuItem', 'name category price')
          .sort({ createdAt: -1 });
        break;
        
      case 'users':
        data = await User.find({ role: 'student', ...query })
          .select('-password')
          .sort({ createdAt: -1 });
        break;
        
      case 'transactions':
        data = await Transaction.find(query)
          .populate('user', 'name email studentId')
          .sort({ createdAt: -1 });
        break;
        
      case 'feedback':
        data = await Feedback.find(query)
          .populate('user', 'name email studentId')
          .populate('menuItem', 'name category')
          .sort({ createdAt: -1 });
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, admin, async (req, res) => {
  try {
    // This would typically come from a settings collection
    // For now, returning default settings
    const settings = {
      canteen: {
        name: 'Campus Canteen',
        openTime: '08:00',
        closeTime: '22:00',
        maxOrderValue: 1000,
        minWalletRecharge: 10,
        maxWalletRecharge: 5000
      },
      orders: {
        maxItemQuantity: 10,
        orderTimeLimit: 30, // minutes
        cancellationTimeLimit: 15 // minutes
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        orderUpdates: true,
        promotions: true
      }
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', protect, admin, async (req, res) => {
  try {
    // In a real application, you would save these to a settings collection
    const settings = req.body;
    
    // Validate settings here if needed
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;