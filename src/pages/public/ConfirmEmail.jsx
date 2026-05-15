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
      toast.success('¡Correo confirmado!')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Token inválido o ya usado')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'slideUp 0.4s ease-out' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            Confirmar correo
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            Revisa tu correo institucional y copia el token de verificación que te enviamos.
          </p>

          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--success-l)', border: '1px solid var(--success)', borderRadius: 10, padding: '14px', color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>
                ✅ Correo confirmado exitosamente
              </div>
              <Link to="/login" className="btn-primary btn-lg" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Iniciar sesión →
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={token} onChange={e => setToken(e.target.value)}
                className="input" style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontSize: 15 }}
                placeholder="Pega tu token aquí" />
              <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
                {loading ? 'Verificando...' : 'Confirmar cuenta'}
              </button>
            </form>
          )}

          <Link to="/registro" style={{ display: 'block', marginTop: '1rem', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>
            ← Volver al registro
          </Link>
        </div>
      </div>
    </div>
  )
}
