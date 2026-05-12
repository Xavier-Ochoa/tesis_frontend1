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
    api.get('/auth/frases')
      .then(r => setFrase(r.data?.frase || ''))
      .catch(() => {})
    api.get('/auth/random-image')
      .then(r => setHeroImage(r.data?.url || r.data?.imageUrl || r.data?.image || ''))
      .catch(() => {})
    api.get('/proyectos/destacados')
      .then(r => setFeatured(r.data?.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchProjects() }, [page, categoria])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 9 }
      if (categoria) params.categoria = categoria
      const { data } = await api.get('/proyectos', { params })
      setProjects(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { fetchProjects(); return }
    setLoading(true)
    try {
      const { data } = await api.get('/proyectos/buscar', { params: { q: search } })
      setProjects(data.data || [])
      setTotalPages(1)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero con imagen de fondo de Unsplash */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 min-h-[220px] flex items-center"
        style={heroImage ? {
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Overlay oscuro siempre presente para legibilidad */}
        <div className={`absolute inset-0 ${heroImage ? 'bg-primary-900/70' : 'bg-gradient-to-r from-primary-700 to-primary-500'}`} />

        <div className="relative z-10 p-8 w-full">
          <h1 className="text-3xl font-bold text-white mb-2">
            Proyectos Académicos ESFOT
          </h1>

          {/* Frase motivacional */}
          {frase && (
            <blockquote className="text-primary-100 text-sm italic mb-4 max-w-lg border-l-2 border-accent-400 pl-3">
              "{frase}"
            </blockquote>
          )}
          {!frase && (
            <p className="text-primary-100 text-sm mb-4 max-w-xl">
              Descubre el talento de los estudiantes y docentes de la Escuela Politécnica Nacional.
            </p>
          )}

          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proyectos..."
              className="input flex-1 text-gray-900"
            />
            <button type="submit"
              className="bg-white text-primary-700 font-medium px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap">
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⭐ Proyectos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
        {['', 'academico', 'extracurricular'].map(c => (
          <button
            key={c}
            onClick={() => { setCategoria(c); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${categoria === c ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-700'}`}
          >
            {c === '' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {loading ? <Spinner /> : (
        <>
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No se encontraron proyectos.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="btn-secondary btn-sm disabled:opacity-40">← Anterior</button>
              <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-secondary btn-sm disabled:opacity-40">Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
