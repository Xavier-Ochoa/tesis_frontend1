import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const navigate  = useNavigate()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/recuperarpassword', { correoInstitucional: email })
      toast.success('Token enviado a tu correo')
      // Redirigir a la página de reset pasando el correo como state (referencia)
      navigate('/nuevo-password', { state: { email } })
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Correo no encontrado')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'slideUp 0.4s ease-out' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>

          <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            Recuperar contraseña
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 1.5rem' }}>
            Ingresa tu correo institucional y te enviaremos un token de recuperación.
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="usuario@epn.edu.ec"
              autoComplete="email"
            />
            <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Enviando...
                  </span>
                : 'Enviar token →'
              }
            </button>
          </form>

          <Link to="/login" style={{ display: 'block', marginTop: '1rem', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
