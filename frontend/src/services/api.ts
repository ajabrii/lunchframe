import axios from 'axios'

const rawApiBase = ((import.meta as any).env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
const API_BASE = rawApiBase.endsWith('/v1') ? rawApiBase : `${rawApiBase}/v1`

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle global errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Optional: window.location.href = '/login' (handled by AuthContext)
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE }
