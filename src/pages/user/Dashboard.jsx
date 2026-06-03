import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: { bg: 'rgba(99,102,241,0.1)', accent: '#6366f1' },
    green:  { bg: 'rgba(16,185,129,0.1)', accent: '#10b981' },
    amber:  { bg: 'rgba(245,158,11,0.1)', accent: '#f59e0b' },
    rose:   { bg: 'rgba(239,68,68,0.1)',  accent: '#ef4444' },
  }[color || 'indigo']

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 16px 0 80px', background: colors.bg }} />
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
        {value ?? '—'}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{label}</p>
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
      .then(r => {
        const raw = r.data?.data || r.data

        if (isAdmin) {
          // El backend devuelve:
          //   raw.resumen.totalProyectos
          //   raw.resumen.totalPublicados
          //   raw.resumen.totalDonaciones
          //   raw.porEstado → array [{ _id: 'aprobado', total: N }, ...]
          // NO existe raw.proyectos ni raw.totalUsuarios
          const getEstado = (estado) =>
            (raw.porEstado || []).find(x => x._id === estado)?.total || 0

          setStats({
            totalProyectos:  raw.resumen?.totalProyectos  || 0,
            aprobados:       getEstado('aprobado'),
            pendientes:      getEstado('pendiente'),
            totalDonaciones: raw.resumen?.totalDonaciones || 0,
          })
        } else {
          // Estructura usuario: resumen.totalProyectos, resumen.totalVistas, resumen.totalLikes, porEstado (array)
          const getEstado = (estado) =>
            (raw.porEstado || []).find(x => x._id === estado)?.total || 0

          setStats({
            totalProyectos: raw.resumen?.totalProyectos || 0,
            aprobados:      getEstado('aprobado'),
            totalLikes:     raw.resumen?.totalLikes     || 0,
            totalVistas:    raw.resumen?.totalVistas    || 0,
          })
        }
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (loading) return <Spinner />

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Hola, {user?.nombre} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0, textTransform: 'capitalize' }}>
            {user?.rol} · {user?.carrera || 'EPN'}
          </p>
        </div>
        <Link to="/mis-proyectos/nuevo" className="btn-primary">
          + Nuevo proyecto
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: '2.5rem' }}>
          {isAdmin ? (<>
            <StatCard icon="📁" label="Total proyectos"  value={stats.totalProyectos}              color="indigo" />
            <StatCard icon="✅" label="Aprobados"          value={stats.aprobados}                   color="green" />
            <StatCard icon="⏳" label="Pendientes"         value={stats.pendientes}                  color="amber" />
            <StatCard icon="💰" label="Total donaciones"   value={`$${stats.totalDonaciones}`}       color="rose" />
          </>) : (<>
            <StatCard icon="📁" label="Mis proyectos"     value={stats.totalProyectos}  color="indigo" />
            <StatCard icon="✅" label="Aprobados"          value={stats.aprobados}       color="green" />
            <StatCard icon="❤️" label="Likes recibidos"   value={stats.totalLikes}      color="rose" />
            <StatCard icon="👁️" label="Vistas totales"    value={stats.totalVistas}     color="amber" />
          </>)}
        </div>
      )}

      {/* Quick links */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Accesos rápidos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { to: '/mis-proyectos',       emoji: '📁', title: 'Mis Proyectos',     desc: 'Ver y gestionar' },
          { to: '/mis-proyectos/nuevo', emoji: '➕', title: 'Crear Proyecto',    desc: 'Publicar nuevo' },
          { to: '/perfil',              emoji: '👤', title: 'Mi Perfil',         desc: 'Editar datos' },
          { to: '/donaciones',          emoji: '💙', title: 'Donar',             desc: 'Apoya la plataforma' },
          ...(isAdmin ? [
            { to: '/admin', emoji: '⚙️', title: 'Panel Admin', desc: 'Gestionar todo' },
          ] : []),
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '18px', transition: 'all 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.emoji}</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 2px' }}>{item.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
