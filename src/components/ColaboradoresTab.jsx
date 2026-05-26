import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ nombre, apellido, size = 36 }) {
  const initials = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase()
  const colors = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706','#dc2626','#0284c7','#0891b2']
  const idx = (nombre?.charCodeAt(0) || 0) % colors.length
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:colors[idx], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, color:'white', fontSize:size*0.36, letterSpacing:'-0.02em' }}>
      {initials || '?'}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, animation:'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--border2)', flexShrink:0 }} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ height:13, width:'40%', background:'var(--border2)', borderRadius:6 }} />
            <div style={{ height:11, width:'60%', background:'var(--border)', borderRadius:6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de colaborador ─────────────────────────────────────────────────
function ColaboradorCard({ c, onRemove, removingId, canRemove }) {
  const id       = c._id || c.id
  const nombre   = c.nombre   || '—'
  const apellido = c.apellido || ''
  const fullName = `${nombre} ${apellido}`.trim()
  const isRemoving = removingId === id

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, opacity:isRemoving ? 0.5 : 1, transition:'box-shadow 0.15s,border-color 0.15s', animation:'slideUp 0.2s ease-out' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.borderColor='var(--border2)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)' }}>
      <Avatar nombre={nombre} apellido={apellido} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:2 }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'var(--text-1)' }}>{fullName}</span>
          {c.semestre && (
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'var(--primary-l)', color:'var(--primary)', border:'1px solid var(--primary)' }}>Sem. {c.semestre}</span>
          )}
        </div>
        <p style={{ fontSize:12, color:'var(--text-3)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {c.email}{c.carrera ? ` · ${c.carrera}` : ''}
        </p>
      </div>
      {canRemove && (
        <button onClick={() => onRemove(id, fullName)} disabled={isRemoving} className="btn-danger btn-sm" title="Remover colaborador" style={{ flexShrink:0 }}>
          {isRemoving ? '...' : 'Remover'}
        </button>
      )}
    </div>
  )
}

