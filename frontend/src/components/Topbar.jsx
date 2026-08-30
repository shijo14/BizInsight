import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useRole } from '../context/RoleContext'
import { useAuth } from '../context/AuthContext'
import { searchRegistry } from '../services/searchRegistry'
import EpicLogo from './EpicLogo'
import './Topbar.css'

const NOTIFICATIONS = [
  { id: 1, title: 'Anomaly Detected',        text: 'Unusual spike in user signups — investigating.',    time: '2 min ago',  color: '#ef4444', dot: '#ef4444' },
  { id: 2, title: 'AI Pipeline Complete',     text: 'Model retrained with 99.1% accuracy.',              time: '18 min ago', color: '#10b981', dot: '#10b981' },
  { id: 3, title: 'Sentiment Alert',          text: 'Negative sentiment up 3% on pricing feedback.',     time: '1 hr ago',   color: '#f59e0b', dot: '#f59e0b' },
  { id: 4, title: 'Competitor Update',        text: 'DataPulse dropped pricing to $129/mo.',             time: '3 hr ago',   color: '#6366f1', dot: '#6366f1' },
  { id: 5, title: 'Weekly Report Ready',      text: 'Your performance summary is available.',            time: '1 day ago',  color: '#06b6d4', dot: '#06b6d4' },
]

const CATBAR_ITEMS = [
  { label: 'Dashboard',   icon: '⊞', path: '/dashboard', module: 'dashboard'   },
  { label: 'Analytics',   icon: '📊', path: '/analytics', module: 'analytics'   },
  { label: 'Sentiment',   icon: '💬', path: '/sentiment', module: 'sentiment'   },
  { label: 'Competitor',  icon: '🔍', path: '/competitor', module: 'competitor'  },
  { label: 'Predictions', icon: '📈', path: '/predictions', module: 'predictions' },
  { label: 'Live Data',   icon: '🌐', path: '/live-data', module: 'liveData'   },
  { label: 'Data Sources', icon: '🗄️', path: '/data-sources', module: 'dataSources' },
  { label: 'Reports',     icon: '📋', path: '/reports', module: 'reports'     },
  { label: 'Settings',    icon: '⚙️',  path: '/settings', module: 'settings'    },
]

