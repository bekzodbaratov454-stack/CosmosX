import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiHeart, FiBookmark, FiEye, FiClock, FiShare2, FiGlobe } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import Comments from '../components/Comments'

export default function PostPage() {
  const { slug } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('uz')
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${slug}`)
        setPost(data.post)
        setLikesCount(data.post.likesCount || 0)
        if (user) {
          // likes array faqat ID larni saqlaydi
          setLiked(data.post.likes?.some(id => 
            id === user._id || id?._id === user._id || id?.toString() === user._id?.toString()
          ))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, user])

  // Saved holatini alohida tekshir — /auth/me dan
  useEffect(() => {
    if (!isAuthenticated || !post) return
    api.get('/auth/me').then(({ data }) => {
      const savedIds = (data.user.savedPosts || []).map(p => p._id || p)
      setSaved(savedIds.some(id => id?.toString() === post._id?.toString()))
    }).catch(() => {})
  }, [post, isAuthenticated])

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Iltimos, avval kiring'); return }
    try {
      const { data } = await api.post(`/posts/${post._id}/like`)
      setLiked(data.liked)
      setLikesCount(data.likesCount)
    } catch { toast.error('Xatolik yuz berdi') }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Iltimos, avval kiring'); return }
    try {
      const { data } = await api.post(`/posts/${post._id}/save`)
      setSaved(data.saved)
      toast.success(data.saved ? 'Saqlandi!' : 'Olib tashlandi')
    } catch { toast.error('Xatolik yuz berdi') }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Havola nusxalandi!')
  }

  if (loading) return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-20">
      <div className="skeleton h-8 w-3/4 mb-4 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl mb-6" />
      <div className="space-y-3">
        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}
      </div>
    </div>
  )

  if (!post) return (
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🌌</div>
        <h2 className="text-2xl font-bold text-white mb-2">Post topilmadi</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">Bosh sahifaga qaytish</Link>
      </div>
    </div>
  )

  const displayContent = lang === 'en' && post.content?.en ? post.content.en : post.content?.uz
  const displayTitle = lang === 'en' && post.title?.en ? post.title.en : post.title?.uz

  return (
    <>
      <Helmet>
        <title>{post.title?.uz} — CosmosX</title>
        <meta name="description" content={post.excerpt?.uz || ''} />
      </Helmet>

      <div className="relative z-10 pt-20">
        {/* Cover */}
        {post.coverImage?.url && (
          <div className="pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title?.uz}
                className="w-full rounded-2xl"
                style={{ maxHeight: '480px', objectFit: 'contain', background: '#0f172a' }}
              />
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${post.coverImage?.url ? 'pt-6' : 'pt-28'}`}
          >
            {/* Category & type */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {post.category && (
                <Link to={`/category/${post.category.slug}`}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{
                    background: `${post.category.color}20`,
                    color: post.category.color,
                    border: `1px solid ${post.category.color}40`,
                  }}>
                  {post.category.icon} {post.category.name?.uz}
                </Link>
              )}
              <span className="badge-done">{post.postType}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {displayTitle}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 flex-wrap">
              {post.author && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {post.author.username?.[0]?.toUpperCase()}
                  </div>
                  <span>{post.author.username}</span>
                </div>
              )}
              <span className="flex items-center gap-1"><FiEye /> {post.views?.toLocaleString()}</span>
              <span className="flex items-center gap-1"><FiClock /> {post.readTime} min</span>
              <span>{post.publishedAt
                ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: uz })
                : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: uz })
              }</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-cosmos-950/50">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                  liked ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'btn-secondary'
                }`}>
                <FiHeart className={liked ? 'fill-current' : ''} /> {likesCount}
              </button>
              <button onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                  saved ? 'bg-cosmos-600/20 text-cosmos-400 border border-cosmos-600/30' : 'btn-secondary'
                }`}>
                <FiBookmark className={saved ? 'fill-current' : ''} />
                {saved ? 'Saqlangan' : 'Saqlash'}
              </button>
              <button onClick={handleShare} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                <FiShare2 /> Ulashish
              </button>

              {/* Language toggle */}
              {post.isTranslated ? (
                <button
                  onClick={() => setLang(lang === 'uz' ? 'en' : 'uz')}
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  <FiGlobe />
                  {/* Hozir qaysi tilda ekanligini va qaysi tilga o'tishini ko'rsat */}
                  <span>{lang === 'uz' ? '🇺🇿 UZ → 🇬🇧 EN' : '🇬🇧 EN → 🇺🇿 UZ'}</span>
                </button>
              ) : (
                <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-600 border border-slate-800">
                  <FiGlobe /> Tarjima yo'q
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            {/* Media gallery */}
            {post.media && post.media.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4">📸 Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.media.map((item, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                      ) : item.type === 'youtube' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}`}
                          className="w-full h-full"
                          allowFullScreen
                          title={item.caption}
                        />
                      ) : (
                        <video src={item.url} controls className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/explore?tag=${tag}`}
                    className="px-3 py-1 rounded-full text-sm text-cosmos-400 hover:text-white transition-colors"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Comments */}
          <div className="mt-12">
            <Comments postId={post._id} />
          </div>
        </div>
      </div>
    </>
  )
}
