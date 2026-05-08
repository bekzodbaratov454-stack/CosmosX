import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTrash2, FiExternalLink } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/comments/admin/all?page=${page}&limit=20`)
        setComments(data.comments)
        setPagination(data.pagination)
      } catch { toast.error('Xatolik') }
      finally { setLoading(false) }
    }
    fetchComments()
  }, [page])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/comments/${id}`)
      setComments(prev => prev.filter(c => c._id !== id))
      toast.success('Izoh o\'chirildi')
    } catch { toast.error('Xatolik') }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Izohlar</h1>
        <p className="text-slate-500 text-sm">{pagination.total || 0} ta izoh</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Foydalanuvchi', 'Izoh', 'Post', 'Sana', 'Amallar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-600">Izohlar yo'q</td>
                </tr>
              ) : comments.map((comment, i) => (
                <motion.tr key={comment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {comment.author?.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-300">{comment.author?.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-400 max-w-xs truncate">{comment.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 truncate max-w-32 block">
                      {comment.post?.title?.uz || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: uz })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(comment._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === p ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
