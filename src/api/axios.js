import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Adjuntar token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esfot_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token expira o es inválido, limpiar sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const teniaToken = localStorage.getItem('esfot_token')
      localStorage.removeItem('esfot_token')
      localStorage.removeItem('esfot_user')
      if (teniaToken) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
