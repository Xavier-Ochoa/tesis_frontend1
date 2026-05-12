import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('perfil')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {[['perfil', 'Datos'], ['password', 'Contraseña']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-primary-700 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'perfil' ? <ProfileForm user={user} updateUser={updateUser} /> : <PasswordForm user={user} />}
    </div>
  )
}

function ProfileForm({ user, updateUser }) {
  const [form, setForm] = useState({
    apellido:    user?.apellido    || '',
    carrera:     user?.carrera     || '',
    semestre:    user?.semestre    || '',
    telefono:    user?.telefono    || '',
    descripcion: user?.descripcion || '',
    github:      user?.github      || '',
  })
  const [photo, setPhoto]     = useState(null)
  const [preview, setPreview] = useState(user?.fotoPerfil || null)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (photo) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
        fd.append('fotoPerfil', photo)
        res = await api.put(`/auth/perfil/${user._id}`, fd)
      } else {
        const payload = { ...form }
        if (payload.semestre) payload.semestre = Number(payload.semestre)
        else delete payload.semestre
        res = await api.put(`/auth/perfil/${user._id}`, payload)
      }
      updateUser(res.data?.usuario || res.data)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {preview ? (
            <img src={preview} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
              {user?.nombre?.[0]?.toUpperCase()}
            </div>
          )}
          <button type="button" onClick={() => document.getElementById('photo-input').click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-primary-700 text-white rounded-full text-xs hover:bg-primary-800 transition-colors">
            ✏️
          </button>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.nombre} {user?.apellido}</p>
          <p className="text-sm text-gray-500">{user?.correoInstitucional}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
        </div>
        <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
        ⚠️ <strong>Nombre, cédula, correo y rol</strong> no se pueden modificar.
      </div>

      <div>
        <label className="label flex items-center">
          Apellido
          <FieldHint text="Mínimo 2 caracteres. Solo letras y espacios." />
        </label>
        <input name="apellido" value={form.apellido} onChange={handle} className="input" />
      </div>

      <div>
        <label className="label flex items-center">
          Carrera
          <FieldHint text="Nombre completo de tu carrera en la EPN." />
        </label>
        <input name="carrera" value={form.carrera} onChange={handle} className="input" />
      </div>

      {user?.rol === 'estudiante' && (
        <div>
          <label className="label flex items-center">
            Semestre
            <FieldHint text="Número del 1 al 8." />
          </label>
          <input name="semestre" type="number" min={1} max={8} value={form.semestre} onChange={handle} className="input" />
        </div>
      )}

      <div>
        <label className="label flex items-center">
          Teléfono
          <FieldHint text="10 dígitos. Ej: 0991234567." />
        </label>
        <input name="telefono" value={form.telefono} onChange={handle} className="input" placeholder="0991234567" />
      </div>

      <div>
        <label className="label flex items-center">
          GitHub
          <FieldHint text="Solo el nombre de usuario, sin la URL. Ej: juanperez" />
        </label>
        <input name="github" value={form.github} onChange={handle} className="input" placeholder="mi-usuario" />
      </div>

      <div>
        <label className="label flex items-center">
          Descripción / Bio
          <FieldHint text="Máximo 500 caracteres. Cuéntanos un poco sobre ti." />
        </label>
        <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3}
          className="input resize-none" maxLength={500} />
        <p className="text-xs text-gray-400 mt-1">{form.descripcion.length}/500</p>
      </div>

      <div>
        <label className="label flex items-center">
          Foto de perfil
          <FieldHint text="JPG o PNG. Se sube automáticamente a Cloudinary. Haz clic en el ícono ✏️ del avatar para seleccionar." />
        </label>
        <p className="text-xs text-gray-400">{photo ? `📎 ${photo.name}` : 'Haz clic en el ícono ✏️ del avatar para cambiar la foto.'}</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function PasswordForm({ user }) {
  const [form, setForm] = useState({ passwordactual: '', passwordnuevo: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/auth/password/${user._id}`, form)
      toast.success('Contraseña actualizada')
      setForm({ passwordactual: '', passwordnuevo: '' })
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Contraseña actual incorrecta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm">
      <div>
        <label className="label flex items-center">
          Contraseña actual
          <FieldHint required text="Ingresa tu contraseña actual para verificar tu identidad." />
        </label>
        <input name="passwordactual" type="password" required value={form.passwordactual} onChange={handle} className="input" />
      </div>
      <div>
        <label className="label flex items-center">
          Nueva contraseña
          <FieldHint required text="Mínimo 6 caracteres. Se recomienda combinar letras, números y símbolos." />
        </label>
        <input name="passwordnuevo" type="password" required value={form.passwordnuevo} onChange={handle} className="input" minLength={6} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
