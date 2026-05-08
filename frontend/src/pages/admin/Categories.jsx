import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const ICONS = ['🌌', '🚀', '🪐', '🕳️', '⭐', '🌍', '🌊', '🔺', '🏛️', '💡', '🛸', '🌙', '☄️', '🌠', '🔭', '🏚️', '🗺️', '🌋', '🏔️', '🌿']
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#1e1b4b', '#0284c7', '#dc2626', '#d97706', '#059669', '#7c3aed']

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: { uz: '', en: '' }, description: { uz: '', en: '' }, icon: '🌌', color: '#6366f1', order: 0 })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories/all')
      setCategories(data.categories)
    } catch { toast.error('Xatolik') }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({ name: { uz: '', en: '' }, description: { uz: '', en: '' }, icon: '🌌', color: '#6366f1', order: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (cat) => {
    setForm({
      name: cat.name || { uz: '', en: '' },
      description: cat.description || { uz: '', en: '' },
      icon: cat.icon || '🌌',
      color: cat.color || '#6366f1',
      order: cat.order || 0,
    })
    setEditingId(cat._id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.uz.trim()) { toast.error('Kategoriya nomi kiritilishi shart'); return }
    try {
      if (editingId) {
        const { data } = await api.put(`/categories/${editingId}`, form)
        setCategories(prev => prev.map(c => c._id === editingId ? data.category : c))
        toast.success('Yangilandi!')
      } else {
        const { data } = await api.post('/categories', form)
        setCategories(prev => [...prev, data.category])
        toast.success('Yaratildi!')
      }
      resetForm()
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Kategoriyani o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(c => c._id !== id))
      toast.success('O\'chirildi')
    } catch { toast.error('Xatolik') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategoriyalar</h1>
          <p className="text-slate-500 text-sm">{categories.length} ta kategoriya</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Yangi Kategoriya
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                  <FiX />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nomi (UZ) *</label>
                    <input value={form.name.uz} onChange={e => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
                      placeholder="Kategoriya nomi" className="input-cosmos text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nomi (EN)</label>
                    <input value={form.name.en} onChange={e => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
                      placeholder="Category name" className="input-cosmos text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tavsif (UZ)</label>
                  <input value={form.description.uz} onChange={e => setForm({ ...form, description: { ...form.description, uz: e.target.value } })}
                    placeholder="Qisqa tavsif" className="input-cosmos text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">Ikonka</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${
                          form.icon === icon ? 'bg-cosmos-600 scale-110' : 'bg-white/5 hover:bg-white/10'
                        }`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">Rang</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${form.color === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tartib raqami</label>
                  <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    className="input-cosmos text-sm w-24" />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl flex items-center gap-3"
                  style={{ background: `${form.color}10`, border: `1px solid ${form.color}25` }}>
                  <span className="text-3xl">{form.icon}</span>
                  <div>
                    <p className="font-medium text-white">{form.name.uz || 'Kategoriya nomi'}</p>
                    <p className="text-xs text-slate-500">{form.name.en || 'Category name'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={resetForm} className="btn-secondary flex-1">Bekor qilish</button>
                <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiSave /> {editingId ? 'Yangilash' : 'Yaratish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl group relative"
              style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}25` }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{cat.icon}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <FiEdit2 className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(cat._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-white text-sm">{cat.name?.uz}</p>
              <p className="text-xs text-slate-500 mt-0.5">{cat.postCount || 0} post</p>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                <span className="text-xs text-slate-600">{cat.isActive ? 'Aktiv' : 'Nofaol'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
