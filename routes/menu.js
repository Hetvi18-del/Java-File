const express = require('express');
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, isVegetarian, isVegan, isGlutenFree, available } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by dietary preferences
    if (isVegetarian === 'true') query.isVegetarian = true;
    if (isVegan === 'true') query.isVegan = true;
    if (isGlutenFree === 'true') query.isGlutenFree = true;
    
    // Filter by availability
    if (available === 'true') query.isAvailable = true;
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get current day for filtering
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    query.availableDays = { $in: [currentDay] };
    
    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get menu by category
// @route   GET /api/menu/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const menuItems = await MenuItem.find({
      category: category,
      isAvailable: true,
      availableDays: { $in: [currentDay] }
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get today's special menu
// @route   GET /api/menu/today/special
// @access  Public
router.get('/today/special', async (req, res) => {
  try {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    
    const menuItems = await MenuItem.find({
      isAvailable: true,
      availableDays: { $in: [currentDay] },
      'availableTime.start': { $lte: currentTime },
      'availableTime.end': { $gte: currentTime }
    }).sort({ category: 1, name: 1 });
    
    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedMenu
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'])
    .withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const menuItem = await MenuItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
router.put('/:id', protect, admin, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'])
    .withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/toggle-availability
// @access  Private/Admin
router.patch('/:id/toggle-availability', protect, admin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;