const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, adminOnly } = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null, isApproved: true })
      .populate('author', 'username avatar')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add comment
router.post('/', protect, async (req, res) => {
  try {
    const { postId, content, parentComment } = req.body;
    const comment = await Comment.create({ post: postId, author: req.user._id, content, parentComment: parentComment || null });
    
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    
    await comment.populate('author', 'username avatar');
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete comment (admin or own)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: get all comments
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Comment.countDocuments();
    const comments = await Comment.find()
      .populate('author', 'username')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, comments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
