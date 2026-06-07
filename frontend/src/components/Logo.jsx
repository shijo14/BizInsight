import './Logo.css'

export default function Logo({ size = '', onClick }) {
  return (
    <div className={`bizlogo ${size}`} onClick={onClick} role="img" aria-label="BizInsight">
      <div className="bizlogo-hex-wrap">
        <svg className="bizlogo-hex" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#6366f1" />
              <stop offset="50%"  stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="hexGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Outer hexagon */}
          <polygon className="hex-bg" points="20,2 37,11.5 37,34.5 20,44 3,34.5 3,11.5" />
          {/* Inner hexagon */}
          <polygon className="hex-inner" points="20,8 32,15 32,31 20,38 8,31 8,15" />
          {/* Spark dot */}
          <circle className="hex-spark" cx="20" cy="23" r="4" />
          {/* B letter */}
          <text x="13" y="29" fill="white" fontSize="16" fontWeight="900" fontFamily="Space Grotesk, sans-serif">B</text>
        </svg>
      </div>
      <div className="bizlogo-text">
        <span className="bizlogo-biz">Biz</span>
        <span className="bizlogo-insight">Insight</span>
      </div>
    </div>
  )
}
