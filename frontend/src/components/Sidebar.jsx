import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { useAuth } from '../context/AuthContext'
import EpicLogo from './EpicLogo'
import './Sidebar.css'

const MENU = [
  {
    id: 'overview', label: 'Overview',
    items: [
      { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
      { to: '/live-data', icon: '🌐', label: 'Live Data', badge: { type: 'new', text: 'New' } }
    ]
  },
  {
    id: 'ai-features', label: 'AI Features',
    items: [
      { to: '/analytics',   icon: '📊', label: 'Analytics' },
      { to: '/sentiment',   icon: '💬', label: 'Sentiment' },
      { to: '/competitor',  icon: '🔍', label: 'Competitor' },
      { to: '/predictions', icon: '📈', label: 'Predictions' }
    ]
  },
  {
    id: 'system', label: 'System',
    items: [
      { to: '/reports',  icon: '📋', label: 'Reports' },
      { to: '/settings', icon: '⚙️',  label: 'Settings' },
      { to: '/admin',    icon: '🛡️',  label: 'Admin Panel', adminOnly: true }
    ]
  }
]

function SidebarSection({ section, isSuperAdmin }) {
  const [collapsed, setCollapsed] = useState(false)
  const visibleItems = section.items.filter(item => !item.adminOnly || isSuperAdmin)
  if (visibleItems.length === 0) return null

  return (
    <div className="sb-section">
      <div className="sb-section-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="sb-section-label">{section.label}</span>
        <span className={`sb-chevron ${collapsed ? 'collapsed' : ''}`}>▼</span>
      </div>
      <div className={`sb-section-content ${collapsed ? 'collapsed' : ''}`}>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className={`sb-badge ${item.badge.type}`}>{item.badge.text}</span>}
            {item.adminOnly && <span className="sb-badge lock" title="Super Admin Only">SA</span>}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default function Sidebar({ open }) {
  const { isSuperAdmin } = useRole()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = currentUser?.avatar || currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'BZ'
  const displayRole = currentUser?.role === 'superadmin' ? 'Super Admin' : 'Admin'

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo in sidebar */}
        <div className="sb-logo-area">
          <EpicLogo size="sm" onClick={() => navigate('/dashboard')} />
        </div>

        <div className="sidebar-inner">
          {MENU.map(section => (
            <SidebarSection key={section.id} section={section} isSuperAdmin={isSuperAdmin} />
          ))}
        </div>

        {/* User card + logout */}
        <div className="sb-user-card">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-info">
            <span className="sb-user-name">{currentUser?.name || 'BizInsight User'}</span>
            <span className="sb-user-role">{displayRole}</span>
          </div>
          <span className="sb-online-dot" title="Online" />
        </div>

        <button className="sb-logout-btn" onClick={handleLogout} title="Sign out" id="sidebarLogoutBtn">
          <span className="sb-logout-icon">⏻</span>
          <span className="sb-logout-label">Sign Out</span>
        </button>
      </aside>
    </>
  )
}
