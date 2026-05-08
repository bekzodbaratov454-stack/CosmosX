import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import {
  FiMenu, FiX, FiUser, FiLogOut, FiSettings,
  FiSearch, FiZap, FiBookmark
} from 'react-icons/fi'

const navLinks = [
  { to: '/', label: 'Bosh sahifa', end: true },
  { to: '/explore', label: 'Kashfiyot' },
  { to: '/category/koinot-yangiliklari', label: 'Koinot' },
  { to: '/category/yer-sirlari', label: 'Yer Sirlari' },
  { to: '/category/okean', label: 'Okean' },
  { to: '/solar-system', label: '🪐 3D Simulyator' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
      style={{
        background: scrolled ? 'rgba(2, 6, 23, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99, 102, 241, 0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <FiZap className="text-white text-lg" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text font-space">CosmosX</span>
            <div className="text-xs text-slate-500 leading-none">Koinot & Yer Sirlari</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-cosmos-600/20 border border-cosmos-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link to="/explore" className="hidden sm:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <FiSearch />
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-slate-300">{user?.username}</span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      background: 'rgba(15, 23, 42, 0.98)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                        <FiUser className="text-cosmos-400" /> Profil
                      </Link>
                      <Link to="/profile?tab=saved" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                        <FiBookmark className="text-cosmos-400" /> Saqlangan
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cosmos-400 hover:text-cosmos-300 hover:bg-cosmos-600/10 transition-all">
                          <FiSettings /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                        <FiLogOut /> Chiqish
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">Kirish</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:block">Ro'yxat</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'rgba(2, 6, 23, 0.98)', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}
          >
            <nav className="p-4 space-y-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'text-white bg-cosmos-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
