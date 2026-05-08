const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    uz: { type: String, required: true, trim: true },
    en: { type: String, trim: true, default: '' }
  },
  content: {
    uz: { type: String, required: true },
    en: { type: String, default: '' }
  },
  excerpt: {
    uz: { type: String, maxlength: 500 },
    en: { type: String, maxlength: 500 }
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{ type: String, lowercase: true }],
  coverImage: {
    url: String,
    publicId: String,
    alt: String
  },
  media: [{
    type: { type: String, enum: ['image', 'video', 'youtube'] },
    url: String,
    publicId: String,
    thumbnail: String,
    caption: String,
    youtubeId: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'archived'],
    default: 'pending'
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  readTime: { type: Number, default: 5 }, // minutes
  postType: {
    type: String,
    enum: ['article', 'fact', 'news', 'mystery', 'discovery'],
    default: 'article'
  },
  isTranslated: { type: Boolean, default: false },
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Auto-generate slug
postSchema.pre('save', async function(next) {
  if (this.isModified('title.uz') || !this.slug) {
    const baseSlug = this.title.uz
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug || `post-${Date.now()}`;
    const existing = await mongoose.model('Post').findOne({ slug, _id: { $ne: this._id } });
    if (existing) slug = `${slug}-${Date.now()}`;
    this.slug = slug;
  }
  
  // Calculate read time
  const wordCount = (this.content.uz || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  
  // Set publishedAt when status changes to done
  if (this.isModified('status') && this.status === 'done' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Check if translated
  this.isTranslated = !!(this.content.en && this.content.en.trim());
  
  next();
});

// Indexes
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'title.uz': 'text', 'content.uz': 'text', 'title.en': 'text' });

module.exports = mongoose.model('Post', postSchema);
