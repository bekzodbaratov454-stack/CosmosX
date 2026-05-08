import axios from 'axios'

// Dev da: vite proxy orqali /api -> localhost:5000/api
// Production da (build): same origin /api -> localhost:5000/api
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('cosmos-auth')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch {}
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - 401 da logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cosmos-auth')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
