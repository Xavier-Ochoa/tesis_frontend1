import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre:'', apellido:'', cedula:'', correoInstitucional:'', contraseña:'', rol:'estudiante', carrera:'', semestre:'' })
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
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Contraseña <FieldHint required text="Mínimo 6 caracteres." /></label>
              <input name="contraseña" type="password" required value={form.contraseña} onChange={handle} className="input" placeholder="Mínimo 6 caracteres" />
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
                <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Carrera <FieldHint text="Selecciona tu carrera." /></label>
                <select name="carrera" value={form.carrera} onChange={handle} className="input">
                  <option value="">-- Selecciona una carrera --</option>
                  {['Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica','Redes y Telecomunicaciones','Procesamiento de Alimentos','Procesamiento industrial de la madera'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {form.rol === 'estudiante' && (
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center' }}>Semestre <FieldHint text="Número del 0 al 5." /></label>
                  <input name="semestre" type="number" min={0} max={5} value={form.semestre} onChange={handle} className="input" placeholder="0 - 5" />
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
    </div>
  )
}
