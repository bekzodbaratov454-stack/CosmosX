const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    uz: { type: String, required: true, trim: true },
    en: { type: String, trim: true }
  },
  description: {
    uz: String,
    en: String
  },
  slug: { type: String, unique: true, lowercase: true },
  icon: { type: String, default: '🌌' },
  color: { type: String, default: '#6366f1' },
  coverImage: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  postCount: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('name.uz') || !this.slug) {
    this.slug = this.name.uz
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim('-') || `cat-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
