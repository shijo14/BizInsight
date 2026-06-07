import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts'
import './Predictions.css'

const API = 'http://localhost:5000'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.filter(p => p.value != null).map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: {typeof p.value === 'number' ? `$${p.value.toLocaleString()}` : p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

const UserGrowthTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.filter(p => p.value != null).map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: {p.value?.toLocaleString()} users
          </div>
        ))}
      </div>
    )
  }
  return null
}

const ConfidenceMeter = ({ value }) => (
  <div className="confidence-meter">
    <div className="confidence-track">
      <div className="confidence-fill" style={{ width: `${value}%` }} />
    </div>
    <span className="confidence-val">{value}%</span>
  </div>
)

export default function Predictions() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/predictions`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="predictions"><div className="spinner" /></div>
  if (!data) return <div className="predictions"><div className="card"><p style={{color:'var(--text-muted)'}}>Failed to load.</p></div></div>

  // Merge historical + forecast for the revenue chart
  const revChartData = [
    ...data.historicalRevenue.map(d => ({ ...d, forecast: null, lower: null, upper: null })),
    ...data.revenueForecast
  ]

  return (
    <div className="predictions">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1>AI Predictions</h1>
          <p>ML-powered forecasting, churn risk, and growth opportunities</p>
        </div>
        <div className="ai-badge">
          <span className="ai-dot" />
          <span>AI Model Active</span>
          <span className="confidence-tag">{data.summary.confidence}% confidence</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="pred-kpi-grid">
        <div className="card pred-kpi-highlight">
          <div className="pred-kpi-icon">💰</div>
          <div className="pred-kpi-label">30-Day Revenue Forecast</div>
          <div className="pred-kpi-value">${data.summary.revenueNext30.toLocaleString()}</div>
          <div className="badge badge-up">↑ +{data.summary.revenueGrowth}% projected</div>
          <ConfidenceMeter value={data.summary.confidence} />
        </div>
        <div className="card pred-kpi-card">
          <div className="pred-kpi-icon">⚠️</div>
          <div className="pred-kpi-label">Churn Risk</div>
          <div className="pred-kpi-value pred-churn-low">{data.summary.churnPct}%</div>
          <div className="badge badge-up">{data.summary.churnRisk} Risk</div>
        </div>
        <div className="card pred-kpi-card">
          <div className="pred-kpi-icon">🎯</div>
          <div className="pred-kpi-label">Top Opportunity</div>
          <div className="pred-kpi-opp">{data.summary.topOpportunity}</div>
          <div className="badge badge-neutral">78% probability</div>
        </div>
        <div className="card pred-kpi-card">
          <div className="pred-kpi-icon">📈</div>
          <div className="pred-kpi-label">User Growth (Q3)</div>
          <div className="pred-kpi-value">1,472</div>
          <div className="badge badge-up">↑ 22.3% projected</div>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <div>
            <h3 className="card-title">Revenue Forecast</h3>
            <p className="card-subtitle">Historical data + 6-month AI projection with confidence bands</p>
          </div>
          <div className="forecast-legend">
            <span className="fl-item"><span className="fl-line fl-actual" />Actual</span>
            <span className="fl-item"><span className="fl-line fl-forecast" />Forecast</span>
            <span className="fl-item"><span className="fl-band" />Confidence Band</span>
          </div>
        </div>
        <div style={{ height: 320, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revChartData}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x="Jul" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Now', fill: '#94a3b8', fontSize: 11 }} />
              <Area type="monotone" dataKey="upper"    name="Upper Bound" stroke="transparent" fill="url(#bandGrad)" />
              <Area type="monotone" dataKey="lower"    name="Lower Bound" stroke="transparent" fill="var(--bg)" />
              <Area type="monotone" dataKey="actual"   name="Actual"   stroke="#10b981" fill="none" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} connectNulls={false} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#6366f1" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="pred-bottom-grid">
        {/* Churn Risk by Segment */}
        <div className="card">
          <h3 className="card-title">Churn Risk by Segment</h3>
          <p className="card-subtitle">Probability of cancellation in next 90 days</p>
          <div className="churn-list">
            {data.churnRisk.map(s => (
              <div key={s.segment} className="churn-row">
                <div className="churn-segment">{s.segment}</div>
                <div className="churn-bar-track">
                  <div className="churn-bar-fill" style={{ width: `${s.risk * 7}%`, background: s.color }} />
                </div>
                <div className="churn-risk-val" style={{ color: s.color }}>{s.risk}%</div>
                <div className="churn-count">{s.count} users</div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="card">
          <h3 className="card-title">Growth Opportunities</h3>
          <p className="card-subtitle">AI-identified revenue expansion areas</p>
          <div className="opportunities-list">
            {data.growthOpportunities.map(o => (
              <div key={o.opportunity} className="opportunity-card">
                <div className="opp-icon">{o.icon}</div>
                <div className="opp-info">
                  <div className="opp-name">{o.opportunity}</div>
                  <div className="opp-potential">{o.potential}</div>
                </div>
                <div className="opp-prob-wrap">
                  <div className="opp-prob-ring" style={{ '--prob': o.probability }}>
                    <span>{o.probability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="card">
          <h3 className="card-title">User Growth Forecast</h3>
          <p className="card-subtitle">Historical + projected active users</p>
          <div style={{ height: 230, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<UserGrowthTooltip />} />
                <ReferenceLine x="Jul" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="users"    name="Actual"   stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
