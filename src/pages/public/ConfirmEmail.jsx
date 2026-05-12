import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ConfirmEmail() {
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!token.trim()) { toast.error('Ingresa el token'); return }
    setLoading(true)
    try {
      await api.get(`/auth/confirm/${token.trim()}`)
      setDone(true)
      toast.success('¡Correo confirmado! Ya puedes iniciar sesión.')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Token inválido o ya usado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmar correo</h1>
        <p className="text-sm text-gray-500 mb-6">
          Revisa tu correo institucional y copia el token de verificación que te enviamos.
        </p>

        {done ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium text-sm">✅ Correo confirmado exitosamente</p>
            </div>
            <Link to="/login" className="btn-primary w-full block text-center">Iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label text-left">Token de verificación</label>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                className="input font-mono text-center tracking-widest"
                placeholder="Pega tu token aquí"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verificando...' : 'Confirmar cuenta'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 mt-4">
          <Link to="/registro" className="text-primary-700 hover:underline">Volver al registro</Link>
        </p>
      </div>
    </div>
  )
}
