import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isDocente } = useAuth()
  const [project, setProject]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [comment, setComment]         = useState('')
  const [colaboradores, setColaboradores] = useState([])
  const [addColabId, setAddColabId]   = useState('')
  const [liked, setLiked]             = useState(false)

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/proyectos/${id}`)
      setProject(data.data || data)
      if (user) setLiked((data.data?.likes || data.likes || []).includes(user._id))
    } catch { toast.error('Proyecto no encontrado') }
    finally { setLoading(false) }
  }

  const fetchColaboradores = async () => {
    if (!user) return
    try {
      const { data } = await api.get(`/proyectos/${id}/colaboradores`)
      setColaboradores(data.data || [])
    } catch {}
  }

  useEffect(() => { fetchProject(); fetchColaboradores() }, [id])

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
      setComment('')
      fetchProject()
      toast.success('Comentario agregado')
    } catch (err) { toast.error(err.response?.data?.message || 'Error al comentar') }
  }

  const deleteComment = async (comentarioId) => {
    if (!confirm('¿Eliminar comentario?')) return
    try {
      await api.delete(`/proyectos/${id}/comentarios/${comentarioId}`)
      fetchProject()
      toast.success('Comentario eliminado')
    } catch { toast.error('No puedes eliminar este comentario') }
  }

  const addColab = async e => {
    e.preventDefault()
    try {
      await api.post(`/proyectos/${id}/colaboradores`, { colaboradorId: addColabId })
      setAddColabId('')
      fetchColaboradores()
      toast.success('Colaborador agregado')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const removeColab = async (colabId) => {
    try {
      await api.delete(`/proyectos/${id}/colaboradores/${colabId}`)
      fetchColaboradores()
      toast.success('Colaborador eliminado')
    } catch { toast.error('Error al eliminar colaborador') }
  }

  if (loading) return <Spinner />
  if (!project) return <div className="text-center py-20 text-gray-400">Proyecto no encontrado</div>

  const isAuthor = user?._id === project.autor?._id
  const likes = project.likes || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image */}
      {project.imagenes?.[0] ? (
        <img src={project.imagenes[0]} alt={project.titulo} className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-primary-700 to-primary-500 rounded-xl mb-6 flex items-center justify-center">
          <span className="text-white text-5xl font-bold opacity-20">{project.titulo?.[0]}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{project.titulo}</h1>
              <span className={`badge ${project.estado === 'publicado' ? 'badge-green' : 'badge-yellow'}`}>
                {project.estado === 'publicado' ? 'Publicado' : 'En progreso'}
              </span>
            </div>
            <p className="text-gray-600 mt-3 leading-relaxed">{project.descripcion}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${liked ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-300 text-gray-600 hover:border-red-300'}`}>
              {liked ? '❤️' : '🤍'} {likes.length} {likes.length === 1 ? 'like' : 'likes'}
            </button>
            {isAuthor && (
              <Link to={`/mis-proyectos/editar/${id}`} className="btn-secondary btn-sm">✏️ Editar</Link>
            )}
          </div>

          {/* Tech & links */}
          {project.tecnologias?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Tecnologías</h3>
              <div className="flex flex-wrap gap-2">
                {project.tecnologias.map((t, i) => <span key={i} className="badge badge-blue">{t}</span>)}
              </div>
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            {project.repositorio && (
              <a href={project.repositorio} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">🔗 Repositorio</a>
            )}
            {project.enlaceDemo && (
              <a href={project.enlaceDemo} target="_blank" rel="noreferrer" className="btn-primary btn-sm">🚀 Demo</a>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Comentarios ({project.comentarios?.length || 0})</h3>
            {user && (
              <form onSubmit={addComment} className="flex gap-2 mb-4">
                <input value={comment} onChange={e => setComment(e.target.value)} required
                  className="input flex-1" placeholder="Escribe un comentario..." />
                <button type="submit" className="btn-primary btn-sm">Enviar</button>
              </form>
            )}
            <div className="space-y-3">
              {(project.comentarios || []).map(c => (
                <div key={c._id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-semibold text-primary-700">{c.autor?.nombre} {c.autor?.apellido}</span>
                    <p className="text-sm text-gray-700 mt-0.5">{c.texto}</p>
                  </div>
                  {(user?._id === c.autor?._id || user?.rol === 'admin') && (
                    <button onClick={() => deleteComment(c._id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕</button>
                  )}
                </div>
              ))}
              {(project.comentarios || []).length === 0 && (
                <p className="text-sm text-gray-400">Sin comentarios aún.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Información</h3>
            <InfoRow label="Autor" value={`${project.autor?.nombre} ${project.autor?.apellido}`} />
            <InfoRow label="Carrera" value={project.carrera} />
            <InfoRow label="Categoría" value={project.categoria} />
            {project.asignatura && <InfoRow label="Asignatura" value={project.asignatura} />}
            {project.nivel && <InfoRow label="Semestre" value={`${project.nivel}°`} />}
            {project.fechaInicio && <InfoRow label="Inicio" value={new Date(project.fechaInicio).toLocaleDateString()} />}
            {project.fechaFin && <InfoRow label="Fin" value={new Date(project.fechaFin).toLocaleDateString()} />}
          </div>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((t, i) => <span key={i} className="badge badge-gray">{t}</span>)}
              </div>
            </div>
          )}

          {/* Collaborators (docente author only) */}
          {user && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Colaboradores</h3>
              {colaboradores.length === 0 && <p className="text-xs text-gray-400">Sin colaboradores.</p>}
              <div className="space-y-2 mb-3">
                {colaboradores.map(c => (
                  <div key={c._id} className="flex items-center justify-between text-sm">
                    <span>{c.nombre} {c.apellido}</span>
                    {isDocente && isAuthor && (
                      <button onClick={() => removeColab(c._id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>
              {isDocente && isAuthor && (
                <form onSubmit={addColab} className="flex gap-1">
                  <input value={addColabId} onChange={e => setAddColabId(e.target.value)} required
                    className="input text-xs flex-1" placeholder="ID del estudiante" />
                  <button type="submit" className="btn-primary btn-sm text-xs">+</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return value ? (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  ) : null
}
