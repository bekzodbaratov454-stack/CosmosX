import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFileText, FiUsers, FiEye, FiTrendingUp, FiPlus, FiClock } from 'react-icons/fi'
import api from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, usersRes, userStatsRes] = await Promise.all([
          api.get('/posts/admin?limit=5'),
          api.get('/users?limit=5'),
          api.get('/users/stats'),
        ])
        setRecentPosts(postsRes.data.posts)
        setUserStats(userStatsRes.data.stats)

        // Calculate post stats
        const allPosts = postsRes.data.pagination
        setStats({
          totalPosts: allPosts.total,
          totalUsers: userStatsRes.data.stats.total,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Jami Postlar', value: stats?.totalPosts || 0, icon: FiFileText, color: '#6366f1', to: '/admin/posts' },
    { label: 'Foydalanuvchilar', value: userStats?.total || 0, icon: FiUsers, color: '#8b5cf6', to: '/admin/users' },
    { label: 'Bugun yangi', value: userStats?.newToday || 0, icon: FiTrendingUp, color: '#06b6d4', to: '/admin/users' },
    { label: 'Adminlar', value: userStats?.admins || 0, icon: FiUsers, color: '#f59e0b', to: '/admin/users' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Sayt statistikasi va boshqaruv</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Yangi Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.to}
              className="block p-5 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: `${card.color}10`,
                border: `1px solid ${card.color}25`,
              }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}20` }}>
                  <card.icon style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? <div className="skeleton h-7 w-16 rounded" /> : card.value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FiClock className="text-cosmos-400" /> So'nggi Postlar
            </h2>
            <Link to="/admin/posts" className="text-sm text-cosmos-400 hover:text-cosmos-300">Barchasi →</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
            ) : recentPosts.map(post => (
              <Link key={post._id} to={`/admin/posts/edit/${post._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${post.category?.color || '#6366f1'}15` }}>
                  {post.category?.icon || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate">
                    {post.title?.uz}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: uz })}
                  </p>
                </div>
                <span className={post.status === 'done' ? 'badge-done' : 'badge-pending'}>
                  {post.status === 'done' ? 'Aktiv' : 'Kutmoqda'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5">⚡ Tezkor Amallar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Yangi Post', icon: '📝', to: '/admin/posts/new', color: '#6366f1' },
              { label: 'Kategoriya', icon: '📁', to: '/admin/categories', color: '#8b5cf6' },
              { label: 'Media', icon: '🖼️', to: '/admin/media', color: '#06b6d4' },
              { label: 'Foydalanuvchilar', icon: '👥', to: '/admin/users', color: '#f59e0b' },
              { label: 'Izohlar', icon: '💬', to: '/admin/comments', color: '#10b981' },
              { label: 'Saytga o\'t', icon: '🌐', to: '/', color: '#ec4899' },
            ].map((action, i) => (
              <Link key={i} to={action.to}
                className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-slate-300">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
