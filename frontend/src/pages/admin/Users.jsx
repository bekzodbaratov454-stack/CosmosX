import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiSlash, FiTrash2, FiUser, FiUserX } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/users?${params}`),
        api.get('/users/stats')
      ])
      setUsers(usersRes.data.users)
      setPagination(usersRes.data.pagination)
      setStats(statsRes.data.stats)
    } catch { toast.error('Xatolik') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleUpdate = async (id, updates) => {
    try {
      const { data } = await api.put(`/users/${id}`, updates)
      setUsers(prev => prev.map(u => u._id === id ? data.user : u))
      toast.success('Yangilandi!')
    } catch { toast.error('Xatolik') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('O\'chirildi')
    } catch { toast.error('Xatolik') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Foydalanuvchilar</h1>
          <p className="text-slate-500 text-sm">{pagination.total || 0} ta foydalanuvchi</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Jami', value: stats.total, color: '#6366f1' },
            { label: 'Oddiy', value: stats.regular, color: '#8b5cf6' },
            { label: 'Admin', value: stats.admins, color: '#f59e0b' },
            { label: 'Bloklangan', value: stats.banned, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl text-center"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); setPage(1); fetchUsers() }} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki email..." className="input-cosmos pl-9 py-2 text-sm" />
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-sm">Qidirish</button>
      </form>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Foydalanuvchi', 'Email', 'Rol', 'Holat', 'Qo\'shilgan', 'Amallar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((user, i) => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-300">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select value={user.role} onChange={e => handleUpdate(user._id, { role: e.target.value })}
                      className={`text-xs px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${
                        user.role === 'admin' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-cosmos-500/15 text-cosmos-400'
                      }`}>
                      <option value="user">👤 User</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${user.isBanned ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'badge-done'}`}>
                      {user.isBanned ? '🚫 Bloklangan' : '✅ Aktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: uz })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdate(user._id, { isBanned: !user.isBanned })}
                        className={`p-1.5 rounded-lg transition-all text-sm ${
                          user.isBanned
                            ? 'text-green-400 hover:bg-green-500/10'
                            : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        title={user.isBanned ? 'Blokdan chiqarish' : 'Bloklash'}>
                        <FiSlash />
                      </button>
                      <button onClick={() => handleDelete(user._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
                        <FiTrash2 />
                      </button>
                    </div>
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
