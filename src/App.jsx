import { Routes, Route } from 'react-router-dom'
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

export default function App() {
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
          <Route path="/donaciones"            element={<Donations />} />

          {/* Protected */}
          <Route path="/dashboard"                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mis-proyectos"            element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/mis-proyectos/nuevo"      element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/mis-proyectos/editar/:id"         element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
          <Route path="/mis-proyectos/:id/nueva-version" element={<ProtectedRoute><CreateVersion /></ProtectedRoute>} />
          <Route path="/perfil"                   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chat"                     element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/proyectos" element={<AdminRoute><AdminProjects /></AdminRoute>} />
          <Route path="/admin/usuarios"  element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/chat"      element={<AdminRoute><AdminChat /></AdminRoute>} />

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
      <footer style={{ borderTop:'1px solid var(--border)', padding:'1rem 1.5rem', textAlign:'center', fontSize:12, color:'var(--text-3)', background:'var(--surface)' }}>
        POLIESFOT — Escuela Politécnica Nacional © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
