import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
      {/* Imagen principal */}
      <div style={{ height:300, borderRadius:20, overflow:'hidden', marginBottom:8, background:'var(--surface3)' }}>
        <img src={images[active]} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.2s' }} />
      </div>
      {/* Miniaturas */}
      {images.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              style={{ width:72, height:54, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${active===i ? 'var(--primary)' : 'transparent'}`, padding:0, cursor:'pointer', transition:'border-color 0.15s' }}>
              <img src={src} alt={`thumb-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isDocente } = useAuth()
  const [project, setProject]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [comment, setComment]     = useState('')
  const [colabs, setColabs]       = useState([])
  const [addColabId, setAddColabId] = useState('')
  const [liked, setLiked]         = useState(false)

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
    try { await api.post(`/proyectos/${id}/colaboradores`, { colaboradorId: addColabId }); setAddColabId(''); fetchColabs(); toast.success('Colaborador agregado') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const removeColab = async (cid) => {
    try { await api.delete(`/proyectos/${id}/colaboradores/${cid}`); fetchColabs(); toast.success('Eliminado') }
    catch { toast.error('Error') }
  }

  if (loading) return <Spinner />
  if (!project) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-3)' }}>Proyecto no encontrado</div>

  const isAuthor = user?._id === (project.autor?._id || project.autor)
  const estadoConfig = { aprobado: { label: 'Aprobado', cls: 'badge-green' }, pendiente: { label: 'Pendiente', cls: 'badge-yellow' }, rechazado: { label: 'Rechazado', cls: 'badge-red' } }
  const ec = estadoConfig[project.estado] || { label: project.estado, cls: 'badge-gray' }
  const likes = project.likes || []

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>
      {/* Hero image */}
      {project.imagenes?.length > 0 ? (
        <ImageGallery images={project.imagenes} title={project.titulo} />
      ) : (
        <div style={{ height: 160, borderRadius: 20, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>{project.titulo?.[0]}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }} className="md:grid">

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-1)', margin: 0, flex: 1, letterSpacing: '-0.03em' }}>
                {project.titulo}
              </h1>
              <span className={`badge ${ec.cls}`}>{ec.label}</span>
              {project.publico ? <span className="badge badge-green">🌐 Público</span> : <span className="badge badge-gray">🔒 Privado</span>}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{project.descripcion}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={toggleLike} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: liked ? 'var(--danger-l)' : 'var(--surface)', color: liked ? 'var(--danger)' : 'var(--text-2)',
              border: `1px solid ${liked ? 'var(--danger)' : 'var(--border2)'}`,
            }}>
              {liked ? '❤️' : '🤍'} {likes.length} {likes.length === 1 ? 'like' : 'likes'}
            </button>
            {project.repositorio && <a href={project.repositorio} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">🔗 Repositorio</a>}
            {project.enlaceDemo  && <a href={project.enlaceDemo}  target="_blank" rel="noreferrer" className="btn-primary btn-sm">🚀 Demo</a>}
            {isAuthor && <Link to={`/mis-proyectos/editar/${id}`} className="btn-secondary btn-sm">✏️ Editar</Link>}
          </div>

          {/* Tech */}
          {project.tecnologias?.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tecnologías</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.tecnologias.map((t, i) => <span key={i} className="badge badge-blue">{t}</span>)}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Comentarios ({project.comentarios?.length || 0})
            </h3>
            {user && (
              <form onSubmit={addComment} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} required className="input" style={{ flex: 1 }} placeholder="Escribe un comentario..." />
                <button type="submit" className="btn-primary btn-sm">Enviar</button>
              </form>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(project.comentarios || []).length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '1rem 0' }}>Sin comentarios aún.</p>
              )}
              {(project.comentarios || []).map(c => (
                <div key={c._id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{c.estudiante?.nombre} {c.estudiante?.apellido}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0' }}>{c.texto}</p>
                  </div>
                  {(user?._id === c.estudiante?._id || user?.rol === 'admin') && (
                    <button onClick={() => deleteComment(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Info */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Información</h3>
            {[
              { label: 'Autor',     value: `${project.autor?.nombre} ${project.autor?.apellido}` },
              { label: 'Carrera',   value: project.carrera },
              { label: 'Categoría',value: project.categoria },
              { label: 'Asignatura',value: project.asignatura },
              { label: 'Semestre', value: project.nivel ? `${project.nivel}°` : null },
              { label: 'Inicio',   value: project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString() : null },
              { label: 'Fin',      value: project.fechaFin    ? new Date(project.fechaFin).toLocaleDateString()    : null },
            ].filter(r => r.value).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.tags.map((t, i) => <span key={i} className="badge badge-gray">{t}</span>)}
              </div>
            </div>
          )}

          {/* Collaborators */}
          {user && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Colaboradores</h3>
              {colabs.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Sin colaboradores.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {colabs.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-1)' }}>{c.nombre} {c.apellido}</span>
                    {isDocente && isAuthor && (
                      <button onClick={() => removeColab(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              {isDocente && isAuthor && (
                <form onSubmit={addColab} style={{ display: 'flex', gap: 6 }}>
                  <input value={addColabId} onChange={e => setAddColabId(e.target.value)} required className="input" style={{ flex: 1, fontSize: 12 }} placeholder="ID del estudiante" />
                  <button type="submit" className="btn-primary btn-xs">+</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
