import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import './Competitor.css'

const API = 'http://localhost:5000'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>{p.name}: {p.value}%</div>
        ))}
      </div>
    )
  }
  return null
}

export default function Competitor() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeComp, setActiveComp] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/competitor`)
      .then(r => { setData(r.data); setActiveComp(r.data.competitors[0]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="competitor"><div className="spinner" /></div>
  if (!data) return <div className="competitor"><div className="card"><p style={{color:'var(--text-muted)'}}>Failed to load.</p></div></div>

  const radarData = activeComp
    ? Object.entries(activeComp.radar).map(([k, v]) => ({
        subject: k.charAt(0).toUpperCase() + k.slice(1),
        [activeComp.name]: v,
        ...(data.competitors.filter(c => c !== activeComp).reduce((acc, c) => ({ ...acc, [c.name]: c.radar[k] }), {}))
      }))
    : []

  return (
    <div className="competitor">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1>Competitor Analysis</h1>
          <p>Market intelligence and competitive benchmarking</p>
        </div>
        <div className="comp-last-updated">
          <span>🔄 Updated just now</span>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="comp-cards-row">
        {data.competitors.map(c => (
          <div
            key={c.name}
            className={`card comp-card${c.isUs ? ' comp-card-us' : ''}${activeComp?.name === c.name ? ' comp-card-active' : ''}`}
            onClick={() => setActiveComp(c)}
            style={{ '--comp-color': c.color }}
          >
            {c.isUs && <div className="comp-us-badge">Us</div>}
            <div className="comp-card-name" style={{ color: c.color }}>{c.name}</div>
            <div className="comp-market-share">
              <span className="comp-share-val">{c.marketShare}%</span>
              <span className="comp-share-label">market share</span>
            </div>
            <div className="comp-stats">
              <div className="comp-stat">
                <div className="comp-stat-val">{c.growth > 0 ? '+' : ''}{c.growth}%</div>
                <div className="comp-stat-label">Growth</div>
              </div>
              <div className="comp-stat">
                <div className="comp-stat-val">{c.nps}</div>
                <div className="comp-stat-label">NPS</div>
              </div>
              <div className="comp-stat">
                <div className="comp-stat-val">{c.rating}</div>
                <div className="comp-stat-label">Rating</div>
              </div>
            </div>
            <div className="comp-pricing">{c.pricing}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        {/* Market Trend */}
        <div className="card">
          <h3 className="card-title">Market Share Trend</h3>
          <p className="card-subtitle">Monthly market share evolution</p>
          <div style={{ height: 280, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.marketTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
                {data.competitors.map(c => (
                  <Line key={c.name} type="monotone" dataKey={c.name.toLowerCase().replace(' ', '')}
                    name={c.name} stroke={c.color} strokeWidth={c.isUs ? 3 : 1.5}
                    strokeDasharray={c.isUs ? '0' : '4 4'} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 className="card-title">Capability Radar</h3>
          <p className="card-subtitle">Click a competitor card to compare</p>
          <div style={{ height: 280, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                {data.competitors.map(c => (
                  <Radar key={c.name} name={c.name} dataKey={c.name}
                    stroke={c.color} fill={c.color} fillOpacity={c.isUs ? 0.25 : 0.08} strokeWidth={c.isUs ? 2 : 1} />
                ))}
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 20 }}>Feature Comparison</h3>
        <div className="feature-table-wrap">
          <table className="feature-table">
            <thead>
              <tr>
                <th className="feature-col">Feature</th>
                {data.competitors.map(c => (
                  <th key={c.name} style={{ color: c.color }}>
                    {c.isUs ? <span>⭐ {c.name}</span> : c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.features.map(f => (
                <tr key={f.feature}>
                  <td className="feature-name">{f.feature}</td>
                  {data.competitors.map(c => {
                    const key = c.name.toLowerCase().replace(' ', '')
                    const hasFeature = f[key]
                    return (
                      <td key={c.name} className="feature-check-cell">
                        {hasFeature
                          ? <span className="check-yes">✓</span>
                          : <span className="check-no">✗</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
