import { useEffect, useState } from 'react'
import './EpicLogo.css'

export default function EpicLogo({ animate = false, size = 'md', onClick }) {
  const [introDone, setIntroDone] = useState(!animate)

  useEffect(() => {
    if (animate) {
      // The cinematic intro lasts about 4.5 seconds
      const timer = setTimeout(() => {
        setIntroDone(true)
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [animate])

  // Array of colors for the spectrum ribbon effect
  const ribbonColors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
  ]

  return (
    <div
      className={`epic-logo epic-logo--${size} ${animate ? 'is-animating' : ''} ${introDone ? 'intro-done' : ''}`}
      onClick={onClick}
      role="img"
      aria-label="BizInsight"
    >
      {/* ─────────────────────────────────────────────────────────────────
          PHASE 1 & 2: THE CINEMATIC "NETFLIX" INTRO 
          (Only renders if animate=true and intro is not yet done)
      ────────────────────────────────────────────────────────────────── */}
      {animate && !introDone && (
        <div className="epic-intro-overlay">
          
          {/* 1. The initial "Stamp" (The B Hexagon hitting the screen) */}
          <div className="intro-stamp">
            <svg viewBox="0 0 100 100" className="intro-stamp-svg">
              <defs>
                <linearGradient id="stampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="stampGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="url(#stampGrad)" strokeWidth="8" filter="url(#stampGlow)"/>
              <text x="50" y="68" fill="url(#stampGrad)" fontSize="52" fontWeight="900" fontFamily="Space Grotesk" textAnchor="middle" filter="url(#stampGlow)">B</text>
            </svg>
          </div>

          {/* 2. The "Ribbon / Spectrum" explosion */}
          <div className="intro-spectrum">
            {/* Generate 50 vertical lines for the barcode light effect */}
            {[...Array(50)].map((_, i) => {
              const color = ribbonColors[i % ribbonColors.length]
              // Randomize height and delay slightly for organic feel
              const height = 40 + Math.random() * 60
              const delay = (Math.random() * 0.2).toFixed(2)
              return (
                <div 
                  key={i} 
                  className="spectrum-line" 
                  style={{
                    '--color': color,
                    '--h': `${height}vh`,
                    '--i': i,
                    '--d': `${delay}s`
                  }}
                />
              )
            })}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          PHASE 3: THE RESTING LOGO
          (Hidden initially if animating, fades in at the end)
      ────────────────────────────────────────────────────────────────── */}
      <div className="epic-resting-container">
        
        <div className="epic-logo__mark">
          <svg className="epic-logo__svg" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="elGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {/* Hexagon Body */}
            <polygon className="epic-logo__hex-bg" points="32,2 60,17 60,55 32,70 4,55 4,17" fill="url(#elGradMain)" />
            {/* Inner Details (Data Bars) */}
            <g className="epic-logo__bars">
              <rect x="16" y="38" width="6" height="14" rx="2" fill="rgba(255,255,255,0.7)" />
              <rect x="24" y="30" width="6" height="22" rx="2" fill="rgba(255,255,255,0.85)" />
              <rect x="32" y="22" width="6" height="30" rx="2" fill="white" />
              <rect x="40" y="28" width="6" height="24" rx="2" fill="rgba(255,255,255,0.85)" />
            </g>
          </svg>
        </div>

        <div className="epic-logo__wordmark">
          <span className="epic-logo__biz">Biz</span>
          <span className="epic-logo__insight">Insight</span>
        </div>

      </div>
    </div>
  )
}
