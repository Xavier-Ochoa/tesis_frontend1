import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

/* ── Icono candado ── */
const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

/* ── Icono ojo ── */
const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

/* ── Fila de dato bloqueado ── */
function LockedField({ label, value }) {
  return (
    <div>
      <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {label}
        <span title="No se puede modificar" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}>
          <LockIcon />
        </span>
      </label>
      <div className="input" style={{ background: 'var(--surface2)', color: 'var(--text-3)', cursor: 'not-allowed', userSelect: 'none' }}>
        {value || '—'}
      </div>
    </div>
  )
}

/* ── Input contraseña ── */
function PasswordInput({ name, value, onChange, show, onToggle, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <input name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        className="input" style={{ paddingRight: '2.5rem' }} {...props} />
      <button type="button" onClick={onToggle} tabIndex={-1}
        aria-label={show ? 'Ocultar' : 'Mostrar'}
        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
        <EyeIcon open={show} />
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════
   Página principal
══════════════════════════════════════════ */
export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  /* ── estado formulario editable ── */
  const [form, setForm] = useState({
    carrera:     user?.carrera     || '',
    semestre:    user?.semestre    || '',
    telefono:    user?.telefono    || '',
    descripcion: user?.descripcion || '',
    github:      user?.github      || '',
  })
  const [photo, setPhoto]     = useState(null)
  const [preview, setPreview] = useState(user?.fotoPerfil?.url || null)
  const [loading, setLoading] = useState(false)

  /* ── estado sección contraseña ── */
  const [pwForm, setPwForm] = useState({ passwordactual: '', passwordnuevo: '', confirmarPassword: '' })
  const [pwShow, setPwShow] = useState({ passwordactual: false, passwordnuevo: false, confirmarPassword: false })
  const [pwLoading, setPwLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePw = e => setPwForm({ ...pwForm, [e.target.name]: e.target.value })
  const togglePw = f => setPwShow(s => ({ ...s, [f]: !s[f] }))
  const handlePhoto = e => { const f = e.target.files[0]; if (!f) return; setPhoto(f); setPreview(URL.createObjectURL(f)) }

  const noCoinciden = pwForm.confirmarPassword.length > 0 && pwForm.passwordnuevo !== pwForm.confirmarPassword
  const siCoinciden = pwForm.confirmarPassword.length > 0 && pwForm.passwordnuevo === pwForm.confirmarPassword

  /* ── guardar perfil ── */
  const submitPerfil = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (photo) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
        fd.append('fotoPerfil', photo)
        res = await api.put('/auth/perfil', fd)
      } else {
        const payload = { ...form }
        if (payload.semestre) payload.semestre = Number(payload.semestre)
        else delete payload.semestre
        res = await api.put('/auth/perfil', payload)
      }
      updateUser(res.data?.usuario || res.data)
      toast.success('Perfil actualizado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error al actualizar')
    } finally { setLoading(false) }
  }

  /* ── cambiar contraseña ── */
  const submitPassword = async e => {
    e.preventDefault()
    if (pwForm.passwordnuevo.length < 8)         { toast.error('Mínimo 8 caracteres'); return }
    if (!/[A-Z]/.test(pwForm.passwordnuevo))     { toast.error('Debe incluir al menos una mayúscula'); return }
    if (!/[0-9]/.test(pwForm.passwordnuevo))     { toast.error('Debe incluir al menos un número'); return }
    if (!/[^A-Za-z0-9]/.test(pwForm.passwordnuevo)) { toast.error('Debe incluir al menos un símbolo (ej. !, @, #)'); return }
    if (pwForm.passwordnuevo !== pwForm.confirmarPassword) { toast.error('Las contraseñas nuevas no coinciden'); return }
    setPwLoading(true)
    try {
      await api.put('/auth/password', pwForm)
      toast.success('Contraseña actualizada correctamente')
      setPwForm({ passwordactual: '', passwordnuevo: '', confirmarPassword: '' })
    } catch (err) {
      const data = err.response?.data
      if (data?.errores?.length) data.errores.forEach(e => toast.error(e.mensaje))
      else toast.error(data?.msg || data?.mensaje || 'Error al cambiar la contraseña')
    } finally { setPwLoading(false) }
  }

  /* ── fortaleza contraseña ── */
  const getPwStrength = pwd => {
    if (pwd.length === 0) return null
    if (pwd.length < 8)   return { level: 0, label: 'Muy corta', color: '#ef4444' }
    const score = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length
    if (score <= 1) return { level: 1, label: 'Débil',    color: '#f97316' }
    if (score === 2) return { level: 2, label: 'Moderada', color: '#eab308' }
    return              { level: 3, label: 'Fuerte',    color: '#22c55e' }
  }
  const strength = getPwStrength(pwForm.passwordnuevo)

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="page" style={{ maxWidth: 640, animation: 'slideUp 0.4s ease-out' }}>

      {/* ── Encabezado con avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-l)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--border2)' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--primary)' }}>
                  {user?.nombre?.[0]?.toUpperCase()}
                </span>}
          </div>
          <button type="button" onClick={() => document.getElementById('photo-input').click()}
            title="Cambiar foto"
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
              borderRadius: '50%', background: 'var(--primary)', color: 'white',
              border: '2px solid var(--surface)', cursor: 'pointer',
              fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✏️
          </button>
          <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18,
            color: 'var(--text-1)', margin: '0 0 3px' }}>
            {user?.nombre} {user?.apellido}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 6px' }}>{user?.correoInstitucional || user?.email}</p>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary)', color: 'white',
            padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
            {user?.rol}
          </span>
        </div>
      </div>

      {/* ══ SECCIÓN 1: Información de perfil ══ */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>

        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800,
          color: 'var(--text-1)', margin: '0 0 1.25rem', letterSpacing: '-0.02em' }}>
          Información de perfil
        </h2>

        {/* Datos bloqueados */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <LockedField label="Nombre"   value={user?.nombre} />
          <LockedField label="Apellido" value={user?.apellido} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <LockedField label="Cédula"  value={user?.cedula} />
          <LockedField label="Correo institucional" value={user?.correoInstitucional || user?.email} />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 1.25rem' }} />

        {/* Datos editables */}
        <form onSubmit={submitPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
                Teléfono <FieldHint text="10 dígitos. Ej: 0991234567." />
              </label>
              <input name="telefono" value={form.telefono} onChange={handle} className="input" placeholder="0991234567" />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
                GitHub (usuario) <FieldHint text="Solo el usuario, sin URL." />
              </label>
              <input name="github" value={form.github} onChange={handle} className="input" placeholder="mi-usuario" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: user?.rol === 'estudiante' ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
                Carrera <FieldHint text="Selecciona tu carrera." />
              </label>
              <select name="carrera" value={form.carrera} onChange={handle} className="input">
                <option value="">-- Selecciona una carrera --</option>
                {['Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica',
                  'Redes y Telecomunicaciones','Procesamiento de Alimentos',
                  'Procesamiento industrial de la madera'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {user?.rol === 'estudiante' && (
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
                  Semestre <FieldHint text="Número del 1 al 5." />
                </label>
                <input name="semestre" type="number" min={1} max={5} value={form.semestre}
                  onChange={handle} className="input" placeholder="1 - 5" />
              </div>
            )}
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
              Bio / Descripción <FieldHint text="Máximo 500 caracteres." />
            </label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle}
              rows={3} className="input" style={{ resize: 'none' }} maxLength={500} />
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{form.descripcion.length}/500</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
            {loading ? 'Guardando...' : 'Actualizar perfil'}
          </button>
        </form>
      </section>

      {/* ══ SECCIÓN 2: Seguridad ══ */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>

        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800,
          color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Seguridad
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 1.25rem' }}>
          Cambia tu contraseña regularmente para mantener tu cuenta segura.
        </p>

        <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
              Contraseña actual <FieldHint required text="Tu contraseña actual para verificar tu identidad." />
            </label>
            <PasswordInput name="passwordactual" value={pwForm.passwordactual} onChange={handlePw}
              show={pwShow.passwordactual} onToggle={() => togglePw('passwordactual')} required />
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
              Nueva contraseña <FieldHint required text="Mínimo 8 caracteres, una mayúscula, un número y un símbolo." />
            </label>
            <PasswordInput name="passwordnuevo" value={pwForm.passwordnuevo} onChange={handlePw}
              show={pwShow.passwordnuevo} onToggle={() => togglePw('passwordnuevo')} required minLength={8} />
            {strength && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                      background: i < strength.level + 1 ? strength.color : 'var(--border2)',
                      transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
              Confirmar nueva contraseña <FieldHint required text="Repite la nueva contraseña." />
            </label>
            <PasswordInput
              name="confirmarPassword" value={pwForm.confirmarPassword} onChange={handlePw}
              show={pwShow.confirmarPassword} onToggle={() => togglePw('confirmarPassword')}
              required minLength={8}
              style={{
                paddingRight: '2.5rem',
                borderColor: noCoinciden ? '#ef4444' : siCoinciden ? '#10b981' : undefined,
                boxShadow: noCoinciden ? '0 0 0 2px rgba(239,68,68,0.2)' : siCoinciden ? '0 0 0 2px rgba(16,185,129,0.2)' : undefined,
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            />
            {noCoinciden && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>✗ Las contraseñas no coinciden</p>}
            {siCoinciden && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#10b981' }}>✓ Las contraseñas coinciden</p>}
          </div>

          <button type="submit" disabled={pwLoading || noCoinciden} className="btn-primary">
            {pwLoading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
