import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const navLink = 'text-sm font-medium text-gray-600 hover:text-primary-700 transition-colors'
  const activeLink = 'text-primary-700 font-semibold'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-bold text-primary-700 text-sm">ESFOT <span className="text-gray-400 font-normal">Proyectos</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={({ isActive }) => isActive ? activeLink : navLink}>Inicio</NavLink>
          {user && <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeLink : navLink}>Dashboard</NavLink>}
          {user && <NavLink to="/mis-proyectos" className={({ isActive }) => isActive ? activeLink : navLink}>Mis Proyectos</NavLink>}
          {user && <NavLink to="/ia" className={({ isActive }) => isActive ? activeLink : navLink}>IA</NavLink>}
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => isActive ? activeLink + ' text-accent-500' : navLink + ' text-accent-500'}>Admin</NavLink>}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                  {user.nombre?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block">{user.nombre}</span>
                <span className="text-gray-400">▾</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <Link to="/perfil" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mi Perfil</Link>
                  <Link to="/mis-proyectos/nuevo" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Nuevo Proyecto</Link>
                  <Link to="/donaciones" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Donar</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" className="btn-primary btn-sm">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
