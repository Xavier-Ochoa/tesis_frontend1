import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [token, setToken]         = useState('')
  const [contraseña, setContraseña] = useState('')
  const [loading, setLoading]     = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!token.trim()) { toast.error('Ingresa el token'); return }
    setLoading(true)
    try {
      await api.post(`/auth/nuevopassword/${token.trim()}`, { contraseña })
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Token inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8">
        <div className="text-4xl text-center mb-4">🔐</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Nueva contraseña</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Ingresa el token de tu correo y tu nueva contraseña.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Token de recuperación</label>
            <input value={token} onChange={e => setToken(e.target.value)} required
              className="input font-mono tracking-widest text-center" placeholder="Pega tu token aquí" />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input type="password" value={contraseña} onChange={e => setContraseña(e.target.value)} required
              className="input" placeholder="Mínimo 6 caracteres" minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>

        <Link to="/login" className="text-sm text-gray-400 hover:underline mt-4 block text-center">Volver al login</Link>
      </div>
    </div>
  )
}
