import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiTrash2, FiCopy, FiImage, FiVideo, FiGrid, FiList } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminMedia() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const fileInputRef = useRef()

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 30 })
      if (typeFilter) params.set('type', typeFilter)
      const { data } = await api.get(`/media?${params}`)
      setMedia(data.media)
      setPagination(data.pagination)
    } catch { toast.error('Xatolik') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMedia() }, [page, typeFilter])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMedia(prev => [...data.media, ...prev])
      toast.success(`${files.length} ta fayl yuklandi!`)
    } catch { toast.error('Yuklash xatoligi') }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/media/${id}`)
      setMedia(prev => prev.filter(m => m._id !== id))
      toast.success('O\'chirildi')
    } catch { toast.error('Xatolik') }
  }

  const copyUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('URL nusxalandi!')
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Kutubxona</h1>
          <p className="text-slate-500 text-sm">{pagination.total || 0} ta fayl</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-cosmos-800">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <FiGrid />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${viewMode === 'list' ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <FiList />
            </button>
          </div>
          <button onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yuklanmoqda...</>
            ) : (
              <><FiUpload /> Yuklash</>
            )}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'Barchasi', icon: null },
          { value: 'image', label: 'Rasmlar', icon: FiImage },
          { value: 'video', label: 'Videolar', icon: FiVideo },
        ].map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => { setTypeFilter(value); setPage(1) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              typeFilter === value ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            style={typeFilter !== value ? { border: '1px solid rgba(99,102,241,0.15)' } : {}}>
            {Icon && <Icon />} {label}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <label className="block mb-6 border-2 border-dashed border-cosmos-800 rounded-2xl p-8 text-center cursor-pointer hover:border-cosmos-600 transition-colors group">
        <FiUpload className="text-4xl text-slate-600 mx-auto mb-3 group-hover:text-cosmos-400 transition-colors" />
        <p className="text-slate-500 group-hover:text-slate-300 transition-colors">
          Fayllarni bu yerga tashlang yoki bosing
        </p>
        <p className="text-xs text-slate-600 mt-1">Rasm va video fayllar (max 100MB)</p>
        <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" />
      </label>

      {/* Media grid/list */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3' : 'space-y-2'}>
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className={`skeleton rounded-xl ${viewMode === 'grid' ? 'aspect-square' : 'h-16'}`} />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <FiImage className="text-5xl mx-auto mb-3 opacity-30" />
          <p>Hali media fayllar yo'q</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="relative group rounded-xl overflow-hidden aspect-square bg-slate-800">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.alt || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <FiVideo className="text-3xl text-slate-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(item.url)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  <FiCopy className="text-sm" />
                </button>
                <button onClick={() => handleDelete(item._id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{item.originalName}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Fayl', 'Tur', 'Hajm', 'Yuklagan', 'Amallar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {media.map((item, i) => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                        {item.type === 'image' ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiVideo className="text-slate-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-300 truncate max-w-xs">{item.originalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.type}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatSize(item.size)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.uploadedBy?.username || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => copyUrl(item.url)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cosmos-400 hover:bg-cosmos-600/10 transition-all">
                        <FiCopy className="text-sm" />
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
