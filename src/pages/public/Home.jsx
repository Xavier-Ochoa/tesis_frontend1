import { useState, useEffect } from 'react'
import api from '../../api/axios'
import ProjectCard from '../../components/ProjectCard'
import Spinner from '../../components/Spinner'

export default function Home() {
  const [projects, setProjects]     = useState([])
  const [featured, setFeatured]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [categoria, setCategoria]   = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [frase, setFrase]           = useState('')
  const [heroImage, setHeroImage]   = useState('')

  useEffect(() => {
    api.get('/auth/frases').then(r => setFrase(r.data?.frase || '')).catch(() => {})
    api.get('/auth/random-image').then(r => setHeroImage(r.data?.url || r.data?.imageUrl || r.data?.image || '')).catch(() => {})
    api.get('/proyectos/destacados').then(r => setFeatured(r.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchProjects() }, [page, categoria])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 8 }
      if (categoria) params.categoria = categoria
      const { data } = await api.get('/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { fetchProjects(); return }
    setLoading(true)
    try {
      const { data } = await api.get('/proyectos/buscar', { params: { q: search } })
      setProjects(data.data || [])
      setTotalPages(1)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>

      {/* Hero */}
      <div style={{
        position: 'relative', minHeight: 280,
        display: 'flex', alignItems: 'center',
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: heroImage
            ? 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(49,46,129,0.75) 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #312e81 60%, #1e1b4b 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: 560 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(165,180,252,0.9)', marginBottom: 14, background: 'rgba(99,102,241,0.2)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(99,102,241,0.3)' }}>
              Escuela Politécnica Nacional
            </span>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: 'white', margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
              Proyectos Académicos<br />
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ESFOT</span>
            </h1>
            {frase && (
              <blockquote style={{ color: 'rgba(203,213,225,0.85)', fontSize: 14, fontStyle: 'italic', margin: '0 0 20px', borderLeft: '2px solid #f59e0b', paddingLeft: 12, lineHeight: 1.6 }}>
                "{frase}"
              </blockquote>
            )}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar proyectos..."
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: '#6366f1', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="page">

        {/* Featured */}
        {featured.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>Proyectos Destacados</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {featured.slice(0, 3).map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Filtrar:</span>
          {[['', 'Todos'], ['academico', 'Académico'], ['extracurricular', 'Extracurricular']].map(([v, l]) => (
            <button key={v} onClick={() => { setCategoria(v); setPage(1) }} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: categoria === v ? 'var(--primary)' : 'var(--surface)',
              color: categoria === v ? 'white' : 'var(--text-2)',
              border: `1px solid ${categoria === v ? 'var(--primary)' : 'var(--border2)'}`,
            }}>{l}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? <Spinner /> : (
          <>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-3)' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Sin resultados</p>
                <p style={{ fontSize: 14 }}>Intenta con otro término o categoría.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {projects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: '2.5rem' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">← Anterior</button>
                <span style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 8px' }}>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Siguiente →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
