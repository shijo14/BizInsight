import { useState, useEffect } from 'react'
import { competitorAPI } from '../services/api'
import {
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import './Competitor.css'

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
  const [nearbyResults, setNearbyResults] = useState(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [userLocation, setUserLocation] = useState(null)

  // Dynamic inputs
  const [fieldInput, setFieldInput] = useState('')
  const [compInput, setCompInput] = useState('')

  const fetchData = (f = '', c = '') => {
    setLoading(true)
    setNearbyResults(null)
    competitorAPI.getData(f, c)
      .then(r => { setData(r); setActiveComp(r.competitors[0]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleAnalyze = () => {
    setNearbyResults(null)
    fetchData(fieldInput, compInput)
  }

  const handleFindNearby = () => {
    const industry = fieldInput.trim()
    if (!industry) {
      setLocationError('Please enter an industry first (e.g. Shoes, Food, Hotels)')
      return
    }
    setLocationError('')
    setNearbyLoading(true)
    setNearbyResults(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserLocation({ lat, lng })
        try {
          const res = await fetch(`http://localhost:5000/api/competitor/nearby?lat=${lat}&lng=${lng}&industry=${encodeURIComponent(industry)}&radius=3000`)
          const json = await res.json()
          if (json.error) throw new Error(json.error)
          setNearbyResults(json)
        } catch (err) {
          setLocationError('Could not fetch nearby competitors: ' + err.message)
        }
        setNearbyLoading(false)
      },
      (err) => {
        setLocationError('Location access denied. Please allow location in your browser.')
        setNearbyLoading(false)
      }
    )
  }

  const handleExport = () => alert('Downloading Competitor Report PDF...')

  if (loading) {
    return (
      <div className="competitor">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text)' }}>Analyzing Market Data...</h3>
          <p style={{ color: 'var(--text-dim)' }}>Scanning news portals and extracting competitor intelligence.</p>
        </div>
      </div>
    )
  }
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Competitor Benchmarking</h1>
          <p>Compare market share, pricing, and features against key industry rivals in real time</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="comp-last-updated">
            <span>🔄 Updated just now</span>
          </div>
          <button onClick={handleExport} style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <h3 className="card-title" style={{ marginBottom: '4px' }}>🔍 Dynamic Market Analysis</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
          Auto-loads competitors based on your industry set in <strong>Settings</strong>. Use these fields to explore a different industry or add specific competitors.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
              Override Industry <span style={{ opacity: 0.6 }}>(e.g. E-Commerce, FinTech, EdTech)</span>
            </label>
            <input 
              type="text" 
              placeholder="Leave blank to use industry from Settings" 
              value={fieldInput}
              onChange={(e) => setFieldInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            />
          </div>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
              Custom Competitors <span style={{ opacity: 0.6 }}>(comma separated, overrides auto-detect)</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., Shopify, Amazon, Meesho (optional)" 
              value={compInput}
              onChange={(e) => setCompInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            />
          </div>
          <button 
            onClick={handleAnalyze}
            style={{ padding: '10px 24px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
          >
            🔄 Re-Analyze
          </button>
          <button 
            onClick={handleFindNearby}
            disabled={nearbyLoading}
            style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: nearbyLoading ? 'wait' : 'pointer', fontWeight: 500 }}
          >
            {nearbyLoading ? '📍 Locating...' : '📍 Find Nearby'}
          </button>
        </div>
        {locationError && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>{locationError}</p>}
      </div>

      {/* Nearby Results Panel */}
      {nearbyResults && (
        <div className="card" style={{ marginBottom: 24, padding: '20px', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' }}>
          <h3 className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📍</span> Real Nearby Competitors
            <span style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>LIVE GPS</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Found {nearbyResults.results.length} <strong>{nearbyResults.industry}</strong> businesses within {nearbyResults.radius / 1000}km of your location.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {nearbyResults.results.map((comp) => (
              <div key={comp.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg2)', borderTop: `3px solid ${comp.color}` }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '4px' }}>{comp.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <span>🗺️</span> {comp.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 500 }}>{comp.distanceLabel}</span>
                  <span>⭐ {comp.rating}</span>
                </div>
              </div>
            ))}
            {nearbyResults.results.length === 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', padding: '1rem' }}>No matching businesses found nearby.</div>
            )}
          </div>
        </div>
      )}


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
