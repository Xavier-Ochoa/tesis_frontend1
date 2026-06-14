import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ProjectCard from '../../components/ProjectCard'
import Spinner from '../../components/Spinner'

const CARRERAS = [
  'Agua y Saneamiento Ambiental',
  'Desarrollo de Software',
  'Electromecánica',
  'Redes y Telecomunicaciones',
  'Procesamiento de Alimentos',
  'Procesamiento Industrial de la Madera',
]

const CARRERA_ICONS = {
  'Agua y Saneamiento Ambiental':        '💧',
  'Desarrollo de Software':              '💻',
  'Electromecánica':                     '⚙️',
  'Redes y Telecomunicaciones':          '📡',
  'Procesamiento de Alimentos':          '🌾',
  'Procesamiento Industrial de la Madera': '🪵',
}

const BENEFICIOS = [
  { icon: '🗂️', title: 'Repositorio Centralizado',    desc: 'Todo el capital intelectual de la ESFOT en un solo catálogo digital fácil de explorar.' },
  { icon: '✅', title: 'Aprobación Institucional',    desc: 'Flujo de revisión y validación docente integrado antes de la publicación.' },
  { icon: '🤝', title: 'Colaboración Activa',         desc: 'Conecta con estudiantes y docentes para proyectos interdisciplinarios.' },
  { icon: '📦', title: 'Acceso Permanente',           desc: 'Preservación digital a largo plazo para que tu trabajo perdure.' },
]

const PASOS = [
  { n: '01', title: 'Crea tu cuenta',       desc: 'Regístrate con tu correo institucional @epn.edu.ec.' },
  { n: '02', title: 'Sube tu proyecto',     desc: 'Completa el formulario con título, descripción, archivos e imágenes.' },
  { n: '03', title: 'Envía a revisión',     desc: 'Solicita la revisión del administrador cuando tu proyecto esté listo.' },
  { n: '04', title: 'Aprobación',           desc: 'El administrador revisa y aprueba o devuelve con observaciones.' },
  { n: '05', title: 'Publica',              desc: 'Con la aprobación en mano, publicas y tu trabajo queda visible para todos.' },
]

