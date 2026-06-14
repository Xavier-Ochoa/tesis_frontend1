import { useState, Fragment } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { token: tokenParam } = useParams()

  // Si viene de ForgotPassword con navigate state, usarlo como referencia visual
  const emailRef = location.state?.email || ''

  // Paso 1: ingresar token | Paso 2: ingresar nueva contraseña
  const [step, setStep]         = useState(tokenParam && tokenParam !== 'TOKEN' ? 2 : 1)
  const [token, setToken]       = useState(tokenParam && tokenParam !== 'TOKEN' ? tokenParam : '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [passError, setPassError]   = useState('')

  // ── Paso 1: verificar que el token no esté vacío y pasar al paso 2 ──
  const handleNextStep = async e => {
    e.preventDefault()
    if (!token.trim()) { setTokenError('Ingresa el código de restablecimiento de tu correo'); return }
    setTokenError('')
    setLoading(true)
    try {
      await api.get(`/auth/recuperarpassword/${token.trim()}`)
      setStep(2)
    } catch (err) {
      setTokenError(err.response?.data?.msg || 'Código inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: cambiar la contraseña ──
  const handleSubmit = async e => {
    e.preventDefault()
    setPassError('')
    if (password.length < 8) { setPassError('La contraseña debe tener al menos 8 caracteres'); return }
    if (!/[A-Z]/.test(password)) { setPassError('La contraseña debe incluir al menos una mayúscula'); return }
    if (!/[0-9]/.test(password)) { setPassError('La contraseña debe incluir al menos un número'); return }
    if (!/[^A-Za-z0-9]/.test(password)) { setPassError('La contraseña debe incluir al menos un símbolo (ej. !, @, #)'); return }
    if (password !== confirm) { setPassError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      await api.post(`/auth/nuevopassword/${token.trim()}`, { password, confirmpassword: confirm })
      toast.success('¡Contraseña actualizada correctamente!')
      navigate('/login', { state: { fromReset: true } })
    } catch (err) {
      const data = err.response?.data

      // Si hay errores de validación de campos (array errores[]), mostrarlos inline
      if (data?.errores?.length) {
        const msgs = data.errores.map(e => e.mensaje).join(' · ')
        setPassError(msgs)
        return
      }

      const msg = data?.msg || ''

      // Solo volver al paso 1 si el error es explícitamente del token
      const esErrorToken =
        err.response?.status === 404 ||
        (msg.toLowerCase().includes('token') && !msg.toLowerCase().includes('contrase'))
      if (esErrorToken) {
        setTokenError(msg || 'Código inválido o expirado')
        setStep(1)
        setToken('')
      } else {
        setPassError(msg || 'Error al actualizar la contraseña')
      }
    } finally { setLoading(false) }
  }

  const EyeIcon = ({ show }) => show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const EyeBtn = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-3)', padding: 4, display: 'flex', alignItems: 'center',
        borderRadius: 6, transition: 'color 0.15s',
      }}
      title={show ? 'Ocultar' : 'Mostrar'}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
    >
      <EyeIcon show={show} />
    </button>
  )

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)',
      borderRadius: 10, padding: '10px 14px', animation: 'slideUp 0.2s ease-out',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <p style={{ fontSize: 13, color: '#ef4444', margin: 0, fontWeight: 500 }}>{msg}</p>
    </div>
  ) : null

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.4s ease-out' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{step === 1 ? '📧' : '🔐'}</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              {step === 1 ? 'Ingresa tu código de restablecimiento' : 'Nueva contraseña'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
              {step === 1
                ? <>Revisa tu correo{emailRef ? <> (<strong style={{ color: 'var(--text-2)' }}>{emailRef}</strong>)</> : ''} y copia el código de restablecimiento de contraseña que recibiste.</>
                : 'Elige una contraseña segura para tu cuenta.'
              }
            </p>
          </div>

          {/* Indicador de pasos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1.75rem' }}>
            {[1, 2].map((s, i) => (
              <Fragment key={s}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step >= s ? 'var(--primary)' : 'var(--border2)',
                    color: step >= s ? 'white' : 'var(--text-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, transition: 'all 0.3s',
                  }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 10, color: step >= s ? 'var(--primary)' : 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s === 1 ? 'Código' : 'Contraseña'}
                  </span>
                </div>
                {i === 0 && (
                  <div style={{ height: 2, width: 40, background: step > 1 ? 'var(--primary)' : 'var(--border2)', transition: 'background 0.3s', marginBottom: 20 }} />
                )}
              </Fragment>
            ))}
          </div>

          {/* ── PASO 1: Token ── */}
          {step === 1 && (
            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ErrorBox msg={tokenError} />
              <div>
                <label className="label">Código de restablecimiento de contraseña</label>
                <input
                  value={token}
                  onChange={e => { setToken(e.target.value); setTokenError('') }}
                  required
                  className="input"
                  style={{ fontFamily: 'JetBrains Mono, monospace', textAlign: 'center', letterSpacing: '0.08em', fontSize: 15, ...(tokenError ? { borderColor: 'rgba(239,68,68,0.5)' } : {}) }}
                  placeholder="Pega tu código aquí"
                  autoFocus
                />
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '5px 0 0 2px' }}>
                  El código de restablecimiento se envió a tu correo institucional. Puede tardar unos segundos en llegar.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Verificando...
                    </span>
                  : 'Verificar código →'
                }
              </button>
            </form>
          )}

          {/* ── PASO 2: Nueva contraseña ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ErrorBox msg={passError} />

              <div>
                <label className="label">Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPassError('') }}
                    required
                    minLength={8}
                    className="input"
                    style={{ paddingRight: 44, ...(passError ? { borderColor: 'rgba(239,68,68,0.5)' } : {}) }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <EyeBtn show={showPass} toggle={() => setShowPass(v => !v)} />
                </div>
                {/* Barra de fortaleza */}
                {password.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                      {[0, 1, 2, 3].map(i => {
                        const strength = password.length < 8 ? 0 : (() => { const u=/[A-Z]/.test(password), n=/[0-9]/.test(password), s=/[^A-Za-z0-9]/.test(password); return [u,n,s].filter(Boolean).length })()
                        return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength + 1 ? ['#f97316','#eab308','#22c55e'][strength - 1] || 'var(--border2)' : 'var(--border2)', transition: 'background 0.3s' }} />
                      })}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>
                      {password.length < 8 ? 'Muy corta' : (() => { const u=/[A-Z]/.test(password), n=/[0-9]/.test(password), s=/[^A-Za-z0-9]/.test(password); const score=[u,n,s].filter(Boolean).length; return score===3?'Fuerte':score===2?'Moderada':'Débil' })()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirmar contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setPassError('') }}
                    required
                    className="input"
                    style={{
                      paddingRight: 44,
                      ...(confirm.length > 0 && confirm !== password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}),
                      ...(confirm.length > 0 && confirm === password ? { borderColor: 'rgba(34,197,94,0.5)' } : {}),
                    }}
                    placeholder="Repite tu nueva contraseña"
                    autoComplete="new-password"
                  />
                  <EyeBtn show={showConf} toggle={() => setShowConf(v => !v)} />
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0 2px' }}>Las contraseñas no coinciden</p>
                )}
                {confirm.length > 0 && confirm === password && (
                  <p style={{ fontSize: 11, color: '#22c55e', margin: '4px 0 0 2px' }}>✓ Las contraseñas coinciden</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading || confirm !== password || password.length < 6} className="btn-primary" style={{ width: '100%' }}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        Actualizando...
                      </span>
                    : 'Cambiar contraseña →'
                  }
                </button>
              </div>
            </form>
          )}

          <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