// ── Panel de colaboradores de UN proyecto (docente) ────────────────────────
function PanelColaboradoresDocente({ proyecto, onColaboradorRemoved }) {
  const [colaboradores, setColaboradores] = useState(proyecto.colaboradores || [])
  const [addEmail, setAddEmail]           = useState('')
  const [adding, setAdding]               = useState(false)
  const [removingId, setRemovingId]       = useState(null)
  const [showForm, setShowForm]           = useState(false)
  const [open, setOpen]                   = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addEmail.trim()) return
    setAdding(true)
    try {
      const { data } = await api.post(`/proyectos/${proyecto._id}/colaboradores`, { email: addEmail.trim() })
      toast.success('Colaborador agregado exitosamente')
      setAddEmail('')
      setShowForm(false)
      // Refetch colaboradores del proyecto
      const r = await api.get(`/proyectos/${proyecto._id}/colaboradores`)
      setColaboradores(r.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo agregar el colaborador')
    } finally { setAdding(false) }
  }

  const handleRemove = async (colaboradorId, nombre) => {
    if (!confirm(`¿Remover a ${nombre} del proyecto?`)) return
    setRemovingId(colaboradorId)
    try {
      await api.delete(`/proyectos/${proyecto._id}/colaboradores/${colaboradorId}`)
      toast.success(`${nombre} fue removido del proyecto`)
      setColaboradores(prev => prev.filter(c => (c._id || c.id) !== colaboradorId))
      onColaboradorRemoved?.(proyecto._id, colaboradorId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo remover al colaborador')
    } finally { setRemovingId(null) }
  }

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      {/* Header del proyecto */}
      <div onClick={() => setOpen(v => !v)} style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background: open ? 'var(--primary-l)' : 'var(--surface)', borderBottom: open ? '1px solid var(--border)' : 'none', transition:'background 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
          <span style={{ fontSize:18 }}>📁</span>
          <div style={{ minWidth:0 }}>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'var(--text-1)', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{proyecto.titulo}</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {proyecto.proyecto_id && <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>#{proyecto.proyecto_id}</span>}
              <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:100, background:'var(--surface2)', color:'var(--text-2)', border:'1px solid var(--border)' }}>
                {colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>
        <span style={{ color:'var(--text-3)', fontSize:12, flexShrink:0, marginLeft:8 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:14, animation:'slideUp 0.2s ease-out' }}>
          {/* Botón agregar */}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => setShowForm(v => !v)} className="btn-primary btn-sm">
              {showForm ? '✕ Cancelar' : '+ Agregar colaborador'}
            </button>
          </div>

          {/* Formulario agregar */}
          {showForm && (
            <div style={{ background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:12, padding:'1rem', animation:'slideUp 0.2s ease-out' }}>
              <form onSubmit={handleAdd} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <input type="email" required value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="correo@estudiante.epn.edu.ec" className="input" style={{ margin:0, flex:1, minWidth:200 }} disabled={adding} />
                <button type="submit" disabled={adding || !addEmail.trim()} className="btn-primary" style={{ alignSelf:'flex-start' }}>
                  {adding ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
              <p style={{ fontSize:11, color:'var(--primary)', margin:'6px 0 0 2px' }}>El estudiante debe tener cuenta activa y correo confirmado.</p>
            </div>
          )}

          {/* Lista colaboradores */}
          {colaboradores.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', background:'var(--surface2)', border:'1px dashed var(--border2)', borderRadius:12 }}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>👥</p>
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>Sin colaboradores aún. Agrega estudiantes al equipo.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {colaboradores.map(c => (
                <ColaboradorCard key={c._id || c.id} c={c} onRemove={handleRemove} removingId={removingId} canRemove={true} />
              ))}
            </div>
          )}

          {/* Link al proyecto */}
          <Link to={`/proyectos/${proyecto._id}`} className="btn-secondary btn-sm" style={{ alignSelf:'flex-start' }}>
            Ver proyecto →
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Vista estudiante: proyectos donde soy colaborador ─────────────────────
function VistaEstudiante() {
  const { user }              = useAuth()
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [openId, setOpenId]       = useState(null)

  useEffect(() => {
    api.get('/proyectos/donde-colaboro')
      .then(r => setProyectos(r.data?.data || []))
      .catch(() => toast.error('No se pudo cargar tus colaboraciones'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  if (proyectos.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'4rem 2rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
        <p style={{ fontSize:40, marginBottom:10 }}>🤝</p>
        <p style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>Aún no colaboras en ningún proyecto</p>
        <p style={{ fontSize:13, color:'var(--text-3)' }}>Cuando un docente te añada como colaborador, el proyecto aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
        Proyectos en los que participas como colaborador ({proyectos.length})
      </p>
      {proyectos.map(p => {
        const isOpen     = openId === p._id
        // Otros colaboradores (sin yo mismo)
        const otrosColab = (p.colaboradores || []).filter(c => (c._id || c.id) !== user?._id)

        return (
          <div key={p._id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            {/* Header */}
            <div onClick={() => setOpenId(isOpen ? null : p._id)} style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background: isOpen ? 'var(--primary-l)' : 'var(--surface)', borderBottom: isOpen ? '1px solid var(--border)' : 'none', transition:'background 0.2s' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'var(--text-1)', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titulo}</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {p.proyecto_id && <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>#{p.proyecto_id}</span>}
                  <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:100, background:'var(--surface2)', color:'var(--text-2)', border:'1px solid var(--border)' }}>
                    {p.autor?.nombre} {p.autor?.apellido} (autor)
                  </span>
                  <span style={{ fontSize:10, padding:'1px 7px', borderRadius:100, background:'var(--surface2)', color:'var(--text-3)', border:'1px solid var(--border)' }}>
                    {otrosColab.length} compañero{otrosColab.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <span style={{ color:'var(--text-3)', fontSize:12, flexShrink:0, marginLeft:8 }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Detalle: compañeros del equipo */}
            {isOpen && (
              <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:12, animation:'slideUp 0.2s ease-out' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
                  Equipo ({otrosColab.length} compañero{otrosColab.length !== 1 ? 's' : ''})
                </p>

                {otrosColab.length === 0 ? (
                  <p style={{ fontSize:13, color:'var(--text-3)' }}>Eres el único colaborador en este proyecto.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {otrosColab.map(c => (
                      <ColaboradorCard key={c._id || c.id} c={c} canRemove={false} />
                    ))}
                  </div>
                )}

                <Link to={`/proyectos/${p._id}`} className="btn-secondary btn-sm" style={{ alignSelf:'flex-start' }}>
                  Ver proyecto →
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Vista docente: mis proyectos con sus colaboradores ────────────────────
function VistaDocente() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchProyectos = useCallback(() => {
    setLoading(true)
    api.get('/proyectos/mis-proyectos-con-colaboradores')
      .then(r => setProyectos(r.data?.data || []))
      .catch(() => toast.error('No se pudo cargar los proyectos'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchProyectos() }, [fetchProyectos])

  if (loading) return <Skeleton />

  if (proyectos.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'4rem 2rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
        <p style={{ fontSize:40, marginBottom:10 }}>📂</p>
        <p style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>Sin equipos activos</p>
        <p style={{ fontSize:13, color:'var(--text-3)' }}>Cuando añadas colaboradores a tus proyectos, aparecerán aquí para gestionar el equipo.</p>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
        Tus proyectos con colaboradores activos ({proyectos.length})
      </p>
      {proyectos.map(p => (
        <PanelColaboradoresDocente key={p._id} proyecto={p} />
      ))}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function ColaboradoresTab() {
  const { user } = useAuth()

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.02em' }}>
          {user?.rol === 'docente' ? '👥 Mis equipos de trabajo' : '🤝 Mis colaboraciones'}
        </h2>
        <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
          {user?.rol === 'docente'
            ? 'Proyectos tuyos que tienen colaboradores. Gestiona el equipo de cada uno.'
            : 'Proyectos en los que participas como colaborador y compañeros de equipo.'}
        </p>
      </div>

      {user?.rol === 'docente' ? <VistaDocente /> : <VistaEstudiante />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}
