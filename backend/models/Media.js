const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  publicId: String,
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  size: Number,
  width: Number,
  height: Number,
  format: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedIn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  tags: [String],
  alt: String
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
