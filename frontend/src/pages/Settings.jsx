import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../context/RoleContext'
import { companyAPI } from '../services/api'
import './Settings.css'

const SECTIONS = ['Profile', 'Company', 'Notifications', 'Integrations', 'Security', 'Billing']

const Toggle = ({ checked, onChange }) => (
  <div className={`toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
    <div className="toggle-knob" />
  </div>
)

export default function Settings() {
  const { currentUser, updateUser } = useAuth()
  const { setRole } = useRole()
  const [activeSection, setActiveSection] = useState('Profile')
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name:     currentUser?.name     || '',
    email:    currentUser?.email    || '',
    company:  currentUser?.company  || 'BizInsight Inc.',
    role:     currentUser?.role     || 'admin',
    timezone: currentUser?.timezone || 'Asia/Kolkata',
    language: currentUser?.language || 'English'
  })

  // Sync profile if currentUser changes (e.g. after role change from admin panel)
  useEffect(() => {
    if (currentUser) {
      setProfile(p => ({
        ...p,
        name:  currentUser.name  || p.name,
        email: currentUser.email || p.email,
        role:  currentUser.role  || p.role,
      }))
    }
  }, [currentUser])

  const [notifications, setNotifications] = useState({
    weeklyReport:    true,
    anomalyAlerts:   true,
    sentimentDrop:   true,
    competitorMove:  false,
    productUpdates:  true,
    marketingEmails: false
  })
  const [senderEmail, setSenderEmail] = useState(() => {
    return localStorage.getItem('bizinsight_sender_email') || 'noreply@bizinsight.com'
  })
  const [security, setSecurity] = useState({ twoFactor: false, sessionLog: true })

  const [company, setCompany] = useState({
    company_name: '', industry: '', headquarters: '', description: '',
    base_revenue: 0, base_users: 0, currency: 'INR', competitors: '', market_segment: '', brandColor: '#6366f1'
  })
  const [loadingCompany, setLoadingCompany] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState({ card: '4242', exp: '12/2027', brand: '💳' })
  const [editingPayment, setEditingPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ card: '', exp: '' })

  // Fetch company data when visiting company tab
  useEffect(() => {
    if (activeSection === 'Company') {
      setLoadingCompany(true)
      companyAPI.getProfile().then(data => {
        if (data) {
          setCompany({
            ...data,
            competitors: data.competitors ? data.competitors.join(', ') : ''
          })
        }
      }).catch(err => console.error(err))
      .finally(() => setLoadingCompany(false))
    }
  }, [activeSection])

  const handleSaveCompany = async () => {
    try {
      const payload = {
        ...company,
        competitors: company.competitors.split(',').map(s => s.trim()).filter(Boolean)
      }
      await companyAPI.updateProfile(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save company profile', err)
    }
  }

  const handleSave = () => {
    if (currentUser) {
      updateUser(currentUser.id, {
        name:     profile.name,
        email:    profile.email,
        company:  profile.company,
        role:     profile.role,
        timezone: profile.timezone,
        language: profile.language,
      })
      // Also sync the mock role in the topbar
      setRole(profile.role)
    }
    localStorage.setItem('bizinsight_sender_email', senderEmail)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const [integrationsList, setIntegrationsList] = useState([
    { name: 'Google Analytics', icon: '📊', desc: 'Import web traffic and conversion data',      connected: true,  color: '#f59e0b' },
    { name: 'Slack',            icon: '💬', desc: 'Receive real-time alerts in your workspace',  connected: true,  color: '#6366f1' },
    { name: 'HubSpot CRM',     icon: '🔗', desc: 'Sync customer data and deal pipeline',         connected: false, color: '#ef4444' },
    { name: 'Stripe',           icon: '💳', desc: 'Pull revenue and subscription metrics',        connected: false, color: '#10b981' },
    { name: 'Zapier',           icon: '⚡', desc: 'Automate workflows with 5000+ apps',           connected: true,  color: '#f97316' },
    { name: 'Salesforce',       icon: '☁️', desc: 'Sync leads, contacts, and opportunities',     connected: false, color: '#06b6d4' },
  ])

  const toggleIntegration = (name) => {
    setIntegrationsList(prev => prev.map(int => int.name === name ? { ...int, connected: !int.connected } : int))
  }

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
                {{ Profile: '👤', Company: '🏢', Notifications: '🔔', Integrations: '🔌', Security: '🔒', Billing: '💳' }[s]}
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
                <div className="settings-avatar">
                  {currentUser?.avatar || currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'BZ'}
                </div>
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
                  <input className="form-input" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input className="form-input" value={profile.company} onChange={e => setProfile({...profile, company: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
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
                <button className="btn btn-ghost" onClick={() => setProfile({
                  name: currentUser?.name || '', email: currentUser?.email || '',
                  company: currentUser?.company || 'BizInsight Inc.', role: currentUser?.role || 'admin',
                  timezone: 'Asia/Kolkata', language: 'English'
                })}>Reset</button>
              </div>
            </div>
          )}

          {/* ── Company Profile ── */}
          {activeSection === 'Company' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Company Profile</h2>
                <p>Configure the foundational business data used across analytics and benchmarking</p>
              </div>

              {loadingCompany ? (
                <div style={{ padding: '20px', color: 'var(--text-dim)' }}>Loading company profile...</div>
              ) : (
                <>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input className="form-input" value={company.company_name} onChange={e => setCompany({...company, company_name: e.target.value})} placeholder="e.g. Nike" />
                    </div>
                    <div className="form-group">
                      <label>Industry</label>
                      <input className="form-input" value={company.industry} onChange={e => setCompany({...company, industry: e.target.value})} placeholder="e.g. Retail / E-commerce" />
                    </div>
                    <div className="form-group">
                      <label>Headquarters</label>
                      <input className="form-input" value={company.headquarters} onChange={e => setCompany({...company, headquarters: e.target.value})} placeholder="e.g. Beaverton, Oregon" />
                    </div>
                    <div className="form-group">
                      <label>Market Segment</label>
                      <select className="form-input" value={company.market_segment} onChange={e => setCompany({...company, market_segment: e.target.value})}>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                        <option value="B2B2C">B2B2C</option>
                        <option value="D2C">D2C (Direct to Consumer)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Company Description</label>
                      <textarea className="form-input" rows="3" value={company.description || ''} onChange={e => setCompany({...company, description: e.target.value})} placeholder="Brief description of the business model and products..."></textarea>
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1', padding: '16px', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🎨 Primary Brand Color (White-Labeling)</label>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>This color will be dynamically applied to all buttons, tabs, and charts to match your brand.</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input type="color" value={company.brandColor || '#6366f1'} onChange={e => {
                          const color = e.target.value;
                          setCompany({...company, brandColor: color});
                          document.documentElement.style.setProperty('--accent', color);
                          document.documentElement.style.setProperty('--primary', color);
                          localStorage.setItem('bizinsight_brand_color', color);
                        }} style={{ width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{company.brandColor || '#6366f1'}</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Base Revenue (Annual)</label>
                      <input className="form-input" type="number" value={company.base_revenue} onChange={e => setCompany({...company, base_revenue: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select className="form-input" value={company.currency} onChange={e => setCompany({...company, currency: e.target.value})}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Active Users / Customers Base</label>
                      <input className="form-input" type="number" value={company.base_users} onChange={e => setCompany({...company, base_users: e.target.value})} />
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Key Competitors (comma separated)</label>
                      <input className="form-input" value={company.competitors} onChange={e => setCompany({...company, competitors: e.target.value})} placeholder="e.g. Adidas, Puma, Under Armour" />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>These will be automatically benchmarked in the Competitor Analysis module.</p>
                    </div>
                  </div>

                  <div className="settings-actions">
                    <button className="btn btn-primary" onClick={handleSaveCompany} disabled={currentUser?.role === 'viewer'}>
                      {currentUser?.role === 'viewer' ? 'Read Only' : 'Save Company Profile'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'Notifications' && (
            <div className="settings-panel">
              <div className="settings-section-header">
                <h2>Notification Preferences</h2>
                <p>Choose what alerts and updates you receive</p>
              </div>

              <div className="form-group" style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Outgoing Sender Email 📨</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '12px' }}>This email will be used as the sender address for all scheduled automated reports.</p>
                <input 
                  type="email" 
                  value={senderEmail} 
                  onChange={e => setSenderEmail(e.target.value)} 
                  placeholder="e.g. alerts@mycompany.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text)' }}
                />
              </div>

              <div className="toggle-list">
                {[
                  { key: 'weeklyReport',    label: 'Weekly Performance Report',    desc: 'Delivered every Monday at 9AM' },
                  { key: 'anomalyAlerts',   label: 'Anomaly Detection Alerts',     desc: 'Instant notification when unusual patterns are detected' },
                  { key: 'sentimentDrop',   label: 'Sentiment Score Drop',         desc: 'Alert when overall sentiment drops below threshold' },
                  { key: 'competitorMove',  label: 'Competitor Market Movements',  desc: 'Get notified of significant competitor changes' },
                  { key: 'productUpdates',  label: 'Product Updates',              desc: 'New features and improvements to BizInsight' },
                  { key: 'marketingEmails', label: 'Marketing Emails',             desc: 'Tips, case studies, and industry insights' },
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
              <div className="settings-integrations-grid">
                {integrationsList.map(int => (
                  <div key={int.name} className={`settings-integration-card${int.connected ? ' connected' : ''}`}>
                    <div className="int-icon" style={{ background: `${int.color}18`, color: int.color }}>{int.icon}</div>
                    <div className="int-info">
                      <div className="int-name">{int.name}</div>
                      <div className="int-desc">{int.desc}</div>
                    </div>
                    <div className="int-actions">
                      {int.connected
                        ? <><span className="int-badge-connected">● Connected</span><button className="btn btn-ghost" style={{fontSize:'0.78rem',padding:'6px 14px'}} onClick={() => toggleIntegration(int.name)}>Disconnect</button></>
                        : <button className="btn btn-primary" style={{fontSize:'0.78rem',padding:'6px 16px'}} onClick={() => toggleIntegration(int.name)}>Connect</button>
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
                    <div className="security-desc">Add an extra layer of protection via authenticator app</div>
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
                <h2>Billing &amp; Plan</h2>
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
                {editingPayment ? (
                  <div style={{ padding: '20px 24px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input className="form-input" placeholder="Card Number (16 digits)" value={newPayment.card} onChange={e => setNewPayment({...newPayment, card: e.target.value})} style={{flex: 1, minWidth: '200px'}} maxLength="16" />
                    <input className="form-input" placeholder="MM/YY" value={newPayment.exp} onChange={e => setNewPayment({...newPayment, exp: e.target.value})} style={{width: '100px'}} maxLength="7" />
                    <button className="btn btn-primary" onClick={() => {
                      if (newPayment.card && newPayment.exp) {
                        setPaymentMethod({ card: newPayment.card.slice(-4), exp: newPayment.exp, brand: '💳' });
                      }
                      setEditingPayment(false);
                    }}>Save</button>
                    <button className="btn btn-ghost" onClick={() => setEditingPayment(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="payment-row">
                    <div className="card-brand">{paymentMethod.brand}</div>
                    <div>
                      <div className="payment-num">•••• •••• •••• {paymentMethod.card}</div>
                      <div className="payment-exp">Expires {paymentMethod.exp}</div>
                    </div>
                    <span className="int-badge-connected">● Default</span>
                    <button className="btn btn-ghost" style={{fontSize:'0.78rem',padding:'6px 14px'}} onClick={() => {
                      setNewPayment({ card: '', exp: '' });
                      setEditingPayment(true);
                    }}>Update</button>
                  </div>
                )}
              </div>

              <div className="settings-section-header" style={{ marginTop: 28 }}>
                <h3 style={{fontSize:'1rem',fontWeight:600}}>Billing History</h3>
              </div>
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: 'May 1, 2026', desc: 'Pro Plan - Monthly', amount: '$99.00', status: 'Paid' },
                      { date: 'Apr 1, 2026', desc: 'Pro Plan - Monthly', amount: '$99.00', status: 'Paid' },
                      { date: 'Mar 1, 2026', desc: 'Pro Plan - Monthly', amount: '$99.00', status: 'Paid' },
                      { date: 'Feb 1, 2026', desc: 'Pro Plan - Monthly', amount: '$99.00', status: 'Paid' },
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
