import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardAPI, liveAPI } from '../services/api'
import { useRole } from '../context/RoleContext'
import SdgSection from '../components/SdgSection'
import confetti from 'canvas-confetti'

const CHART_DATA = [
  { name: 'Jan', revenue: 4521, expected: 4000 },
  { name: 'Feb', revenue: 5154, expected: 4800 },
  { name: 'Mar', revenue: 4872, expected: 5200 },
  { name: 'Apr', revenue: 5616, expected: 5500 },
  { name: 'May', revenue: 6015, expected: 5800 },
  { name: 'Jun', revenue: 6583, expected: 6200 },
  { name: 'Jul', revenue: 7040, expected: 6600 },
]

const CountUp = ({ end, prefix='', suffix='' }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / 30));
    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

export default function Dashboard() {
  const { isViewer, roleLabel } = useRole()
  const [metrics, setMetrics] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isTvMode, setIsTvMode] = useState(false)
  const [tvSlide, setTvSlide] = useState(0)
  
  // Dashboard Widget Visibility State
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('bizinsight_dash_layout')
    return saved ? JSON.parse(saved) : { stats: true, chart: true, ai: true, news: true }
  })

  // Gamification & Custom Goals
  const [goalConfig, setGoalConfig] = useState(() => {
    const saved = localStorage.getItem('bizinsight_custom_goal')
    return saved ? JSON.parse(saved) : { title: 'Q3 Revenue Goal', progress: 88 }
  })
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  
  // Custom Reminders / Alerts
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('bizinsight_custom_alerts')
    return saved ? JSON.parse(saved) : [
      { time: 'Just now',    text: 'Your average customer sentiment dropped from Positive to Neutral this week. Click here to read the recent 1-star reviews.', color: '#ef4444', action: '/sentiment' },
      { time: '2 hrs ago',  text: 'You haven\'t logged your Q2 Revenue yet. Click here to update it.', color: '#f59e0b', action: '/financials' },
      { time: 'Yesterday', text: 'Competitor "Shopify" changed their pricing. View benchmarking.', color: '#6366f1', action: '/competitor' },
    ]
  })
  const [newReminder, setNewReminder] = useState('')

  const handleAddReminder = (e) => {
    e.preventDefault()
    if (!newReminder.trim()) return
    const updated = [{ time: 'Just now', text: newReminder, color: '#ec4899' }, ...alerts]
    setAlerts(updated)
    localStorage.setItem('bizinsight_custom_alerts', JSON.stringify(updated))
    setNewReminder('')
  }

  const triggerConfetti = () => {
    const newGoal = { ...goalConfig, progress: 100 };
    setGoalConfig(newGoal);
    localStorage.setItem('bizinsight_custom_goal', JSON.stringify(newGoal));
    
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  const handleSaveGoal = () => {
    localStorage.setItem('bizinsight_custom_goal', JSON.stringify(goalConfig))
    setIsEditingGoal(false)
  }

  const handleSaveLayout = () => {
    localStorage.setItem('bizinsight_dash_layout', JSON.stringify(widgets))
    localStorage.setItem('bizinsight_custom_metrics', JSON.stringify(metrics))
    setIsEditing(false)
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [mData, nData] = await Promise.all([
          dashboardAPI.getMetrics(),
          liveAPI.getNews().catch(() => [])
        ])
        setMetrics(mData?.metrics || null)
        setNews(nData || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // TV Mode Auto-Carousel
  useEffect(() => {
    if (!isTvMode) return
    document.documentElement.requestFullscreen().catch(() => {})
    const interval = setInterval(() => {
      setTvSlide(s => (s + 1) % 3)
    }, 8000)
    return () => {
      clearInterval(interval)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [isTvMode])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 260, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 6, marginTop: 10 }} />
        </div>
        <div className="stats-grid">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="stat-card">
              <div>
                <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: 120, height: 30, borderRadius: 6, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 12 }} />
              </div>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return (
    <div className="dashboard">
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📡</div>
        <h3>Could not load dashboard data</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Please start the backend server and refresh.</p>
      </div>
    </div>
  )

  const statCards = [
    { key: 'totalRevenue', label: 'Total Revenue', value: metrics.totalRevenue, prefix: '₹', suffix: '', badge: '↑ 12.5%', badgeType: 'up', icon: '💵', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', tooltip: 'Total gross income generated by the business before any expenses are deducted.' },
    { key: 'activeUsers', label: 'Active Users', value: metrics.activeUsers, prefix: '', suffix: '', badge: '↑ 8.2%', badgeType: 'up', icon: '👥', color: '#10b981', bg: 'rgba(16,185,129,0.1)', tooltip: 'Number of unique users who have logged in or interacted with the platform in the last 30 days.' },
    { key: 'mrr', label: 'Monthly Recurring', value: metrics.mrr || 1029983, prefix: '₹', suffix: '', badge: '↑ 8.1%', badgeType: 'up', icon: '🔄', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', tooltip: 'Predictable monthly revenue generated from active subscriptions.' },
    { key: 'conversionRate', label: 'Conversion Rate', value: metrics.conversionRate || 3.24, prefix: '', suffix: '%', badge: '↑ 0.6%', badgeType: 'up', icon: '🎯', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', tooltip: 'The percentage of website visitors who complete a desired goal (like signing up or purchasing).' },
    { key: 'ltv', label: 'Customer LTV', value: metrics.ltv || 107111, prefix: '₹', suffix: '', badge: '↑ 19.3%', badgeType: 'up', icon: '⭐', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', tooltip: 'Lifetime Value: The total revenue you can expect from a single customer throughout their entire relationship with your business.' },
  ]

  return (
    <div className="dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1>Comprehensive Dashboard</h1>
          <p>Revenue, Active Users, MRR, Conversion Rates, and LTV — all at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isViewer && (
            <>
              <button className="btn btn-ghost" onClick={() => setIsTvMode(true)}>
                📺 TV Mode
              </button>
              <button className="btn btn-ghost" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel Edit' : '⚙️ Customize'}
              </button>
            </>
          )}
          <div style={{ background: 'var(--surface)', padding: '8px 18px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            Welcome back, {roleLabel} 👋
          </div>
        </div>
      </div>

      {isTvMode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999, background: '#050810', color: '#fff',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          animation: 'fade-in 0.5s ease-out'
        }}>
          <button onClick={() => setIsTvMode(false)} style={{ position: 'absolute', top: 30, right: 30, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '1.2rem' }}>✕ Exit TV Mode</button>
          
          <div style={{ textAlign: 'center', animation: 'pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} key={tvSlide}>
            {tvSlide === 0 && (
              <>
                <div style={{ fontSize: '3rem', color: '#64748b', marginBottom: 20 }}>Current Revenue</div>
                <div style={{ fontSize: '10rem', fontWeight: 800, background: 'var(--grad)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  ₹{(metrics?.totalRevenue / 100000).toFixed(1)}L
                </div>
                <div style={{ fontSize: '3rem', color: '#10b981', marginTop: 20 }}>↑ 12.5% vs last month</div>
              </>
            )}
            {tvSlide === 1 && (
              <>
                <div style={{ fontSize: '3rem', color: '#64748b', marginBottom: 20 }}>Active Users</div>
                <div style={{ fontSize: '10rem', fontWeight: 800, color: '#fff' }}>
                  {metrics?.activeUsers.toLocaleString()}
                </div>
                <div style={{ fontSize: '3rem', color: '#10b981', marginTop: 20 }}>↑ 8.2% growth</div>
              </>
            )}
            {tvSlide === 2 && (
              <>
                <div style={{ fontSize: '3rem', color: '#64748b', marginBottom: 20 }}>Customer Sentiment</div>
                <div style={{ fontSize: '10rem', fontWeight: 800, color: '#3b82f6' }}>
                  4.8 <span style={{ fontSize: '5rem', color: '#64748b' }}>/ 5</span>
                </div>
                <div style={{ fontSize: '3rem', color: '#10b981', marginTop: 20 }}>Extremely Positive</div>
              </>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: tvSlide === i ? '#fff' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
            <strong>Customize Dashboard:</strong> Toggle the widgets you want to see, or type in the boxes below to edit your key metrics.
          </div>
          <button className="btn btn-primary" onClick={handleSaveLayout}>Save Changes</button>
        </div>
      )}

      {(widgets.stats || isEditing) && (
        <div style={{ position: 'relative' }}>
          {isEditing && (
            <div style={{ position: 'absolute', top: -35, right: 0, zIndex: 20 }}>
              <button className="btn btn-ghost" onClick={() => setWidgets(w => ({...w, stats: !w.stats}))} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {widgets.stats ? '👁️ Hide Stats Widget' : '🙈 Show Stats Widget'}
              </button>
            </div>
          )}
          <div className="stats-grid" style={{ marginBottom: 28, opacity: isEditing && !widgets.stats ? 0.3 : 1 }}>
            {statCards.map((s, i) => (
              <div key={s.label} className="stat-card dash-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="stat-card-info">
                  <div className="stat-card-label">
                    {s.label} <span title={s.tooltip} style={{ cursor: 'help', fontSize: '1rem', marginLeft: '4px' }}>✨</span>
                  </div>
                  <div className="stat-card-value">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={s.value} 
                        onChange={e => setMetrics({...metrics, [s.key]: Number(e.target.value)})}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '1.5rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                      />
                    ) : (
                      <CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} />
                    )}
                  </div>
                  <div className={`badge badge-${s.badgeType}`}>{s.badge}</div>
                </div>
                <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="charts-grid">
        {(widgets.chart || isEditing) && (
          <div className="card" style={{ position: 'relative', opacity: isEditing && !widgets.chart ? 0.3 : 1 }}>
            {isEditing && (
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}>
                <button className="btn btn-ghost" onClick={() => setWidgets(w => ({...w, chart: !w.chart}))} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  {widgets.chart ? '👁️ Hide Chart' : '🙈 Show Chart'}
                </button>
              </div>
            )}
            <h3 style={{ marginBottom: '20px' }}>Revenue Trend (₹ thousands)</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.revenueTrend || CHART_DATA}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}K`} />
                <Tooltip contentStyle={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} formatter={(v) => [`₹${v}K`]} />
                <Line type="monotone" dataKey="revenue"  name="Actual"   stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expected" name="Forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Actionable AI Insights Banner */}
          <div style={{ marginTop: '20px', background: 'var(--bg2)', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid var(--accent)', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text)' }}>AI Revenue Insight</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Your Q3 Revenue is trending <strong>12.5% above expectations</strong> this week.
                <span style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginTop: '6px', padding: '8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  Recommendation: Your competitor "Shopify" launched a new ad campaign on Tuesday. Consider increasing your Google Ads spend by 5% to maintain your dominant impression share in the market.
                </span>
              </div>
            </div>
          </div>

          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Goal Tracker */}
          <div className="card" style={{ background: 'var(--grad)', color: '#fff', border: 'none', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              {isEditingGoal ? (
                <input 
                  type="text" 
                  value={goalConfig.title} 
                  onChange={e => setGoalConfig({...goalConfig, title: e.target.value})} 
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', outline: 'none', width: '60%' }} 
                  autoFocus 
                />
              ) : (
                <h3 style={{ margin: 0 }}>🏆 {goalConfig.title}</h3>
              )}
              
              {isEditingGoal ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <input 
                    type="number" 
                    value={goalConfig.progress} 
                    onChange={e => setGoalConfig({...goalConfig, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})} 
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', outline: 'none', width: '60px', textAlign: 'center' }} 
                  />%
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 'bold' }}>{goalConfig.progress}%</span>
                  {!isViewer && (
                    <button onClick={() => setIsEditingGoal(true)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}>
                      ✎
                    </button>
                  )}
                </div>
              )}
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${goalConfig.progress}%`, background: '#fff', height: '100%', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
            
            {isEditingGoal ? (
              <button 
                onClick={handleSaveGoal}
                style={{ width: '100%', padding: '8px', background: '#10b981', border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Save Goal
              </button>
            ) : goalConfig.progress < 100 ? (
              <button 
                onClick={triggerConfetti}
                style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                Simulate Major Deal Close ✨
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontWeight: 'bold', animation: 'pop-in 0.3s' }}>
                Goal Achieved! 🎉
              </div>
            )}
          </div>

          {(widgets.ai || isEditing) && (
            <div className="card" style={{ position: 'relative', opacity: isEditing && !widgets.ai ? 0.3 : 1 }}>
              {isEditing && (
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}>
                  <button className="btn btn-ghost" onClick={() => setWidgets(w => ({...w, ai: !w.ai}))} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    {widgets.ai ? '👁️ Hide Alerts' : '🙈 Show Alerts'}
                  </button>
                </div>
              )}
              <h3 style={{ marginBottom: '16px' }}>📥 Actionable Insights Inbox</h3>
              
              {!isViewer && (
                <form onSubmit={handleAddReminder} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a custom reminder..." 
                    value={newReminder}
                    onChange={e => setNewReminder(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', outline: 'none' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>Add</button>
                </form>
              )}

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert, i) => (
                <li key={i} style={{ padding: '12px 14px', background: `${alert.color}0d`, borderRadius: '8px', borderLeft: `3px solid ${alert.color}` }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{alert.time}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                    {alert.text}
                    {alert.action && (
                      <a href={alert.action} style={{ color: alert.color, marginLeft: 8, textDecoration: 'none', fontWeight: 'bold' }}>Action ➔</a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {((news.length > 0 && widgets.news) || isEditing) && (
            <div className="card" style={{ flex: 1, position: 'relative', opacity: isEditing && !widgets.news ? 0.3 : 1 }}>
              {isEditing && (
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}>
                  <button className="btn btn-ghost" onClick={() => setWidgets(w => ({...w, news: !w.news}))} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    {widgets.news ? '👁️ Hide News' : '🙈 Show News'}
                  </button>
                </div>
              )}
              <h3 style={{ marginBottom: '16px' }}>📰 Latest News</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.slice(0, 3).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', padding: '8px', borderRadius: 8, display: 'block', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.source}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SdgSection />
    </div>
  )
}
