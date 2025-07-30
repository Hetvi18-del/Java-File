const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
router.post('/', protect, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, menuItemId, rating, review, aspects, isAnonymous } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }
    
    // Verify order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed orders' });
    }
    
    // Verify menu item exists in the order
    const orderItem = order.items.find(item => item.menuItem.toString() === menuItemId);
    if (!orderItem) {
      return res.status(400).json({ message: 'Menu item not found in this order' });
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      user: req.user.id,
      order: orderId,
      menuItem: menuItemId
    });
    
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this item' });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      user: req.user.id,
      order: orderId,
      menuItem: menuItemId,
      rating,
      review: review || '',
      aspects: aspects || {},
      isAnonymous: isAnonymous || false
    });
    
    // Update menu item rating
    await updateMenuItemRating(menuItemId);
    
    // Mark order as rated if all items are rated
    const totalItems = order.items.length;
    const ratedItems = await Feedback.countDocuments({ order: orderId });
    
    if (ratedItems === totalItems) {
      order.isRated = true;
      await order.save();
    }
    
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('menuItem', 'name image category')
      .populate('user', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedFeedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get feedback for a menu item
// @route   GET /api/feedback/menu-item/:id
// @access  Public
router.get('/menu-item/:id', async (req, res) => {
  try {
    const { limit = 10, page = 1, rating } = req.query;
    
    let query = { 
      menuItem: req.params.id,
      status: 'active'
    };
    
    if (rating) {
      query.rating = parseInt(rating);
    }
    
    const feedbacks = await Feedback.find(query)
      .populate('user', 'name')
      .populate('menuItem', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Hide user info if anonymous
    const processedFeedbacks = feedbacks.map(feedback => {
      if (feedback.isAnonymous) {
        feedback.user = { name: 'Anonymous' };
      }
      return feedback;
    });
    
    const total = await Feedback.countDocuments(query);
    
    // Get rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: { menuItem: req.params.id, status: 'active' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      count: processedFeedbacks.length,
      total,
      data: processedFeedbacks,
      ratingDistribution
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
router.get('/my-feedback', protect, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const feedbacks = await Feedback.find({ user: req.user.id })
      .populate('menuItem', 'name image category price')
      .populate('order', 'orderNumber createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Feedback.countDocuments({ user: req.user.id });
    
    res.json({
      success: true,
      count: feedbacks.length,
      total,
      data: feedbacks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
router.put('/:id', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (feedback.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }
    
    const { rating, review, aspects, isAnonymous } = req.body;
    
    if (rating) feedback.rating = rating;
    if (review !== undefined) feedback.review = review;
    if (aspects) feedback.aspects = { ...feedback.aspects, ...aspects };
    if (isAnonymous !== undefined) feedback.isAnonymous = isAnonymous;
    
    await feedback.save();
    
    // Update menu item rating
    await updateMenuItemRating(feedback.menuItem);
    
    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('menuItem', 'name image category')
      .populate('user', 'name');
    
    res.json({
      success: true,
      data: updatedFeedback
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }
    
    const menuItemId = feedback.menuItem;
    await Feedback.findByIdAndDelete(req.params.id);
    
    // Update menu item rating
    await updateMenuItemRating(menuItemId);
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Mark feedback as helpful
// @route   POST /api/feedback/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user already marked as helpful
    if (feedback.isHelpful.users.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already marked as helpful' });
    }
    
    feedback.isHelpful.users.push(req.user.id);
    feedback.isHelpful.count += 1;
    
    await feedback.save();
    
    res.json({
      success: true,
      message: 'Marked as helpful',
      helpfulCount: feedback.isHelpful.count
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { status, rating, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);
    
    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email studentId')
      .populate('menuItem', 'name category')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Feedback.countDocuments(query);
    
    res.json({
      success: true,
      count: feedbacks.length,
      total,
      data: feedbacks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Respond to feedback (Admin)
// @route   POST /api/feedback/:id/respond
// @access  Private/Admin
router.post('/:id/respond', protect, admin, [
  body('message').notEmpty().withMessage('Response message is required')
    .isLength({ max: 300 }).withMessage('Response cannot exceed 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    feedback.adminResponse = {
      message,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };
    
    await feedback.save();
    
    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('menuItem', 'name')
      .populate('adminResponse.respondedBy', 'name');
    
    res.json({
      success: true,
      data: updatedFeedback
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update feedback status (Admin)
// @route   PATCH /api/feedback/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, [
  body('status').isIn(['active', 'hidden', 'flagged']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')
     .populate('menuItem', 'name');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update menu item rating
async function updateMenuItemRating(menuItemId) {
  try {
    const stats = await Feedback.aggregate([
      { $match: { menuItem: menuItemId, status: 'active' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (stats.length > 0) {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
        'ratings.count': stats[0].count
      });
    }
  } catch (error) {
    console.error('Error updating menu item rating:', error);
  }
}

module.exports = router;