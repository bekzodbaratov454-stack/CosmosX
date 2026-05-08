import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FiUser, FiBookmark, FiHeart, FiEdit2, FiSave, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import PostCard from '../components/PostCard'

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [editing, setEditing] = useState(false)
  const [savedPosts, setSavedPosts] = useState([])
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeTab === 'saved') {
      api.get('/auth/me').then(({ data }) => {
        // savedPosts to'liq populate qilingan bo'lishi kerak
        const posts = (data.user.savedPosts || []).filter(p => p && p._id && p.title)
        setSavedPosts(posts)
      }).catch(() => setSavedPosts([]))
    }
  }, [activeTab])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data.user)
      setEditing(false)
      toast.success('Profil yangilandi!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: FiUser },
    { id: 'saved', label: 'Saqlangan', icon: FiBookmark },
  ]

  return (
    <>
      <Helmet><title>Profil — CosmosX</title></Helmet>

      <div className="relative z-10 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
              <p className="text-slate-500">{user?.email}</p>
              {user?.bio && <p className="text-sm text-slate-400 mt-1">{user.bio}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                  {user?.role === 'admin' ? '👑 Admin' : '👤 Foydalanuvchi'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-cosmos-950/50 pb-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === id ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Profil ma'lumotlari</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                    <FiEdit2 /> Tahrirlash
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                      <FiX /> Bekor
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                      <FiSave /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Foydalanuvchi nomi</label>
                  {editing ? (
                    <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                      className="input-cosmos" />
                  ) : (
                    <p className="text-white">{user?.username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Email</label>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Bio</label>
                  {editing ? (
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                      className="input-cosmos resize-none" rows={3} placeholder="O'zingiz haqida yozing..." />
                  ) : (
                    <p className="text-white">{user?.bio || <span className="text-slate-600">Bio qo'shilmagan</span>}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">A'zo bo'lgan sana</label>
                  <p className="text-white">{new Date(user?.createdAt).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved posts tab */}
        {activeTab === 'saved' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {savedPosts.length === 0 ? (
              <div className="text-center py-20">
                <FiBookmark className="text-5xl mx-auto mb-4 text-slate-700" />
                <h3 className="text-xl font-bold text-white mb-2">Saqlangan postlar yo'q</h3>
                <p className="text-slate-500">Postlarni saqlash uchun ♥ tugmasini bosing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {savedPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
