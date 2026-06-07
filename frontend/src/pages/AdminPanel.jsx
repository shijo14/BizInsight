import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './AdminPanel.css'

const ACTIVITY_ICONS = {
  export: '📤', ai: '🤖', data: '🔄', user: '👤', system: '✅'
}

function AddUserModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', password: 'Admin@123', role: 'admin' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = onAdd(form)
    if (!result.success) { setError(result.error); setLoading(false); return }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Add New User</h2>
            <p>Create a new admin account for BizInsight</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="mf-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Priya Nair"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="mf-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="user@bizinsight.io"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="mf-group">
            <label>Initial Password</label>
            <input
              type="text"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <span className="mf-hint">User should change this after first login</span>
          </div>
          <div className="mf-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin — Analytics & module access</option>
              <option value="superadmin">Super Admin — Full system access</option>
            </select>
          </div>

          {error && <div className="mf-error">⚠️ {error}</div>}

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit-btn" disabled={loading}>
              {loading ? <><span className="btn-spin" /> Adding…</> : '+ Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const { users, addUser, removeUser, toggleUserStatus, updateUserRole, currentUser } = useAuth()
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast]       = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    adminAPI.getStats().then(s => { setStats(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdd = (form) => {
    const result = addUser(form)
    if (result.success) showToast(`✅ ${result.user.name} added successfully!`)
    return result
  }

  const handleRemove = (id, name) => {
    if (id === currentUser?.id) { showToast('❌ Cannot remove your own account', 'error'); return }
    if (!window.confirm(`Remove ${name} from BizInsight?`)) return
    removeUser(id)
    showToast(`🗑️ ${name} removed.`)
  }

  const handleToggleStatus = (id, name, currentStatus) => {
    if (id === currentUser?.id) { showToast('❌ Cannot deactivate yourself', 'error'); return }
    toggleUserStatus(id)
    showToast(`${currentStatus === 'Active' ? '⏸️ Deactivated' : '▶️ Activated'} ${name}`)
  }

  const handleRoleChange = (id, newRole, name) => {
    if (id === currentUser?.id) { showToast('❌ Cannot change your own role here', 'error'); return }
    updateUserRole(id, newRole)
    showToast(`🔄 ${name} is now ${newRole === 'superadmin' ? 'Super Admin' : 'Admin'}`)
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* Modal */}
      {showModal && (
        <AddUserModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}

      <div className="page-header">
        <div>
          <h1>👑 Super Admin Panel</h1>
          <p>System health, user management, and activity logs</p>
        </div>
        <button className="add-user-btn" onClick={() => setShowModal(true)} id="addUserBtn">
          + Add Admin User
        </button>
      </div>

      {/* System Health Cards */}
      {stats && (
        <div className="admin-stats-grid">
          {[
            { label: 'CPU Usage',    val: stats.systemHealth.cpu,    color: '#10b981', icon: '💻' },
            { label: 'Memory',       val: stats.systemHealth.memory, color: '#f59e0b', icon: '🧠' },
            { label: 'Storage',      val: stats.systemHealth.disk,   color: '#6366f1', icon: '💾' },
            { label: 'API Quota',    val: Math.round((stats.apiCalls.month / stats.apiCalls.limit) * 100), color: '#ef4444', icon: '⚡' },
          ].map(s => (
            <div className="astat-card" key={s.label}>
              <div className="astat-top">
                <span className="astat-icon">{s.icon}</span>
                <div>
                  <div className="astat-label">{s.label}</div>
                  <div className="astat-value" style={{ color: s.color }}>{s.val}%</div>
                </div>
              </div>
              <div className="astat-bar">
                <div className="astat-fill" style={{ width: `${s.val}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Call Summary */}
      {stats && (
        <div className="api-summary-row">
          {[
            { label: 'Today', val: stats.apiCalls.today.toLocaleString() },
            { label: 'This Week', val: stats.apiCalls.week.toLocaleString() },
            { label: 'This Month', val: stats.apiCalls.month.toLocaleString() },
            { label: 'Monthly Limit', val: stats.apiCalls.limit.toLocaleString() },
          ].map(a => (
            <div className="api-summary-card" key={a.label}>
              <span className="api-summary-label">{a.label}</span>
              <span className="api-summary-val">{a.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {['users', 'modules', 'activity'].map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'users' ? `👥 Users (${users.length})` : tab === 'modules' ? '⚙️ Active Modules' : '📋 Activity Log'}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="card admin-card">
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.status === 'Inactive' ? 'row-inactive' : ''}>
                    <td>
                      <div className="user-profile">
                        <div className="user-avatar-sm">{u.avatar}</div>
                        <div className="user-name-col">
                          <strong>{u.name}</strong>
                          <span>{u.email}</span>
                        </div>
                        {u.id === currentUser?.id && <span className="you-badge">You</span>}
                      </div>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value, u.name)}
                        disabled={u.id === currentUser?.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={`status-toggle-btn ${u.status === 'Active' ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(u.id, u.name, u.status)}
                        disabled={u.id === currentUser?.id}
                        title={`Click to ${u.status === 'Active' ? 'deactivate' : 'activate'}`}
                      >
                        <span className="status-dot-sm" />
                        {u.status}
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{u.joined}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.lastActive || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn remove"
                          onClick={() => handleRemove(u.id, u.name)}
                          disabled={u.id === currentUser?.id}
                          title="Remove user"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODULES TAB ── */}
      {activeTab === 'modules' && stats && (
        <div className="card admin-card">
          <div className="modules-grid">
            {stats.activeModules.map(m => (
              <div className="module-card" key={m.name}>
                <div className="module-header">
                  <span className="module-name">{m.name}</span>
                  <span className={`module-status ${m.status.toLowerCase()}`}>{m.status}</span>
                </div>
                <div className="module-stats">
                  <div className="module-stat"><span>{m.requests.toLocaleString()}</span><label>Requests</label></div>
                  <div className="module-stat"><span style={{ color: m.errorRate > 0.3 ? '#ef4444' : '#10b981' }}>{m.errorRate}%</span><label>Error Rate</label></div>
                </div>
                <div className="module-bar-wrap">
                  <div className="module-bar-fill" style={{ width: `${Math.min((m.requests / 7000) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === 'activity' && stats && (
        <div className="card admin-card">
          <div className="activity-list">
            {stats.recentActivity.map((act, i) => (
              <div key={i} className="activity-item">
                <div className="act-icon">{ACTIVITY_ICONS[act.type] || '📌'}</div>
                <div className="act-body">
                  <p>{act.event}</p>
                  <span className="act-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
