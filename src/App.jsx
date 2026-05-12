import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Public pages
import Home           from './pages/public/Home'
import Login          from './pages/public/Login'
import Register       from './pages/public/Register'
import ConfirmEmail   from './pages/public/ConfirmEmail'
import ForgotPassword from './pages/public/ForgotPassword'
import ResetPassword  from './pages/public/ResetPassword'
import ProjectDetail  from './pages/public/ProjectDetail'

// User pages
import Dashboard     from './pages/user/Dashboard'
import MyProjects    from './pages/user/MyProjects'
import CreateProject from './pages/user/CreateProject'
import EditProject   from './pages/user/EditProject'
import Profile       from './pages/user/Profile'
import AIGenerator   from './pages/user/AIGenerator'
import Donations     from './pages/user/Donations'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProjects  from './pages/admin/AdminProjects'
import AdminUsers     from './pages/admin/AdminUsers'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<Home />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/registro"          element={<Register />} />
          <Route path="/confirmar-email"   element={<ConfirmEmail />} />
          <Route path="/recuperar-password" element={<ForgotPassword />} />
          <Route path="/nuevo-password/:token" element={<ResetPassword />} />
          <Route path="/proyectos/:id"     element={<ProjectDetail />} />

          {/* Protected (any logged user) */}
          <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mis-proyectos"     element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/mis-proyectos/nuevo" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/mis-proyectos/editar/:id" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
          <Route path="/perfil"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ia"                element={<ProtectedRoute><AIGenerator /></ProtectedRoute>} />
          <Route path="/donaciones"        element={<Donations />} />

          {/* Admin only */}
          <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/proyectos"   element={<AdminRoute><AdminProjects /></AdminRoute>} />
          <Route path="/admin/usuarios"    element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-5xl font-bold text-gray-200">404</p>
              <p className="text-gray-500">Página no encontrada</p>
              <a href="/" className="btn-primary btn-sm">Volver al inicio</a>
            </div>
          } />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        ESFOT — Escuela Politécnica Nacional © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
