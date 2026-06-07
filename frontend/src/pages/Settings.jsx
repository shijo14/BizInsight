import { useState } from 'react'
import './Settings.css'

const SECTIONS = ['Profile', 'Notifications', 'Integrations', 'Security', 'Billing']

const Toggle = ({ checked, onChange }) => (
  <div className={`toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
    <div className="toggle-knob" />
  </div>
)

export default function Settings() {
  const [activeSection, setActiveSection] = useState('Profile')
  const [profile, setProfile] = useState({
    name: 'Shijo Varghese',
    email: 'shijo@bizinsight.io',
    company: 'BizInsight Inc.',
    role: 'Admin',
    timezone: 'Asia/Kolkata',
    language: 'English'
  })
  const [notifications, setNotifications] = useState({
    weeklyReport:    true,
    anomalyAlerts:   true,
    sentimentDrop:   true,
    competitorMove:  false,
    productUpdates:  true,
    marketingEmails: false
  })
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionLog: true
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const integrations = [
    { name: 'Google Analytics', icon: '📊', desc: 'Import web traffic and conversion data', connected: true,  color: '#f59e0b' },
    { name: 'Slack',            icon: '💬', desc: 'Receive real-time alerts in your workspace', connected: true,  color: '#6366f1' },
    { name: 'HubSpot CRM',     icon: '🔗', desc: 'Sync customer data and deal pipeline', connected: false, color: '#ef4444' },
    { name: 'Stripe',           icon: '💳', desc: 'Pull revenue and subscription metrics', connected: false, color: '#10b981' },
    { name: 'Zapier',           icon: '⚡', desc: 'Automate workflows with 5000+ apps', connected: true,  color: '#f97316' },
    { name: 'Salesforce',       icon: '☁️', desc: 'Sync leads, contacts, and opportunities', connected: false, color: '#06b6d4' },
  ]

  return (
    <div className="settings">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences, and integrations</p>
        </div>
        {saved && (
          <div className="save-toast">✅ Changes saved successfully</div>
        )}
      </div>

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <nav className="settings-nav">
          {SECTIONS.map(s => (
            <button
              key={s}
              className={`settings-nav-item${activeSection === s ? ' active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              <span className="settings-nav-icon">
                {{ Profile: '👤', Notifications: '🔔', Integrations: '🔌', Security: '🔒', Billing: '💳' }[s]}
              </span>
              {s}
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div className="settings-content">

          {/* ── Profile ── */}
          {activeSection === 'Profile' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Profile Settings</h2>
                <p>Update your personal information and preferences</p>
              </div>

              {/* Avatar */}
              <div className="profile-avatar-row">
                <div className="settings-avatar">SV</div>
                <div>
                  <button className="btn btn-ghost" style={{ marginRight: 10 }}>Upload Photo</button>
                  <button className="btn btn-ghost">Remove</button>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 8 }}>JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="form-input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input className="form-input" value={profile.company} onChange={e => setProfile({...profile, company: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
                    <option>Admin</option>
                    <option>Analyst</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select className="form-input" value={profile.timezone} onChange={e => setProfile({...profile, timezone: e.target.value})}>
                    <option>Asia/Kolkata</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Singapore</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select className="form-input" value={profile.language} onChange={e => setProfile({...profile, language: e.target.value})}>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                <button className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'Notifications' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Notification Preferences</h2>
                <p>Choose what alerts and updates you receive</p>
              </div>
              <div className="toggle-list">
                {[
                  { key: 'weeklyReport',    label: 'Weekly Performance Report',   desc: 'Delivered every Monday at 9AM' },
                  { key: 'anomalyAlerts',   label: 'Anomaly Detection Alerts',    desc: 'Instant notification when unusual patterns are detected' },
                  { key: 'sentimentDrop',   label: 'Sentiment Score Drop',        desc: 'Alert when overall sentiment drops below threshold' },
                  { key: 'competitorMove',  label: 'Competitor Market Movements', desc: 'Get notified of significant competitor changes' },
                  { key: 'productUpdates',  label: 'Product Updates',             desc: 'New features and improvements to BizInsight' },
                  { key: 'marketingEmails', label: 'Marketing Emails',            desc: 'Tips, case studies, and industry insights' },
                ].map(n => (
                  <div key={n.key} className="toggle-row">
                    <div className="toggle-info">
                      <div className="toggle-label">{n.label}</div>
                      <div className="toggle-desc">{n.desc}</div>
                    </div>
                    <Toggle
                      checked={notifications[n.key]}
                      onChange={v => setNotifications({...notifications, [n.key]: v})}
                    />
                  </div>
                ))}
              </div>
              <div className="settings-actions">
                <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {activeSection === 'Integrations' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Integrations</h2>
                <p>Connect your favorite tools to supercharge BizInsight</p>
              </div>
              <div className="integrations-grid">
                {integrations.map(int => (
                  <div key={int.name} className={`integration-card${int.connected ? ' connected' : ''}`}>
                    <div className="int-icon" style={{ background: `${int.color}18`, color: int.color }}>{int.icon}</div>
                    <div className="int-info">
                      <div className="int-name">{int.name}</div>
                      <div className="int-desc">{int.desc}</div>
                    </div>
                    <div className="int-actions">
                      {int.connected
                        ? <><span className="int-badge-connected">● Connected</span><button className="btn btn-ghost" style={{fontSize:'0.78rem',padding:'6px 14px'}}>Disconnect</button></>
                        : <button className="btn btn-primary" style={{fontSize:'0.78rem',padding:'6px 16px'}}>Connect</button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeSection === 'Security' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Security</h2>
                <p>Manage your account security and access</p>
              </div>

              <div className="security-card card">
                <div className="security-row">
                  <div>
                    <div className="security-label">Two-Factor Authentication</div>
                    <div className="security-desc">Add an extra layer of protection to your account via authenticator app</div>
                  </div>
                  <Toggle checked={security.twoFactor} onChange={v => setSecurity({...security, twoFactor: v})} />
                </div>
                <div className="security-row">
                  <div>
                    <div className="security-label">Session Activity Log</div>
                    <div className="security-desc">Track all login sessions and device access</div>
                  </div>
                  <Toggle checked={security.sessionLog} onChange={v => setSecurity({...security, sessionLog: v})} />
                </div>
              </div>

              <div className="settings-section-header" style={{ marginTop: 32 }}>
                <h3 style={{fontSize:'1rem', fontWeight: 600}}>Change Password</h3>
              </div>
              <div className="settings-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-input" placeholder="Min. 12 characters" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Repeat new password" />
                </div>
              </div>
              <div className="settings-actions">
                <button className="btn btn-primary" onClick={handleSave}>Update Password</button>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>These actions are irreversible. Please proceed with caution.</p>
                <button className="btn btn-danger">Delete Account</button>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {activeSection === 'Billing' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Billing & Plan</h2>
                <p>Manage your subscription and payment methods</p>
              </div>

              <div className="plan-card card">
                <div className="plan-badge">Current Plan</div>
                <div className="plan-name">Pro Plan</div>
                <div className="plan-price">$99<span>/month</span></div>
                <div className="plan-features">
                  {['Unlimited analytics', 'Sentiment analysis', 'AI Predictions', 'Competitor tracking', 'Priority support', 'API access'].map(f => (
                    <div key={f} className="plan-feature">✓ {f}</div>
                  ))}
                </div>
                <div className="plan-actions">
                  <button className="btn btn-primary">Upgrade to Enterprise</button>
                  <button className="btn btn-ghost">Cancel Subscription</button>
                </div>
              </div>

              <div className="settings-section-header" style={{ marginTop: 28 }}>
                <h3 style={{fontSize:'1rem',fontWeight:600}}>Payment Method</h3>
              </div>
              <div className="payment-card card">
                <div className="payment-row">
                  <div className="card-brand">💳</div>
                  <div>
                    <div className="payment-num">•••• •••• •••• 4242</div>
                    <div className="payment-exp">Expires 12/2027</div>
                  </div>
                  <span className="int-badge-connected">● Default</span>
                  <button className="btn btn-ghost" style={{fontSize:'0.78rem',padding:'6px 14px'}}>Update</button>
                </div>
              </div>

              <div className="settings-section-header" style={{ marginTop: 28 }}>
                <h3 style={{fontSize:'1rem',fontWeight:600}}>Billing History</h3>
              </div>
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: 'May 1, 2026',  desc: 'Pro Plan - Monthly',  amount: '$99.00', status: 'Paid' },
                      { date: 'Apr 1, 2026',  desc: 'Pro Plan - Monthly',  amount: '$99.00', status: 'Paid' },
                      { date: 'Mar 1, 2026',  desc: 'Pro Plan - Monthly',  amount: '$99.00', status: 'Paid' },
                      { date: 'Feb 1, 2026',  desc: 'Pro Plan - Monthly',  amount: '$99.00', status: 'Paid' },
                    ].map((inv, i) => (
                      <tr key={i}>
                        <td>{inv.date}</td>
                        <td>{inv.desc}</td>
                        <td style={{color:'var(--text)'}}>{inv.amount}</td>
                        <td><span className="badge badge-up">{inv.status}</span></td>
                        <td><button className="btn btn-ghost" style={{fontSize:'0.75rem',padding:'4px 12px'}}>Download</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
