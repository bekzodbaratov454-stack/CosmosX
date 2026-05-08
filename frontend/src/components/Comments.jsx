import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiTrash2, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Comments({ postId }) {
  const { user, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/post/${postId}`)
      setComments(data.comments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!isAuthenticated) { toast.error('Iltimos, avval kiring'); return }

    setSubmitting(true)
    try {
      const { data } = await api.post('/comments', {
        postId,
        content: newComment,
        parentComment: replyTo
      })
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c._id === replyTo ? { ...c, replies: [...(c.replies || []), data.comment] } : c
        ))
      } else {
        setComments(prev => [data.comment, ...prev])
      }
      setNewComment('')
      setReplyTo(null)
      toast.success('Izoh qo\'shildi!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(prev => prev.filter(c => c._id !== commentId))
      toast.success('Izoh o\'chirildi')
    } catch { toast.error('Xatolik') }
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FiMessageSquare className="text-cosmos-400" />
        Izohlar ({comments.length})
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-cosmos-400">
              <span>Javob yozilmoqda</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Izoh yozing..."
                className="input-cosmos flex-1"
                maxLength={1000}
              />
              <button type="submit" disabled={submitting || !newComment.trim()}
                className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-50">
                <FiSend />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl text-center text-sm text-slate-500"
          style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          Izoh qoldirish uchun <a href="/login" className="text-cosmos-400 hover:text-cosmos-300">kiring</a>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <FiMessageSquare className="text-4xl mx-auto mb-3 opacity-30" />
          <p>Hali izoh yo'q. Birinchi bo'ling!</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {comments.map((comment, i) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {comment.author?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{comment.author?.username}</span>
                      <span className="text-xs text-slate-600">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: uz })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => setReplyTo(comment._id)}
                        className="text-xs text-slate-600 hover:text-cosmos-400 transition-colors">
                        Javob berish
                      </button>
                      {(user?._id === comment.author?._id || user?.role === 'admin') && (
                        <button onClick={() => handleDelete(comment._id)}
                          className="text-xs text-red-500/50 hover:text-red-400 transition-colors flex items-center gap-1">
                          <FiTrash2 /> O'chirish
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 mt-3 space-y-3">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ background: 'rgba(99,102,241,0.05)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                          {reply.author?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-white">{reply.author?.username}</span>
                          <p className="text-xs text-slate-400 mt-0.5">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
