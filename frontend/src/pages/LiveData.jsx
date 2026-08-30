import { useState, useEffect } from 'react'
import { liveAPI } from '../services/api'
import './LiveData.css'

export default function LiveData() {
  const [crypto, setCrypto] = useState([])
  const [stocks, setStocks] = useState([])
  const [exchange, setExchange] = useState(null)
  const [weather, setWeather] = useState(null)
  const [news, setNews] = useState([])
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forecasting, setForecasting] = useState(false)

  const [cryptoInput, setCryptoInput] = useState('BTC, ETH, SOL')
  const [stocksInput, setStocksInput] = useState('AAPL, TSLA, MSFT')

  const fetchData = async () => {
    try {
      const [c, s, e, w, n] = await Promise.all([
        liveAPI.getCrypto(cryptoInput),
        liveAPI.getStocks(stocksInput),
        liveAPI.getExchange(),
        liveAPI.getWeather(),
        liveAPI.getNews()
      ])
      setCrypto(c)
      setStocks(s)
      setExchange(e)
      setWeather(w)
      setNews(n)
    } catch (err) {
      console.error('Failed to fetch live data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // Remove interval so inputs don't feel glitchy on auto-refresh

  const handlePredict = async () => {
    setForecasting(true)
    const f = await liveAPI.getForecast(cryptoInput, stocksInput, news[0]?.title || '')
    setForecast(f)
    setForecasting(false)
  }

  if (loading) return <div className="spinner"></div>

  return (
    <div className="live-page">
      <div className="page-header">
        <h1>Live Data Feeds</h1>
        <p>Live streams from Crypto, Exchange Rates, Weather, and News integrated with internal metrics</p>
      </div>

      {/* Asset Selection & Forecast */}
      <div className="card" style={{ marginBottom: 24, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px', gap: '16px' }}>
          <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Configure Monitored Assets
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={fetchData}
              style={{ padding: '8px 16px', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🔄 Sync
            </button>
            <button 
              onClick={handlePredict}
              disabled={forecasting || news.length === 0}
              className="btn btn-primary"
              style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: forecasting ? 'wait' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {forecasting ? '✨ Forecasting...' : '✨ AI Forecast'}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 500 }}>
              Cryptocurrencies (Comma Separated)
            </label>
            <input 
              type="text" 
              value={cryptoInput}
              onChange={(e) => setCryptoInput(e.target.value)}
              placeholder="e.g. BTC, ETH, SOL"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text)', fontSize: '0.95rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 500 }}>
              Stock Equities (Comma Separated)
            </label>
            <input 
              type="text" 
              value={stocksInput}
              onChange={(e) => setStocksInput(e.target.value)}
              placeholder="e.g. AAPL, TSLA, MSFT"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text)', fontSize: '0.95rem' }}
            />
          </div>
        </div>
      </div>

      {forecast && (
        <div className="card" style={{ marginBottom: 24, padding: '20px', background: forecast.sentiment === 'bullish' ? 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' : 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)', borderLeft: `4px solid ${forecast.sentiment === 'bullish' ? '#10b981' : '#ef4444'}` }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            🤖 AI Forecast: {forecast.sentiment.toUpperCase()} 
            <span style={{ fontSize: '0.8rem', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-dim)', fontWeight: 'normal' }}>
              Confidence: {forecast.confidence}%
            </span>
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.6 }}>{forecast.narrative}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '12px' }}>Generated based on live pricing and breaking news.</p>
        </div>
      )}

      {/* Tickers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Crypto Ticker */}
        <div className="crypto-ticker">
          <div className="ticker-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" style={{ display: 'inline-block' }}></span> 
            <span>Live Crypto Markets</span>
          </div>
          <div className="ticker-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {crypto.map(coin => (
              <div key={coin.symbol} className="crypto-card" style={{ minWidth: '140px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="crypto-top" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {coin.image && <img src={coin.image} alt={coin.symbol} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                  <span className="crypto-sym" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text)' }}>{coin.symbol}</span>
                </div>
                <div className="crypto-price" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>${coin.current_price.toLocaleString()}</div>
                <div className={`crypto-change ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: coin.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444' }}>
                  {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            ))}
            {crypto.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-dim)' }}>No crypto selected.</p>}
          </div>
        </div>

        {/* Stocks Ticker */}
        <div className="crypto-ticker">
          <div className="ticker-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" style={{ display: 'inline-block', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></span> 
            <span>Live Stock Equities</span>
          </div>
          <div className="ticker-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {stocks.map(stock => (
              <div key={stock.symbol} className="crypto-card" style={{ minWidth: '140px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="crypto-top" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="crypto-sym" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)' }}>{stock.symbol}</span>
                </div>
                <div className="crypto-price" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>${stock.current_price.toLocaleString()}</div>
                <div className={`crypto-change ${stock.price_change_percentage_24h >= 0 ? 'up' : 'down'}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: stock.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444' }}>
                  {stock.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(stock.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            ))}
            {stocks.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-dim)' }}>No stocks selected.</p>}
          </div>
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
