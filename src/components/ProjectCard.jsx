import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const { _id, titulo, descripcion, categoria, carrera, tecnologias, imagenes, estado, autor, likes = [] } = project

  return (
    <Link to={`/proyectos/${_id}`} className="card hover:shadow-md transition-shadow block group">
      {imagenes?.[0] ? (
        <img src={imagenes[0]} alt={titulo} className="w-full h-40 object-cover rounded-t-xl" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-700 to-primary-500 rounded-t-xl flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-30">{titulo?.[0]?.toUpperCase()}</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">{titulo}</h3>
          <span className={`badge flex-shrink-0 ${estado === 'publicado' ? 'badge-green' : 'badge-yellow'}`}>
            {estado === 'publicado' ? 'Publicado' : 'En progreso'}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{descripcion}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {tecnologias?.slice(0, 3).map((t, i) => (
            <span key={i} className="badge badge-blue">{t}</span>
          ))}
          {tecnologias?.length > 3 && <span className="badge badge-gray">+{tecnologias.length - 3}</span>}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{autor?.nombre} {autor?.apellido}</span>
          <div className="flex items-center gap-3">
            <span>❤️ {likes.length}</span>
            <span className="badge badge-gray">{categoria}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
