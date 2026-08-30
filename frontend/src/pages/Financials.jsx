import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { financialsAPI } from '../services/api'
import './Financials.css'

export default function Financials() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = () => {
    financialsAPI.getEntries()
      .then(res => {
        if (Array.isArray(res)) setEntries(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Revenue',
    category: '',
    amount: '',
    notes: ''
  })

  const [budget] = useState(500000) // Monthly budget in INR

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.category) return
    try {
      const added = await financialsAPI.addEntry({
        ...form,
        amount: Number(form.amount)
      })
      if (added && added.id) {
        setEntries(prev => [added, ...prev])
      } else {
        setEntries(prev => [{ id: Date.now(), ...form, amount: Number(form.amount) }, ...prev])
      }
      setForm({ ...form, category: '', amount: '', notes: '' })
    } catch(err) {
      console.error(err)
    }
  }

  const removeEntry = async (id) => {
    try {
      await financialsAPI.deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  // Calculate summaries
  const totalRevenue = entries.filter(e => e.type === 'Revenue').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = entries.filter(e => e.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0)
  const netProfit = totalRevenue - totalExpense
  
  const budgetPercent = Math.min(100, Math.round((totalExpense / budget) * 100))
  const isOverBudget = totalExpense > budget

  // Calculate runway (basic AI forecast logic)
  const monthlyBurn = totalExpense
  const currentCash = 18000 // Arbitrary starting cash
  const monthsRunway = monthlyBurn > 0 ? (currentCash / monthlyBurn).toFixed(1) : '12+'

  // Chart Data preparation (group by date)
  const chartData = useMemo(() => {
    const grouped = {}
    entries.forEach(e => {
      if (e.type === 'Custom KPI') return // don't plot custom KPIs on the rev/exp chart
      if (!grouped[e.date]) {
        grouped[e.date] = { date: e.date, Revenue: 0, Expense: 0 }
      }
      grouped[e.date][e.type] += e.amount
    })
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [entries])

  return (
    <div className="financials-page fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1>Financials & Manual Entry</h1>
        <p>Log revenue, expenses, and custom KPIs manually to fuel your analytics.</p>
      </div>

      <div className="financials-grid">
        {/* Left Column: Form and Table */}
        <div className="fin-col">
          <div className="card">
            <h2 className="card-title">Add New Entry</h2>
            <form onSubmit={handleAddEntry} className="fin-form">
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                  <option value="Custom KPI">Custom KPI</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category / Metric Name</label>
                <input type="text" className="form-input" placeholder="e.g. Sales, Marketing, Signups" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Amount / Value</label>
                <input type="number" className="form-input" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              </div>
              <div className="form-group fin-full-width">
                <label>Notes (Optional)</label>
                <input type="text" className="form-input" placeholder="Any additional context..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="fin-full-width" style={{ marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
                  + Log Entry
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: '24px', flex: 1 }}>
            <h2 className="card-title">Recent Entries</h2>
            <div className="fin-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>
                        <span className={`badge ${entry.type === 'Revenue' ? 'badge-up' : entry.type === 'Expense' ? 'badge-down' : 'badge-neutral'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td>{entry.category}</td>
                      <td style={{ fontWeight: 'bold' }}>
                        {entry.type !== 'Custom KPI' ? '₹' : ''}{entry.amount.toLocaleString()}
                      </td>
                      <td>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => removeEntry(entry.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>No entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Summaries and Chart */}
        <div className="fin-col">
          <div className="fin-summary-grid">
            <div className="card stat-card">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value" style={{ color: '#10b981' }}>₹{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-title">Total Expenses</div>
              <div className="stat-value" style={{ color: '#ef4444' }}>₹{totalExpense.toLocaleString()}</div>
            </div>
            <div className="card stat-card fin-full-width" style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}>
              <div className="stat-title" style={{ color: 'rgba(255,255,255,0.8)' }}>Net Profit</div>
              <div className="stat-value">₹{netProfit.toLocaleString()}</div>
            </div>
          </div>

          {/* Budget vs Actuals */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Budget vs. Actuals</h3>
              <span style={{ fontWeight: 'bold', color: isOverBudget ? '#ef4444' : 'var(--text)' }}>₹{totalExpense.toLocaleString()} / ₹{budget.toLocaleString()}</span>
            </div>
            <div style={{ background: 'var(--bg2)', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${budgetPercent}%`, background: isOverBudget ? '#ef4444' : '#10b981', height: '100%', transition: 'width 0.5s' }} />
            </div>
            {isOverBudget ? (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>⚠️ You have exceeded your monthly budget.</p>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>You have {100 - budgetPercent}% of your budget remaining.</p>
            )}
          </div>

          {/* AI Cash Flow Forecasting */}
          <div className="card" style={{ marginTop: '24px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, marginBottom: '8px' }}>
              ✨ AI Cash Flow Forecast
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Based on your current burn rate of <strong>₹{monthlyBurn.toLocaleString()}</strong>, you have <strong>{monthsRunway} months</strong> of runway remaining.
            </p>
            {monthsRunway < 6 && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                ⚠️ Warning: You will run out of cash in roughly {monthsRunway} months. Consider reducing marketing spend by 15%.
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h2 className="card-title">Cash Flow Trends</h2>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={12} tickMargin={10} />
                  <YAxis stroke="var(--text-dim)" fontSize={12} tickFormatter={val => `₹${val/1000}k`} width={60} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--text)' }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[4,4,0,0]} barSize={30} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4,4,0,0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Annotations */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Chart Annotations 📌</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {entries.filter(e => e.notes).slice(0,3).map(e => (
                  <li key={e.id} style={{ fontSize: '0.85rem', background: 'var(--bg2)', padding: '8px 12px', borderRadius: '6px', borderLeft: `3px solid ${e.type === 'Revenue' ? '#10b981' : e.type === 'Expense' ? '#ef4444' : '#6366f1'}` }}>
                    <strong>{e.date}:</strong> {e.notes}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
