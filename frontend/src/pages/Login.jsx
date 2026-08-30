import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EpicLogo from '../components/EpicLogo'
import './Login.css'

const DEMO_ACCOUNTS = [
  { label: '👑 Super Admin', email: 'shijo@bizinsight.io',  password: 'Admin@123', role: 'Full access + Admin Panel' },
  { label: '👤 Admin',       email: 'anika@bizinsight.io',  password: 'Admin@123', role: 'Manage users, reports & integrations' },
  { label: '👁 Standard User', email: 'david@bizinsight.io', password: 'Admin@123', role: 'View-only dashboard access' },
]

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [logoReady, setLogoReady] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const t = setTimeout(() => setLogoReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate network
    const result = login(email.trim(), password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="login-root">
      {/* Animated background particles */}
      <div className="login-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="login-particle" style={{ '--i': i }} />
        ))}
        <div className="login-grid-overlay" />
      </div>

      <div className={`login-container ${logoReady ? 'ready' : ''}`}>
        {/* Left panel — Branding */}
        <div className="login-left">
          <div className="login-logo-wrap">
            <EpicLogo animate />
          </div>
          <div className="login-tagline">
            <h2>Enterprise Analytics Platform</h2>
            <p>Offline-resilient, AI-powered business intelligence — built for decision-makers who can't afford to wait.</p>
          </div>
          <div className="login-platform-badges">
            <span className="platform-badge">PROGRESSIVE WEB APP</span>
            <span className="platform-badge">AI-POWERED</span>
            <span className="platform-badge">OFFLINE-FIRST</span>
          </div>
          <div className="login-sdg-badges">
            <span className="sdg-badge">🎯 SDG 8</span>
            <span className="sdg-badge">⚙️ SDG 9</span>
            <span className="sdg-badge">♻️ SDG 12</span>
          </div>
          <div className="login-features">
            {['Real-time Live Data Feeds', 'AI Revenue & Churn Predictions', 'Offline-First PWA Architecture', 'Role-Based Access Control'].map(f => (
              <div key={f} className="login-feature-item">
                <span className="lf-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — Form */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h1>Welcome back</h1>
              <p>Sign in to your BizInsight workspace</p>
            </div>

            {/* Demo quick-fill */}
            <div className="demo-accounts">
              <span className="demo-label">Quick demo:</span>
              <div className="demo-btns">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    className="demo-fill-btn"
                    onClick={() => fillDemo(acc)}
                    title={acc.role}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">📧</span>
                  <input
                    id="loginEmail"
                    type="email"
                    placeholder="you@bizinsight.io"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    id="loginPassword"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(v => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className={`login-submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading || !email || !password}
                id="loginSubmitBtn"
              >
                {loading ? (
                  <><span className="btn-spinner" /> Signing in…</>
                ) : (
                  <>Sign In to BizInsight →</>
                )}
              </button>
            </form>


          </div>

          <div className="login-footer">
            <span>© 2025 BizInsight · Prepared by Shijo Varghese</span>
          </div>
        </div>
      </div>
    </div>
  )
}
