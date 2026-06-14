import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

const ROLES = { estudiante: 'Estudiante', docente: 'Docente' }

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ nombre:'', apellido:'', cedula:'', correoInstitucional:'', contraseña:'', rol:'estudiante', carrera:'', semestre:'' })
  const [loading, setLoading]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  // Validación de fortaleza de contraseña (igual que backend)
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return { level: -1, label: '', color: 'var(--border2)' }
    if (pwd.length < 8)   return { level: 0, label: 'Muy corta', color: '#ef4444' }
    const hasUpper  = /[A-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
    const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length
    if (score === 0) return { level: 1, label: 'Débil', color: '#f97316' }
    if (score === 1) return { level: 1, label: 'Débil', color: '#f97316' }
    if (score === 2) return { level: 2, label: 'Moderada', color: '#eab308' }
    return { level: 3, label: 'Fuerte', color: '#22c55e' }
  }
  const pwdStrength = getPasswordStrength(form.contraseña)
  const pwdValid = pwdStrength.level === 3

  // Al pulsar "Crear cuenta" → validar contraseña antes de mostrar modal
  const handlePreSubmit = e => {
    e.preventDefault()
    if (!pwdValid) {
      toast.error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo.')
      return
    }
    setShowConfirm(true)
  }

  // Al confirmar en el modal → enviar al backend
  const submit = async () => {
    setShowConfirm(false)
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.semestre) payload.semestre = Number(payload.semestre)
      else delete payload.semestre
      // carrera es obligatoria, se envía siempre
      await api.post('/auth/registro', payload)
      toast.success('Registro exitoso. Revisa tu correo para el token.')
      navigate('/confirmar-email')
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.msg || 'Error al registrarse')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 460, animation: 'slideUp 0.4s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Crear cuenta</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>Completa con tus datos de la EPN</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handlePreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Nombre <FieldHint required text="Solo letras. Mín. 2 caracteres." /></label>
                <input name="nombre" required value={form.nombre} onChange={handle} className="input" placeholder="Juan" />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Apellido <FieldHint required text="Solo letras. Mín. 2 caracteres." /></label>
                <input name="apellido" required value={form.apellido} onChange={handle} className="input" placeholder="Pérez" />
              </div>
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Cédula <FieldHint required text="Exactamente 10 dígitos numéricos." /></label>
              <input name="cedula" required value={form.cedula} onChange={handle} className="input" placeholder="1712345678" maxLength={10} />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Correo institucional <FieldHint required text="Debe terminar en @epn.edu.ec." /></label>
              <input name="correoInstitucional" type="email" required value={form.correoInstitucional} onChange={handle} className="input" placeholder="usuario@epn.edu.ec" />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Contraseña <FieldHint required text="Mínimo 8 caracteres, una mayúscula, un número y un símbolo." /></label>
              <input name="contraseña" type="password" required value={form.contraseña} onChange={handle} className="input" placeholder="Mínimo 8 caracteres" minLength={8} />
              {form.contraseña.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwdStrength.level ? pwdStrength.color : 'var(--border2)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: pwdStrength.color, fontWeight: 600 }}>{pwdStrength.label}</span>
                  {!pwdValid && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0' }}>
                      Debe incluir: mayúscula, número y símbolo (ej. <code>!</code>, <code>@</code>, <code>#</code>)
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Rol <FieldHint required text="Estudiante: proyectos requieren aprobación. Docente: publica directamente." /></label>
              <select name="rol" value={form.rol} onChange={handle} className="input">
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: form.rol === 'estudiante' ? '1fr 1fr' : '1fr', gap: 12 }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Carrera <FieldHint required text="Selecciona tu carrera." /></label>
                <select name="carrera" required value={form.carrera} onChange={handle} className="input">
                  <option value="" disabled>-- Selecciona una carrera --</option>
                  {['Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica','Redes y Telecomunicaciones','Procesamiento de Alimentos','Procesamiento Industrial de la Madera'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {form.rol === 'estudiante' && (
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Semestre <FieldHint text="Número del 1 al 5." /></label>
                  <input name="semestre" type="number" min={1} max={5} value={form.semestre} onChange={handle} className="input" placeholder="1 - 5" />
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Registrando...' : 'Crear cuenta →'}
            </button>
          </form>
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: '1rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Iniciar sesión</Link>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: '4px' }}>
            ¿Ya te registraste y tienes tu token?{' '}
            <Link to="/confirmar-email" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Confirmar email</Link>
          </p>
        </div>
      </div>

      {/* ── Modal de confirmación ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '2rem', maxWidth: 420, width: '100%',
            boxShadow: 'var(--shadow-lg)', animation: 'slideUp 0.25s ease-out',
          }}>
            {/* Icono + título */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                ¿Confirmas tus datos?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
                Estos campos <strong style={{ color: 'var(--text-2)' }}>no podrán modificarse</strong> una vez creada la cuenta. Verifica que todo sea correcto.
              </p>
            </div>

            {/* Datos a confirmar */}
            <div style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem',
            }}>
              {[
                { label: 'Nombre completo', value: `${form.nombre} ${form.apellido}`.trim() },
                { label: 'Cédula',          value: form.cedula },
                { label: 'Correo institucional', value: form.correoInstitucional },
                { label: 'Rol',             value: ROLES[form.rol] || form.rol },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', gap: 12,
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>
                    {row.value || <em style={{ color: 'var(--text-3)', fontWeight: 400 }}>—</em>}
                  </span>
                </div>
              ))}
            </div>

            {/* Advertencia */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: 12, color: '#b45309', margin: 0, lineHeight: 1.5 }}>
                Una vez registrado, el nombre, cédula, correo y rol <strong>no se pueden cambiar</strong>. Si hay un error, cancela y corrígelo ahora.
              </p>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                ← Cancelar y corregir
              </button>
              <button
                onClick={submit}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Sí, crear cuenta ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
