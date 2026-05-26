import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => {
        const raw = r.data?.data || r.data

        // El backend devuelve:
        //   raw.resumen.totalProyectos
        //   raw.resumen.totalPublicados
        //   raw.resumen.totalDonaciones
        //   raw.porEstado  → array [{ _id: 'aprobado', total: N }, ...]
        // NO existe raw.proyectos ni raw.totalUsuarios

        const getEstado = (estado) =>
          (raw.porEstado || []).find(x => x._id === estado)?.total || 0

        setStats({
          totalProyectos:      raw.resumen?.totalProyectos  || 0,
          proyectosAprobados:  getEstado('aprobado'),
          proyectosPendientes: getEstado('pendiente'),
          proyectosRechazados: getEstado('rechazado'),
          totalDonaciones:     raw.resumen?.totalDonaciones || 0,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const cards = stats ? [
    { icon: '📁', label: 'Total proyectos', value: stats.totalProyectos,      color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: '✅', label: 'Aprobados',        value: stats.proyectosAprobados,  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: '⏳', label: 'Pendientes',       value: stats.proyectosPendientes, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: '💰', label: 'Total donaciones', value: `$${stats.totalDonaciones}`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ] : []

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Panel de Administración
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>POLIESFOT — Escuela Politécnica Nacional</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: '2.5rem' }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 16px 0 80px', background: c.bg }} />
            <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{c.value ?? '—'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acciones rápidas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {[
          { to: '/admin/proyectos', emoji: '📋', title: 'Gestionar Proyectos', desc: 'Aprobar, rechazar y editar', accent: true },
          { to: '/admin/usuarios',  emoji: '👥', title: 'Gestionar Usuarios',  desc: 'Ver todos los registrados', accent: false },
          { to: '/admin/chat',      emoji: '💬', title: 'Chat Soporte',        desc: 'Responder a usuarios', accent: false },
          { to: '/',                emoji: '🌐', title: 'Vista Pública',       desc: 'Ver como usuario normal',  accent: false },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: `1px solid ${item.accent ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              borderRadius: 14, padding: 20, transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{item.emoji}</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: item.accent ? '#ef4444' : 'var(--text-1)', margin: '0 0 3px' }}>{item.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
