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

export default function AdminProjects() {
  const [searchParams]            = useSearchParams()
  const autorParam                = searchParams.get('autor') || ''
  const [autorNombre, setAutorNombre] = useState('')

  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState('')
  const [categoria, setCategoria] = useState('')
  const [autor, setAutor]         = useState(autorParam)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editModal, setEditModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [saving, setSaving]       = useState(false)

  // Si viene ?autor=id desde AdminUsers, buscar el nombre para mostrarlo
  useEffect(() => {
    if (!autorParam) return
    api.get(`/admin/estudiantes/${autorParam}`)
      .then(r => {
        const u = r.data?.data || r.data
        setAutorNombre(`${u.nombre} ${u.apellido}`)
      })
      .catch(() => {})
  }, [autorParam])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (filtro)    params.estado    = filtro
      if (categoria) params.categoria = categoria
      if (autor)     params.autor     = autor
      const { data } = await api.get('/admin/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProjects() }, [page, filtro, categoria, autor])

  const approve = async (id) => {
    try { await api.put(`/admin/proyectos/${id}/aprobar`); toast.success('Proyecto aprobado'); fetchProjects() }
    catch { toast.error('Error al aprobar') }
  }

  const reject = async () => {
    try {
      await api.put(`/admin/proyectos/${rejectModal.id}/rechazar`, { motivo: rejectModal.motivo })
      toast.success('Proyecto rechazado'); setRejectModal(null); fetchProjects()
    } catch { toast.error('Error al rechazar') }
  }

  const deleteProject = async (id) => {
    if (!confirm('¿Eliminar este proyecto? No se puede deshacer.')) return
    try { await api.delete(`/admin/proyectos/${id}`); toast.success('Eliminado'); fetchProjects() }
    catch { toast.error('Error al eliminar') }
  }

  const saveEdit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      const { _imageFile, _id, ...campos } = editModal
      Object.entries(campos).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, v) })
      if (_imageFile) fd.append('imagen', _imageFile)
      await api.put(`/admin/proyectos/${_id}`, fd)
      toast.success('Actualizado'); setEditModal(null); fetchProjects()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Gestión de Proyectos</h1>
          <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>{projects.length} resultado(s)</p>
        </div>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {/* Banner cuando se filtra por autor */}
      {autor && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13 }}>
          <span style={{ color:'var(--primary)', fontWeight:600 }}>
            👤 Mostrando proyectos de: <strong>{autorNombre || autor}</strong>
          </span>
          <button
            onClick={() => { setAutor(''); setPage(1) }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontWeight:700, fontSize:12, padding:'2px 8px', borderRadius:6, border:'1px solid var(--primary)' }}>
            × Ver todos
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[['','Todos'],['pendiente','Pendientes'],['aprobado','Aprobados'],['rechazado','Rechazados']].map(([v,l]) => (
          <button key={v} onClick={() => { setFiltro(v); setPage(1) }} style={{
            padding:'6px 14px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
            background: filtro===v ? 'var(--primary)' : 'var(--surface)',
            color: filtro===v ? 'white' : 'var(--text-2)',
            border: `1px solid ${filtro===v ? 'var(--primary)' : 'var(--border2)'}`,
          }}>{l}</button>
        ))}
        <select value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1) }}
          className="input" style={{ width:'auto', padding:'6px 12px', fontSize:13 }}>
          <option value="">Todas las categorías</option>
          <option value="academico">Académico</option>
          <option value="extracurricular">Extracurricular</option>
        </select>
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
                const ec = estadoConfig[p.estado] || { label: p.estado, cls: 'badge-gray' }
                return (
                  <div key={p._id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
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
                        <span className="badge badge-blue">{p.categoria}</span>
                        {p.publico ? <span className="badge badge-green" style={{ fontSize:10 }}>🌐 Público</span> : <span className="badge badge-gray" style={{ fontSize:10 }}>🔒 Privado</span>}
                      </div>
                      <p style={{ fontSize:12, color:'var(--text-3)', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.autor?.nombre} {p.autor?.apellido} · {p.carrera}
                      </p>
                      <div style={{ display:'flex', gap:10, fontSize:12, color:'var(--text-3)' }}>
                        <span>❤️ {p.likes?.length||0}</span>
                        <span>💬 {p.comentarios?.length||0}</span>
                      </div>
                      {p.estado==='rechazado' && p.motivoRechazo && (
                        <p style={{ fontSize:11, color:'var(--danger)', margin:'3px 0 0' }}>⚠️ {p.motivoRechazo}</p>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                      <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-xs">Ver</Link>
                      <button onClick={() => setEditModal({ ...p, _id:p._id, _imageFile:null, tecnologias:Array.isArray(p.tecnologias)?p.tecnologias.join(', '):'', tags:Array.isArray(p.tags)?p.tags.join(', '):'', fechaInicio:p.fechaInicio?p.fechaInicio.slice(0,10):'', fechaFin:p.fechaFin?p.fechaFin.slice(0,10):'' })} className="btn-secondary btn-xs">Editar</button>
                      {p.estado !== 'aprobado' && (
                        <button onClick={() => approve(p._id)} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', background:'var(--success-l)', color:'var(--success)', border:'1px solid var(--success)' }}>✅ Aprobar</button>
                      )}
                      {p.estado !== 'rechazado' && (
                        <button onClick={() => setRejectModal({ id:p._id, motivo:'' })} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', background:'var(--danger-l)', color:'var(--danger)', border:'1px solid var(--danger)' }}>❌ Rechazar</button>
                      )}
                      <button onClick={() => deleteProject(p._id)} className="btn-danger btn-xs">Eliminar</button>
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

      {/* Reject Modal */}
      {rejectModal && (
        <div onClick={e => { if(e.target===e.currentTarget) setRejectModal(null) }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:420, boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px' }}>Rechazar proyecto</h2>
            <p style={{ fontSize:13, color:'var(--text-3)', margin:'0 0 1.25rem' }}>Puedes indicar el motivo del rechazo (opcional).</p>
            <textarea value={rejectModal.motivo} onChange={e => setRejectModal({...rejectModal, motivo:e.target.value})}
              rows={3} className="input" style={{ resize:'none', marginBottom:14 }} placeholder="Motivo del rechazo..." />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={reject} className="btn-danger" style={{ flex:1 }}>Confirmar rechazo</button>
              <button onClick={() => setRejectModal(null)} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div onClick={e => { if(e.target===e.currentTarget) setEditModal(null) }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'1.75rem', boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:0 }}>Editar proyecto</h2>
              <button onClick={() => setEditModal(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-3)', lineHeight:1 }}>×</button>
            </div>
            <form onSubmit={saveEdit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[['titulo','Título'],['descripcion','Descripción'],['carrera','Carrera'],['tecnologias','Tecnologías (coma)']].map(([k,l]) => (
                <div key={k}>
                  <label className="label">{l}</label>
                  {k==='descripcion'
                    ? <textarea value={editModal[k]||''} onChange={e => setEditModal({...editModal,[k]:e.target.value})} rows={3} className="input" style={{ resize:'none' }} />
                    : <input value={editModal[k]||''} onChange={e => setEditModal({...editModal,[k]:e.target.value})} className="input" />
                  }
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="label">Categoría</label>
                  <select value={editModal.categoria||'academico'} onChange={e => setEditModal({...editModal,categoria:e.target.value})} className="input">
                    <option value="academico">Académico</option>
                    <option value="extracurricular">Extracurricular</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nueva imagen</label>
                  <input type="file" accept="image/*" onChange={e => setEditModal({...editModal,_imageFile:e.target.files[0]})} className="input" style={{ fontSize:12 }} />
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex:1 }}>{saving?'Guardando...':'Guardar'}</button>
                <button type="button" onClick={() => setEditModal(null)} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
