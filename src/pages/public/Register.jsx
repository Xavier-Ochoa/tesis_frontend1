import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', apellido: '', cedula: '', correoInstitucional: '',
    contraseña: '', rol: 'estudiante', carrera: '', semestre: '',
  })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.semestre) payload.semestre = Number(payload.semestre)
      else delete payload.semestre
      if (!payload.carrera) delete payload.carrera
      await api.post('/auth/registro', payload)
      toast.success('Registro exitoso. Revisa tu correo para obtener el token de verificación.')
      navigate('/confirmar-email')
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.msg || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mb-6">Completa el formulario con tus datos de la EPN</p>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center">
                Nombre
                <FieldHint required text="Solo letras. Mínimo 2 caracteres, máximo 50." />
              </label>
              <input name="nombre" required value={form.nombre} onChange={handle} className="input" placeholder="Juan" />
            </div>
            <div>
              <label className="label flex items-center">
                Apellido
                <FieldHint required text="Solo letras. Mínimo 2 caracteres, máximo 50." />
              </label>
              <input name="apellido" required value={form.apellido} onChange={handle} className="input" placeholder="Pérez" />
            </div>
          </div>

          <div>
            <label className="label flex items-center">
              Cédula
              <FieldHint required text="Exactamente 10 dígitos numéricos." />
            </label>
            <input name="cedula" required value={form.cedula} onChange={handle} className="input" placeholder="1712345678" maxLength={10} />
          </div>

          <div>
            <label className="label flex items-center">
              Correo institucional
              <FieldHint required text="Debe terminar en @epn.edu.ec. Este será tu usuario para iniciar sesión." />
            </label>
            <input name="correoInstitucional" type="email" required value={form.correoInstitucional} onChange={handle} className="input" placeholder="usuario@epn.edu.ec" />
          </div>

          <div>
            <label className="label flex items-center">
              Contraseña
              <FieldHint required text="Mínimo 6 caracteres. Se recomienda incluir letras, números y un símbolo." />
            </label>
            <input name="contraseña" type="password" required value={form.contraseña} onChange={handle} className="input" placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label className="label flex items-center">
              Rol
              <FieldHint required text="Estudiante: crea proyectos que esperan aprobación del admin. Docente: publica proyectos directamente y puede añadir colaboradores." />
            </label>
            <select name="rol" value={form.rol} onChange={handle} className="input">
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
            </select>
          </div>

          <div>
            <label className="label flex items-center">
              Carrera
              <FieldHint text="Nombre completo de tu carrera en la EPN. Ej: Ingeniería en Software." />
            </label>
            <input name="carrera" value={form.carrera} onChange={handle} className="input" placeholder="Ingeniería en Software" />
          </div>

          {form.rol === 'estudiante' && (
            <div>
              <label className="label flex items-center">
                Semestre
                <FieldHint text="Número del 1 al 8 que corresponde a tu semestre actual." />
              </label>
              <input name="semestre" type="number" min={1} max={8} value={form.semestre} onChange={handle} className="input" placeholder="1 - 8" />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary-700 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
