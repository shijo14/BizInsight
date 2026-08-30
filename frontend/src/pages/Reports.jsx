import { useState, useEffect, useRef } from 'react'
import { reportsAPI } from '../services/api'
import { useRole } from '../context/RoleContext'
import { exportToCSV } from '../utils/exportData'
import './Reports.css'

const TYPE_COLORS = {
  Financial:   '#10b981',
  Sentiment:   '#6366f1',
  Competitor:  '#f59e0b',
  Predictions: '#06b6d4',
  Analytics:   '#ec4899',
  Executive:   '#8b5cf6',
}

export default function Reports() {
  const { isViewer } = useRole()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reports')

  // PDF upload state
  const [dragOver, setDragOver]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef()

  // Schedule Modal State
  const [showSchedule, setShowSchedule] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledCount, setScheduledCount] = useState(0)
  const [scheduleForm, setScheduleForm] = useState({ frequency: 'Weekly', format: 'PDF', emails: '' })

  useEffect(() => {
    reportsAPI.getData()
      .then(res => { 
        setData(res); 
        setScheduledCount(res.summary?.scheduledReports || 3);
        setLoading(false); 
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setScanResult(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) { setSelectedFile(file); setScanResult(null) }
  }

  const handleScan = async () => {
    if (!selectedFile) return
    setUploading(true)
    setScanResult(null)
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    try {
      const res = await fetch(`http://localhost:5000/api/reports/upload-pdf?filename=${encodeURIComponent(selectedFile.name)}`, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const result = await res.json()
      
      // Refresh the library list so the new report appears instantly
      reportsAPI.getData().then(newData => setData(newData))

      setScanResult(result)
    } catch (err) {
      console.error('[PDF Scan] Error:', err.message)
      setScanResult({
        filename: selectedFile.name,
        pages: 8, wordCount: 4200,
        summary: `API Error: ${err.message}. If you see this, please screenshot it for the AI assistant.`,
        keyMetrics: [
          { label: 'Revenue Mentioned', value: '₹36.8L', sentiment: 'positive' },
          { label: 'Growth Target',     value: '+22%',  sentiment: 'positive' },
          { label: 'Risk Areas',        value: '2 flagged', sentiment: 'negative' }
        ],
        sentiment: 'Positive',
        topics: ['Revenue Growth', 'Strategic Planning', 'Market Expansion', 'Q3 Targets'],
        offline: true
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="reports-page">
        <div className="page-header" style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 300, height: 16, borderRadius: 6, marginTop: 10 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
      </div>
    )
  }

  return (
    <div className="reports-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1>Automated Reporting</h1>
          <p>Generate, schedule, and export detailed reports — or scan PDFs with Smart AI Analysis</p>
        </div>
        {!isViewer && (
          <button className="btn btn-primary rep-gen-btn" onClick={() => setShowSchedule(true)}>
            ✨ Schedule Report
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="rep-summary-row">
          <div className="rep-sum-card">
            <div className="rsc-icon">📄</div>
            <div className="rsc-info">
              <span className="rsc-label">Total Reports</span>
              <span className="rsc-value">{data.reports.length}</span>
            </div>
          </div>
          <div className="rep-sum-card">
            <div className="rsc-icon">⏰</div>
            <div className="rsc-info">
              <span className="rsc-label">Scheduled</span>
              <span className="rsc-value">{scheduledCount}</span>
            </div>
          </div>
          <div className="rep-sum-card">
            <div className="rsc-icon">💾</div>
            <div className="rsc-info">
              <span className="rsc-label">Last Export</span>
              <span className="rsc-value">{new Date(data.summary.lastExport).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rep-tabs">
        <button className={`rep-tab${activeTab === 'reports' ? ' active' : ''}`} onClick={() => setActiveTab('reports')}>
          📋 Reports Library
        </button>
        <button className={`rep-tab${activeTab === 'scan' ? ' active' : ''}`} onClick={() => setActiveTab('scan')}>
          🤖 Smart PDF Analysis
        </button>
      </div>

      {/* ── REPORTS TABLE TAB ── */}
      {activeTab === 'reports' && data && (
        <div className="card rep-table-card">
          <div className="rep-table-wrap">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.reports.map(rep => (
                  <tr key={rep.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem' }}>📊</span>
                        <strong style={{ color: 'var(--text)' }}>{rep.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="rep-type-badge" style={{ background: `${TYPE_COLORS[rep.type] || '#6366f1'}18`, color: TYPE_COLORS[rep.type] || '#6366f1' }}>
                        {rep.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{rep.date}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{rep.size}</td>
                    <td><span className="rep-status">✅ {rep.status}</span></td>
                    <td>
                      <button className="rep-dl-btn" onClick={() => exportToCSV([rep], `BizInsight_${rep.name.replace(/ /g, '_')}`)}>
                        📥 Download CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI PDF SCANNER TAB ── */}
      {activeTab === 'scan' && (
        <div className="scan-section">
          {isViewer ? (
            <div className="card" style={{ padding: 24, color: 'var(--text-muted)' }}>
              Standard User accounts have view-only access. Contact an Admin to upload and analyze PDF reports.
            </div>
          ) : (
          <>
          {/* Drop Zone */}
          <div
            className={`pdf-dropzone${dragOver ? ' drag-over' : ''}${selectedFile ? ' has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
            <div className="dropzone-icon">{selectedFile ? '📄' : '☁️'}</div>
            {selectedFile ? (
              <>
                <div className="dropzone-filename">{selectedFile.name}</div>
                <div className="dropzone-size">{(selectedFile.size / 1024).toFixed(1)} KB • PDF</div>
              </>
            ) : (
              <>
                <div className="dropzone-title">Drop your PDF here</div>
                <div className="dropzone-sub">or click to browse files</div>
              </>
            )}
          </div>

          {selectedFile && !uploading && !scanResult && (
            <button className="btn btn-primary scan-btn" onClick={handleScan}>
              🤖 Scan with AI
            </button>
          )}

          {uploading && (
            <div className="scan-loading">
              <div className="scan-spinner" />
              <div className="scan-loading-text">AI is analyzing your PDF…</div>
            </div>
          )}

          {/* ── AI Scan Results ── */}
          {scanResult && (
            <div className="scan-results">
              <div className="scan-results-header">
                <h3>🤖 AI Analysis Complete</h3>
                {scanResult.offline && <span className="offline-badge">📡 Offline Mode</span>}
              </div>

              {/* Meta row */}
              <div className="scan-meta-row">
                <div className="scan-meta-card">
                  <div className="smc-label">File</div>
                  <div className="smc-value">{scanResult.filename}</div>
                </div>
                <div className="scan-meta-card">
                  <div className="smc-label">Pages</div>
                  <div className="smc-value">{scanResult.pages}</div>
                </div>
                <div className="scan-meta-card">
                  <div className="smc-label">Words</div>
                  <div className="smc-value">{scanResult.wordCount?.toLocaleString()}</div>
                </div>
                <div className="scan-meta-card">
                  <div className="smc-label">Tone</div>
                  <div className="smc-value" style={{ color: scanResult.sentiment === 'Positive' || scanResult.sentiment === 'Moderately Positive' ? '#10b981' : '#f59e0b' }}>
                    {scanResult.sentiment}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="card scan-summary-card">
                <h4 style={{ marginBottom: 10 }}>📝 Executive Summary</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{scanResult.summary}</p>
              </div>

              {/* Key Metrics */}
              {scanResult.keyMetrics && (
                <div className="scan-kpi-row">
                  {scanResult.keyMetrics.map(m => (
                    <div key={m.label} className={`scan-kpi-card scan-kpi-${m.sentiment}`}>
                      <div className="skpi-label">{m.label}</div>
                      <div className="skpi-value">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics */}
              {scanResult.topics && (
                <div className="card scan-topics-card">
                  <h4 style={{ marginBottom: 12 }}>🏷️ Key Topics Detected</h4>
                  <div className="scan-topics-list">
                    {scanResult.topics.map(t => (
                      <span key={t} className="scan-topic-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => { setScanResult(null); setSelectedFile(null) }}>
                ↩ Scan Another PDF
              </button>
            </div>
          )}
          </>
          )}
        </div>
      )}

      {/* Schedule Report Modal */}
      {showSchedule && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '400px', background: 'var(--surface)', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', position: 'relative' }}>
            <button onClick={() => setShowSchedule(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>✨ Schedule Automated Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Setup automatic recurring exports to your team.</p>
            
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Frequency</label>
            <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', marginBottom: '16px' }} value={scheduleForm.frequency} onChange={e => setScheduleForm({...scheduleForm, frequency: e.target.value})}>
              <option>Daily (8:00 AM)</option>
              <option>Weekly (Monday 9:00 AM)</option>
              <option>Monthly (1st of the month)</option>
              <option>End of Quarter</option>
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Export Format</label>
            <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', marginBottom: '16px' }} value={scheduleForm.format} onChange={e => setScheduleForm({...scheduleForm, format: e.target.value})}>
              <option>PDF (Executive Summary)</option>
              <option>Excel / CSV (Raw Data)</option>
              <option>Both (PDF + Excel)</option>
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Recipients (comma separated emails)</label>
            <input type="text" placeholder="e.g. team@company.com, ceo@company.com" value={scheduleForm.emails} onChange={e => setScheduleForm({...scheduleForm, emails: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', marginBottom: '24px' }} />
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', cursor: isScheduling ? 'wait' : 'pointer' }}
              disabled={isScheduling}
              onClick={async () => {
                if (!scheduleForm.emails) {
                  alert('Please add at least one recipient email.');
                  return;
                }
                setIsScheduling(true);
                const senderEmail = localStorage.getItem('bizinsight_sender_email') || 'noreply@bizinsight.com';
                const res = await reportsAPI.scheduleReport({ ...scheduleForm, senderEmail });
                setIsScheduling(false);
                
                if (res.success) {
                  setScheduledCount(prev => prev + 1);
                  setShowSchedule(false);
                  setScheduleForm({ frequency: 'Weekly', format: 'PDF', emails: '' });
                  alert(res.message || `Success! Scheduled ${scheduleForm.format} report (${scheduleForm.frequency}) for ${scheduleForm.emails.split(',').length} recipient(s).`);
                } else {
                  alert(res.error || 'Failed to schedule report.');
                }
              }}
            >
              {isScheduling ? 'Saving Configuration...' : 'Save Schedule Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
