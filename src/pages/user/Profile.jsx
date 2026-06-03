import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('perfil')
  return (
    <div className="page" style={{ maxWidth: 640, animation: 'slideUp 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 1.5rem', letterSpacing: '-0.03em' }}>Mi Perfil</h1>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: 4 }}>
        {[['perfil','Datos personales'],['password','Contraseña']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={`tab ${tab===k?'active':''}`}>{l}</button>
        ))}
      </div>
      {tab === 'perfil' ? <ProfileForm user={user} updateUser={updateUser} /> : <PasswordForm user={user} />}
    </div>
  )
}

function ProfileForm({ user, updateUser }) {
  // apellido excluido del form: el backend no permite modificarlo después del registro
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
  const handlePhoto = e => { const f=e.target.files[0]; if(!f) return; setPhoto(f); setPreview(URL.createObjectURL(f)) }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (photo) {
        const fd = new FormData()
        Object.entries(form).forEach(([k,v]) => { if(v!=='') fd.append(k,v) })
        fd.append('fotoPerfil', photo)
        res = await api.put('/auth/perfil', fd)
      } else {
        const payload = { ...form }
        if (payload.semestre) payload.semestre = Number(payload.semestre)
        else delete payload.semestre
        res = await api.put('/auth/perfil', payload)
      }
      updateUser(res.data?.usuario || res.data)
      toast.success('Perfil actualizado')
    } catch (err) { toast.error(err.response?.data?.msg || 'Error al actualizar') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1.25rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-l)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border2)' }}>
            {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, color:'var(--primary)' }}>{user?.nombre?.[0]?.toUpperCase()}</span>}
          </div>
          <button type="button" onClick={() => document.getElementById('photo-input').click()}
            style={{ position:'absolute', bottom:0, right:0, width:24, height:24, borderRadius:'50%', background:'var(--primary)', color:'white', border:'none', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
            ✏️
          </button>
        </div>
        <div>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'var(--text-1)', margin:'0 0 2px' }}>{user?.nombre} {user?.apellido}</p>
          <p style={{ fontSize:12, color:'var(--text-3)', margin:'0 0 4px' }}>{user?.email}</p>
          <span style={{ fontSize:10, fontWeight:700, background:'var(--primary)', color:'white', padding:'2px 8px', borderRadius:100, textTransform:'uppercase' }}>{user?.rol}</span>
        </div>
        <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhoto} style={{ display:'none' }} />
      </div>

      <div style={{ background: 'var(--warning-l)', border: '1px solid var(--warning)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--warning)' }}>
        ⚠️ <strong>Nombre, apellido, cédula, correo y rol</strong> no se pueden modificar.
      </div>

      {[
        { name:'telefono', label:'Teléfono', hint:'10 dígitos. Ej: 0991234567.', placeholder:'0991234567' },
        { name:'github', label:'GitHub (usuario)', hint:'Solo el usuario, sin URL.', placeholder:'mi-usuario' },
      ].map(f => (
        <div key={f.name}>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>{f.label} <FieldHint text={f.hint} /></label>
          <input name={f.name} value={form[f.name]} onChange={handle} className="input" placeholder={f.placeholder} />
        </div>
      ))}

      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint text="Selecciona tu carrera." /></label>
        <select name="carrera" value={form.carrera} onChange={handle} className="input">
          <option value="">-- Selecciona una carrera --</option>
          {['Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica','Redes y Telecomunicaciones','Procesamiento de Alimentos','Procesamiento industrial de la madera'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {user?.rol === 'estudiante' && (
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Semestre <FieldHint text="Número del 0 al 5." /></label>
          <input name="semestre" type="number" min={0} max={5} value={form.semestre} onChange={handle} className="input" placeholder="0 - 5" />
        </div>
      )}

      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Bio / Descripción <FieldHint text="Máximo 500 caracteres." /></label>
        <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3} className="input" style={{ resize:'none' }} maxLength={500} />
        <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/500</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width:'100%' }}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function PasswordInput({ name, value, onChange, show, onToggle, ...props }) {
  return (
    <div style={{ position:'relative' }}>
      <input
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="input"
        style={{ paddingRight: '2.5rem' }}
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)',
          background:'none', border:'none', cursor:'pointer', padding:0,
          color:'var(--text-3)', display:'flex', alignItems:'center'
        }}
        tabIndex={-1}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}

