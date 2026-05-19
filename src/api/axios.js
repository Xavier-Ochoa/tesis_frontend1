import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esfot_token')

  if (token) {
    // 🔒 MUY IMPORTANTE: no reemplazar headers, solo agregar
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('esfot_token')
      localStorage.removeItem('esfot_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
