import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardAPI, liveAPI } from '../services/api'
import { useRole } from '../context/RoleContext'

export default function Dashboard() {
  const { isSuperAdmin } = useRole()
  const [metrics, setMetrics] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [mData, nData] = await Promise.all([
          dashboardAPI.getMetrics(),
          liveAPI.getNews().catch(() => []) // non-critical
        ])
        setMetrics(mData.metrics)
        setNews(nData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const chartData = [
    { name: 'Jan', revenue: 4000, expected: 2400 },
    { name: 'Feb', revenue: 3000, expected: 1398 },
    { name: 'Mar', revenue: 2000, expected: 9800 },
    { name: 'Apr', revenue: 2780, expected: 3908 },
    { name: 'May', revenue: 1890, expected: 4800 },
    { name: 'Jun', revenue: 2390, expected: 3800 },
    { name: 'Jul', revenue: 3490, expected: 4300 },
  ]

  if (loading || !metrics) return <div className="spinner"></div>

  return (
    <div className="dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p>AI-powered insights for your business</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
          Welcome back, {isSuperAdmin ? 'Super Admin' : 'Admin'} 👋
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <div className="stat-card-label">Total Revenue</div>
            <div className="stat-card-value">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="badge badge-up">↑ 12.5%</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>💵</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-info">
            <div className="stat-card-label">Active Users</div>
            <div className="stat-card-value">{metrics.activeUsers.toLocaleString()}</div>
            <div className="badge badge-up">↑ 8.2%</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-info">
            <div className="stat-card-label">Avg Sentiment</div>
            <div className="stat-card-value">{metrics.sentimentScore}/5</div>
            <div className="badge badge-neutral">- 0%</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#f472b6' }}>💖</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-info">
            <div className="stat-card-label">Server Uptime</div>
            <div className="stat-card-value">{metrics.uptime}%</div>
            <div className="badge badge-down">↓ 0.1%</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>⚡</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Revenue vs Expected</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip contentStyle={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expected" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>AI Alerts</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Just now</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Anomaly detected in user signups. Investigating...</div>
              </li>
              <li style={{ padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>2 hrs ago</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Server load balanced successfully.</div>
              </li>
              <li style={{ padding: '12px', background: 'rgba(245,158,11,0.05)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Yesterday</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Warning: API request limit approaching 80%.</div>
              </li>
            </ul>
          </div>
          {news.length > 0 && (
            <div className="card" style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '16px' }}>Latest News</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.slice(0, 3).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.source} • {new Date(item.pubDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
