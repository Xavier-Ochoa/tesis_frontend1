import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

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
      const lista = data.data || data.usuarios || []
      setUsers(lista)
      // Actualizar confirmados desde el listado (sin filtros activos)
      if (!search && !carrera && !semestre) {
        setStats(prev => prev ? { ...prev, confirmados: lista.filter(u => u.confirmEmail).length } : prev)
      }
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/admin/estudiantes/estadisticas')
      .then(r => {
        const raw = r.data?.data || r.data
        // porRol es array de agregación: [{_id:'estudiante', total:N}, ...]
        // el campo correcto es totalUsuarios, no total
        const porRol   = raw.porRol || []
        const getTotal = (rol) => porRol.find(r => r._id === rol)?.total || 0
        setStats({
          total:           raw.totalUsuarios   || 0,
          estudiantes:     getTotal('estudiante'),
          docentes:        getTotal('docente'),
          administradores: getTotal('admin'),
        })
      })
      .catch(() => {})
    fetchUsers()
  }, [])

  const toggleEstado = async (user) => {
    const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo'
    const accion      = nuevoEstado === 'inactivo' ? 'suspender' : 'activar'
    if (!confirm(`¿Deseas ${accion} a ${user.nombre} ${user.apellido}?`)) return
    try {
      await api.patch(`/admin/estudiantes/${user._id}/estado`, { estado: nuevoEstado })
      toast.success(`Usuario ${nuevoEstado === 'inactivo' ? 'suspendido' : 'activado'} correctamente`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.msg || `Error al ${accion} el usuario`)
    }
  }

  const rolColor = { estudiante: 'var(--primary)', docente: 'var(--success)', admin: 'var(--danger)' }
  const rolBg    = { estudiante: 'var(--primary-l)', docente: 'var(--success-l)', admin: 'var(--danger-l)' }

  return (
    <div className="page" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Usuarios registrados</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{users.length} usuario(s) mostrado(s)</p>
        </div>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Total',            value: stats.total,           icon: '👥' },
            { label: 'Estudiantes',     value: stats.estudiantes,     icon: '🎓' },
            { label: 'Docentes',        value: stats.docentes,        icon: '👨‍🏫' },
            { label: 'Administradores', value: stats.administradores, icon: '🛡️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: 20, margin: '0 0 4px' }}>{s.icon}</p>
              <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px' }}>{s.value ?? '—'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search}   onChange={e => setSearch(e.target.value)}   className="input" style={{ width: 180 }} placeholder="Buscar por apellido" />
        <input value={carrera}  onChange={e => setCarrera(e.target.value)}  className="input" style={{ width: 220 }} placeholder="Filtrar por carrera" />
        <input value={semestre} onChange={e => setSemestre(e.target.value)} type="number" min={1} max={8} className="input" style={{ width: 110 }} placeholder="Semestre" />
        <button onClick={fetchUsers} className="btn-primary btn-sm">Buscar</button>
        <button onClick={() => { setSearch(''); setCarrera(''); setSemestre(''); setTimeout(fetchUsers, 0) }} className="btn-secondary btn-sm">Limpiar</button>
      </div>

      {loading ? <Spinner /> : (
        users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-3)' }}>
            No se encontraron usuarios.
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                    {['Usuario', 'Carrera', 'Sem.', 'Rol', 'Confirmación', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const activo = u.estado !== 'inactivo'
                    return (
                      <tr key={u._id}
                        style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s', opacity: activo ? 1 : 0.6 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Avatar + nombre */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'var(--primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {u.fotoPerfil?.url
                                ? <img src={u.fotoPerfil.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--primary)' }}>{u.nombre?.[0]?.toUpperCase()}</span>
                              }
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: 'var(--text-1)', margin: '0 0 1px', whiteSpace: 'nowrap' }}>{u.nombre} {u.apellido}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{u.correoInstitucional}</p>
                            </div>
                          </div>
                        </td>

                        {/* Carrera */}
                        <td style={{ padding: '12px 14px', color: 'var(--text-2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.carrera || '—'}</td>

                        {/* Semestre */}
                        <td style={{ padding: '12px 14px', color: 'var(--text-2)', textAlign: 'center' }}>{u.semestre || '—'}</td>

                        {/* Rol */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: rolBg[u.rol] || 'var(--surface3)', color: rolColor[u.rol] || 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {u.rol}
                          </span>
                        </td>

                        {/* Email confirmado */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: u.confirmEmail ? 'var(--success-l)' : 'var(--warning-l)', color: u.confirmEmail ? 'var(--success)' : 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {u.confirmEmail ? '✓ Confirmado' : '⏳ Pendiente'}
                          </span>
                        </td>

                        {/* Estado cuenta */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em', background: activo ? 'var(--success-l)' : 'var(--danger-l)', color: activo ? 'var(--success)' : 'var(--danger)' }}>
                            {activo ? '● Activo' : '○ Inactivo'}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Link
                              to={`/admin/proyectos?autor=${u._id}`}
                              style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', padding: '3px 8px', borderRadius: 6, background: 'var(--primary-l)', border: '1px solid var(--primary)', whiteSpace: 'nowrap' }}>
                              Proyectos →
                            </Link>
                            {u.rol !== 'admin' && (
                              <button
                                onClick={() => toggleEstado(u)}
                                style={{
                                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                  background: activo ? 'var(--danger-l)'  : 'var(--success-l)',
                                  color:      activo ? 'var(--danger)'    : 'var(--success)',
                                  border:     `1px solid ${activo ? 'var(--danger)' : 'var(--success)'}`,
                                }}
                              >
                                {activo ? '⛔ Suspender' : '✅ Activar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}
