import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ── Avatar initials helper ─────────────────────────────────────────────────
function Avatar({ nombre, apellido, size = 36 }) {
  const initials = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase()
  const colors = [
    '#4f46e5', '#7c3aed', '#db2777', '#059669',
    '#d97706', '#dc2626', '#0284c7', '#0891b2',
  ]
  const idx = (nombre?.charCodeAt(0) || 0) % colors.length
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: colors[idx], display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Syne, sans-serif',
      fontWeight: 800, color: 'white', fontSize: size * 0.36,
      letterSpacing: '-0.02em',
    }}>
      {initials || '?'}
    </div>
  )
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px', display: 'flex',
      alignItems: 'center', gap: 12, animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--border2)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 13, width: '40%', background: 'var(--border2)', borderRadius: 6 }} />
        <div style={{ height: 11, width: '60%', background: 'var(--border)', borderRadius: 6 }} />
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ColaboradoresTab({ projectId, projectTitle }) {
  const { user } = useAuth()

  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading]             = useState(true)
  const [addEmail, setAddEmail]           = useState('')
  const [adding, setAdding]               = useState(false)
  const [removingId, setRemovingId]       = useState(null)
  const [showForm, setShowForm]           = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchColaboradores = useCallback(() => {
    setLoading(true)
    api.get(`/proyectos/${projectId}/colaboradores`)
      .then(r => setColaboradores(r.data?.data || r.data || []))
      .catch(() => {
        setColaboradores([])
        toast.error('No se pudo cargar la lista de colaboradores')
      })
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => { fetchColaboradores() }, [fetchColaboradores])

  // ── Add collaborator ───────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addEmail.trim()) return
    setAdding(true)
    try {
      await api.post(`/proyectos/${projectId}/colaboradores`, {
        email: addEmail.trim(),
      })
      toast.success('Colaborador agregado exitosamente')
      setAddEmail('')
      setShowForm(false)
      fetchColaboradores()
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo agregar el colaborador'
      toast.error(msg)
    } finally { setAdding(false) }
  }

  // ── Remove collaborator ────────────────────────────────────────────────
  const handleRemove = async (colaboradorId, nombre) => {
    if (!confirm(`¿Remover a ${nombre} del proyecto?`)) return
    setRemovingId(colaboradorId)
    try {
      await api.delete(`/proyectos/${projectId}/colaboradores/${colaboradorId}`)
      toast.success(`${nombre} fue removido del proyecto`)
      setColaboradores(prev => prev.filter(c => (c._id || c.id) !== colaboradorId))
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo remover al colaborador'
      toast.error(msg)
    } finally { setRemovingId(null) }
  }

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800,
            color: 'var(--text-1)', margin: '0 0 3px', letterSpacing: '-0.02em',
          }}>
            Equipo de trabajo
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            {loading ? '…' : `${colaboradores.length} colaborador${colaboradores.length !== 1 ? 'es' : ''}`} en este proyecto
          </p>
        </div>

        {/* Only the teacher/author sees the add button */}
        {user?.rol === 'docente' && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-primary btn-sm"
            style={{ gap: 6 }}
          >
            {showForm ? '✕ Cancelar' : '+ Agregar colaborador'}
          </button>
        )}
      </div>

      {/* ── Add-collaborator form ── */}
      {showForm && user?.rol === 'docente' && (
        <div style={{
          background: 'var(--primary-l)', border: '1px solid var(--primary)',
          borderRadius: 14, padding: '1.25rem',
          animation: 'slideUp 0.25s ease-out',
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700, color: 'var(--primary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px',
          }}>
            Agregar estudiante al equipo
          </p>
          <form
            onSubmit={handleAdd}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="email"
                required
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                placeholder="correo@estudiante.epn.edu.ec"
                className="input"
                style={{ margin: 0 }}
                disabled={adding}
              />
              <p style={{ fontSize: 11, color: 'var(--primary)', margin: '4px 0 0 2px' }}>
                El estudiante debe tener cuenta activa y correo confirmado.
              </p>
            </div>
            <button
              type="submit"
              disabled={adding || !addEmail.trim()}
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              {adding ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Agregando...
                </span>
              ) : 'Agregar'}
            </button>
          </form>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : colaboradores.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3.5rem 2rem',
          background: 'var(--surface2)', border: '1px dashed var(--border2)',
          borderRadius: 16,
        }}>
          <p style={{ fontSize: 38, marginBottom: 10 }}>👥</p>
          <p style={{
            fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700,
            color: 'var(--text-1)', marginBottom: 5,
          }}>
            Sin colaboradores aún
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 300, margin: '0 auto' }}>
            {user?.rol === 'docente'
              ? 'Agrega estudiantes al equipo usando el botón de arriba.'
              : 'Todavía no hay colaboradores registrados en este proyecto.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {colaboradores.map(c => {
            const id = c._id || c.id
            const nombre = c.nombre || '—'
            const apellido = c.apellido || ''
            const fullName = `${nombre} ${apellido}`.trim()
            const isRemoving = removingId === id

            return (
              <div
                key={id}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                  opacity: isRemoving ? 0.5 : 1,
                  animation: 'slideUp 0.2s ease-out',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                  e.currentTarget.style.borderColor = 'var(--border2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <Avatar nombre={nombre} apellido={apellido} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
                      color: 'var(--text-1)',
                    }}>
                      {fullName}
                    </span>
                    {c.semestre && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                        background: 'var(--primary-l)', color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                      }}>
                        Sem. {c.semestre}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12, color: 'var(--text-3)', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.email}
                    {c.carrera ? ` · ${c.carrera}` : ''}
                  </p>
                </div>

                {/* Remove button — only for docente */}
                {user?.rol === 'docente' && (
                  <button
                    onClick={() => handleRemove(id, fullName)}
                    disabled={isRemoving}
                    className="btn-danger btn-sm"
                    title="Remover colaborador"
                    style={{ flexShrink: 0 }}
                  >
                    {isRemoving ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        style={{ animation: 'spin 0.7s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : 'Remover'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Spin keyframe (inline, harmless duplicate if index.css also has it) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
