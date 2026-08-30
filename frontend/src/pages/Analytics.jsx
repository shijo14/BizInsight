import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import { analyticsAPI } from '../services/api'
import { useRole } from '../context/RoleContext'
import './Analytics.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {Math.round(percent * 100)}%
    </text>
  )
}

export default function Analytics() {
  const { isSuperAdmin, isViewer } = useRole()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNarrative, setShowNarrative] = useState(false)
  const [narrativeText, setNarrativeText] = useState('')
  const [isEditingStory, setIsEditingStory] = useState(false)
  const [savedStory, setSavedStory] = useState(() => localStorage.getItem('bizinsight_custom_story') || '')

  const generateNarrative = () => {
    if (!data) return
    setShowNarrative(true)
    setIsEditingStory(false)
    setNarrativeText('Analyzing data streams and drafting narrative...')
    setTimeout(() => {
      if (savedStory) {
        setNarrativeText(savedStory)
        return
      }

      const rev = data.kpis.find(k => k.label.includes('Revenue')) || { value: '₹0', change: 0 }
      const users = data.kpis.find(k => k.label.includes('Users')) || { value: '0', change: 0 }
      
      const story = `This month's performance has been ${rev.change > 0 ? 'outstanding' : 'challenging'}. We've seen total revenue hit ${rev.value}, which is a ${rev.change > 0 ? 'growth' : 'decline'} of ${Math.abs(rev.change)}% compared to the previous period. This correlates strongly with our active user base reaching ${users.value} (up ${users.change}%). If these traffic and conversion trends hold, we anticipate crossing our Q3 objectives well ahead of schedule. Keep an eye on the conversion funnel, as optimizations there could yield even higher margins.`
      
      let currentText = ''
      let i = 0
      const typeWriter = setInterval(() => {
        currentText += story.charAt(i)
        setNarrativeText(currentText)
        i++
        if (i === story.length) clearInterval(typeWriter)
      }, 10)
    }, 600)
  }

  const saveCustomStory = () => {
    localStorage.setItem('bizinsight_custom_story', narrativeText)
    setSavedStory(narrativeText)
    setIsEditingStory(false)
  }

  useEffect(() => {
    analyticsAPI.getDetailed()
      .then(r => { setData(r); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="analytics"><div className="spinner" /></div>
  if (!data) return <div className="analytics"><div className="card"><p style={{color:'var(--text-muted)'}}>Failed to load.</p></div></div>

  return (
    <div className="analytics">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1>Analytics</h1>
          <p>Detailed performance metrics and data exploration</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={generateNarrative} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✨</span> Auto-Narrative
          </button>
          <div className="date-range-pills">
            {['7D', '30D', '90D', 'YTD'].map((r, i) => (
              <button key={r} className={`date-pill${i === 1 ? ' active' : ''}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      {showNarrative && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--grad)', color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>📖</span> Data Story
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isViewer && (
                <button onClick={() => setIsEditingStory(!isEditingStory)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {isEditingStory ? 'Cancel' : '✎ Edit'}
                </button>
              )}
              <button onClick={() => setShowNarrative(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>✕</button>
            </div>
          </div>
          {isEditingStory ? (
            <div>
              <textarea 
                value={narrativeText} 
                onChange={e => setNarrativeText(e.target.value)} 
                style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
              <button onClick={saveCustomStory} className="btn btn-primary" style={{ marginTop: '10px', background: '#10b981', color: '#fff', border: 'none' }}>Save Story</button>
            </div>
          ) : (
            <p style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{narrativeText}</p>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="analytics-kpi-grid">
        {data.kpis.map(k => (
          <div key={k.label} className="card analytics-kpi-card">
            <div className="akpi-icon">{k.icon}</div>
            <div className="akpi-label">{k.label}</div>
            <div className="akpi-value">{k.value}</div>
            <div className={`badge ${k.change > 0 ? 'badge-up' : 'badge-down'}`}>
              {k.change > 0 ? '↑' : '↓'} {Math.abs(k.change)}%
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card analytics-chart-wide">
        <div className="chart-header">
          <div>
            <h3 className="card-title">Revenue vs Expenses vs Profit</h3>
            <p className="card-subtitle">Monthly financial performance overview</p>
          </div>
          <div className="chart-legend">
            <span className="legend-dot" style={{background:'#6366f1'}} /> Revenue
            <span className="legend-dot" style={{background:'#ef4444'}} /> Expenses
            <span className="legend-dot" style={{background:'#10b981'}} /> Profit
          </div>
        </div>
        <div style={{ height: 300, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueByMonth} barSize={22} barGap={4}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue"  name="Revenue"  fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} opacity={0.7} />
              <Bar dataKey="profit"   name="Profit"   fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column: Traffic + Funnel */}
      <div className="analytics-two-col">
        <div className="card">
          <h3 className="card-title">Traffic Sources</h3>
          <p className="card-subtitle">Where your visitors come from</p>
          <div style={{ height: 240, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.trafficSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  labelLine={false} label={renderCustomLabel}>
                  {data.trafficSources.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="traffic-legend">
            {data.trafficSources.map(s => (
              <div key={s.name} className="traffic-leg-row">
                <span className="legend-dot" style={{ background: s.color }} />
                <span className="traffic-leg-name">{s.name}</span>
                <span className="traffic-leg-pct">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Conversion Funnel</h3>
          <p className="card-subtitle">From visitor to customer journey</p>
          <div className="funnel-list">
            {data.funnelStages.map((stage, i) => (
              <div key={stage.stage} className="funnel-row">
                <div className="funnel-label">
                  <span className="funnel-stage">{stage.stage}</span>
                  <span className="funnel-count">{stage.count.toLocaleString()}</span>
                </div>
                <div className="funnel-track">
                  <div className="funnel-fill" style={{
                    width: `${stage.pct}%`,
                    background: `hsl(${230 - i * 22}, 80%, ${55 + i * 5}%)`,
                    opacity: 1 - i * 0.12
                  }} />
                </div>
                <span className="funnel-pct">{stage.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 20 }}>Top Pages by Traffic</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Sessions</th>
              <th>Bounce Rate</th>
              <th>Avg Time on Page</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.topPages.map((p, i) => (
              <tr key={p.page}>
                <td><span className="page-rank">#{i+1}</span> {p.page}</td>
                <td>{p.sessions.toLocaleString()}</td>
                <td>
                  <span className={`badge ${parseFloat(p.bounce) < 35 ? 'badge-up' : parseFloat(p.bounce) < 45 ? 'badge-neutral' : 'badge-down'}`}>
                    {p.bounce}
                  </span>
                </td>
                <td>{p.avgTime}</td>
                <td>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${(p.sessions / 12430) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
