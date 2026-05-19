import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ColaboradoresTab from '../../components/ColaboradoresTab'
import toast from 'react-hot-toast'

const estadoConfig = {
  aprobado:  { label: 'Aprobado',  cls: 'badge-green' },
  pendiente: { label: 'Pendiente', cls: 'badge-yellow' },
  rechazado: { label: 'Rechazado', cls: 'badge-red' },
}

// ── Tab constants ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'proyectos',      label: '📁 Mis Proyectos' },
  { id: 'colaboradores',  label: '👥 Colaboradores' },
]

export default function MyProjects() {
  const { user } = useAuth()
  const [activeTab, setActiveTab]   = useState('proyectos')

  // ── Proyectos state ────────────────────────────────────────────────────
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('')

  // ── Colaboradores: selected project ───────────────────────────────────
  const [selectedProject, setSelectedProject] = useState(null)

  const fetchProjects = () => {
    const params = {}
    if (filtro) params.estado = filtro
    api.get('/proyectos/usuario/mis-proyectos', { params })
      .then(r => {
        const data = r.data?.data || []
        setProjects(data)
        // Auto-select first project for colaboradores tab if none selected
        if (!selectedProject && data.length > 0) {
          setSelectedProject(data[0])
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [filtro])

  const deleteProject = async (id) => {
    if (!confirm('¿Eliminar este proyecto? No se puede deshacer.')) return
    try {
      await api.delete(`/proyectos/${id}`)
      toast.success('Proyecto eliminado')
      if (selectedProject?._id === id) setSelectedProject(null)
      fetchProjects()
    } catch { toast.error('No se pudo eliminar') }
  }

  if (loading) return <Spinner />

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800,
            color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em',
          }}>
            Mis Proyectos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            {projects.length} proyecto(s)
          </p>
        </div>
        <Link to="/mis-proyectos/nuevo" className="btn-primary">+ Nuevo</Link>
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--primary)'
                : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-3)',
              transition: 'all 0.15s', marginBottom: -1, borderRadius: '6px 6px 0 0',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-2)'
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-3)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: Mis Proyectos
      ══════════════════════════════════════════════ */}
      {activeTab === 'proyectos' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[['', 'Todos'], ['pendiente', 'Pendientes'], ['aprobado', 'Aprobados'], ['rechazado', 'Rechazados']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFiltro(v)}
                style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  background: filtro === v ? 'var(--primary)' : 'var(--surface)',
                  color: filtro === v ? 'white' : 'var(--text-2)',
                  border: `1px solid ${filtro === v ? 'var(--primary)' : 'var(--border2)'}`,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {projects.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '5rem 2rem',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
            }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>📁</p>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700,
                color: 'var(--text-1)', marginBottom: 6,
              }}>Sin proyectos</p>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
                Crea tu primer proyecto y compártelo con la comunidad.
              </p>
              <Link to="/mis-proyectos/nuevo" className="btn-primary">Crear proyecto</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(p => {
                const ec = estadoConfig[p.estado] || { label: p.estado, cls: 'badge-gray' }
                return (
                  <div
                    key={p._id}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '16px',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    }}
                  >
                    {/* Thumbnail */}
                    {p.imagenes?.[0] ? (
                      <img
                        src={p.imagenes[0]} alt={p.titulo}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 60, height: 60, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 22,
                      }}>
                        {p.titulo?.[0]}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        flexWrap: 'wrap', marginBottom: 3,
                      }}>
                        <span style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                          color: 'var(--text-1)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {p.titulo}
                        </span>
                        <span className={`badge ${ec.cls}`}>{ec.label}</span>
                        <span className="badge badge-gray">{p.categoria}</span>
                        {!p.publico && <span className="badge badge-gray">🔒 Privado</span>}
                      </div>
                      <p style={{
                        fontSize: 13, color: 'var(--text-3)', margin: '0 0 4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.descripcion}
                      </p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)' }}>
                        <span>❤️ {p.likes?.length || 0}</span>
                        <span>💬 {p.comentarios?.length || 0}</span>
                        <span>{p.carrera}</span>
                      </div>
                      {p.estado === 'rechazado' && p.motivoRechazo && (
                        <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>⚠️ {p.motivoRechazo}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                      <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-sm">Ver</Link>
                      <Link to={`/mis-proyectos/editar/${p._id}`} className="btn-secondary btn-sm">Editar</Link>
                      {/* Docentes can go to collaborators for a specific project */}
                      {user?.rol === 'docente' && (
                        <button
                          onClick={() => { setSelectedProject(p); setActiveTab('colaboradores') }}
                          className="btn-secondary btn-sm"
                          title="Gestionar colaboradores"
                        >
                          👥 Equipo
                        </button>
                      )}
                      <button onClick={() => deleteProject(p._id)} className="btn-danger btn-sm">Eliminar</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════
          TAB: Colaboradores
      ══════════════════════════════════════════════ */}
      {activeTab === 'colaboradores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Project selector */}
          {projects.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
            }}>
              <p style={{ fontSize: 38, marginBottom: 10 }}>📁</p>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700,
                color: 'var(--text-1)', marginBottom: 6,
              }}>No tienes proyectos</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>
                Crea un proyecto para gestionar su equipo de colaboradores.
              </p>
              <Link to="/mis-proyectos/nuevo" className="btn-primary">Crear proyecto</Link>
            </div>
          ) : (
            <>
              {/* Project picker */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'block', marginBottom: 8,
                }}>
                  Proyecto seleccionado
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={e => {
                    const p = projects.find(p => p._id === e.target.value)
                    setSelectedProject(p || null)
                  }}
                  className="input"
                  style={{ margin: 0 }}
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.titulo}</option>
                  ))}
                </select>
              </div>

              {/* Collaborators panel */}
              {selectedProject && (
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '1.25rem',
                  animation: 'slideUp 0.25s ease-out',
                }}>
                  <ColaboradoresTab
                    key={selectedProject._id}
                    projectId={selectedProject._id}
                    projectTitle={selectedProject.titulo}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