export default function Home() {
  const navigate = useNavigate()

  // Hero
  const [frase, setFrase]         = useState('')
  const [heroImage, setHeroImage] = useState('')

  // Destacados
  const [featured, setFeatured]   = useState([])

  // Explorador
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [carrera, setCarrera]     = useState('')
  const [categoria, setCategoria] = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)

  // Init
  useEffect(() => {
    api.get('/auth/frases').then(r => setFrase(r.data?.frase || '')).catch(() => {})
    api.get('/auth/random-image').then(r => setHeroImage(r.data?.url || r.data?.imageUrl || r.data?.image || '')).catch(() => {})
    api.get('/proyectos/destacados').then(r => setFeatured(r.data?.data || [])).catch(() => {})
  }, [])

  // Fetch on filter/page change
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 9 }
      if (categoria) params.categoria = categoria
      if (carrera)   params.carrera   = carrera
      if (search)    params.q         = search
      const { data } = await api.get('/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [page, categoria, carrera, search])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const setFilter = (key, value) => {
    if (key === 'carrera')   { setCarrera(value);   setPage(1) }
    if (key === 'categoria') { setCategoria(value); setPage(1) }
  }

  const hasFilters = carrera || categoria || search

  return (
    <div id="top" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: 320,
        display: 'flex', alignItems: 'center',
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        overflow: 'hidden',
      }}>
        {/* overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: heroImage
            ? 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(49,46,129,0.80) 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #312e81 60%, #1e1b4b 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(99,102,241,0.18) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: 600 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(165,180,252,0.9)', marginBottom: 16,
              background: 'rgba(99,102,241,0.2)', padding: '4px 14px',
              borderRadius: 100, border: '1px solid rgba(99,102,241,0.3)',
            }}>
              Escuela Politécnica Nacional · ESFOT
            </span>

            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 4.5vw, 46px)',
              fontWeight: 800, color: 'white',
              margin: '0 0 14px', lineHeight: 1.12, letterSpacing: '-0.03em',
            }}>
              Descubre y comparte<br />
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                proyectos académicos
              </span>
            </h1>

            <p style={{ color: 'rgba(203,213,225,0.85)', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px', maxWidth: 480 }}>
              La plataforma institucional para publicar y explorar el talento estudiantil de la ESFOT. Seis carreras, un solo lugar.
            </p>

            {frase && (
              <blockquote style={{ color: 'rgba(203,213,225,0.75)', fontSize: 13, fontStyle: 'italic', margin: '0 0 24px', borderLeft: '2px solid #f59e0b', paddingLeft: 14, lineHeight: 1.6 }}>
                "{frase}"
              </blockquote>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="#explorar" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 24px', borderRadius: 10,
                background: '#6366f1', color: 'white',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                transition: 'background 0.2s',
              }}>
                Explorar proyectos →
              </a>
              <Link to="/registro" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 24px', borderRadius: 10,
                background: 'rgba(255,255,255,0.1)', color: 'white',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
              }}>
                Publicar proyecto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTADÍSTICAS (estáticas) ──────────────────────── */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
            {[
              { n: '6',    label: 'Carreras',              icon: '🎓' },
              { n: '100+', label: 'Proyectos publicados',  icon: '📁' },
              { n: '500+', label: 'Estudiantes activos',   icon: '👩‍🎓' },
              { n: '2',    label: 'Tipos de proyecto',     icon: '🔖' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '28px 20px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROYECTOS DESTACADOS ──────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ background: 'var(--bg)', padding: '3.5rem 0 2.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: 4 }}>Lo más visto</span>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Proyectos Destacados</h2>
              </div>
              <a href="#explorar" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Ver todos →
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {featured.slice(0, 3).map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── EXPLORADOR DE PROYECTOS ───────────────────────── */}
      <section id="explorar" style={{ background: 'var(--surface2)', padding: '3.5rem 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: 4 }}>Catálogo completo</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px' }}>Explorar proyectos</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>Filtra por carrera, tipo o busca por palabras clave.</p>
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', maxWidth: 540 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar por título, descripción o palabras clave..."
                style={{
                  width: '100%', padding: '10px 36px 10px 14px',
                  borderRadius: 10, border: '1px solid var(--border2)',
                  background: 'var(--surface)', color: 'var(--text-1)',
                  fontSize: 14, outline: 'none',
                }}
              />
              {searchInput && (
                <button type="button" onClick={clearSearch} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-3)', fontSize: 16, lineHeight: 1, padding: 0,
                }}>✕</button>
              )}
            </div>
            <button type="submit" style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--primary)', color: 'white',
              border: 'none', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Buscar
            </button>
          </form>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>

            {/* Por tipo */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', margin: '0 0 8px' }}>Tipo</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['', 'Todos'], ['academico', 'Académico'], ['extracurricular', 'Extracurricular']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilter('categoria', v)} style={{
                    padding: '6px 14px', borderRadius: 100, fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: categoria === v ? 'var(--primary)' : 'var(--surface)',
                    color: categoria === v ? 'white' : 'var(--text-2)',
                    border: `1px solid ${categoria === v ? 'var(--primary)' : 'var(--border2)'}`,
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Por carrera */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', margin: '0 0 8px' }}>Carrera</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setFilter('carrera', '')} style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  background: carrera === '' ? 'var(--primary)' : 'var(--surface)',
                  color: carrera === '' ? 'white' : 'var(--text-2)',
                  border: `1px solid ${carrera === '' ? 'var(--primary)' : 'var(--border2)'}`,
                }}>Todas</button>
                {CARRERAS.map(c => (
                  <button key={c} onClick={() => setFilter('carrera', c)} style={{
                    padding: '6px 14px', borderRadius: 100, fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: carrera === c ? 'var(--primary)' : 'var(--surface)',
                    color: carrera === c ? 'white' : 'var(--text-2)',
                    border: `1px solid ${carrera === c ? 'var(--primary)' : 'var(--border2)'}`,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span>{CARRERA_ICONS[c]}</span> {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen y limpiar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', minHeight: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {loading ? '' : `${total} proyecto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
            </span>
            {hasFilters && (
              <button onClick={() => { setCarrera(''); setCategoria(''); clearSearch() }} style={{
                fontSize: 12, color: 'var(--danger)', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
              }}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? <Spinner /> : (
            <>
              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-3)' }}>
                  <p style={{ fontSize: 44, marginBottom: 12 }}>🔍</p>
                  <p style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Sin resultados</p>
                  <p style={{ fontSize: 14 }}>Intenta con otro término, carrera o tipo de proyecto.</p>
                  {hasFilters && (
                    <button onClick={() => { setCarrera(''); setCategoria(''); clearSearch() }} style={{
                      marginTop: 16, padding: '8px 20px', borderRadius: 10,
                      background: 'var(--primary)', color: 'white',
                      border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>Limpiar filtros</button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {projects.map(p => <ProjectCard key={p._id} project={p} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: '2rem' }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">← Anterior</button>
                  <span style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 8px' }}>Página {page} de {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Siguiente →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── BENEFICIOS ────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: 4 }}>¿Por qué PoliExpo?</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Una plataforma hecha para la ESFOT</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {BENEFICIOS.map((b, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px 20px',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 30, marginBottom: 12 }}>{b.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 8px' }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.65 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────── */}
      <section style={{ background: 'var(--surface)', padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: 4 }}>El proceso</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Tu camino a la publicación</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {PASOS.map((p, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '20px 12px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--primary-l)', border: '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{p.n}</span>
                </div>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 6px' }}>{p.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
        padding: '4rem 0', borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
            ¿Tienes un proyecto académico?
          </h2>
          <p style={{ color: 'rgba(203,213,225,0.85)', fontSize: 15, margin: '0 0 28px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            Únete a estudiantes y docentes que ya comparten su conocimiento en PoliExpo. Regístrate y publica tu trabajo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registro" style={{
              padding: '12px 28px', borderRadius: 10,
              background: '#6366f1', color: 'white',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              Crear cuenta
            </Link>
            <a href="#explorar" style={{
              padding: '12px 28px', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              Explorar proyectos
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
