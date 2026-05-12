import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

export default function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchProjects = () => {
    api.get(`/proyectos/estudiante/${user._id}`)
      .then(r => setProjects(r.data?.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const deleteProject = async (id) => {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/proyectos/${id}`)
      toast.success('Proyecto eliminado')
      fetchProjects()
    } catch { toast.error('No se pudo eliminar') }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
        <Link to="/mis-proyectos/nuevo" className="btn-primary btn-sm">+ Nuevo</Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Aún no tienes proyectos.</p>
          <Link to="/mis-proyectos/nuevo" className="btn-primary">Crear mi primer proyecto</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p._id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                {p.imagenes?.[0] ? (
                  <img src={p.imagenes[0]} alt={p.titulo} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex-shrink-0 flex items-center justify-center text-primary-700 font-bold text-xl">
                    {p.titulo?.[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{p.titulo}</h3>
                    <span className={`badge flex-shrink-0 ${p.estado === 'publicado' ? 'badge-green' : 'badge-yellow'}`}>
                      {p.estado === 'publicado' ? 'Publicado' : 'En progreso'}
                    </span>
                    <span className="badge badge-gray flex-shrink-0">{p.categoria}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.descripcion}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>❤️ {p.likes?.length || 0}</span>
                    <span>💬 {p.comentarios?.length || 0}</span>
                    <span>{p.carrera}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-sm text-xs">Ver</Link>
                <Link to={`/mis-proyectos/editar/${p._id}`} className="btn-secondary btn-sm text-xs">Editar</Link>
                <button onClick={() => deleteProject(p._id)} className="btn-danger btn-sm text-xs">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