export default function Topbar({ onToggleSidebar, sidebarOpen }) {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { theme, setTheme } = useTheme()
  const { isSuperAdmin, isViewer, roleLabel } = useRole()
  const { currentUser, logout, permissions } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [searchFocused,  setSearchFocused]  = useState(false)
  const [searchCategory, setSearchCategory] = useState('All')
  const [focusedIdx,     setFocusedIdx]     = useState(-1)

  const [showNotifs,     setShowNotifs]     = useState(false)
  const [notifCount,     setNotifCount]     = useState(NOTIFICATIONS.length)

  const searchRef   = useRef(null)
  const notifsRef   = useRef(null)

  // ── Dismiss a notification
  const handleDismissNotif = (id, e) => {
    e.stopPropagation()
    // Simulated dismiss - in a real app this would call an API
    const el = document.getElementById(`notif-${id}`)
    if (el) el.style.display = 'none'
    setNotifCount(prev => Math.max(0, prev - 1))
  }

  // ── Search ──────────────────────────────────────────────────
  const doSearch = useCallback((q) => {
    if (!q.trim()) { setSearchResults([]); return }
    const results = searchRegistry(q, navigate, setTheme)
    const filtered = searchCategory === 'All'
      ? results
      : results.filter(r => r.category === searchCategory)
    setSearchResults(filtered)
    setFocusedIdx(-1)
  }, [navigate, setTheme, searchCategory])

  useEffect(() => { doSearch(searchQuery) }, [searchQuery, searchCategory, doSearch])

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchFocused(false)
        setShowNotifs(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleKeyDown = (e) => {
    if (!searchResults.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx(i => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault()
      executeResult(searchResults[focusedIdx])
    }
  }

  const executeResult = (item) => {
    item.action()
    setSearchQuery('')
    setSearchResults([])
    setSearchFocused(false)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Group results by category
  const grouped = searchResults.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const themeOptions = [
    { key: 'light',  icon: '☀️',  label: 'Light',  cls: 'light-btn'  },
    { key: 'dark',   icon: '🌙',  label: 'Dark',   cls: ''           },
    { key: 'modern', icon: '✨',  label: 'Modern', cls: 'modern-btn' },
  ]

  return (
    <header className="topbar">
      {/* ── Row 1 ───────────────────────────────────────────── */}
      <div className="topbar-main">

        {/* Hamburger */}
        <button
          className={`topbar-hamburger ${sidebarOpen ? 'open' : ''}`}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="sidebarToggleBtn"
        >
          <span /><span /><span />
        </button>

        {/* Logo — hidden on desktop since sidebar has it, visible on mobile */}
        <div className="topbar-logo-area">
          <EpicLogo size="sm" onClick={() => navigate('/dashboard')} />
        </div>

        {/* Search */}
        <div className="topbar-search-wrap" style={{ position: 'relative' }}>
          <select
            className="search-category-select"
            value={searchCategory}
            onChange={e => setSearchCategory(e.target.value)}
            aria-label="Search category"
          >
            {['All','Pages','Actions','Features','Metrics','Info'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="topbar-search-input-wrap">
            <input
              ref={searchRef}
              id="globalSearch"
              className="topbar-search-input"
              type="search"
              placeholder="Search pages, actions, metrics…"
              autoComplete="off"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleKeyDown}
              aria-label="Global search"
            />
            {!searchQuery && <kbd className="search-kbd">Ctrl K</kbd>}
          </div>

          <button className="topbar-search-btn" aria-label="Search" onClick={() => doSearch(searchQuery)}>
            🔍
          </button>

          {/* Results Dropdown */}
          {searchFocused && (searchQuery.trim() || searchResults.length > 0) && (
            <div className="search-results-dropdown" role="listbox">
              {searchResults.length === 0 && searchQuery.trim() ? (
                <div style={{ padding: '16px', color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No results for "<strong style={{color:'var(--text)'}}>{searchQuery}</strong>"
                </div>
              ) : (
                Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="search-group-label">{cat}</div>
                    {items.map((item, i) => {
                      const globalIdx = searchResults.indexOf(item)
                      return (
                        <div
                          key={item.id}
                          className={`search-result-item ${focusedIdx === globalIdx ? 'focused' : ''}`}
                          role="option"
                          onClick={() => executeResult(item)}
                          onMouseEnter={() => setFocusedIdx(globalIdx)}
                        >
                          <div className="sri-icon">{item.icon}</div>
                          <div className="sri-info">
                            <div className="sri-label">{item.label}</div>
                            <div className="sri-desc">{item.description}</div>
                          </div>
                          <span className="sri-cat">{item.category}</span>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              {/* Ask BizBot */}
              <div
                className="search-ask-ai"
                onClick={() => {
                  setSearchFocused(false)
                  window.dispatchEvent(new CustomEvent('open-bizbot', { detail: { query: searchQuery } }))
                  setSearchQuery('')
                }}
              >
                <span>🤖</span>
                <span>Ask BizBot: "<strong>{searchQuery || 'anything about your business'}</strong>"</span>
              </div>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="topbar-right">
          {/* Theme Pill */}
          <div className="theme-pill" role="group" aria-label="Theme">
            {themeOptions.map(opt => (
              <button
                key={opt.key}
                id={`theme-${opt.key}`}
                className={`theme-pill-btn ${opt.cls} ${theme === opt.key ? 'active' : ''}`}
                onClick={() => setTheme(opt.key)}
                title={`${opt.label} mode`}
                aria-pressed={theme === opt.key}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="topbar-action-wrapper" ref={notifsRef}>
            <button 
              className={`topbar-btn ${showNotifs ? 'active' : ''}`}
              onClick={() => { setShowNotifs(!showNotifs) }}
            >
              🔔
              {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
            </button>
            
            {showNotifs && (
              <div className="topbar-dropdown notif-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Notifications</span>
                  <button className="notif-clear" onClick={() => setNotifCount(0)}>Mark all read</button>
                </div>
                <div className="notif-list">
                  {notifCount === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      You have no new notifications.
                    </div>
                  ) : (
                    NOTIFICATIONS.map(n => (
                      <div id={`notif-${n.id}`} key={n.id} className="notif-item">
                        <div className="notif-dot-type" style={{ background: n.dot }} />
                        <div className="notif-item-text">
                          <strong>{n.title}</strong>
                          {n.text}
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <button className="notif-dismiss" onClick={(e) => handleDismissNotif(n.id, e)}>✕</button>
                      </div>
                    ))
                  )}
                </div>
                <div className="notif-footer">
                  <button onClick={() => { setShowNotifs(false); navigate('/settings') }}>View Alert Settings</button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            className="topbar-logout-btn"
            onClick={handleLogout}
            title={`Sign out (${currentUser?.name || 'User'})`}
            id="topbarLogoutBtn"
          >
            <span>⏻</span>
            <span className="logout-label">Sign Out</span>
          </button>

          {/* Role badge (RBAC) */}
          <div className="role-switcher">
            <div className="role-badge-btn role-badge-readonly" title={`Signed in as ${currentUser?.name || 'User'}`}>
              <span className="role-crown">{isSuperAdmin ? '👑' : roleLabel === 'Standard User' ? '👁' : '👤'}</span>
              <span className="role-name">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Category bar ─────────────────────────────── */}
      <div className="topbar-catbar" role="navigation" aria-label="Quick navigation">
        {CATBAR_ITEMS.filter(c => {
          const role = currentUser?.role || 'viewer'
          if (!isSuperAdmin && c.module && !permissions[role]?.[c.module]) return false
          if (c.path === '/settings' && isViewer) return false
          return c.path !== '/admin' || isSuperAdmin
        }).map(item => (
          <button
            key={item.path}
            className={`catbar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        {isSuperAdmin && (
          <button
            className={`catbar-item ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
          </button>
        )}
      </div>
    </header>
  )
}
