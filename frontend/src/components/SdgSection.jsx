import './SdgSection.css'

const SDG_GOALS = [
  {
    id: 8,
    icon: '🌍',
    title: 'SDG 8 — Decent Work & Economic Growth',
    description: 'Drives productivity by delivering actionable insights and identifying growth opportunities.'
  },
  {
    id: 9,
    icon: '⚙️',
    title: 'SDG 9 — Industry, Innovation & Infrastructure',
    description: 'Upgrades enterprise capabilities through AI-powered analytics and offline-resilient infrastructure.'
  },
  {
    id: 12,
    icon: '♻️',
    title: 'SDG 12 — Responsible Consumption & Production',
    description: 'Predictive analytics optimize resource allocation, forecast demand, and reduce operational waste.'
  }
]

export default function SdgSection() {
  return (
    <section className="sdg-section card">
      <div className="sdg-section-header">
        <h3 className="card-title">Aligning with Global Goals</h3>
        <p className="card-subtitle">
          BizInsight supports UN Sustainable Development Goals that matter most to modern enterprises.
        </p>
      </div>
      <div className="sdg-grid">
        {SDG_GOALS.map(goal => (
          <div key={goal.id} className="sdg-card">
            <div className="sdg-icon">{goal.icon}</div>
            <div className="sdg-title">{goal.title}</div>
            <p className="sdg-desc">{goal.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
