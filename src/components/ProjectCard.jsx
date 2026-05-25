import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const {
    _id, titulo, descripcion, categoria, carrera, tecnologias,
    imagenes, estado, autor, likes = [],
    tipoProyecto, version, esUltimaVersion, proyecto_id,
  } = project

  const estadoConfig = {
    aprobado:  { label: 'Aprobado',  color: 'badge-green' },
    pendiente: { label: 'Pendiente', color: 'badge-yellow' },
    rechazado: { label: 'Rechazado', color: 'badge-red' },
  }[estado] || { label: estado, color: 'badge-gray' }

  const tipoLabel  = tipoProyecto === 'publico' ? '🌐 Público' : '🔒 Privado'
  const tipoBadge  = tipoProyecto === 'publico' ? 'badge-green' : 'badge-gray'
  const versionStr = version ? `v${String(version).padStart(3, '0')}` : null

  return (
    <Link to={`/proyectos/${_id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex', flexDirection: 'column',
        opacity: esUltimaVersion === false ? 0.75 : 1,
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          e.currentTarget.style.borderColor = 'var(--primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        {/* Versión anterior banner */}
        {esUltimaVersion === false && (
          <div style={{ background:'var(--warning-l)', borderBottom:'1px solid var(--warning)', padding:'5px 14px', fontSize:11, fontWeight:700, color:'var(--warning)', display:'flex', alignItems:'center', gap:5 }}>
            🕒 Versión anterior
          </div>
        )}

        {/* Image */}
        {imagenes?.[0] ? (
          <div style={{ height: 160, overflow: 'hidden', flexShrink: 0, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imagenes[0]} alt={titulo}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          </div>
        ) : (
          <div style={{
            height: 120, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
            <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, opacity: 0.35 }}>
              {titulo?.[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 15, fontWeight: 700,
              color: 'var(--text-1)',
              margin: 0, lineHeight: 1.3,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              flex: 1,
            }}>
              {titulo}
            </h3>
            <span className={`badge ${estadoConfig.color}`} style={{ flexShrink: 0, marginTop: 2 }}>
              {estadoConfig.label}
            </span>
          </div>

          {/* Badges: tipo, versión, código */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
            <span className={`badge ${tipoBadge}`} style={{ fontSize:10 }}>{tipoLabel}</span>
            {versionStr && (
              <span className="badge badge-blue" style={{ fontSize:10 }}>{versionStr}</span>
            )}
            {proyecto_id && (
              <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>#{proyecto_id}</span>
            )}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {descripcion}
          </p>

          {/* Tech tags */}
          {tecnologias?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tecnologias.slice(0, 3).map((t, i) => (
                <span key={i} className="badge badge-blue">{t}</span>
              ))}
              {tecnologias.length > 3 && (
                <span className="badge badge-gray">+{tecnologias.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              {autor?.nombre} {autor?.apellido}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>❤️ {likes.length}</span>
              <span className="badge badge-gray" style={{ fontSize: 10 }}>{categoria}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
