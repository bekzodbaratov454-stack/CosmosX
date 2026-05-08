import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiHeart, FiClock, FiBookmark } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'

const typeColors = {
  article: '#6366f1',
  fact: '#f59e0b',
  news: '#06b6d4',
  mystery: '#a855f7',
  discovery: '#10b981',
}

const typeLabels = {
  article: 'Maqola',
  fact: 'Fakt',
  news: 'Yangilik',
  mystery: 'Sir',
  discovery: 'Kashfiyot',
}

export default function PostCard({ post, index = 0, featured = false }) {
  const color = typeColors[post.postType] || '#6366f1'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`card-cosmos group ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <Link to={`/post/${post.slug}`} className="block h-full">
        {/* Cover image */}
        <div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-48'}`}>
          {post.coverImage?.url ? (
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title?.uz}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl"
              style={{
                background: `radial-gradient(ellipse at center, ${color}20 0%, transparent 70%), linear-gradient(135deg, #0f172a, #1e293b)`
              }}>
              {post.category?.icon || '🌌'}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-space-card via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="badge text-xs"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              {typeLabels[post.postType] || 'Maqola'}
            </span>
            {post.featured && (
              <span className="badge text-xs" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Category */}
          {post.category && (
            <div className="absolute top-3 right-3">
              <span className="text-2xl">{post.category.icon}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {post.category && (
            <p className="text-xs font-medium mb-2" style={{ color }}>
              {post.category.name?.uz}
            </p>
          )}

          <h3 className={`font-bold text-white mb-2 line-clamp-2 group-hover:text-cosmos-300 transition-colors ${featured ? 'text-xl' : 'text-base'}`}>
            {post.title?.uz}
          </h3>

          {post.excerpt?.uz && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {post.excerpt.uz}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FiEye className="text-cosmos-500" />
                {post.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiHeart className="text-pink-500" />
                {post.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-cosmos-500" />
                {post.readTime || 5} min
              </span>
            </div>
            <span className="text-slate-600">
              {post.publishedAt
                ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: uz })
                : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: uz })
              }
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
