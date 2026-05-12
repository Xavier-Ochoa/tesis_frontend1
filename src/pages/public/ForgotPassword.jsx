import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/recuperarpassword', { correoInstitucional: email })
      setSent(true)
      toast.success('Se envió el token a tu correo')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Correo no encontrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="text-4xl mb-4">🔑</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500 mb-6">Te enviaremos un token a tu correo institucional.</p>

        {sent ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">Revisa tu correo y usa el token en la siguiente pantalla.</p>
            </div>
            <Link to="/nuevo-password/TOKEN" className="btn-primary w-full block text-center text-sm">
              Tengo mi token →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label text-left">Correo institucional</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="usuario@epn.edu.ec" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar token'}
            </button>
          </form>
        )}

        <Link to="/login" className="text-sm text-gray-400 hover:underline mt-4 block">Volver al login</Link>
      </div>
    </div>
  )
}

export default ForgotPassword
