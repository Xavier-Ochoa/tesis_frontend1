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

function PasswordForm({ user }) {
  const [form, setForm] = useState({ passwordactual:'', passwordnuevo:'' })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/password', form)
      toast.success('Contraseña actualizada')
      setForm({ passwordactual:'', passwordnuevo:'' })
    } catch (err) { toast.error(err.response?.data?.msg || 'Contraseña actual incorrecta') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem', maxWidth:380 }}>
      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Contraseña actual <FieldHint required text="Tu contraseña actual para verificar identidad." /></label>
        <input name="passwordactual" type="password" required value={form.passwordactual} onChange={handle} className="input" />
      </div>
      <div>
        <label className="label" style={{ display:'flex', alignItems:'center' }}>Nueva contraseña <FieldHint required text="Mínimo 6 caracteres." /></label>
        <input name="passwordnuevo" type="password" required value={form.passwordnuevo} onChange={handle} className="input" minLength={6} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
