import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get(`/posts/admin?${params}`)
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      toast.error('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [page, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`)
      setPosts(prev => prev.filter(p => p._id !== id))
      toast.success('Post o\'chirildi')
      setDeleteConfirm(null)
    } catch { toast.error('Xatolik') }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/posts/${id}`, { status })
      setPosts(prev => prev.map(p => p._id === id ? { ...p, status } : p))
      toast.success(`Status: ${status}`)
    } catch { toast.error('Xatolik') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Postlar</h1>
          <p className="text-slate-500 text-sm">{pagination.total || 0} ta post</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Yangi Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Qidirish..." className="input-cosmos pl-9 py-2 text-sm" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Qidirish</button>
        </form>

        <div className="flex gap-2">
          {[
            { value: '', label: 'Barchasi' },
            { value: 'done', label: '✅ Aktiv' },
            { value: 'pending', label: '⏳ Kutmoqda' },
            { value: 'archived', label: '📦 Arxiv' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => { setStatusFilter(value); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === value ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={statusFilter !== value ? { border: '1px solid rgba(99,102,241,0.15)' } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Post', 'Kategoriya', 'Status', 'Ko\'rishlar', 'Sana', 'Amallar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-600">
                    Hech narsa topilmadi
                  </td>
                </tr>
              ) : posts.map((post, i) => (
                <motion.tr
                  key={post._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
                  className="hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${post.category?.color || '#6366f1'}15` }}>
                        {post.category?.icon || '📝'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-300 truncate max-w-xs">
                          {post.title?.uz}
                        </p>
                        <p className="text-xs text-slate-600">{post.postType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{post.category?.name?.uz || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={post.status}
                      onChange={e => handleStatusChange(post._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${
                        post.status === 'done' ? 'bg-green-500/15 text-green-400' :
                        post.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      <option value="done">✅ Aktiv</option>
                      <option value="pending">⏳ Kutmoqda</option>
                      <option value="archived">📦 Arxiv</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FiEye /> {post.views?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: uz })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/post/${post.slug}`} target="_blank"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cosmos-400 hover:bg-cosmos-600/10 transition-all">
                        <FiEye className="text-sm" />
                      </Link>
                      <Link to={`/admin/posts/edit/${post._id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                        <FiEdit2 className="text-sm" />
                      </Link>
                      {deleteConfirm === post._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(post._id)}
                            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            Ha
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 rounded text-xs bg-slate-500/20 text-slate-400">
                            Yo'q
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(post._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <FiTrash2 className="text-sm" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === p ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
