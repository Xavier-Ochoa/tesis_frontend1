import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ token: '', contraseña: '' })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!form.token.trim()) { toast.error('Ingresa el token'); return }
    setLoading(true)
    try {
      await api.post(`/auth/nuevopassword/${form.token.trim()}`, { contraseña: form.contraseña })
      toast.success('Contraseña actualizada')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Token inválido o expirado')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'slideUp 0.4s ease-out' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nueva contraseña</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>Ingresa el token de tu correo y tu nueva contraseña.</p>
          </div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Token de recuperación</label>
              <input name="token" value={form.token} onChange={handle} required
                className="input" style={{ fontFamily: 'JetBrains Mono, monospace', textAlign: 'center', letterSpacing: '0.05em' }}
                placeholder="Pega tu token aquí" />
            </div>
            <div>
              <label className="label">Nueva contraseña</label>
              <input name="contraseña" type="password" value={form.contraseña} onChange={handle} required
                className="input" placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width: '100%' }}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña →'}
            </button>
          </form>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Volver al login</Link>
        </div>
      </div>
    </div>
  )
}
