import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ correoInstitucional: '', contraseña: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.usuario || data, data.token)
      toast.success('¡Bienvenido!')
      navigate(data.usuario?.rol === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">E</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-1">ESFOT — EPN</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Correo institucional</label>
            <input name="correoInstitucional" type="email" required value={form.correoInstitucional}
              onChange={handle} className="input" placeholder="usuario@epn.edu.ec" />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input name="contraseña" type="password" required value={form.contraseña}
              onChange={handle} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link to="/recuperar-password" className="text-sm text-primary-700 hover:underline block">¿Olvidaste tu contraseña?</Link>
          <p className="text-sm text-gray-500">¿No tienes cuenta? <Link to="/registro" className="text-primary-700 hover:underline">Regístrate</Link></p>
          <p className="text-sm text-gray-500">¿Recibiste tu token? <Link to="/confirmar-email" className="text-primary-700 hover:underline">Confirmar email</Link></p>
        </div>
      </div>
    </div>
  )
}