function PasswordForm({ user }) {
  const [form, setForm] = useState({ passwordactual:'', passwordnuevo:'', confirmarPassword:'' })
  const [show, setShow] = useState({ passwordactual:false, passwordnuevo:false, confirmarPassword:false })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const toggle = field => setShow(s => ({ ...s, [field]: !s[field] }))

  const noCoinciden = form.confirmarPassword.length > 0 && form.passwordnuevo !== form.confirmarPassword
  const siCoinciden = form.confirmarPassword.length > 0 && form.passwordnuevo === form.confirmarPassword

  const submit = async e => {
    e.preventDefault()
    if (form.passwordnuevo.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!/[A-Z]/.test(form.passwordnuevo)) {
      toast.error('La nueva contraseña debe incluir al menos una mayúscula')
      return
    }
    if (!/[0-9]/.test(form.passwordnuevo)) {
      toast.error('La nueva contraseña debe incluir al menos un número')
      return
    }
    if (!/[^A-Za-z0-9]/.test(form.passwordnuevo)) {
      toast.error('La nueva contraseña debe incluir al menos un símbolo (ej. !, @, #)')
      return
    }
    if (form.passwordnuevo !== form.confirmarPassword) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    setLoading(true)
    try {
      await api.put('/auth/password', form)
      toast.success('Contraseña actualizada')
      setForm({ passwordactual:'', passwordnuevo:'', confirmarPassword:'' })
    } catch (err) {
      const data = err.response?.data
      if (data?.errores?.length) {
        data.errores.forEach(e => toast.error(e.mensaje))
      } else {
        toast.error(data?.msg || data?.mensaje || 'Error al cambiar la contraseña')
      }
    }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem', maxWidth:380 }}>
      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Contraseña actual <FieldHint required text="Tu contraseña actual para verificar identidad." /></label>
        <PasswordInput name="passwordactual" value={form.passwordactual} onChange={handle} show={show.passwordactual} onToggle={() => toggle('passwordactual')} required />
      </div>
      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Nueva contraseña <FieldHint required text="Mínimo 8 caracteres, una mayúscula, un número y un símbolo." /></label>
        <PasswordInput name="passwordnuevo" value={form.passwordnuevo} onChange={handle} show={show.passwordnuevo} onToggle={() => toggle('passwordnuevo')} required minLength={8} />
      </div>
      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Confirmar nueva contraseña <FieldHint required text="Repite la nueva contraseña." /></label>
        <PasswordInput
          name="confirmarPassword"
          value={form.confirmarPassword}
          onChange={handle}
          show={show.confirmarPassword}
          onToggle={() => toggle('confirmarPassword')}
          required
          minLength={8}
          style={{
            paddingRight: '2.5rem',
            borderColor: noCoinciden ? '#ef4444' : siCoinciden ? '#10b981' : undefined,
            boxShadow: noCoinciden ? '0 0 0 2px rgba(239,68,68,0.2)' : siCoinciden ? '0 0 0 2px rgba(16,185,129,0.2)' : undefined,
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
        />
        {noCoinciden && (
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#ef4444', display:'flex', alignItems:'center', gap:4 }}>
            <span>✗</span> Las contraseñas no coinciden
          </p>
        )}
        {siCoinciden && (
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#10b981', display:'flex', alignItems:'center', gap:4 }}>
            <span>✓</span> Las contraseñas coinciden
          </p>
        )}
      </div>
      <button type="submit" disabled={loading || noCoinciden} className="btn-primary">
        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
