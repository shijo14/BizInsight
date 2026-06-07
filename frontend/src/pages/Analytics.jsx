import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import './Analytics.css'

const API = 'http://localhost:5000'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${p.value.toLocaleString()}` : p.value}
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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/analytics/detailed`)
      .then(r => { setData(r.data); setLoading(false) })
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
        <div className="date-range-pills">
          {['7D', '30D', '90D', 'YTD'].map((r, i) => (
            <button key={r} className={`date-pill${i === 1 ? ' active' : ''}`}>{r}</button>
          ))}
        </div>
      </div>

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
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
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
