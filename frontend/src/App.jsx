import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { RoleProvider } from './context/RoleContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Sentiment from './pages/Sentiment'
import Competitor from './pages/Competitor'
import Predictions from './pages/Predictions'
import Settings from './pages/Settings'
import LiveData from './pages/LiveData'
import AdminPanel from './pages/AdminPanel'
import Reports from './pages/Reports'
import Login from './pages/Login'
import BizBot from './components/BizBot'

// ── Protected route wrapper ────────────────────────────────────────────────
function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { isAuthenticated, isSuperAdmin, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#050810'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)',
            borderTop: '3px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Loading BizInsight…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// ── Main app layout (only shown when authenticated) ────────────────────────
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="page-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analytics"   element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/sentiment"   element={<ProtectedRoute><Sentiment /></ProtectedRoute>} />
            <Route path="/competitor"  element={<ProtectedRoute><Competitor /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/live-data"   element={<ProtectedRoute><LiveData /></ProtectedRoute>} />
            <Route path="/reports"     element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute requireSuperAdmin><AdminPanel /></ProtectedRoute>} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      <BizBot />
    </div>
  )
}

// ── Root router ─────────────────────────────────────────────────────────────
function RootRouter() {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#050810'
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <AuthProvider>
          <BrowserRouter>
            <RootRouter />
          </BrowserRouter>
        </AuthProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}
