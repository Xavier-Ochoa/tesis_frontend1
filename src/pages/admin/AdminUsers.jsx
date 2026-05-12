import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [carrera, setCarrera]   = useState('')
  const [semestre, setSemestre] = useState('')
  const [stats, setStats]       = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)   params.apellido = search
      if (carrera)  params.carrera  = carrera
      if (semestre) params.semestre = semestre
      const { data } = await api.get('/admin/estudiantes', { params })
      setUsers(data.data || data.usuarios || [])
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/admin/estudiantes/estadisticas')
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => {})
    fetchUsers()
  }, [])

  const rolColor = { estudiante: 'badge-blue', docente: 'badge-green', admin: 'badge-red' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios registrados</h1>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total usuarios', value: stats.total },
            { label: 'Estudiantes',    value: stats.estudiantes },
            { label: 'Docentes',       value: stats.docentes },
            { label: 'Confirmados',    value: stats.confirmados },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{s.value ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input w-48" placeholder="Buscar por apellido" />
        <input value={carrera} onChange={e => setCarrera(e.target.value)}
          className="input w-52" placeholder="Filtrar por carrera" />
        <input value={semestre} onChange={e => setSemestre(e.target.value)} type="number" min={1} max={8}
          className="input w-28" placeholder="Semestre" />
        <button onClick={fetchUsers} className="btn-primary btn-sm">Buscar</button>
        <button onClick={() => { setSearch(''); setCarrera(''); setSemestre(''); fetchUsers() }} className="btn-secondary btn-sm">Limpiar</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No se encontraron usuarios.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Carrera</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Semestre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.fotoPerfil ? (
                            <img src={u.fotoPerfil} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-bold text-xs">
                              {u.nombre?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{u.nombre} {u.apellido}</p>
                            <p className="text-xs text-gray-400">{u.correoInstitucional}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.carrera || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{u.semestre || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${rolColor[u.rol] || 'badge-gray'}`}>{u.rol}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.confirmEmail ? 'badge-green' : 'badge-yellow'}`}>
                          {u.confirmEmail ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/proyectos?estudiante=${u._id}`}
                          onClick={e => { e.preventDefault(); window.location.href = `/proyectos/estudiante/${u._id}` }}
                          className="text-xs text-primary-700 hover:underline">
                          Ver proyectos
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">{users.length} usuario(s) mostrado(s)</p>
        </>
      )}
    </div>
  )
}
