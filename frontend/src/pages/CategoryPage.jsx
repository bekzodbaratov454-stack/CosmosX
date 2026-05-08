import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import api from '../lib/api'
import PostCard from '../components/PostCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [catRes, postsRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/posts?limit=12&page=${page}`)
        ])
        const cat = catRes.data.categories.find(c => c.slug === slug)
        setCategory(cat)
        if (cat) {
          const { data } = await api.get(`/posts?category=${cat._id}&limit=12&page=${page}`)
          setPosts(data.posts)
          setPagination(data.pagination)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, page])

  if (!loading && !category) return (
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🌌</div>
        <h2 className="text-2xl font-bold text-white">Kategoriya topilmadi</h2>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{category?.name?.uz || 'Kategoriya'} — CosmosX</title>
      </Helmet>

      <div className="relative z-10 pt-20">
        {/* Hero */}
        <div className="relative py-20 px-4 text-center overflow-hidden"
          style={{
            background: category ? `radial-gradient(ellipse at center, ${category.color}15 0%, transparent 70%)` : undefined
          }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-7xl mb-4">{category?.icon || '🌌'}</div>
            <h1 className="text-4xl font-bold text-white mb-3">{category?.name?.uz}</h1>
            {category?.description?.uz && (
              <p className="text-slate-400 max-w-xl mx-auto">{category.description.uz}</p>
            )}
            <p className="text-sm text-slate-600 mt-3">{pagination.total || 0} ta post</p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-white mb-2">Hali post yo'q</h3>
              <p className="text-slate-500">Bu kategoriyada hali maqolalar qo'shilmagan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    page === p ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
