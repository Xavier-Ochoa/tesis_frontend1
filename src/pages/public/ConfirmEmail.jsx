import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ConfirmEmail() {
  const [token, setToken]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  // Reenvío
  const [showResend, setShowResend]   = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending]     = useState(false)

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

  const handleResend = async e => {
    e.preventDefault()
    if (!resendEmail.trim()) return
    setResending(true)
    try {
      await api.post('/auth/reenviar-confirmacion', { email: resendEmail.trim() })
      toast.success('Token reenviado. Revisa tu correo institucional.')
      setShowResend(false)
      setResendEmail('')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'No se pudo reenviar el token')
    } finally { setResending(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.4s ease-out' }}>
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
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 10, padding: 14, color: '#15803d', fontWeight: 600, fontSize: 14 }}>
                ✅ Correo confirmado exitosamente
              </div>
              <Link to="/login" className="btn-primary btn-lg" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Iniciar sesión →
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="input"
                  style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontSize: 15 }}
                  placeholder="Pega tu token aquí"
                />
                <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
                  {loading ? 'Verificando...' : 'Confirmar cuenta'}
                </button>
              </form>

              {/* Separador */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.25rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>¿No recibiste el correo?</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Botón reenviar */}
              {!showResend ? (
                <button
                  onClick={() => setShowResend(true)}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  Reenviar token de confirmación
                </button>
              ) : (
                <div style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '1rem', textAlign: 'left',
                  animation: 'slideUp 0.2s ease-out',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
                    Ingresa tu correo registrado
                  </p>
                  <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      className="input"
                      placeholder="usuario@epn.edu.ec"
                      style={{ margin: 0 }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => { setShowResend(false); setResendEmail('') }}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={resending}
                        className="btn-primary"
                        style={{ flex: 2 }}
                      >
                        {resending ? 'Enviando...' : 'Reenviar →'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          <Link to="/registro" style={{ display: 'block', marginTop: '1rem', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>
            ← Volver al registro
          </Link>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
