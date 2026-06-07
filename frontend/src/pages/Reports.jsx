import { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'
import './Reports.css'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportsAPI.getData()
        setData(res)
      } catch (e) {
        console.error('Failed to fetch reports', e)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading || !data) return <div className="spinner"></div>

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Exports</h1>
        <p>Download and review generated business reports.</p>
      </div>

      <div className="reports-summary">
        <div className="report-sum-card">
          <div className="rs-icon">📄</div>
          <div className="rs-info">
            <span className="rs-label">Total Reports</span>
            <span className="rs-val">{data.summary.totalReports}</span>
          </div>
        </div>
        <div className="report-sum-card">
          <div className="rs-icon">⏳</div>
          <div className="rs-info">
            <span className="rs-label">Scheduled</span>
            <span className="rs-val">{data.summary.scheduledReports}</span>
          </div>
        </div>
        <div className="report-sum-card">
          <div className="rs-icon">💾</div>
          <div className="rs-info">
            <span className="rs-label">Last Export</span>
            <span className="rs-val">{new Date(data.summary.lastExport).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="user-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Category</th>
                <th>Date Generated</th>
                <th>Size</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map(rep => (
                <tr key={rep.id}>
                  <td><strong>{rep.name}</strong></td>
                  <td>
                    <span className={`rep-type-badge ${rep.type.toLowerCase()}`}>
                      {rep.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>{rep.date}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{rep.size}</td>
                  <td><span className="rep-status">{rep.status}</span></td>
                  <td>
                    <button className="download-btn" onClick={() => alert(`Downloading ${rep.name}...`)}>
                      📥 Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
