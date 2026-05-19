import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// ===============================
// INTERCEPTOR DE REQUEST (PRUEBA)
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('esfot_token')

    // 🔴 PRUEBAS VISUALES
    console.log('================ AXIOS REQUEST ================')
    console.log('URL:', config.url)
    console.log('METHOD:', config.method)
    console.log('TOKEN EN LOCALSTORAGE:', token)
    console.log('HEADERS ANTES:', config.headers)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✔ Authorization SET')
    } else {
      console.warn('❌ NO HAY TOKEN')
    }

    console.log('HEADERS DESPUÉS:', config.headers)
    console.log('==============================================')

    return config
  },
  (error) => {
    console.error('❌ ERROR EN REQUEST INTERCEPTOR', error)
    return Promise.reject(error)
  }
)

// ===============================
// INTERCEPTOR DE RESPONSE
// ===============================
api.interceptors.response.use(
  (response) => {
    console.log('🟢 RESPONSE OK:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('🔴 RESPONSE ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      console.warn('⚠️ TOKEN INVÁLIDO O EXPIRADO → LIMPIANDO SESIÓN')
      localStorage.removeItem('esfot_token')
      localStorage.removeItem('esfot_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
