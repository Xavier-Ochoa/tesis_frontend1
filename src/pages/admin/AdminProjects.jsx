import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

export default function AdminProjects() {
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState('')
  const [categoria, setCategoria] = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editModal, setEditModal] = useState(null)   // proyecto a editar
  const [saving, setSaving]       = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (filtro)    params.estado    = filtro
      if (categoria) params.categoria = categoria
      const { data } = await api.get('/admin/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProjects() }, [page, filtro, categoria])

  const publish = async (id) => {
    try {
      await api.put(`/admin/proyectos/${id}/publicar`)
      toast.success('Proyecto publicado')
      fetchProjects()
    } catch { toast.error('Error al publicar') }
  }

  const unpublish = async (id) => {
    try {
      await api.put(`/admin/proyectos/${id}/despublicar`)
      toast.success('Proyecto despublicado')
      fetchProjects()
    } catch { toast.error('Error al despublicar') }
  }

  const deleteProject = async (id) => {
    if (!confirm('¿Eliminar este proyecto? No se puede deshacer.')) return
    try {
      await api.delete(`/admin/proyectos/${id}`)
      toast.success('Proyecto eliminado')
      fetchProjects()
    } catch { toast.error('Error al eliminar') }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      const { _imageFile, _id, ...campos } = editModal
      Object.entries(campos).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, v) })
      if (_imageFile) fd.append('imagen', _imageFile)
      await api.put(`/admin/proyectos/${_id}`, fd)
      toast.success('Proyecto actualizado')
      setEditModal(null)
      fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h1>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[['', 'Todos'], ['en_progreso', 'Pendientes'], ['publicado', 'Publicados']].map(([v, l]) => (
          <button key={v} onClick={() => { setFiltro(v); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filtro === v ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-500'}`}>
            {l}
          </button>
        ))}
        <select value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1) }}
          className="input w-auto text-sm py-1.5">
          <option value="">Todas las categorías</option>
          <option value="academico">Académico</option>
          <option value="extracurricular">Extracurricular</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <>
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No hay proyectos con estos filtros.</div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p._id} className="card p-4 flex items-start gap-4 flex-wrap">
                  {/* Thumbnail */}
                  {p.imagenes?.[0] ? (
                    <img src={p.imagenes[0]} alt={p.titulo} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex-shrink-0 flex items-center justify-center text-primary-700 font-bold text-xl">
                      {p.titulo?.[0]}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{p.titulo}</h3>
                      <span className={`badge flex-shrink-0 ${p.estado === 'publicado' ? 'badge-green' : 'badge-yellow'}`}>
                        {p.estado === 'publicado' ? 'Publicado' : 'En progreso'}
                      </span>
                      <span className="badge badge-blue flex-shrink-0">{p.categoria}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{p.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Autor: {p.autor?.nombre} {p.autor?.apellido} · {p.carrera}
                      · ❤️ {p.likes?.length || 0} · 💬 {p.comentarios?.length || 0}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-sm text-xs">Ver</Link>
                    <button onClick={() => setEditModal({ ...p, _id: p._id, _imageFile: null,
                      tecnologias: Array.isArray(p.tecnologias) ? p.tecnologias.join(', ') : '',
                      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
                      fechaInicio: p.fechaInicio ? p.fechaInicio.slice(0,10) : '',
                      fechaFin:    p.fechaFin    ? p.fechaFin.slice(0,10)    : '',
                    })} className="btn-secondary btn-sm text-xs">Editar</button>
                    {p.estado === 'publicado'
                      ? <button onClick={() => unpublish(p._id)} className="btn-sm text-xs bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100 rounded-lg px-3 py-1.5">Despublicar</button>
                      : <button onClick={() => publish(p._id)}   className="btn-sm text-xs bg-green-50  text-green-700  border border-green-300  hover:bg-green-100  rounded-lg px-3 py-1.5">Publicar</button>
                    }
                    <button onClick={() => deleteProject(p._id)} className="btn-danger btn-sm text-xs">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Anterior</button>
              <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Siguiente →</button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setEditModal(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Editar proyecto</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={saveEdit} className="space-y-3">
              <div>
                <label className="label">Título</label>
                <input value={editModal.titulo || ''} onChange={e => setEditModal({...editModal, titulo: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea value={editModal.descripcion || ''} onChange={e => setEditModal({...editModal, descripcion: e.target.value})} rows={3} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoría</label>
                  <select value={editModal.categoria || 'academico'} onChange={e => setEditModal({...editModal, categoria: e.target.value})} className="input">
                    <option value="academico">Académico</option>
                    <option value="extracurricular">Extracurricular</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select value={editModal.estado || 'en_progreso'} onChange={e => setEditModal({...editModal, estado: e.target.value})} className="input">
                    <option value="en_progreso">En progreso</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Tecnologías</label>
                <input value={editModal.tecnologias || ''} onChange={e => setEditModal({...editModal, tecnologias: e.target.value})} className="input" placeholder="React, Node.js" />
              </div>
              <div>
                <label className="label">Nueva imagen (opcional)</label>
                <input type="file" accept="image/*" onChange={e => setEditModal({...editModal, _imageFile: e.target.files[0]})} className="input text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
