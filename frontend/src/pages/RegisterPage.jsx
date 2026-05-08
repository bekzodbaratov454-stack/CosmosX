import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Parol kamida 6 ta belgi'); return }
    const result = await register(form.username, form.email, form.password)
    if (result.success) {
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! 🎉')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <>
      <Helmet><title>Ro'yxatdan o'tish — CosmosX</title></Helmet>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <FiZap className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold gradient-text font-space">CosmosX</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Qo'shiling!</h1>
            <p className="text-slate-500">Koinot sirlarini birga kashf eting</p>
          </div>

          <div className="glass rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Foydalanuvchi nomi</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="username" type="text" value={form.username} onChange={handleChange}
                    placeholder="cosmosuser" className="input-cosmos pl-11" required minLength={3} maxLength={30} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="email@example.com" className="input-cosmos pl-11" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Parol</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="input-cosmos pl-11 pr-11" required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">Kamida 6 ta belgi</p>
              </div>

              <button type="submit" disabled={isLoading}
                className="btn-primary w-full py-4 text-base disabled:opacity-50">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ro'yxatdan o'tilmoqda...
                  </span>
                ) : "Ro'yxatdan o'tish 🚀"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Hisobingiz bormi?{' '}
                <Link to="/login" className="text-cosmos-400 hover:text-cosmos-300 font-medium">Kiring</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
