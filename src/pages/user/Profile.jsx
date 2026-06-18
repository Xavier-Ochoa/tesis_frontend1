import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

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

/* Fila de dato estático */
function DataRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>
        {value || <em style={{ color: 'var(--text-3)', fontWeight: 400 }}>—</em>}
      </span>
    </div>
  )
}

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

/* ══════════════════════════════════════════ */
export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('perfil')
  return (
    <div className="page" style={{ maxWidth: 640, animation: 'slideUp 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 1.5rem', letterSpacing: '-0.03em' }}>Mi Perfil</h1>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: 4 }}>
        {[['perfil', 'Datos personales'], ['password', 'Contraseña']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`tab ${tab === k ? 'active' : ''}`}>{l}</button>
        ))}
      </div>
      {tab === 'perfil'
        ? <ProfileTab user={user} updateUser={updateUser} />
        : <PasswordTab />}
    </div>
  )
}

/* ══ TAB: Datos personales ══ */
function ProfileTab({ user, updateUser }) {
  const [editing, setEditing] = useState(false)
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

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePhoto = e => { const f = e.target.files[0]; if (!f) return; setPhoto(f); setPreview(URL.createObjectURL(f)) }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (photo) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        fd.append('fotoPerfil', photo)
        res = await api.put('/auth/perfil', fd)
      } else {
        const payload = { ...form }
        if (payload.semestre !== '') payload.semestre = Number(payload.semestre)
        res = await api.put('/auth/perfil', payload)
      }
      updateUser(res.data?.usuario || res.data)
      toast.success('Perfil actualizado correctamente')
      setEditing(false)
    } catch (err) {
      const data = err.response?.data
      if (data?.errores?.length) data.errores.forEach(e => toast.error(e.mensaje))
      else toast.error(data?.msg || 'Error al actualizar')
    } finally { setLoading(false) }
  }

  const cancelEdit = () => {
    setForm({
      carrera:     user?.carrera     || '',
      semestre:    user?.semestre    || '',
      telefono:    user?.telefono    || '',
      descripcion: user?.descripcion || '',
      github:      user?.github      || '',
    })
    setPhoto(null)
    setPreview(user?.fotoPerfil?.url || null)
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Avatar + nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1.25rem',
        background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-l)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--border2)' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>
                  {user?.nombre?.[0]?.toUpperCase()}
                </span>}
          </div>
          {editing && (
            <button type="button" onClick={() => document.getElementById('photo-input').click()}
              title="Cambiar foto"
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24,
                borderRadius: '50%', background: 'var(--primary)', color: 'white',
                border: '2px solid var(--surface)', cursor: 'pointer',
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✏️
            </button>
          )}
          <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-1)', margin: '0 0 2px' }}>
            {user?.nombre} {user?.apellido}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 6px' }}>
            {user?.correoInstitucional || user?.email}
          </p>
          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary)', color: 'white',
            padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>
            {user?.rol}
          </span>
        </div>
      </div>

      {/* ── MODO VISTA ── */}
      {!editing && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

          {/* Datos bloqueados */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
              <LockIcon />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Datos no modificables
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <DataRow label="Nombre"   value={user?.nombre} />
              <DataRow label="Apellido" value={user?.apellido} />
              <DataRow label="Cédula"   value={user?.cedula} />
              <DataRow label="Correo institucional" value={user?.correoInstitucional || user?.email} />
              <DataRow label="Rol" value={user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : ''} />
            </div>
          </div>

          {/* Datos editables (solo lectura en modo vista) */}
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Datos de perfil
              </span>
              <button onClick={() => setEditing(true)} className="btn-primary"
                style={{ fontSize: 13, padding: '6px 16px', borderRadius: 8 }}>
                ✏️ Actualizar
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <DataRow label="Teléfono" value={user?.telefono} />
              <DataRow label="GitHub"   value={user?.github} />
              <DataRow label="Carrera"  value={user?.carrera} />
              {user?.rol === 'estudiante' && <DataRow label="Semestre" value={user?.semestre} />}
            </div>
            {(user?.descripcion) && (
              <div style={{ marginTop: '1rem' }}>
                <DataRow label="Bio / Descripción" value={user?.descripcion} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODO EDICIÓN ── */}
      {editing && (
        <form onSubmit={submit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Editando datos de perfil
            </span>
          </div>

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
              <input name="github" value={form.github} onChange={handle} className="input" placeholder="https://github.com/..." />
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
                  'Procesamiento Industrial de la Madera'].map(c => (
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

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2 }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ══ TAB: Contraseña ══ */
function PasswordTab() {
  const [form, setForm] = useState({ passwordactual: '', passwordnuevo: '', confirmarPassword: '' })
  const [show, setShow] = useState({ passwordactual: false, passwordnuevo: false, confirmarPassword: false })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const toggle = f => setShow(s => ({ ...s, [f]: !s[f] }))

  const noCoinciden = form.confirmarPassword.length > 0 && form.passwordnuevo !== form.confirmarPassword
  const siCoinciden = form.confirmarPassword.length > 0 && form.passwordnuevo === form.confirmarPassword

  const getPwStrength = pwd => {
    if (pwd.length === 0) return null
    if (pwd.length < 8)   return { level: 0, label: 'Muy corta', color: '#ef4444' }
    const score = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length
    if (score <= 1) return { level: 1, label: 'Débil',    color: '#f97316' }
    if (score === 2) return { level: 2, label: 'Moderada', color: '#eab308' }
    return               { level: 3, label: 'Fuerte',    color: '#22c55e' }
  }
  const strength = getPwStrength(form.passwordnuevo)

  const submit = async e => {
    e.preventDefault()
    if (form.passwordnuevo.length < 8)              { toast.error('Mínimo 8 caracteres'); return }
    if (!/[A-Z]/.test(form.passwordnuevo))          { toast.error('Debe incluir al menos una mayúscula'); return }
    if (!/[0-9]/.test(form.passwordnuevo))          { toast.error('Debe incluir al menos un número'); return }
    if (!/[^A-Za-z0-9]/.test(form.passwordnuevo))  { toast.error('Debe incluir al menos un símbolo (ej. !, @, #)'); return }
    if (form.passwordnuevo !== form.confirmarPassword) { toast.error('Las contraseñas nuevas no coinciden'); return }
    setLoading(true)
    try {
      await api.put('/auth/password', form)
      toast.success('Contraseña actualizada correctamente')
      setForm({ passwordactual: '', passwordnuevo: '', confirmarPassword: '' })
    } catch (err) {
      const data = err.response?.data
      if (data?.errores?.length) data.errores.forEach(e => toast.error(e.mensaje))
      else toast.error(data?.msg || data?.mensaje || 'Error al cambiar la contraseña')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 380 }}>
      <div>
        <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
          Contraseña actual <FieldHint required text="Tu contraseña actual para verificar tu identidad." />
        </label>
        <PasswordInput name="passwordactual" value={form.passwordactual} onChange={handle}
          show={show.passwordactual} onToggle={() => toggle('passwordactual')} required />
      </div>
      <div>
        <label className="label" style={{ display: 'flex', alignItems: 'center' }}>
          Nueva contraseña <FieldHint required text="Mínimo 8 caracteres, una mayúscula, un número y un símbolo." />
        </label>
        <PasswordInput name="passwordnuevo" value={form.passwordnuevo} onChange={handle}
          show={show.passwordnuevo} onToggle={() => toggle('passwordnuevo')} required minLength={8} />
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
          name="confirmarPassword" value={form.confirmarPassword} onChange={handle}
          show={show.confirmarPassword} onToggle={() => toggle('confirmarPassword')}
          required minLength={8}
          style={{
            paddingRight: '2.5rem',
            borderColor: noCoinciden ? '#ef4444' : siCoinciden ? '#10b981' : undefined,
            boxShadow: noCoinciden ? '0 0 0 2px rgba(239,68,68,0.2)' : siCoinciden ? '0 0 0 2px rgba(16,185,129,0.2)' : undefined,
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
        />
        {noCoinciden && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><span>✗</span> Las contraseñas no coinciden</p>}
        {siCoinciden && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span>✓</span> Las contraseñas coinciden</p>}
      </div>
      <button type="submit" disabled={loading || noCoinciden} className="btn-primary">
        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
