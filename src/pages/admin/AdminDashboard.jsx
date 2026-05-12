import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue:   'bg-blue-50   text-blue-700   border-blue-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    red:    'bg-red-50    text-red-700    border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500">ESFOT — Escuela Politécnica Nacional</p>
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📁" label="Total proyectos"    value={stats.totalProyectos}        color="blue" />
          <StatCard icon="✅" label="Publicados"          value={stats.proyectosPublicados}    color="green" />
          <StatCard icon="⏳" label="En progreso"         value={stats.proyectosEnProgreso}    color="yellow" />
          <StatCard icon="👥" label="Total usuarios"      value={stats.totalUsuarios}          color="purple" />
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-base font-semibold text-gray-700 mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminLink to="/admin/proyectos" emoji="📋" title="Gestionar proyectos"
          desc="Publicar, despublicar y eliminar proyectos" badge="Pendientes" />
        <AdminLink to="/admin/usuarios" emoji="👤" title="Gestionar usuarios"
          desc="Ver todos los usuarios registrados" />
        <AdminLink to="/" emoji="🌐" title="Ver plataforma pública"
          desc="Cómo ve el frontend un visitante normal" />
      </div>
    </div>
  )
}

function AdminLink({ to, emoji, title, desc, badge }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        {badge && <span className="badge badge-yellow">{badge}</span>}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </Link>
  )
}
