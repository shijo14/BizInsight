import { useState, useEffect } from 'react'
import { sentimentAPI } from '../services/api'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, Legend
} from 'recharts'
import './Sentiment.css'

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? 'star filled' : i - 0.5 <= rating ? 'star half' : 'star'}>★</span>
      ))}
    </div>
  )
}

const SentimentBadge = ({ sentiment }) => {
  const map = { positive: { cls: 'badge-sent-pos', label: '😊 Positive' }, negative: { cls: 'badge-sent-neg', label: '😞 Negative' }, neutral: { cls: 'badge-sent-neu', label: '😐 Neutral' } }
  const { cls, label } = map[sentiment] || map.neutral
  return <span className={`sent-badge ${cls}`}>{label}</span>
}

const ScoreGauge = ({ score, max = 5 }) => {
  const pct = (score / max) * 100
  const angle = (pct / 100) * 180 - 90
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 110" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${pct * 2.83} 283`} />
        <line
          x1="100" y1="100"
          x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="6" fill="#6366f1" />
      </svg>
      <div className="gauge-score">{score}</div>
      <div className="gauge-label">/ {max} Overall Score</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: {p.value}{p.name === 'score' ? '/5' : '%'}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Sentiment() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [animateBars, setAnimateBars] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [newReviewText, setNewReviewText] = useState('')
  const [newReviewSentiment, setNewReviewSentiment] = useState('positive')

  useEffect(() => {
    sentimentAPI.getData()
      .then(r => { setData(r); setLoading(false); setTimeout(() => setAnimateBars(true), 100) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="sentiment"><div className="spinner" /></div>
  if (!data) return <div className="sentiment"><div className="card"><p style={{color:'var(--text-muted)'}}>Failed to load data.</p></div></div>

  return (
    <div className="sentiment">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div className="page-header-left">
          <h1>Sentiment Analysis</h1>
          <p>Aggregates customer reviews from Google, Trustpilot, and G2 into a single sentiment score</p>
        </div>
        <div className="page-header-right">
          <div className="sentiment-source-badges">
            {['Google', 'Trustpilot', 'G2'].map(source => (
              <span key={source} className="sentiment-source-badge">{source}</span>
            ))}
          </div>
          <div className="total-reviews-pill">
            <span className="reviews-dot" />
            <span>{data.overall.totalReviews.toLocaleString()} reviews analyzed</span>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="sentiment-kpi-row">
        <div className="card sent-gauge-card">
          <ScoreGauge score={data.overall.score} />
          <div className="gauge-change badge badge-up">↑ +{data.overall.change} this month</div>
        </div>
        {data.breakdown.map(b => (
          <div key={b.label} className="card sent-kpi-card">
            <div className="sent-kpi-label">{b.label}</div>
            <div className="sent-kpi-value" style={{ color: b.color }}>{b.pct}%</div>
            <div className="sent-kpi-count">{b.count.toLocaleString()} reviews</div>
            <div className="sent-kpi-bar-track">
              <div className="sent-kpi-bar-fill" style={{ width: animateBars ? `${b.pct}%` : '0%', background: b.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        {['overview', 'categories', 'keywords', 'reviews'].map(t => (
          <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="charts-grid">
          <div className="card">
            <h3 className="card-title">Sentiment Trend</h3>
            <p className="card-subtitle">Monthly breakdown of customer sentiment</p>
            <div style={{ height: 280, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="positive" name="Positive" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="neutral"  name="Neutral"  stroke="#6366f1" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="negative" name="Negative" stroke="#ef4444" fill="url(#negGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Score Trend</h3>
            <p className="card-subtitle">Average monthly sentiment score</p>
            <div style={{ height: 280, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[3, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" name="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="charts-grid">
          <div className="card">
            <h3 className="card-title">Category Breakdown</h3>
            <p className="card-subtitle">Sentiment score by feedback category</p>
            <div className="category-list">
              {data.categories.map(c => {
                const pct = (c.score / 5) * 100
                const color = c.score >= 4.3 ? '#10b981' : c.score >= 3.8 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={c.name} className="category-row">
                    <div className="category-name">{c.name}</div>
                    <div className="category-bar-wrap">
                      <div className="category-bar-track">
                        <div className="category-bar-fill" style={{ width: animateBars ? `${pct}%` : '0%', background: color }} />
                      </div>
                    </div>
                    <div className="category-score" style={{ color }}>{c.score}/5</div>
                    <div className="category-reviews">{c.reviews} reviews</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Category Radar</h3>
            <p className="card-subtitle">Visualized performance profile</p>
            <div style={{ height: 300, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.categories.map(c => ({ subject: c.name.split(' ')[0], score: c.score * 20 }))}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Keywords */}
      {activeTab === 'keywords' && (
        <div className="card">
          <h3 className="card-title">Top Keywords</h3>
          <p className="card-subtitle">Most frequently mentioned terms in customer feedback</p>
          <div className="keyword-cloud">
            {data.keywords.map(k => {
              const size = 0.85 + (k.count / 450) * 0.9
              const colors = { positive: '#10b981', negative: '#ef4444', neutral: '#6366f1' }
              return (
                <div key={k.word} className="keyword-chip" style={{ fontSize: `${size}rem`, color: colors[k.sentiment], borderColor: `${colors[k.sentiment]}30`, background: `${colors[k.sentiment]}0d`, cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedKeyword(k.word)
                    setActiveTab('reviews')
                  }}>
                  {k.word}
                  <span className="keyword-count">{k.count}</span>
                </div>
              )
            })}
          </div>
          <div className="keyword-legend">
            <span className="kw-leg kw-pos">● Positive</span>
            <span className="kw-leg kw-neg">● Negative</span>
            <span className="kw-leg kw-neu">● Neutral</span>
          </div>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Customer Reviews</h3>
              {selectedKeyword && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Filtering by keyword: </span>
                  <span className="badge badge-neutral" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                    {selectedKeyword} <button style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 4, cursor: 'pointer' }} onClick={() => setSelectedKeyword('')}>×</button>
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" placeholder="Write a review..." value={newReviewText} onChange={e => setNewReviewText(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
              <select value={newReviewSentiment} onChange={e => setNewReviewSentiment(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <button className="btn btn-primary" onClick={() => {
                if(!newReviewText) return;
                const newRev = {
                  id: Date.now(),
                  author: 'New User',
                  avatar: 'NU',
                  date: 'Just now',
                  source: 'Direct',
                  sentiment: newReviewSentiment,
                  rating: newReviewSentiment === 'positive' ? 5 : newReviewSentiment === 'negative' ? 1 : 3,
                  text: newReviewText
                };
                setData(prev => ({...prev, recentReviews: [newRev, ...prev.recentReviews]}));
                setNewReviewText('');
              }}>Add</button>
            </div>
          </div>

          <div className="reviews-grid">
            {data.recentReviews.filter(r => !selectedKeyword || r.text.toLowerCase().includes(selectedKeyword.toLowerCase())).map(r => (
              <div key={r.id} className={`card review-card review-${r.sentiment}`}>
                <div className="review-header">
                  <div className="review-avatar">{r.avatar}</div>
                  <div className="review-meta">
                    <strong>{r.author}</strong>
                    <span>{r.date} · {r.source}</span>
                  </div>
                  <SentimentBadge sentiment={r.sentiment} />
                </div>
                <StarRating rating={r.rating} />
                <p className="review-text">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
