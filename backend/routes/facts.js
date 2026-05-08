const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, adminOnly } = require('../middleware/auth');

// Get random fact
router.get('/random', async (req, res) => {
  try {
    const count = await Post.countDocuments({ status: 'done', postType: 'fact' });
    const random = Math.floor(Math.random() * count);
    const fact = await Post.findOne({ status: 'done', postType: 'fact' })
      .populate('category', 'name icon color')
      .skip(random);
    res.json({ success: true, fact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get daily fact
router.get('/daily', async (req, res) => {
  try {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const count = await Post.countDocuments({ status: 'done', postType: 'fact' });
    if (!count) return res.json({ success: true, fact: null });
    const index = dayOfYear % count;
    const fact = await Post.findOne({ status: 'done', postType: 'fact' })
      .populate('category', 'name icon color')
      .skip(index);
    res.json({ success: true, fact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
