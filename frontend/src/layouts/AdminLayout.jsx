import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  FiHome, FiFileText, FiUsers, FiFolder, FiImage,
  FiMessageSquare, FiLogOut, FiMenu, FiX, FiZap
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/admin', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/admin/posts', icon: FiFileText, label: 'Postlar' },
  { to: '/admin/users', icon: FiUsers, label: 'Foydalanuvchilar' },
  { to: '/admin/categories', icon: FiFolder, label: 'Kategoriyalar' },
  { to: '/admin/media', icon: FiImage, label: 'Media' },
  { to: '/admin/comments', icon: FiMessageSquare, label: 'Izohlar' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col"
            style={{
              background: 'rgba(2, 6, 23, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-cosmos-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <FiZap className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="font-bold text-white font-space">CosmosX</h1>
                  <p className="text-xs text-cosmos-400">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-cosmos-600 text-white shadow-lg shadow-cosmos-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="text-lg flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-cosmos-950">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                  <p className="text-xs text-cosmos-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
              >
                <FiLogOut /> Chiqish
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4"
          style={{
            background: 'rgba(2, 6, 23, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="flex-1" />
          <NavLink to="/" className="text-sm text-cosmos-400 hover:text-white transition-colors">
            ← Saytga qaytish
          </NavLink>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
