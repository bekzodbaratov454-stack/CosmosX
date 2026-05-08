import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSave, FiEye, FiGlobe, FiImage, FiVideo, FiX, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import RichEditor from '../../components/admin/RichEditor'

const POST_TYPES = ['article', 'fact', 'news', 'mystery', 'discovery']

export default function AdminPostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [categories, setCategories] = useState([])
  const [activeLang, setActiveLang] = useState('uz')
  const [saving, setSaving] = useState(false)
  const [mediaFiles, setMediaFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: { uz: '', en: '' },
    content: { uz: '', en: '' },
    excerpt: { uz: '', en: '' },
    category: '',
    tags: '',
    postType: 'article',
    status: 'pending',
    featured: false,
    coverImage: { url: '', alt: '' },
    media: [],
  })

  useEffect(() => {
    api.get('/categories/all').then(({ data }) => setCategories(data.categories))
    if (isEdit) {
      api.get(`/posts/id/${id}`).then(({ data }) => {
        const p = data.post
        setForm({
          title: p.title || { uz: '', en: '' },
          content: p.content || { uz: '', en: '' },
          excerpt: p.excerpt || { uz: '', en: '' },
          category: p.category?._id || '',
          tags: (p.tags || []).join(', '),
          postType: p.postType || 'article',
          status: p.status || 'pending',
          featured: p.featured || false,
          coverImage: p.coverImage || { url: '', alt: '' },
          media: p.media || [],
        })
        setMediaFiles(p.media || [])
      })
    }
  }, [id, isEdit])

  const handleSave = async () => {
    if (!form.title.uz.trim()) { toast.error('Sarlavha (UZ) kiritilishi shart'); return }
    if (!form.content.uz.trim()) { toast.error('Kontent (UZ) kiritilishi shart'); return }
    if (!form.category) { toast.error('Kategoriya tanlang'); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        media: mediaFiles,
      }
      if (isEdit) {
        await api.put(`/posts/${id}`, payload)
        toast.success('Post yangilandi! ✅')
      } else {
        const { data } = await api.post('/posts', payload)
        toast.success('Post yaratildi! 🚀')
        navigate(`/admin/posts/edit/${data.post._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const newMedia = data.media.map(m => ({
        type: m.type,
        url: m.url,
        caption: ''
      }))
      setMediaFiles(prev => [...prev, ...newMedia])
      toast.success(`${files.length} ta fayl yuklandi`)
    } catch { toast.error('Yuklash xatoligi') }
    finally { setUploading(false) }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(prev => ({ ...prev, coverImage: { url: data.media[0].url, alt: form.title.uz } }))
      toast.success('Muqova yuklandi!')
    } catch { toast.error('Xatolik') }
    finally { setUploading(false) }
  }

  const addYoutube = () => {
    const url = prompt('YouTube URL yoki Video ID kiriting:')
    if (!url) return
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    const youtubeId = match ? match[1] : url
    setMediaFiles(prev => [...prev, { type: 'youtube', youtubeId, url: `https://youtube.com/watch?v=${youtubeId}`, caption: '' }])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Postni Tahrirlash' : 'Yangi Post'}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEdit ? 'Mavjud postni yangilang' : 'Yangi maqola yozing'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex rounded-xl overflow-hidden border border-cosmos-800">
            {['uz', 'en'].map(lang => (
              <button key={lang} onClick={() => setActiveLang(lang)}
                className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-1 ${
                  activeLang === lang ? 'bg-cosmos-600 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                <FiGlobe className="text-xs" />
                {lang === 'uz' ? "O'zbek" : 'English'}
              </button>
            ))}
          </div>

          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="input-cosmos py-2 text-sm w-36">
            <option value="pending">⏳ Kutmoqda</option>
            <option value="done">✅ Aktiv</option>
            <option value="archived">📦 Arxiv</option>
          </select>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <FiSave /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="xl:col-span-2 space-y-5">
          {/* Language indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <FiGlobe className="text-cosmos-400" />
            <span className="text-slate-400">
              {activeLang === 'uz' ? "O'zbek tili (majburiy)" : 'English (ixtiyoriy — tarjima)'}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Sarlavha {activeLang === 'uz' ? '(UZ) *' : '(EN)'}
            </label>
            <input
              value={form.title[activeLang]}
              onChange={e => setForm({ ...form, title: { ...form.title, [activeLang]: e.target.value } })}
              placeholder={activeLang === 'uz' ? 'Post sarlavhasi...' : 'Post title...'}
              className="input-cosmos text-lg font-semibold"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Qisqa tavsif {activeLang === 'uz' ? '(UZ)' : '(EN)'}
            </label>
            <textarea
              value={form.excerpt[activeLang]}
              onChange={e => setForm({ ...form, excerpt: { ...form.excerpt, [activeLang]: e.target.value } })}
              placeholder="Qisqa tavsif (SEO uchun)..."
              className="input-cosmos resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Rich Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Kontent {activeLang === 'uz' ? '(UZ) *' : '(EN)'}
            </label>
            <RichEditor
              key={activeLang}
              content={form.content[activeLang]}
              onChange={val => setForm({ ...form, content: { ...form.content, [activeLang]: val } })}
              placeholder={activeLang === 'uz' ? 'Maqola matnini yozing...' : 'Write article content...'}
            />
          </div>

          {/* Media */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">📸 Media Fayllar</h3>
              <div className="flex gap-2">
                <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1">
                  <FiImage /> Rasm/Video
                  <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button onClick={addYoutube} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <FiVideo /> YouTube
                </button>
              </div>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-cosmos-400 mb-3">
                <span className="w-4 h-4 border-2 border-cosmos-400/30 border-t-cosmos-400 rounded-full animate-spin" />
                Yuklanmoqda...
              </div>
            )}
            {mediaFiles.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {mediaFiles.map((item, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-800">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : item.type === 'youtube' ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-900/20">
                        <span className="text-2xl">▶️</span>
                      </div>
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">Media fayllar yo'q</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Cover image */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3">🖼️ Muqova Rasm</h3>
            {form.coverImage?.url ? (
              <div className="relative rounded-xl overflow-hidden aspect-video mb-3">
                <img src={form.coverImage.url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setForm({ ...form, coverImage: { url: '', alt: '' } })}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <FiX className="text-xs" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-cosmos-800 rounded-xl p-6 text-center cursor-pointer hover:border-cosmos-600 transition-colors mb-3">
                <FiImage className="text-3xl text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Rasm yuklash</p>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            )}
            <input
              value={form.coverImage?.url || ''}
              onChange={e => setForm({ ...form, coverImage: { ...form.coverImage, url: e.target.value } })}
              placeholder="Yoki URL kiriting..."
              className="input-cosmos text-sm"
            />
          </div>

          {/* Settings */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white">⚙️ Sozlamalar</h3>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Kategoriya *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-cosmos text-sm">
                <option value="">Kategoriya tanlang</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.icon} {cat.name?.uz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Post turi</label>
              <select value={form.postType} onChange={e => setForm({ ...form, postType: e.target.value })}
                className="input-cosmos text-sm">
                {POST_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Teglar (vergul bilan)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="koinot, sayyora, nasa" className="input-cosmos text-sm" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all relative ${form.featured ? 'bg-cosmos-600' : 'bg-slate-700'}`}
                onClick={() => setForm({ ...form, featured: !form.featured })}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-slate-400">⭐ Featured post</span>
            </label>
          </div>

          {/* Status info */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3">📊 Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Holat:</span>
                <span className={form.status === 'done' ? 'text-green-400' : form.status === 'pending' ? 'text-yellow-400' : 'text-slate-400'}>
                  {form.status === 'done' ? '✅ Aktiv' : form.status === 'pending' ? '⏳ Kutmoqda' : '📦 Arxiv'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarjima:</span>
                <span className={form.content.en ? 'text-cyan-400' : 'text-slate-600'}>
                  {form.content.en ? '✅ Bor' : '❌ Yo\'q'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Featured:</span>
                <span className={form.featured ? 'text-yellow-400' : 'text-slate-600'}>
                  {form.featured ? '⭐ Ha' : '—'}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl text-xs text-slate-500"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
              💡 <strong className="text-slate-400">Pending</strong> — faqat admin ko'radi.<br />
              <strong className="text-slate-400">Done</strong> — barcha foydalanuvchilar ko'radi.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
