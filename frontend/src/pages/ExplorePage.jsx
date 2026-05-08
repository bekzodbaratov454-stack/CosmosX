import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import api from '../lib/api'
import PostCard from '../components/PostCard'

const POST_TYPES = [
  { value: '', label: 'Barchasi' },
  { value: 'article', label: 'Maqola' },
  { value: 'fact', label: 'Fakt' },
  { value: 'news', label: 'Yangilik' },
  { value: 'mystery', label: 'Sir' },
  { value: 'discovery', label: 'Kashfiyot' },
]

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories))
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search) params.set('search', search)
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedType) params.set('type', selectedType)
      if (searchParams.get('tag')) params.set('tag', searchParams.get('tag'))
      if (searchParams.get('featured')) params.set('featured', 'true')

      const { data } = await api.get(`/posts?${params}`)
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedCategory, selectedType, searchParams])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedType('')
    setPage(1)
    setSearchParams({})
  }

  const hasFilters = search || selectedCategory || selectedType

  return (
    <>
      <Helmet>
        <title>Kashfiyot — CosmosX</title>
      </Helmet>

      <div className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">🔭 Kashfiyot</h1>
          <p className="text-slate-500">Barcha postlar va maqolalarni ko'ring</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className="input-cosmos pl-11"
              />
            </div>
            <button type="submit" className="btn-primary px-6">Qidirish</button>
            {hasFilters && (
              <button type="button" onClick={clearFilters}
                className="btn-secondary px-4 flex items-center gap-2">
                <FiX /> Tozalash
              </button>
            )}
          </form>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setSelectedType(value); setPage(1) }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedType === value
                    ? 'bg-cosmos-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={selectedType === value ? {} : { border: '1px solid rgba(99,102,241,0.15)' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !selectedCategory ? 'bg-cosmos-600/30 text-cosmos-300' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}>
              Barcha kategoriyalar
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => { setSelectedCategory(cat._id); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === cat._id ? 'text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
                style={selectedCategory === cat._id ? {
                  background: `${cat.color}25`,
                  border: `1px solid ${cat.color}40`,
                  color: cat.color
                } : { border: '1px solid rgba(99,102,241,0.1)' }}
              >
                {cat.icon} {cat.name?.uz}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-600 mb-6">
            {pagination.total || 0} ta post topildi
          </p>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌌</div>
            <h3 className="text-xl font-bold text-white mb-2">Hech narsa topilmadi</h3>
            <p className="text-slate-500">Boshqa kalit so'z bilan qidiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  page === p ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
