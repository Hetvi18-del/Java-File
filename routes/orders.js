const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItem').notEmpty().withMessage('Menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['wallet', 'cash', 'card']).withMessage('Invalid payment method'),
  body('orderType').optional().isIn(['pre-order', 'instant']).withMessage('Invalid order type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, paymentMethod, orderType, scheduledTime, notes } = req.body;
    
    // Validate menu items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
      }
      
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is not available` });
      }
      
      if (menuItem.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Only ${menuItem.quantity} ${menuItem.name} available` 
        });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }
    
    // Check wallet balance if payment method is wallet
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user.id);
      if (user.walletBalance < totalAmount) {
        return res.status(400).json({ 
          message: 'Insufficient wallet balance',
          required: totalAmount,
          available: user.walletBalance
        });
      }
    }
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      orderType: orderType || 'instant',
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      notes: notes || '',
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending'
    });
    
    // Process wallet payment
    if (paymentMethod === 'wallet') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletBalance: -totalAmount }
      });
      
      // Create transaction record
      const user = await User.findById(req.user.id);
      await Transaction.create({
        user: req.user.id,
        type: 'debit',
        amount: totalAmount,
        description: `Food order - ${order.orderNumber}`,
        category: 'food-purchase',
        order: order._id,
        balanceAfter: user.walletBalance - totalAmount
      });
    }
    
    // Update menu item quantities
    for (const item of items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { quantity: -item.quantity }
      });
    }
    
    // Set estimated time
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 20); // Default 20 minutes
    order.estimatedTime = estimatedTime;
    await order.save();
    
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price image category')
      .populate('user', 'name email studentId');
    
    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.menuItem', 'name price image category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price image category description')
      .populate('user', 'name email studentId phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    // Refund wallet payment
    if (order.paymentMethod === 'wallet' && order.paymentStatus === 'paid') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletBalance: order.totalAmount }
      });
      
      // Create refund transaction
      const user = await User.findById(req.user.id);
      await Transaction.create({
        user: req.user.id,
        type: 'credit',
        amount: order.totalAmount,
        description: `Refund for cancelled order - ${order.orderNumber}`,
        category: 'refund',
        order: order._id,
        balanceAfter: user.walletBalance + order.totalAmount
      });
    }
    
    // Restore menu item quantities
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { quantity: item.quantity }
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { status, date, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    const orders = await Order.find(query)
      .populate('items.menuItem', 'name price category')
      .populate('user', 'name email studentId phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    if (status === 'completed') {
      order.actualCompletionTime = new Date();
    }
    
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price category')
      .populate('user', 'name email studentId phone');
    
    res.json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const stats = await Order.aggregate([
      {
        $facet: {
          todayOrders: [
            { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
          ],
          statusCounts: [
            { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          popularItems: [
            { $unwind: '$items' },
            { $group: { _id: '$items.menuItem', totalQuantity: { $sum: '$items.quantity' } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
            { $unwind: '$item' },
            { $project: { name: '$item.name', quantity: '$totalQuantity' } }
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