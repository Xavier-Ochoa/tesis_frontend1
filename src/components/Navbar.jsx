import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const userCanCreate = user && user.rol !== 'admin'

  const avatar = user?.fotoPerfil?.url
    ? <img src={user.fotoPerfil.url} alt="" className="w-full h-full object-cover" />
    : <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{user?.nombre?.[0]?.toUpperCase()}</span>

  const roleBadgeColor = isAdmin ? '#ef4444' : user?.rol === 'docente' ? '#10b981' : 'var(--primary)'

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}>
            <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.5px' }}>EP</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>
            POLI<span style={{ color: 'var(--accent)' }}>ESFOT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
          <NavLink to="/" end className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>
            Inicio
          </NavLink>
          {userCanCreate && <>
            <NavLink to="/dashboard" className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>Dashboard</NavLink>
            <NavLink to="/mis-proyectos" className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>Mis Proyectos</NavLink>
          </>}
          {isAdmin && <>
            <NavLink to="/admin" end className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>Admin</NavLink>
            <NavLink to="/admin/proyectos" className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>Proyectos</NavLink>
            <NavLink to="/admin/usuarios" className="nav-link" style={({ isActive }) => isActive ? { color: 'var(--primary)', background: 'var(--primary-l)' } : {}}>Usuarios</NavLink>
          </>}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--surface3)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-2)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--surface3)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '4px 10px 4px 4px',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--primary-l)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {avatar}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden md:block">
                  {user.nombre}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ color: 'var(--text-3)', flexShrink: 0, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  width: 220,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'slideUp 0.15s ease-out',
                }}>
                  {/* User info */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{user.nombre} {user.apellido}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, background: roleBadgeColor, color: 'white', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {user.rol}
                    </span>
                  </div>

                  {/* Menu items */}
                  {[
                    { to: '/perfil', icon: '👤', label: 'Mi Perfil' },
                    ...(userCanCreate ? [
                      { to: '/mis-proyectos', icon: '📁', label: 'Mis Proyectos' },
                      { to: '/mis-proyectos/nuevo', icon: '➕', label: 'Nuevo Proyecto' },
                      { to: '/donaciones', icon: '💙', label: 'Donar' },
                    ] : []),
                    ...(isAdmin ? [
                      { to: '/admin', icon: '🛡️', label: 'Panel Admin', accent: true },
                      { to: '/admin/proyectos', icon: '📋', label: 'Gestionar Proyectos', accent: true },
                      { to: '/admin/usuarios', icon: '👥', label: 'Gestionar Usuarios', accent: true },
                    ] : []),
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 16px',
                        fontSize: 13, fontWeight: 500,
                        color: 'var(--text-1)',
                        textDecoration: 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '9px 16px', fontSize: 13, fontWeight: 500,
                        color: 'var(--text-1)', background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background 0.1s', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>🚪</span> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" className="btn-primary btn-sm">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
