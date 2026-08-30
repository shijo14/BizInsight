import { useState, useEffect } from 'react'
import './OfflineBanner.css'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOffline = () => setOffline(true)

    const handleOnline = () => {
      setOffline(false)
      setSyncing(true)
      setTimeout(() => setSyncing(false), 2800)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (syncing) {
    return (
      <div className="offline-banner syncing" role="status">
        <span className="offline-banner-icon">🔄</span>
        <span>Connectivity restored — syncing cached data with live sources…</span>
      </div>
    )
  }

  if (!offline) return null

  return (
    <div className="offline-banner offline" role="status">
      <span className="offline-banner-icon">📡</span>
      <span>
        <strong>Offline-first mode.</strong> Dashboards and historical data remain available via cached Service Worker data.
      </span>
    </div>
  )
}
