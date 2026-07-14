import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home           from './pages/public/Home'
import Login          from './pages/public/Login'
import Register       from './pages/public/Register'
import ConfirmEmail   from './pages/public/ConfirmEmail'
import ForgotPassword from './pages/public/ForgotPassword'
import ResetPassword  from './pages/public/ResetPassword'
import ProjectDetail  from './pages/public/ProjectDetail'

import Dashboard     from './pages/user/Dashboard'
import MyProjects    from './pages/user/MyProjects'
import CreateProject from './pages/user/CreateProject'
import EditProject      from './pages/user/EditProject'
import CreateVersion    from './pages/user/CreateVersion'
import Profile       from './pages/user/Profile'
import Donations     from './pages/user/Donations'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProjects  from './pages/admin/AdminProjects'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminChat      from './pages/admin/AdminChat'

import Chat from './pages/user/Chat'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'admin'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/"                      element={<Home />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/registro"              element={<Register />} />
          <Route path="/confirmar-email"       element={<ConfirmEmail />} />
          <Route path="/recuperar-password"    element={<ForgotPassword />} />
          <Route path="/nuevo-password"         element={<ResetPassword />} />
          <Route path="/nuevo-password/:token" element={<ResetPassword />} />
          <Route path="/proyectos/:id"         element={<ProjectDetail />} />

          {/* Protected */}
          <Route path="/dashboard"                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mis-proyectos"            element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/mis-proyectos/nuevo"      element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/mis-proyectos/editar/:id"         element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
          <Route path="/mis-proyectos/:id/nueva-version" element={<ProtectedRoute><CreateVersion /></ProtectedRoute>} />
          <Route path="/perfil"                   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/donaciones"               element={<ProtectedRoute><Donations /></ProtectedRoute>} />
          <Route path="/chat"                     element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/proyectos" element={<AdminRoute><AdminProjects /></AdminRoute>} />
          <Route path="/admin/usuarios"  element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/chat"      element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:12 }}>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:72, fontWeight:800, color:'var(--border2)', margin:0 }}>404</p>
              <p style={{ fontSize:16, color:'var(--text-2)', margin:0 }}>Página no encontrada</p>
              <a href="/" className="btn-primary btn-sm" style={{ textDecoration:'none', marginTop:8 }}>← Volver al inicio</a>
            </div>
          } />
        </Routes>
      </main>
      <footer style={{ borderTop:'1px solid var(--border)', background:'var(--surface)', paddingTop:'2.5rem' }}>
        <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem 2.5rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'2rem' }}>

          {/* Marca */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:800, color:'var(--primary)', marginBottom:8 }}>
              PoliExpo
            </div>
            <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7, margin:'0 0 12px' }}>
              Plataforma Institucional de Proyectos Académicos de la ESFOT — Escuela Politécnica Nacional.
            </p>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase', margin:0 }}>
              Universidad / ESFOT
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h5 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-1)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Plataforma</h5>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
              {[['/#top', 'Inicio'], ['/#explorar', 'Proyectos'], ['/registro', 'Registro'], ['/login', 'Iniciar sesión']].map(([href, label]) => (
                <li key={href}><a href={href} style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none' }}>{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h5 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-1)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Contacto</h5>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12 }}>
              <li>
                <a href="mailto:luis.ochoa02@epn.edu.ec" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:9 }}>
                  {/* Email SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                    <rect width="24" height="24" rx="4" fill="#EA4335"/>
                    <path d="M4 7.5L12 13L20 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="4" y="7" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5" fill="none"/>
                  </svg>
                  luis.ochoa02@epn.edu.ec
                </a>
              </li>
              <li>
                <a href="https://wa.me/593984986049" target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:9 }}>
                  {/* WhatsApp SVG oficial */}
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                    <rect width="24" height="24" rx="4" fill="#25D366"/>
                    <path d="M12 4C7.582 4 4 7.582 4 12c0 1.49.39 2.888 1.07 4.1L4 20l4.02-1.05A7.953 7.953 0 0012 20c4.418 0 8-3.582 8-8s-3.582-8-8-8zm3.93 11.07c-.17.48-.98.92-1.36.97-.35.05-.79.07-1.27-.08-.29-.09-.67-.22-1.15-.43-2.02-.87-3.34-2.91-3.44-3.04-.1-.14-.82-1.09-.82-2.08 0-.99.52-1.48.7-1.68.18-.2.4-.25.53-.25h.38c.12 0 .29-.05.45.34.17.4.57 1.39.62 1.49.05.1.08.22.02.35-.06.13-.1.21-.19.32-.1.11-.2.25-.29.34-.1.1-.2.2-.09.4.11.2.5.82 1.07 1.33.74.65 1.36.85 1.55.95.2.1.31.08.43-.05.12-.13.5-.58.63-.78.13-.2.27-.17.45-.1.18.07 1.15.54 1.35.64.2.1.33.15.38.23.05.09.05.52-.12 1z" fill="white"/>
                  </svg>
                  (+593) 984 986 049
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--text-1)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Legal</h5>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
              {['Privacidad', 'Términos de uso', 'Ayuda'].map(l => (
                <li key={l}><span style={{ fontSize:13, color:'var(--text-3)' }}>{l}</span></li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid var(--border)', padding:'1rem 1.5rem', textAlign:'center' }}>
          <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>
            © {new Date().getFullYear()} PoliExpo · Escuela Politécnica Nacional · Todos los derechos reservados.
          </p>
        </div>
      </footer>
      {/* Widget de chat flotante — usuarios no-admin */}
      {user && !esAdmin && <Chat />}
      {/* Widget de chat flotante — admin */}
      {user && esAdmin && <AdminChat />}
    </div>
  )
}
