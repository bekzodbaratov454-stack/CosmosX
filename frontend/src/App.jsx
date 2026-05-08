import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Layouts
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

// Public pages
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import CategoryPage from './pages/CategoryPage'
import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import SolarSystemPage from './pages/SolarSystemPage'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminPosts from './pages/admin/Posts'
import AdminPostEditor from './pages/admin/PostEditor'
import AdminUsers from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import AdminMedia from './pages/admin/Media'
import AdminComments from './pages/admin/Comments'

// Stars background
import StarsBackground from './components/ui/StarsBackground'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <StarsBackground />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="post/:slug" element={<PostPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 3D Solar System - standalone full screen */}
        <Route path="/solar-system" element={<SolarSystemPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<AdminPostEditor />} />
          <Route path="posts/edit/:id" element={<AdminPostEditor />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="comments" element={<AdminComments />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
