const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// @GET /api/posts - Public (only done posts)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, search, type, featured } = req.query;
    const query = { status: 'done' };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (type) query.postType = type;
    if (featured === 'true') query.featured = true;
    if (search) query.$text = { $search: search };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('category', 'name icon color slug')
      .populate('author', 'username avatar')
      .select('-content')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/posts/admin - Admin: all posts
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('category', 'name icon color')
      .populate('author', 'username avatar')
      .select('-content.uz -content.en')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, posts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/posts/featured
router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'done', featured: true })
      .populate('category', 'name icon color slug')
      .populate('author', 'username avatar')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(6);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/posts/trending
router.get('/trending', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'done' })
      .populate('category', 'name icon color slug')
      .populate('author', 'username avatar')
      .select('-content')
      .sort({ views: -1, likesCount: -1 })
      .limit(10);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/posts/:slug - Single post
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('category', 'name icon color slug')
      .populate('author', 'username avatar bio');
    
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    // Only admin can see pending posts
    if (post.status !== 'done' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Unique view tracking — cookie asosida (1 kun)
    const viewedKey = `viewed_${post._id}`;
    const cookies = req.headers.cookie || '';
    const alreadyViewed = cookies.split(';').some(c => c.trim().startsWith(viewedKey + '='));
    
    if (!alreadyViewed) {
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      res.setHeader('Set-Cookie', `${viewedKey}=1; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax`);
    }
    
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/posts/id/:id - Get by ID (admin)
router.get('/id/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('category', 'name icon color slug')
      .populate('author', 'username avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/posts - Create post (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    
    // Update category post count
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: 1 } });
    
    await post.populate('category', 'name icon color');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/posts/:id - Update post (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('category', 'name icon color');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/posts/:id - Delete post (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/posts/:id/like - Like/unlike post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const userId = req.user._id;
    const liked = post.likes.includes(userId);
    
    if (liked) {
      post.likes.pull(userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }
    await post.save({ validateBeforeSave: false });
    res.json({ success: true, liked: !liked, likesCount: post.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/posts/:id/save - Save/unsave post
router.post('/:id/save', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const postId = req.params.id;
    const saved = user.savedPosts.includes(postId);
    
    if (saved) user.savedPosts.pull(postId);
    else user.savedPosts.push(postId);
    
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: !saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
