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

const TABS = [
  { id: 'proyectos',     label: '📁 Mis Proyectos' },
  { id: 'colaboradores', label: '👥 Colaboradores' },
]

// ── Modal de confirmación genérico ────────────────────────────────────────────
function ConfirmModal({ config, onConfirm, onClose }) {
  if (!config) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:420, boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:'0 0 10px' }}>{config.title}</h2>
        <p style={{ fontSize:13, color:'var(--text-2)', margin:'0 0 1.25rem', lineHeight:1.6 }}>{config.message}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onConfirm} className={config.danger ? 'btn-danger' : 'btn-primary'} style={{ flex:1 }}>{config.confirmLabel}</button>
          <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ── Modal de nueva versión ─────────────────────────────────────────────────────
function NuevaVersionModal({ project, onClose, onCreated }) {
  const [step, setStep]     = useState('confirm') // 'confirm' | 'done'
  const [loading, setLoading] = useState(false)

  const crear = async () => {
    setLoading(true)
    try {
      const { data } = await api.post(`/proyectos/${project._id}/versiones`, {})
      const ver = data.data?.version || data.version || ''
      toast.success(`Versión ${ver} creada exitosamente. Está pendiente de revisión.`)
      onCreated()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear versión')
    } finally { setLoading(false) }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:440, boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:'0 0 10px' }}>🔖 Crear nueva versión</h2>
        <div style={{ background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'var(--primary)', marginBottom:'1.25rem', lineHeight:1.6 }}>
          ℹ️ Se creará una nueva versión del proyecto copiando todos los datos actuales como punto de partida. La versión anterior quedará bloqueada y no podrá modificarse. El nuevo proyecto quedará como <strong>pendiente</strong> hasta que el administrador lo revise.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={crear} disabled={loading} className="btn-primary" style={{ flex:1 }}>{loading ? 'Creando...' : 'Continuar'}</button>
          <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default function MyProjects() {
  const { user } = useAuth()
  const [activeTab, setActiveTab]   = useState('proyectos')
  const [projects, setProjects]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo]     = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [versionModal, setVersionModal] = useState(null)

  const fetchProjects = () => {
    const params = {}
    if (filtroEstado) params.estado = filtroEstado
    if (filtroTipo)   params.tipoProyecto = filtroTipo
    api.get('/proyectos/usuario/mis-proyectos', { params })
      .then(r => {
        const data = r.data?.data || []
        setProjects(data)
        if (!selectedProject && data.length > 0) setSelectedProject(data[0])
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [filtroEstado, filtroTipo])

  // Lógica de eliminación según tipoProyecto
  const handleDelete = (p) => {
    if (p.tipoProyecto === 'publico') {
      setConfirmModal({
        title: 'ℹ️ ¿Desactivar proyecto?',
        message: 'El proyecto dejará de ser visible en la plataforma, pero no será eliminado permanentemente. Todas las versiones serán desactivadas.',
        confirmLabel: 'Desactivar',
        danger: false,
        onConfirm: async () => {
          try {
            await api.delete(`/proyectos/${p._id}`)
            toast.success('Proyecto desactivado.')
            if (selectedProject?._id === p._id) setSelectedProject(null)
            fetchProjects()
          } catch { toast.error('No se pudo desactivar') }
          setConfirmModal(null)
        }
      })
    } else {
      setConfirmModal({
        title: '⚠️ ¿Eliminar proyecto permanentemente?',
        message: 'Esta acción no se puede deshacer. El proyecto y todas sus versiones serán eliminados definitivamente, incluyendo imágenes y archivos.',
        confirmLabel: 'Eliminar permanentemente',
        danger: true,
        onConfirm: async () => {
          try {
            await api.delete(`/proyectos/${p._id}`)
            toast.success('Proyecto eliminado permanentemente.')
            if (selectedProject?._id === p._id) setSelectedProject(null)
            fetchProjects()
          } catch { toast.error('No se pudo eliminar') }
          setConfirmModal(null)
        }
      })
    }
  }

  // Determinar si mostrar botón Editar
  const puedeEditar = (p) => {
    if (p.esUltimaVersion === false) return false
    const tipo = p.tipoProyecto
    const est  = p.estado
    if (tipo === 'privado') return est === 'pendiente' || est === 'rechazado'
    if (tipo === 'publico') return est === 'rechazado'
    return false
  }

  const tooltipEditar = (p) => {
    if (p.esUltimaVersion === false) return 'Solo se puede editar la última versión del proyecto.'
    if (p.tipoProyecto === 'publico' && (p.estado === 'pendiente' || p.estado === 'aprobado'))
      return 'Los proyectos públicos no se pueden modificar una vez enviados.'
    if (p.tipoProyecto === 'privado' && p.estado === 'aprobado')
      return 'No se puede editar un proyecto aprobado.'
    return ''
  }

  // Solo público + aprobado + última versión + autor puede crear nueva versión
  const puedeNuevaVersion = (p) =>
    p.esUltimaVersion === true &&
    p.tipoProyecto === 'publico' &&
    p.estado === 'aprobado' &&
    p.rolEnProyecto === 'autor'

  if (loading) return <Spinner />

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>
            Mis Proyectos
          </h1>
          <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>{projects.length} proyecto(s)</p>
        </div>
        <Link to="/mis-proyectos/nuevo" className="btn-primary">+ Nuevo</Link>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'9px 18px', fontSize:13, fontWeight:600, cursor:'pointer',
            background:'transparent', border:'none',
            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-3)',
            transition:'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* TAB: Proyectos */}
      {activeTab === 'proyectos' && (
        <>
          {/* Filtros */}
          <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', flexWrap:'wrap' }}>
            {/* Filtro por estado */}
            {[['', 'Todos'], ['pendiente', 'Pendientes'], ['aprobado', 'Aprobados'], ['rechazado', 'Rechazados']].map(([v, l]) => (
              <button key={v} onClick={() => setFiltroEstado(v)} style={{
                padding:'6px 14px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
                background: filtroEstado === v ? 'var(--primary)' : 'var(--surface)',
                color: filtroEstado === v ? 'white' : 'var(--text-2)',
                border: `1px solid ${filtroEstado === v ? 'var(--primary)' : 'var(--border2)'}`,
              }}>{l}</button>
            ))}
            {/* Filtro por tipoProyecto */}
            <div style={{ display:'flex', gap:6, marginLeft:'auto', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:500 }}>Tipo:</span>
              {[['', 'Todos'], ['publico', 'Público'], ['privado', 'Privado']].map(([v, l]) => (
                <button key={v} onClick={() => setFiltroTipo(v)} style={{
                  padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
                  background: filtroTipo === v ? 'var(--text-1)' : 'var(--surface)',
                  color: filtroTipo === v ? 'var(--bg)' : 'var(--text-2)',
                  border: `1px solid ${filtroTipo === v ? 'var(--text-1)' : 'var(--border2)'}`,
                }}>{l}</button>
              ))}
            </div>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 2rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20 }}>
              <p style={{ fontSize:48, marginBottom:12 }}>📁</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>Sin proyectos</p>
              <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:20 }}>Crea tu primer proyecto y compártelo con la comunidad.</p>
              <Link to="/mis-proyectos/nuevo" className="btn-primary">Crear proyecto</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {projects.map(p => {
                const ec       = estadoConfig[p.estado] || { label: p.estado, cls: 'badge-gray' }
                const canEdit  = puedeEditar(p)
                const editTip  = tooltipEditar(p)
                const canVer   = puedeNuevaVersion(p)
                const tipoBadge = p.tipoProyecto === 'publico' ? 'badge-green' : 'badge-gray'
                const tipoLabel = p.tipoProyecto === 'publico' ? '🌐 Público' : '🔒 Privado'
                const verStr    = p.version ? `v${String(p.version).padStart(3,'0')}` : null

                return (
                  <div key={p._id} style={{
                    background:'var(--surface)', border:`1px solid ${p.esUltimaVersion === false ? 'var(--warning)' : 'var(--border)'}`,
                    borderRadius:14, padding:'16px',
                    display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
                    opacity: p.esUltimaVersion === false ? 0.8 : 1,
                  }}>
                    {/* Thumbnail */}
                    {p.imagenes?.[0] ? (
                      <img src={p.imagenes[0]} alt={p.titulo} style={{ width:60, height:60, objectFit:'cover', borderRadius:10, flexShrink:0 }} />
                    ) : (
                      <div style={{ width:60, height:60, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, color:'white', fontSize:22 }}>
                        {p.titulo?.[0]}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {p.titulo}
                        </span>
                        <span className={`badge ${ec.cls}`}>{ec.label}</span>
                        <span className={`badge ${tipoBadge}`} style={{ fontSize:10 }}>{tipoLabel}</span>
                        {verStr && <span className="badge badge-blue" style={{ fontSize:10 }}>{verStr}</span>}
                        {p.proyecto_id && <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>#{p.proyecto_id}</span>}
                        {p.esUltimaVersion === false && (
                          <span className="badge badge-yellow" style={{ fontSize:10 }}>🕒 Versión anterior</span>
                        )}
                      </div>
                      <p style={{ fontSize:13, color:'var(--text-3)', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.descripcion}
                      </p>
                      <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-3)' }}>
                        <span>❤️ {p.likes?.length || 0}</span>
                        <span>💬 {p.comentarios?.length || 0}</span>
                        <span>{p.carrera}</span>
                      </div>
                      {p.estado === 'rechazado' && p.motivoRechazo && (
                        <div style={{ marginTop:6, padding:'6px 10px', background:'var(--danger-l)', border:'1px solid var(--danger)', borderRadius:8, fontSize:12, color:'var(--danger)' }}>
                          ⚠️ {p.motivoRechazo} — <strong>Puedes editarlo, corregirlo y volver a enviarlo.</strong>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                      <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-sm">Ver</Link>

                      {canEdit ? (
                        <Link to={`/mis-proyectos/editar/${p._id}`} className="btn-secondary btn-sm">Editar</Link>
                      ) : (
                        <span title={editTip} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'not-allowed', background:'var(--surface2)', color:'var(--text-3)', border:'1px solid var(--border)', opacity:0.6 }}>
                          Editar
                        </span>
                      )}

                      {canVer && (
                        <button onClick={() => setVersionModal(p)} className="btn-secondary btn-sm" title="Crear nueva versión de este proyecto">
                          🔖 Nueva versión
                        </button>
                      )}

                      {user?.rol === 'docente' && (
                        <button onClick={() => { setSelectedProject(p); setActiveTab('colaboradores') }} className="btn-secondary btn-sm" title="Gestionar colaboradores">
                          👥 Equipo
                        </button>
                      )}

                      <button onClick={() => handleDelete(p)} className="btn-danger btn-sm">
                        {p.tipoProyecto === 'publico' ? 'Desactivar' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* TAB: Colaboradores */}
      {activeTab === 'colaboradores' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem 2rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
              <p style={{ fontSize:38, marginBottom:10 }}>📁</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>No tienes proyectos</p>
              <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:18 }}>Crea un proyecto para gestionar su equipo de colaboradores.</p>
              <Link to="/mis-proyectos/nuevo" className="btn-primary">Crear proyecto</Link>
            </div>
          ) : (
            <>
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>
                  Proyecto seleccionado
                </label>
                <select value={selectedProject?._id || ''} onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value) || null)} className="input" style={{ margin:0 }}>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.titulo}</option>)}
                </select>
              </div>
              {selectedProject && (
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem', animation:'slideUp 0.25s ease-out' }}>
                  <ColaboradoresTab key={selectedProject._id} projectId={selectedProject._id} projectTitle={selectedProject.titulo} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modales */}
      <ConfirmModal
        config={confirmModal}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => setConfirmModal(null)}
      />

      {versionModal && (
        <NuevaVersionModal
          project={versionModal}
          onClose={() => setVersionModal(null)}
          onCreated={fetchProjects}
        />
      )}
    </div>
  )
}
