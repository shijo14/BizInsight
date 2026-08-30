import { useState, useRef, useEffect } from 'react'
import { dataAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './DataSources.css'

const INTEGRATIONS = [
  { id: 'ga', name: 'Google Analytics', icon: '📊', status: 'Connected' },
  { id: 'sf', name: 'Salesforce', icon: '☁️', status: 'Not Connected' },
  { id: 'sh', name: 'Shopify', icon: '🛍️', status: 'Connected' },
  { id: 'stripe', name: 'Stripe', icon: '💳', status: 'Not Connected' },
  { id: 'hub', name: 'HubSpot', icon: '⚙️', status: 'Not Connected' },
]

export default function DataSources() {
  const { currentUser } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploads, setUploads] = useState([])
  const [toast, setToast] = useState(null)
  const inputRef = useRef(null)

  // Load upload history from DB on mount
  useEffect(() => {
    dataAPI.getDatasets().then(rows => {
      if (rows.length > 0) {
        setUploads(rows.map(r => ({
          id: r.id,
          name: r.filename,
          type: r.data_type,
          rows: r.rows_processed,
          time: new Date(r.uploaded_at).toLocaleDateString()
        })))
      } else {
        // seed with demo data only if DB is empty
        setUploads([
          { id: 1, name: 'historical_sales_2025.csv', type: 'Sales & Revenue', rows: 4500, time: '2 days ago' },
          { id: 2, name: 'competitor_pricing_q3.xlsx', type: 'Market Intelligence', rows: 120, time: '1 week ago' }
        ])
      }
    })
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      showToast('⚠️ Please upload a valid CSV or Excel file', 'error')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await dataAPI.uploadDataset(formData, currentUser?.id)
      if (res.error) throw new Error(res.error)
      
      showToast(`✅ ${res.message}`)
      
      setUploads(prev => [{
        id: Date.now(),
        name: res.filename,
        type: res.dataType,
        rows: res.rowsProcessed,
        time: 'Just now'
      }, ...prev])

    } catch (err) {
      showToast('❌ Upload failed: ' + err.message, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="data-sources-page">
      {toast && (
        <div className={`admin-toast ${toast.type}`} style={{ zIndex: 1000, position: 'fixed', bottom: 20, right: 20 }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Data Sources & Integrations</h1>
          <p>Connect your tools or upload raw datasets to power BizInsight analytics</p>
        </div>
        <button 
          onClick={() => alert("Exporting full dataset backup...")}
          style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>📥</span> Export Backup
        </button>
      </div>

      <div className="ds-grid">
        {/* Left Column: Integrations & History */}
        <div className="ds-left">
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="card-title">Live Integrations</h3>
            <p className="card-subtitle">Connect external APIs to sync data automatically</p>
            <div className="integrations-grid">
              {INTEGRATIONS.map(int => (
                <div key={int.id} className={`integration-card ${int.status === 'Connected' ? 'connected' : ''}`}>
                  <div className="integration-icon" style={{ background: int.status === 'Connected' ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)' }}>
                    {int.icon}
                  </div>
                  <div>
                    <div className="integration-name">{int.name}</div>
                    <div className="integration-status">{int.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Recent Uploads</h3>
            <p className="card-subtitle">History of manually ingested datasets</p>
            <div className="recent-uploads-list">
              {uploads.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>No uploads yet.</div>
              ) : (
                uploads.map(u => (
                  <div key={u.id} className="upload-history-item">
                    <div className="uhi-icon">{u.name.endsWith('.csv') ? '📄' : '📊'}</div>
                    <div className="uhi-details">
                      <div className="uhi-name">{u.name}</div>
                      <div className="uhi-meta">{u.rows.toLocaleString()} rows • {u.time}</div>
                    </div>
                    <div className="uhi-status">{u.type}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upload Zone */}
        <div className="ds-right">
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title">Manual Data Ingestion</h3>
            <p className="card-subtitle" style={{ marginBottom: 24 }}>Upload CSV or Excel files to update your metrics</p>
            
            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <input 
                ref={inputRef}
                type="file" 
                className="upload-input" 
                accept=".csv, .xlsx, .xls"
                onChange={handleChange}
                disabled={uploading}
              />
              
              {uploading ? (
                <>
                  <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, borderTopColor: 'var(--primary)' }} />
                  <div className="upload-text">Processing Dataset...</div>
                  <div className="upload-subtext">Parsing rows and updating analytics</div>
                </>
              ) : (
                <>
                  <span className="upload-icon">📁</span>
                  <div className="upload-text">Drag & Drop your dataset here</div>
                  <div className="upload-subtext">or click to browse files</div>
                  <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Supported formats: .CSV, .XLSX
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
