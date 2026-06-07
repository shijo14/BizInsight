import { useState, useEffect } from 'react'
import { liveAPI } from '../services/api'
import './LiveData.css'

export default function LiveData() {
  const [crypto, setCrypto] = useState([])
  const [exchange, setExchange] = useState(null)
  const [weather, setWeather] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, e, w, n] = await Promise.all([
          liveAPI.getCrypto(),
          liveAPI.getExchange(),
          liveAPI.getWeather(),
          liveAPI.getNews()
        ])
        setCrypto(c)
        setExchange(e)
        setWeather(w)
        setNews(n)
      } catch (err) {
        console.error('Failed to fetch live data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="spinner"></div>

  return (
    <div className="live-page">
      <div className="page-header">
        <h1>Live Data Center</h1>
        <p>Real-time external API streams (Crypto, Forex, Weather, News)</p>
      </div>

      {/* Crypto Ticker (CoinGecko) */}
      <div className="crypto-ticker">
        <div className="ticker-header">
          <span className="live-dot"></span> Live Crypto Markets
        </div>
        <div className="ticker-scroll">
          {crypto.map(coin => (
            <div key={coin.id} className="crypto-card">
              <div className="crypto-top">
                <img src={coin.image} alt={coin.symbol} className="crypto-icon" />
                <span className="crypto-sym">{coin.symbol}</span>
              </div>
              <div className="crypto-price">${coin.current_price.toLocaleString()}</div>
              <div className={`crypto-change ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="live-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Weather Widget (Open-Meteo) */}
          {weather && (
            <div className="weather-widget">
              <div className="weather-info">
                <h3>{weather.location}</h3>
                <p>{weather.description} • Wind: {weather.windspeed} km/h</p>
              </div>
              <div className="weather-temp">{weather.temperature}{weather.unit}</div>
            </div>
          )}

          {/* Exchange Rates (ExchangeRate-API) */}
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Forex Exchange Rates (Base: USD)</h3>
            {exchange && (
              <table className="exchange-table">
                <thead>
                  <tr><th>Currency</th><th>Rate</th></tr>
                </thead>
                <tbody>
                  {Object.entries(exchange.rates).slice(0, 5).map(([cur, rate]) => (
                    <tr key={cur}>
                      <td><strong>{cur}</strong></td>
                      <td>{rate.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '12px' }}>
              Last updated: {exchange?.updated}
            </p>
          </div>
        </div>

        {/* Business News (RSS) */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Top Business News</h3>
          <div className="news-feed">
            {news.map((item, idx) => (
              <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="news-item">
                <strong>{item.title}</strong>
                <div className="news-meta">
                  <span>{item.source}</span>
                  <span>{new Date(item.pubDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
