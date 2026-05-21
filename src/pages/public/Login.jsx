import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]         = useState({ correoInstitucional: '', contraseña: '' })
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')

  const handle = e => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.usuario || data, data.token)
      toast.success('¡Bienvenido!')
      navigate(data.usuario?.rol === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.msg || ''

      // Cuenta no confirmada → aviso especial con enlace
      if (msg.toLowerCase().includes('confirmar') || msg.toLowerCase().includes('confirmado') || msg.toLowerCase().includes('confirma')) {
        setError('__NO_CONFIRMADO__')
        return
      }

      // Credenciales incorrectas → error inline
      const esCredenciales =
        err.response?.status === 400 ||
        err.response?.status === 401 ||
        msg.toLowerCase().includes('contraseña') ||
        msg.toLowerCase().includes('correo') ||
        msg.toLowerCase().includes('credencial') ||
        msg.toLowerCase().includes('incorrecta') ||
        msg.toLowerCase().includes('inválid') ||
        msg.toLowerCase().includes('no encontrad')

      if (esCredenciales) {
        setError('El correo o la contraseña son incorrectos.')
      } else {
        toast.error(msg || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>

      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, animation: 'slideUp 0.4s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 20 }}>EP</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>POLIESFOT — EPN</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${error ? 'var(--danger, #ef4444)' : 'var(--border)'}`, borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-lg)', transition: 'border-color 0.2s' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Error inline — cuenta no confirmada */}
            {error === '__NO_CONFIRMADO__' && (
              <div style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: 10, padding: '12px 14px',
                animation: 'slideUp 0.2s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📧</span>
                  <p style={{ fontSize: 13, color: '#b45309', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                    Tu cuenta aún no ha sido confirmada. Revisa tu correo institucional e ingresa el token de verificación.
                  </p>
                </div>
                <a
                  href="/confirmar-email"
                  style={{
                    display: 'block', textAlign: 'center', width: '100%',
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.5)',
                    borderRadius: 8, padding: '8px 12px',
                    color: '#b45309', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  Confirmar mi cuenta →
                </a>
              </div>
            )}

            {/* Error inline — credenciales incorrectas */}
            {error && error !== '__NO_CONFIRMADO__' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 10, padding: '10px 14px',
                animation: 'slideUp 0.2s ease-out',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 13, color: '#ef4444', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <div>
              <label className="label">Correo institucional</label>
              <input
                name="correoInstitucional"
                type="email"
                required
                value={form.correoInstitucional}
                onChange={handle}
                className="input"
                placeholder="usuario@epn.edu.ec"
                style={error ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="contraseña"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.contraseña}
                  onChange={handle}
                  className="input"
                  placeholder="••••••••"
                  style={{ paddingRight: 44, ...(error ? { borderColor: 'rgba(239,68,68,0.5)' } : {}) }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', padding: 4, display: 'flex', alignItems: 'center',
                    borderRadius: 6, transition: 'color 0.15s',
                  }}
                  title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  {showPass ? (
                    // Ojo tachado (ocultar)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Ojo (mostrar)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Ingresando...' : 'Iniciar sesión →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
            <Link to="/recuperar-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Regístrate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
