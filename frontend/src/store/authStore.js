import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { username, email, password })
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) return
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const { data } = await api.get('/auth/me')
          set({ user: data.user, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      }
    }),
    {
      name: 'cosmos-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
