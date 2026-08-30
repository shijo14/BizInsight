import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { RoleProvider, useRole } from './context/RoleContext'
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
import DataSources from './pages/DataSources'
import Login from './pages/Login'
import Chatbot from './components/Chatbot'
import OfflineBanner from './components/OfflineBanner'
import Financials from './pages/Financials'

// ── Protected route wrapper ────────────────────────────────────────────────
function ProtectedRoute({ children, requireSuperAdmin = false, viewerRestricted = false, module = null }) {
  const { isAuthenticated, authLoading, permissions, currentUser } = useAuth()
  const { isSuperAdmin, isViewer } = useRole()

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
  
  const role = currentUser?.role || 'viewer'
  if (module && !isSuperAdmin) {
    if (!permissions[role]?.[module]) {
      return <Navigate to="/dashboard" replace />
    }
  } else if (viewerRestricted && isViewer) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// ── Main app layout (only shown when authenticated) ────────────────────────
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const savedColor = localStorage.getItem('bizinsight_brand_color')
    if (savedColor) {
      document.documentElement.style.setProperty('--accent', savedColor)
      document.documentElement.style.setProperty('--primary', savedColor)
    }
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <OfflineBanner />
        <div className="page-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/financials"  element={<ProtectedRoute><Financials /></ProtectedRoute>} />
            <Route path="/analytics"   element={<ProtectedRoute module="analytics"><Analytics /></ProtectedRoute>} />
            <Route path="/sentiment"   element={<ProtectedRoute module="sentiment"><Sentiment /></ProtectedRoute>} />
            <Route path="/competitor"  element={<ProtectedRoute module="competitor"><Competitor /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute module="predictions"><Predictions /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute module="settings" viewerRestricted><Settings /></ProtectedRoute>} />
            <Route path="/live-data"   element={<ProtectedRoute module="liveData"><LiveData /></ProtectedRoute>} />
            <Route path="/data-sources" element={<ProtectedRoute module="dataSources"><DataSources /></ProtectedRoute>} />
            <Route path="/reports"     element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute requireSuperAdmin><AdminPanel /></ProtectedRoute>} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      <Chatbot />
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
      <AuthProvider>
        <RoleProvider>
          <BrowserRouter>
            <RootRouter />
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
