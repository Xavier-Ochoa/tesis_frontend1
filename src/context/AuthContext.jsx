import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('esfot_user')) } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem('esfot_token') || null)
  const [loading, setLoading] = useState(true)

  // Verificar que el token siga siendo válido al cargar la app
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return }
      try {
        const { data } = await api.get('/auth/perfil')
        setUser(data)
        localStorage.setItem('esfot_user', JSON.stringify(data))
      } catch {
        setUser(null)
        setToken(null)
        localStorage.removeItem('esfot_token')
        localStorage.removeItem('esfot_user')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const login = (userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('esfot_token', jwt)
    localStorage.setItem('esfot_user', JSON.stringify(userData))
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
    setToken(null)
    localStorage.removeItem('esfot_token')
    localStorage.removeItem('esfot_user')
  }

  const updateUser = (data) => {
    setUser(data)
    localStorage.setItem('esfot_user', JSON.stringify(data))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin: user?.rol === 'admin', isDocente: user?.rol === 'docente' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
