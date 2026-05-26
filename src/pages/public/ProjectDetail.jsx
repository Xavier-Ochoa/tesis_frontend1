import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

// ── Galería con miniaturas ────────────────────────────────────────────────────
function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0)
  if (!images?.length) return null
  return (
    <div style={{ marginBottom:'1.5rem' }}>
      <div style={{ maxHeight:420, borderRadius:20, overflow:'hidden', marginBottom:8, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <img src={images[active]} alt={title} style={{ width:'100%', maxHeight:420, objectFit:'contain', objectPosition:'center', transition:'opacity 0.2s', display:'block' }} />
      </div>
      {images.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              style={{ width:72, height:54, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${active===i ? 'var(--primary)' : 'transparent'}`, padding:0, cursor:'pointer', transition:'border-color 0.15s', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={src} alt={`thumb-${i}`} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Historial de Versiones ────────────────────────────────────────────────────
function HistorialVersiones({ proyectoId }) {
  const [versiones, setVersiones] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!proyectoId) return
    api.get(`/proyectos/versiones/${proyectoId}`)
      .then(r => setVersiones(r.data?.data || []))
      .catch(() => setVersiones([]))
      .finally(() => setLoading(false))
  }, [proyectoId])

  const estadoCfg = {
    aprobado:  { label:'Aprobado',  cls:'badge-green' },
    pendiente: { label:'Pendiente', cls:'badge-yellow' },
    rechazado: { label:'Rechazado', cls:'badge-red' },
  }

  if (loading) return <div style={{ padding:'1rem', fontSize:13, color:'var(--text-3)' }}>Cargando historial...</div>
  if (!versiones.length) return <p style={{ fontSize:13, color:'var(--text-3)', padding:'0.5rem 0' }}>Sin historial de versiones.</p>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {versiones.map((v, i) => {
        const ec = estadoCfg[v.estado] || { label:v.estado, cls:'badge-gray' }
        const verStr = v.version ? `v${String(v.version).padStart(3,'0')}` : `v${i+1}`
        return (
          <div key={v._id||i} style={{ background:'var(--surface2)', border:`1px solid ${v.esUltimaVersion ? 'var(--primary)' : 'var(--border)'}`, borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap', marginBottom:2 }}>
                <span style={{ fontWeight:700, fontSize:13, color:'var(--text-1)' }}>{verStr}</span>
                <span className={`badge ${ec.cls}`} style={{ fontSize:10 }}>{ec.label}</span>
                {v.esUltimaVersion && <span className="badge badge-green" style={{ fontSize:9 }}>Versión actual</span>}
              </div>
              <span style={{ fontSize:11, color:'var(--text-3)' }}>
                {v.createdAt ? new Date(v.createdAt).toLocaleDateString('es-EC') : '—'}
              </span>
            </div>
            <Link to={`/proyectos/${v._id}`} className="btn-secondary btn-xs">Ver</Link>
          </div>
        )
      })}
    </div>
  )
}

export default function ProjectDetail() {
  const { id }   = useParams()
  const { user, isDocente } = useAuth()
  const [project, setProject]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [comment, setComment]     = useState('')
  const [colabs, setColabs]       = useState([])
  const [addColabEmail, setAddColabEmail] = useState('')
  const [liked, setLiked]         = useState(false)
  const [showHistorial, setShowHistorial]       = useState(false)

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/proyectos/${id}`)
      const p = data.data || data
      setProject(p)
      if (user) setLiked((p.likes || []).some(l => l === user._id || l?._id === user._id))
    } catch { toast.error('Proyecto no encontrado') }
    finally { setLoading(false) }
  }

  const fetchColabs = async () => {
    if (!user) return
    try { const { data } = await api.get(`/proyectos/${id}/colaboradores`); setColabs(data.data || []) } catch {}
  }

  useEffect(() => { fetchProject(); fetchColabs() }, [id])

  const toggleLike = async () => {
    if (!user) { toast.error('Inicia sesión para dar like'); return }
    try {
      if (liked) { await api.delete(`/proyectos/${id}/like`); setLiked(false) }
      else        { await api.post(`/proyectos/${id}/like`);   setLiked(true) }
      fetchProject()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const addComment = async e => {
    e.preventDefault()
    if (!user) { toast.error('Inicia sesión para comentar'); return }
    try {
      await api.post(`/proyectos/${id}/comentarios`, { texto: comment })
      setComment(''); fetchProject(); toast.success('Comentario agregado')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const deleteComment = async (cid) => {
    if (!confirm('¿Eliminar comentario?')) return
    try { await api.delete(`/proyectos/${id}/comentarios/${cid}`); fetchProject(); toast.success('Eliminado') }
    catch { toast.error('No puedes eliminar este comentario') }
  }

  const addColab = async e => {
    e.preventDefault()
    try { await api.post(`/proyectos/${id}/colaboradores`, { email: addColabEmail }); setAddColabEmail(''); fetchColabs(); toast.success('Colaborador agregado') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const removeColab = async (cid) => {
    try { await api.delete(`/proyectos/${id}/colaboradores/${cid}`); fetchColabs(); toast.success('Eliminado') }
    catch { toast.error('Error') }
  }

  if (loading) return <Spinner />
  if (!project) return <div style={{ textAlign:'center', padding:'5rem', color:'var(--text-3)' }}>Proyecto no encontrado</div>

  const isAuthor      = user?._id === (project.autor?._id || project.autor)
  const isColaborador = !isAuthor && colabs.some(c => (c._id || c) === user?._id)
  const esMiembro     = isAuthor || isColaborador

  // Lógica de edición
  const tipo = project.tipoProyecto || (project.publico ? 'publico' : 'privado')
  const est  = project.estado
  const esUltima = project.esUltimaVersion !== false

  let puedeEditarBoton = false
  let tooltipEdit = ''
  if (!esUltima) {
    tooltipEdit = 'Solo se puede editar la última versión del proyecto.'
  } else if (tipo === 'privado' && (est === 'pendiente' || est === 'rechazado')) {
    puedeEditarBoton = true
  } else if (tipo === 'publico' && est === 'rechazado') {
    puedeEditarBoton = true
  } else if (tipo === 'publico' && (est === 'pendiente' || est === 'aprobado')) {
    tooltipEdit = 'Los proyectos públicos no se pueden modificar una vez enviados.'
  } else if (tipo === 'privado' && est === 'aprobado') {
    tooltipEdit = 'No se puede editar un proyecto aprobado.'
  }

  const mostrarEditar = esMiembro
  // Solo autor + público + aprobado + última versión puede crear nueva versión
  const puedeNuevaVersion = isAuthor && esUltima && tipo === 'publico' && est === 'aprobado'

  const estadoConfig = { aprobado: { label:'Aprobado', cls:'badge-green' }, pendiente: { label:'Pendiente', cls:'badge-yellow' }, rechazado: { label:'Rechazado', cls:'badge-red' } }
  const ec     = estadoConfig[est] || { label:est, cls:'badge-gray' }
  const likes  = project.likes || []
  const verStr = project.version ? `v${String(project.version).padStart(3,'0')}` : null
  const tipoBadge = tipo === 'publico' ? 'badge-green' : 'badge-gray'
  const tipoLabel = tipo === 'publico' ? '🌐 Público' : '🔒 Privado'

  return (
    <div className="page" style={{ animation:'slideUp 0.4s ease-out' }}>

      {/* Banner: versión anterior */}
      {!esUltima && (
        <div style={{ background:'var(--warning-l)', border:'1px solid var(--warning)', borderRadius:12, padding:'10px 16px', marginBottom:'1rem', fontSize:13, color:'var(--warning)', fontWeight:600 }}>
          🕒 Estás viendo una versión anterior. Esta versión no puede modificarse.
        </div>
      )}

      {/* Banner: proyecto rechazado (vista estudiante) */}
      {esMiembro && est === 'rechazado' && (
        <div style={{ background:'var(--danger-l)', border:'1px solid var(--danger)', borderRadius:12, padding:'10px 16px', marginBottom:'1rem', fontSize:13, color:'var(--danger)', fontWeight:600 }}>
          ⚠️ Tu proyecto fue rechazado.
          {project.motivoRechazo && ` Motivo: ${project.motivoRechazo}.`}
          {puedeEditarBoton ? ' Puedes editarlo, corregirlo y volver a enviarlo.' : ''}
        </div>
      )}

      {/* Hero image */}
      {project.imagenes?.length > 0 ? (
        <ImageGallery images={project.imagenes} title={project.titulo} />
      ) : (
        <div style={{ height:160, borderRadius:20, marginBottom:'1.5rem', background:'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          <span style={{ fontFamily:'Syne, sans-serif', fontSize:56, fontWeight:800, color:'rgba(255,255,255,0.2)' }}>{project.titulo?.[0]}</span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }} className="md:grid">

        {/* Main */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* Header */}
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, flexWrap:'wrap', marginBottom:10 }}>
              <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:0, flex:1, letterSpacing:'-0.03em' }}>
                {project.titulo}
              </h1>
              <span className={`badge ${ec.cls}`}>{ec.label}</span>
              <span className={`badge ${tipoBadge}`}>{tipoLabel}</span>
              {verStr && <span className="badge badge-blue">{verStr}</span>}
              {project.proyecto_id && (
                <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 7px' }}>
                  #{project.proyecto_id}
                </span>
              )}
            </div>
            <p style={{ fontSize:15, color:'var(--text-2)', lineHeight:1.7, margin:0 }}>{project.descripcion}</p>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={toggleLike} style={{
              display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
              background: liked ? 'var(--danger-l)' : 'var(--surface)', color: liked ? 'var(--danger)' : 'var(--text-2)',
              border: `1px solid ${liked ? 'var(--danger)' : 'var(--border2)'}`,
            }}>
              {liked ? '❤️' : '🤍'} {likes.length} {likes.length === 1 ? 'like' : 'likes'}
            </button>

            {project.repositorio && <a href={project.repositorio} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">🔗 Repositorio</a>}
            {project.enlaceDemo  && <a href={project.enlaceDemo}  target="_blank" rel="noreferrer" className="btn-primary btn-sm">🚀 Demo</a>}

            {mostrarEditar && (
              puedeEditarBoton ? (
                <Link to={`/mis-proyectos/editar/${id}`} className="btn-secondary btn-sm">
                  {isColaborador ? '👥 Editar (colaborador)' : '✏️ Editar'}
                </Link>
              ) : (
                <span title={tooltipEdit} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'not-allowed', background:'var(--surface2)', color:'var(--text-3)', border:'1px solid var(--border)', opacity:0.6, display:'inline-flex', alignItems:'center' }}>
                  ✏️ Editar
                </span>
              )
            )}

            {puedeNuevaVersion && (
              <Link to={`/mis-proyectos/${id}/nueva-version`} className="btn-secondary btn-sm">
                🔖 Nueva versión
              </Link>
            )}

            {project.proyecto_id && (
              <button onClick={() => setShowHistorial(h => !h)} className="btn-secondary btn-sm">
                📋 {showHistorial ? 'Ocultar historial' : 'Ver versiones'}
              </button>
            )}
          </div>

          {/* Historial de versiones expandible */}
          {showHistorial && project.proyecto_id && (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'var(--text-2)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Historial de versiones
              </h3>
              <HistorialVersiones proyectoId={project.proyecto_id} />
            </div>
          )}

          {/* Tech */}
          {project.tecnologias?.length > 0 && (
            <div>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:700, color:'var(--text-2)', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Tecnologías</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {project.tecnologias.map((t, i) => <span key={i} className="badge badge-blue">{t}</span>)}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:700, color:'var(--text-2)', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              Comentarios ({project.comentarios?.length || 0})
            </h3>
            {user && (
              <form onSubmit={addComment} style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} required className="input" style={{ flex:1 }} placeholder="Escribe un comentario..." />
                <button type="submit" className="btn-primary btn-sm">Enviar</button>
              </form>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(project.comentarios || []).length === 0 && (
                <p style={{ fontSize:13, color:'var(--text-3)', padding:'1rem 0' }}>Sin comentarios aún.</p>
              )}
              {(project.comentarios || []).map(c => (
                <div key={c._id} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)' }}>{c.estudiante?.nombre} {c.estudiante?.apellido}</span>
                    <p style={{ fontSize:13, color:'var(--text-2)', margin:'3px 0 0' }}>{c.texto}</p>
                  </div>
                  {(user?._id === c.estudiante?._id || user?.rol === 'admin') && (
                    <button onClick={() => deleteComment(c._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:16, padding:'0 4px', flexShrink:0 }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Info */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
            <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-2)', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Información</h3>
            {[
              { label: 'Autor',                value: `${project.autor?.nombre} ${project.autor?.apellido}` },
              { label: 'Carrera',              value: project.carrera },
              { label: 'Categoría',            value: project.categoria },
              { label: 'Línea de Investigación', value: project.lineaInvestigacion || project.asignatura },
              { label: 'Inicio',               value: project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString() : null },
              { label: 'Fin',                  value: project.fechaFin    ? new Date(project.fechaFin).toLocaleDateString()    : null },
            ].filter(r => r.value).map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ color:'var(--text-3)' }}>{r.label}</span>
                <span style={{ fontWeight:600, color:'var(--text-1)', textAlign:'right' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-2)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Tags</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {project.tags.map((t, i) => <span key={i} className="badge badge-gray">{t}</span>)}
              </div>
            </div>
          )}

          {/* Colaboradores */}
          {(() => {
            const esPublicoAprobado = project.estado === 'aprobado' && tipo === 'publico'
            const tieneAccesoPrivado = isAuthor || isColaborador || user?.rol === 'admin'
            const puedeVerColabs = esPublicoAprobado || tieneAccesoPrivado
            if (!puedeVerColabs) return null
            if (colabs.length === 0 && !(isDocente && isAuthor)) return null

            return (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-2)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Colaboradores</h3>
                {colabs.length === 0 && <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:10 }}>Sin colaboradores aún.</p>}
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom: isDocente && isAuthor ? 10 : 0 }}>
                  {colabs.map(c => (
                    <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                      <span style={{ color:'var(--text-1)' }}>{c.nombre} {c.apellido}</span>
                      {isDocente && isAuthor && (
                        <button onClick={() => removeColab(c._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', fontSize:16 }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                {isDocente && isAuthor && (
                  <form onSubmit={addColab} style={{ display:'flex', gap:6 }}>
                    <input type="email" value={addColabEmail} onChange={e => setAddColabEmail(e.target.value)} required className="input" style={{ flex:1, fontSize:12 }} placeholder="correo@estudiante.epn.edu.ec" />
                    <button type="submit" className="btn-primary btn-xs">+</button>
                  </form>
                )}
              </div>
            )
          })()}
        </div>
      </div>

    </div>
  )
}
