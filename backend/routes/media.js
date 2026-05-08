const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const Media = require('../models/Media');
const { protect, adminOnly } = require('../middleware/auth');

// Upload media
router.post('/upload', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    const mediaItems = [];
    for (const file of req.files) {
      const isVideo = /mp4|webm|ogg|mov/.test(path.extname(file.originalname).toLowerCase().slice(1));
      const mediaItem = await Media.create({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        type: isVideo ? 'video' : 'image',
        size: file.size,
        format: path.extname(file.originalname).slice(1),
        uploadedBy: req.user._id
      });
      mediaItems.push(mediaItem);
    }
    res.status(201).json({ success: true, media: mediaItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all media (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const query = type ? { type } : {};
    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, media, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete media
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    
    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
