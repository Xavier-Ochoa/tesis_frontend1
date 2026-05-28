import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

const estadoConfig = {
  aprobado:  { label: 'Aprobado',  cls: 'badge-green' },
  pendiente: { label: 'Pendiente', cls: 'badge-yellow' },
  rechazado: { label: 'Rechazado', cls: 'badge-red' },
}

function ConfirmModal({ config, onClose }) {
  if (!config) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:420, boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:'0 0 10px' }}>{config.title}</h2>
        <p style={{ fontSize:13, color:'var(--text-2)', margin:'0 0 1.25rem', lineHeight:1.6 }}>{config.message}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={config.onConfirm} className={config.danger ? 'btn-danger' : 'btn-primary'} style={{ flex:1 }}>{config.confirmLabel}</button>
          <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function RejectModal({ modal, onChange, onConfirm, onClose }) {
  if (!modal) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:420, boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px' }}>Rechazar proyecto</h2>
        <p style={{ fontSize:13, color:'var(--text-3)', margin:'0 0 10px' }}>Puedes indicar el motivo del rechazo (opcional).</p>
        <div style={{ background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'var(--primary)', marginBottom:'1rem', lineHeight:1.55 }}>
          ℹ️ Al rechazar, el autor podrá editarlo y volver a enviarlo para revisión.
        </div>
        <textarea value={modal.motivo} onChange={e => onChange(e.target.value)}
          rows={3} className="input" style={{ resize:'none', marginBottom:14 }} placeholder="Motivo del rechazo..." />
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onConfirm} className="btn-danger" style={{ flex:1 }}>Confirmar rechazo</button>
          <button onClick={onClose} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function VersionesModal({ proyectoId, onClose }) {
  const [versiones, setVersiones] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get(`/admin/proyectos/versiones/${proyectoId}`)
      .then(r => setVersiones(r.data?.data || []))
      .catch(() => setVersiones([]))
      .finally(() => setLoading(false))
  }, [proyectoId])

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:520, maxHeight:'80vh', overflowY:'auto', boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:0 }}>Historial de versiones</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-3)' }}>×</button>
        </div>
        {loading ? <Spinner /> : versiones.length === 0 ? (
          <p style={{ textAlign:'center', color:'var(--text-3)', padding:'2rem' }}>Sin versiones disponibles.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {versiones.map((v, i) => {
              const ec = estadoConfig[v.estado] || { label: v.estado, cls:'badge-gray' }
              const verStr = v.version ? `v${String(v.version).padStart(3,'0')}` : `v${i+1}`
              return (
                <div key={v._id || i} style={{ background:'var(--surface2)', border:`1px solid ${v.esUltimaVersion ? 'var(--primary)' : 'var(--border)'}`, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:14, color:'var(--text-1)' }}>{verStr}</span>
                      <span className={`badge ${ec.cls}`}>{ec.label}</span>
                      {v.esUltimaVersion && <span className="badge badge-green" style={{ fontSize:10 }}>Versión actual</span>}
                    </div>
                    <span style={{ fontSize:12, color:'var(--text-3)' }}>
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString('es-EC') : '—'}
                    </span>
                  </div>
                  <Link to={`/proyectos/${v._id}`} className="btn-secondary btn-xs" style={{ flexShrink:0 }}>Ver</Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminProjects() {
  const [searchParams]              = useSearchParams()
  const autorParam                  = searchParams.get('autor') || ''
  const [autorNombre, setAutorNombre] = useState('')

  const [projects, setProjects]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtro, setFiltro]         = useState('')
  const [filtroActivo, setFiltroActivo] = useState('true')
  const [categoria, setCategoria]   = useState('')
  const [autor, setAutor]           = useState(autorParam)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rejectModal, setRejectModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [versionesModal, setVersionesModal] = useState(null)

  useEffect(() => {
    if (!autorParam) return
    api.get(`/admin/estudiantes/${autorParam}`)
      .then(r => { const u = r.data?.data || r.data; setAutorNombre(`${u.nombre} ${u.apellido}`) })
      .catch(() => {})
  }, [autorParam])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, limit:12 }
      if (filtro)       params.estado    = filtro
      if (categoria)    params.categoria = categoria
      if (autor)        params.autor     = autor
      if (filtroActivo) params.activo    = filtroActivo
      const { data } = await api.get('/admin/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProjects() }, [page, filtro, categoria, autor, filtroActivo])

  const approve = async (id) => {
    try {
      await api.put(`/admin/proyectos/${id}/aprobar`)
      toast.success('Proyecto aprobado. El autor ya puede publicarlo en la landing page.')
      fetchProjects()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al aprobar') }
  }

  const reject = async () => {
    try {
      await api.put(`/admin/proyectos/${rejectModal.id}/rechazar`, { motivo: rejectModal.motivo })
      toast.success('Proyecto rechazado')
      setRejectModal(null)
      fetchProjects()
    } catch { toast.error('Error al rechazar') }
  }

  const desactivar = (p) => {
    // El admin solo puede desactivar proyectos pendientes o rechazados
    if (p.estado === 'aprobado') {
      toast.error('No se puede desactivar un proyecto aprobado. Solo se pueden desactivar proyectos pendientes o rechazados.')
      return
    }
    setConfirmModal({
      title: '⚠️ ¿Desactivar este proyecto?',
      message: `Este proyecto está en estado "${p.estado}". Al desactivarlo dejará de ser visible. Podrás reactivarlo cuando lo desees.`,
      confirmLabel: 'Desactivar',
      danger: false,
      onConfirm: async () => {
        try {
          await api.put(`/admin/proyectos/${p._id}/desactivar`)
          toast.success('Proyecto desactivado.')
          fetchProjects()
        } catch (err) { toast.error(err.response?.data?.message || 'Error al desactivar') }
        setConfirmModal(null)
      }
    })
  }

  const reactivar = (p) => {
    setConfirmModal({
      title: '✅ ¿Reactivar este proyecto?',
      message: 'El proyecto volverá a ser visible en la plataforma.',
      confirmLabel: 'Reactivar',
      danger: false,
      onConfirm: async () => {
        try {
          await api.put(`/admin/proyectos/${p._id}/reactivar`)
          toast.success('Proyecto reactivado.')
          fetchProjects()
        } catch (err) { toast.error(err.response?.data?.message || 'Error al reactivar') }
        setConfirmModal(null)
      }
    })
  }

  return (
    <div className="page" style={{ animation:'slideUp 0.4s ease-out' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Gestión de Proyectos</h1>
          <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>{projects.length} resultado(s) · Solo proyectos enviados al admin</p>
        </div>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {autor && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13 }}>
          <span style={{ color:'var(--primary)', fontWeight:600 }}>
            👤 Mostrando proyectos de: <strong>{autorNombre || autor}</strong>
          </span>
          <button onClick={() => { setAutor(''); setPage(1) }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontWeight:700, fontSize:12, padding:'2px 8px', borderRadius:6, border:'1px solid var(--primary)' }}>× Ver todos</button>
        </div>
      )}

      {/* Filtros estado */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        {[['','Todos'],['pendiente','Pendientes'],['aprobado','Aprobados'],['rechazado','Rechazados']].map(([v,l]) => (
          <button key={v} onClick={() => { setFiltro(v); setPage(1) }} style={{
            padding:'6px 14px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
            background: filtro===v ? 'var(--primary)' : 'var(--surface)',
            color: filtro===v ? 'white' : 'var(--text-2)',
            border: `1px solid ${filtro===v ? 'var(--primary)' : 'var(--border2)'}`,
          }}>{l}</button>
        ))}
        <select value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1) }} className="input" style={{ width:'auto', padding:'6px 12px', fontSize:13 }}>
          <option value="">Todas las categorías</option>
          <option value="academico">Académico</option>
          <option value="extracurricular">Extracurricular</option>
        </select>
      </div>

      {/* Filtro Activo/Inactivo */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.5rem', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600 }}>Visibilidad:</span>
        {[['true','Activos'],['false','Inactivos'],['','Todos']].map(([v,l]) => (
          <button key={v} onClick={() => { setFiltroActivo(v); setPage(1) }} style={{
            padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
            background: filtroActivo===v ? 'var(--text-1)' : 'var(--surface)',
            color: filtroActivo===v ? 'var(--bg)' : 'var(--text-2)',
            border: `1px solid ${filtroActivo===v ? 'var(--text-1)' : 'var(--border2)'}`,
          }}>{l}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text-3)' }}>
              No hay proyectos con estos filtros.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {projects.map(p => {
                const ec      = estadoConfig[p.estado] || { label: p.estado, cls:'badge-gray' }
                const verStr  = p.version ? `v${String(p.version).padStart(3,'0')}` : null
                const inactivo = p.activo === false
                // El admin SOLO puede desactivar pendientes y rechazados
                const puedeDesactivar = p.activo !== false && p.estado !== 'aprobado'

                return (
                  <div key={p._id} style={{
                    background:'var(--surface)', border:`1px solid ${inactivo ? 'var(--border2)' : 'var(--border)'}`,
                    borderRadius:14, padding:'14px 16px',
                    display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
                    opacity: inactivo ? 0.75 : 1,
                  }}>
                    {p.imagenes?.[0]
                      ? <img src={p.imagenes[0]} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:10, flexShrink:0 }} />
                      : <div style={{ width:56, height:56, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,var(--primary),#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, color:'white', fontSize:20 }}>
                          {p.titulo?.[0]}
                        </div>
                    }

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:3 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titulo}</span>
                        <span className={`badge ${ec.cls}`}>{ec.label}</span>
                        <span className="badge badge-blue" style={{ fontSize:10 }}>{p.categoria}</span>
                        <span className="badge badge-blue" style={{ fontSize:10 }}>📤 Enviado al admin</span>
                        {p.publico && <span className="badge badge-green" style={{ fontSize:10 }}>🌐 Publicado</span>}
                        {verStr && <span className="badge badge-blue" style={{ fontSize:10 }}>{verStr}</span>}
                        {p.proyecto_id && <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>#{p.proyecto_id}</span>}
                        {inactivo && <span className="badge badge-red" style={{ fontSize:10 }}>● Inactivo</span>}
                      </div>
                      <p style={{ fontSize:12, color:'var(--text-3)', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.autor?.nombre} {p.autor?.apellido} · {p.carrera}
                      </p>
                      <div style={{ display:'flex', gap:10, fontSize:12, color:'var(--text-3)' }}>
                        <span>❤️ {p.likes?.length||0}</span>
                        <span>💬 {p.comentarios?.length||0}</span>
                      </div>
                      {p.estado === 'rechazado' && p.motivoRechazo && (
                        <p style={{ fontSize:11, color:'var(--danger)', margin:'3px 0 0' }}>⚠️ {p.motivoRechazo}</p>
                      )}
                      {p.estado === 'aprobado' && !p.publico && (
                        <div style={{ marginTop:5, fontSize:11, color:'var(--primary)', background:'var(--primary-l)', borderRadius:6, padding:'4px 8px', display:'inline-block' }}>
                          ✅ Aprobado — el autor puede publicarlo en la landing page cuando lo desee.
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                      <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-xs">Ver</Link>

                      {p.proyecto_id && (
                        <button onClick={() => setVersionesModal(p.proyecto_id)} className="btn-secondary btn-xs">
                          📋 Versiones
                        </button>
                      )}

                      {p.estado !== 'aprobado' && (
                        <button onClick={() => approve(p._id)} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', background:'var(--success-l)', color:'var(--success)', border:'1px solid var(--success)' }}>
                          ✅ Aprobar
                        </button>
                      )}
                      {p.estado !== 'rechazado' && (
                        <button onClick={() => setRejectModal({ id:p._id, motivo:'' })} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', background:'var(--danger-l)', color:'var(--danger)', border:'1px solid var(--danger)' }}>
                          ❌ Rechazar
                        </button>
                      )}

                      {/* Desactivar solo si pendiente o rechazado */}
                      {p.activo !== false ? (
                        <button
                          onClick={() => desactivar(p)}
                          disabled={!puedeDesactivar}
                          title={!puedeDesactivar ? 'Solo se pueden desactivar proyectos pendientes o rechazados' : 'Desactivar proyecto'}
                          style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor: puedeDesactivar ? 'pointer' : 'not-allowed', background: puedeDesactivar ? 'var(--warning-l)' : 'var(--surface2)', color: puedeDesactivar ? 'var(--warning)' : 'var(--text-3)', border: `1px solid ${puedeDesactivar ? 'var(--warning)' : 'var(--border)'}`, opacity: puedeDesactivar ? 1 : 0.5 }}>
                          ⏸ Desactivar
                        </button>
                      ) : (
                        <button onClick={() => reactivar(p)} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', background:'var(--success-l)', color:'var(--success)', border:'1px solid var(--success)' }}>
                          ▶ Reactivar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:'2rem', alignItems:'center' }}>
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-secondary btn-sm">← Anterior</button>
              <span style={{ fontSize:13, color:'var(--text-3)' }}>Página {page} de {totalPages}</span>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="btn-secondary btn-sm">Siguiente →</button>
            </div>
          )}
        </>
      )}

      <RejectModal
        modal={rejectModal}
        onChange={motivo => setRejectModal(r => ({ ...r, motivo }))}
        onConfirm={reject}
        onClose={() => setRejectModal(null)}
      />
      <ConfirmModal config={confirmModal} onClose={() => setConfirmModal(null)} />
      {versionesModal && <VersionesModal proyectoId={versionesModal} onClose={() => setVersionesModal(null)} />}
    </div>
  )
}
