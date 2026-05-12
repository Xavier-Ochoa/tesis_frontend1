import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'

function StatCard({ label, value, color = 'primary' }) {
  const colors = { primary: 'bg-primary-50 text-primary-700', green: 'bg-green-50 text-green-700', yellow: 'bg-yellow-50 text-yellow-700', red: 'bg-red-50 text-red-700' }
  return (
    <div className={`rounded-xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const endpoint = isAdmin ? '/dashboard/admin' : '/dashboard/usuario'
    api.get(endpoint)
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (loading) return <Spinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.nombre} 👋</h1>
          <p className="text-sm text-gray-500 capitalize">{user?.rol} · {user?.carrera}</p>
        </div>
        <Link to="/mis-proyectos/nuevo" className="btn-primary btn-sm">+ Nuevo proyecto</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isAdmin ? (
            <>
              <StatCard label="Total proyectos" value={stats.totalProyectos} color="primary" />
              <StatCard label="Publicados"       value={stats.proyectosPublicados} color="green" />
              <StatCard label="En progreso"      value={stats.proyectosEnProgreso} color="yellow" />
              <StatCard label="Total usuarios"   value={stats.totalUsuarios} color="red" />
            </>
          ) : (
            <>
              <StatCard label="Mis proyectos"   value={stats.totalProyectos} color="primary" />
              <StatCard label="Publicados"       value={stats.publicados} color="green" />
              <StatCard label="Likes recibidos"  value={stats.totalLikes} color="red" />
              <StatCard label="Vistas totales"   value={stats.totalVistas} color="yellow" />
            </>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink to="/mis-proyectos"      emoji="📁" title="Mis Proyectos"        desc="Ver y gestionar tus proyectos" />
        <QuickLink to="/mis-proyectos/nuevo" emoji="➕" title="Crear Proyecto"       desc="Publica un nuevo proyecto" />
        <QuickLink to="/perfil"             emoji="👤" title="Mi Perfil"            desc="Actualiza tus datos" />
        <QuickLink to="/ia"                 emoji="🤖" title="Sugerencias de IA"    desc="Genera títulos con inteligencia artificial" />
        <QuickLink to="/donaciones"         emoji="💙" title="Donar"               desc="Apoya la plataforma" />
        {isAdmin && <QuickLink to="/admin"  emoji="⚙️" title="Panel Admin"          desc="Gestionar la plataforma" />}
      </div>
    </div>
  )
}

function QuickLink({ to, emoji, title, desc }) {
  return (
    <Link to={to} className="card p-4 hover:shadow-md transition-shadow group">
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </Link>
  )
}
