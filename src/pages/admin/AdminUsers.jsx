import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

const ROLES = ['estudiante', 'docente', 'admin']
const TABS = [
  { id: 'usuarios',      label: '👥 Usuarios' },
  { id: 'roles',         label: '🛡️ Cambiar Roles' },
]

// ── Modal cambiar rol ─────────────────────────────────────────────────────────
function CambiarRolModal({ user, onClose, onSuccess }) {
  const [rol, setRol] = useState(user.rol)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    if (rol === user.rol) { toast.error('Selecciona un rol diferente al actual'); return }
    setLoading(true)
    try {
      await api.patch(`/auth/usuarios/${user._id}/rol`, { rol })
      toast.success(`Rol de ${user.nombre} ${user.apellido} cambiado a "${rol}"`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error al cambiar el rol')
    } finally { setLoading(false) }
  }

  const rolColor = { estudiante: 'var(--primary)', docente: 'var(--success)', admin: 'var(--danger)' }
  const rolBg    = { estudiante: 'var(--primary-l)', docente: 'var(--success-l)', admin: 'var(--danger-l)' }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:440, padding:'1.75rem', boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-1)', margin:0 }}>Cambiar rol</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-3)' }}>×</button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:'1.25rem' }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--primary-l)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:'var(--primary)', flexShrink:0 }}>
            {user.nombre?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight:700, color:'var(--text-1)', margin:0 }}>{user.nombre} {user.apellido}</p>
            <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>{user.email}</p>
          </div>
          <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background: rolBg[user.rol] || 'var(--surface2)', color: rolColor[user.rol] || 'var(--text-2)', textTransform:'uppercase' }}>
            {user.rol}
          </span>
        </div>

        <p style={{ fontSize:13, color:'var(--text-2)', margin:'0 0 12px' }}>Selecciona el nuevo rol:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.25rem' }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => setRol(r)} style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, cursor:'pointer',
              fontFamily:'inherit', fontSize:14, fontWeight:600, transition:'all 0.15s',
              background: rol === r ? rolBg[r] || 'var(--primary-l)' : 'var(--surface2)',
              color: rol === r ? rolColor[r] || 'var(--primary)' : 'var(--text-2)',
              border: `1.5px solid ${rol === r ? rolColor[r] || 'var(--primary)' : 'var(--border)'}`,
            }}>
              <span>{r === 'estudiante' ? '🎓' : r === 'docente' ? '👨‍🏫' : '🛡️'}</span>
              <span style={{ flex:1, textAlign:'left', textTransform:'capitalize' }}>{r}</span>
              {rol === r && <span style={{ fontSize:16 }}>✓</span>}
            </button>
          ))}
        </div>

        {rol !== user.rol && (
          <div style={{ background:'var(--warning-l)', border:'1px solid var(--warning)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'var(--warning)', marginBottom:'1rem' }}>
            ⚠️ Cambiarás el rol de <strong>{user.nombre}</strong> de <strong>{user.rol}</strong> a <strong>{rol}</strong>.
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={confirm} disabled={loading || rol === user.rol} className="btn-primary" style={{ flex:1 }}>
            {loading ? 'Cambiando...' : 'Confirmar cambio'}
          </button>
          <button onClick={onClose} disabled={loading} className="btn-secondary" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { user: adminUser } = useAuth()
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [carrera, setCarrera]     = useState('')
  const [semestre, setSemestre]   = useState('')
  const [stats, setStats]         = useState(null)
  const [activeTab, setActiveTab] = useState('usuarios')
  const [rolModal, setRolModal]   = useState(null)
  const [filtroRol, setFiltroRol] = useState('')

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
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/admin/estudiantes/estadisticas')
      .then(r => {
        const raw    = r.data?.data || r.data
        const porRol = raw.porRol || []
        const getT   = (rol) => porRol.find(r => r._id === rol)?.total || 0
        setStats({ total: raw.totalUsuarios || 0, estudiantes: getT('estudiante'), docentes: getT('docente'), administradores: getT('admin') })
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

  // Usuarios filtrados para la tab de roles (excluye al admin actual)
  const usuariosParaRol = users.filter(u => {
    if (u._id === adminUser?._id) return false // nunca se muestra a sí mismo
    if (filtroRol && u.rol !== filtroRol) return false
    return true
  })

  const renderTabUsuarios = () => (
    <>
      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
        <input value={search}   onChange={e => setSearch(e.target.value)}   className="input" style={{ width:180 }} placeholder="Buscar por apellido" />
        <input value={carrera}  onChange={e => setCarrera(e.target.value)}  className="input" style={{ width:220 }} placeholder="Filtrar por carrera" />
        <input value={semestre} onChange={e => setSemestre(e.target.value)} type="number" min={1} max={8} className="input" style={{ width:110 }} placeholder="Semestre" />
        <button onClick={fetchUsers} className="btn-primary btn-sm">Buscar</button>
        <button onClick={() => { setSearch(''); setCarrera(''); setSemestre(''); setTimeout(fetchUsers, 0) }} className="btn-secondary btn-sm">Limpiar</button>
      </div>

      {loading ? <Spinner /> : users.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text-3)' }}>
          No se encontraron usuarios.
        </div>
      ) : (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                  {['Usuario', 'Carrera', 'Sem.', 'Rol', 'Confirmación', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontWeight:600, color:'var(--text-2)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const activo = u.estado !== 'inactivo'
                  const esSelf = u._id === adminUser?._id
                  return (
                    <tr key={u._id}
                      style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', transition:'background 0.1s', opacity: activo ? 1 : 0.6 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, overflow:'hidden', background:'var(--primary-l)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {u.fotoPerfil?.url
                              ? <img src={u.fotoPerfil.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color:'var(--primary)' }}>{u.nombre?.[0]?.toUpperCase()}</span>}
                          </div>
                          <div>
                            <p style={{ fontWeight:600, color:'var(--text-1)', margin:'0 0 1px', whiteSpace:'nowrap' }}>
                              {u.nombre} {u.apellido}
                              {esSelf && <span style={{ marginLeft:6, fontSize:10, background:'var(--primary)', color:'white', padding:'1px 6px', borderRadius:10 }}>TÚ</span>}
                            </p>
                            <p style={{ fontSize:11, color:'var(--text-3)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px', color:'var(--text-2)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.carrera || '—'}</td>
                      <td style={{ padding:'12px 14px', color:'var(--text-2)', textAlign:'center' }}>{u.semestre || '—'}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:100, background: rolBg[u.rol] || 'var(--surface2)', color: rolColor[u.rol] || 'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          {u.rol}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:100, background: u.confirmEmail ? 'var(--success-l)' : 'var(--warning-l)', color: u.confirmEmail ? 'var(--success)' : 'var(--warning)', textTransform:'uppercase' }}>
                          {u.confirmEmail ? '✓ Confirmado' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:100, textTransform:'uppercase', background: activo ? 'var(--success-l)' : 'var(--danger-l)', color: activo ? 'var(--success)' : 'var(--danger)' }}>
                          {activo ? '● Activo' : '○ Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          <Link to={`/admin/proyectos?autor=${u._id}`}
                            style={{ fontSize:11, color:'var(--primary)', fontWeight:600, textDecoration:'none', padding:'3px 8px', borderRadius:6, background:'var(--primary-l)', border:'1px solid var(--primary)', whiteSpace:'nowrap' }}>
                            Proyectos →
                          </Link>
                          {!esSelf && (
                            <button onClick={() => toggleEstado(u)}
                              style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:6, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap', background: activo ? 'var(--danger-l)' : 'var(--success-l)', color: activo ? 'var(--danger)' : 'var(--success)', border:`1px solid ${activo ? 'var(--danger)' : 'var(--success)'}` }}>
                              {activo ? '⛔ Suspender' : '✅ Activar'}
                            </button>
                          )}
                          {!esSelf && (
                            <button onClick={() => setRolModal(u)}
                              style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:6, cursor:'pointer', background:'var(--warning-l)', color:'var(--warning)', border:'1px solid var(--warning)', whiteSpace:'nowrap' }}>
                              🛡️ Rol
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
      )}
    </>
  )

  const renderTabRoles = () => (
    <>
      <div style={{ background:'var(--warning-l)', border:'1px solid var(--warning)', borderRadius:12, padding:'12px 16px', marginBottom:'1.25rem', fontSize:13, color:'var(--warning)', lineHeight:1.55 }}>
        ⚠️ <strong>Atención:</strong> Cambiar el rol de un usuario afecta sus permisos inmediatamente. No puedes cambiar tu propio rol. Esta acción queda registrada.
      </div>

      {/* Filtro por rol */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.25rem', alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600 }}>Filtrar por rol:</span>
        {[['','Todos'],['estudiante','Estudiantes'],['docente','Docentes'],['admin','Admins']].map(([v,l]) => (
          <button key={v} onClick={() => setFiltroRol(v)} style={{
            padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
            background: filtroRol === v ? 'var(--primary)' : 'var(--surface)',
            color: filtroRol === v ? 'white' : 'var(--text-2)',
            border:`1px solid ${filtroRol === v ? 'var(--primary)' : 'var(--border2)'}`,
          }}>{l}</button>
        ))}
      </div>

      {loading ? <Spinner /> : usuariosParaRol.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text-3)' }}>
          No hay usuarios para mostrar.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {usuariosParaRol.map(u => (
            <div key={u._id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--primary-l)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'var(--primary)', flexShrink:0 }}>
                {u.nombre?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, color:'var(--text-1)', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.nombre} {u.apellido}</p>
                <p style={{ fontSize:12, color:'var(--text-3)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background: rolBg[u.rol] || 'var(--surface2)', color: rolColor[u.rol] || 'var(--text-2)', textTransform:'uppercase' }}>
                  {u.rol}
                </span>
                <button onClick={() => setRolModal(u)} className="btn-primary btn-sm">
                  🛡️ Cambiar rol
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="page" style={{ animation:'slideUp 0.4s ease-out' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Usuarios registrados</h1>
          <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>{users.length} usuario(s) mostrado(s)</p>
        </div>
        <Link to="/admin" className="btn-secondary btn-sm">← Admin</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:'1.5rem' }}>
          {[
            { label:'Total',            value:stats.total,           icon:'👥' },
            { label:'Estudiantes',      value:stats.estudiantes,     icon:'🎓' },
            { label:'Docentes',         value:stats.docentes,        icon:'👨‍🏫' },
            { label:'Administradores',  value:stats.administradores, icon:'🛡️' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
              <p style={{ fontSize:20, margin:'0 0 4px' }}>{s.icon}</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'var(--text-1)', margin:'0 0 2px' }}>{s.value ?? '—'}</p>
              <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
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

      {activeTab === 'usuarios' && renderTabUsuarios()}
      {activeTab === 'roles'    && renderTabRoles()}

      {rolModal && (
        <CambiarRolModal
          user={rolModal}
          onClose={() => setRolModal(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  )
}
