import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import './BizBot.css'

export default function BizBot() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi Shijo! I am BizBot. How can I help you analyze your business data today?', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => scrollToBottom(), [messages, isTyping])

  // Listen for custom event from global search
  useEffect(() => {
    const handleOpenBot = (e) => {
      setOpen(true)
      if (e.detail?.query) {
        handleUserMessage(e.detail.query)
      }
    }
    window.addEventListener('open-bizbot', handleOpenBot)
    return () => window.removeEventListener('open-bizbot', handleOpenBot)
  }, [])

  const handleUserMessage = async (msgText) => {
    const text = (msgText || input).trim()
    if (!text) return
    
    setInput('')
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    
    const newMsg = { id: Date.now(), sender: 'user', text, time }
    setMessages(prev => [...prev, newMsg])
    setIsTyping(true)

    // Simulate AI processing & rules
    setTimeout(async () => {
      const lower = text.toLowerCase()
      let reply = "I'm sorry, I don't have the data for that right now. Try asking about revenue, sentiment, or predictions."
      
      try {
        if (lower.includes('revenue') || lower.includes('sales')) {
          const data = await dashboardAPI.getMetrics()
          reply = `Your total revenue is currently **$${data.metrics.totalRevenue.toLocaleString()}**. That's a strong indicator!`
        } else if (lower.includes('sentiment') || lower.includes('feedback')) {
          reply = "Your overall sentiment score is 4.8/5. 'Pricing' and 'Support' are the top topics right now. Want me to open the Sentiment page?"
          // We can optionally add an action button in the text, but simple text works for demo
        } else if (lower.includes('predict') || lower.includes('forecast')) {
          reply = "Our AI forecasts next month's revenue to be around $94,800. I can show you the full breakdown on the Predictions page."
        } else if (lower.includes('sdg') || lower.includes('sustainabl')) {
          reply = "BizInsight aligns with SDG 8 (Economic Growth), SDG 9 (Innovation), and SDG 12 (Responsible Consumption). We optimize resources and promote growth."
        } else if (lower.includes('competitor') || lower.includes('market share')) {
          reply = "You currently hold 18% market share, trailing DataPulse at 31%. Your sentiment score is significantly higher, though!"
        } else if (lower.includes('navigate') || lower.includes('go to')) {
          if (lower.includes('prediction')) navigate('/predictions')
          if (lower.includes('sentiment')) navigate('/sentiment')
          if (lower.includes('dashboard')) navigate('/dashboard')
          reply = "Navigating there now!"
        }
      } catch (err) {
        reply = "I had trouble fetching that data. Please try again."
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
      }])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleUserMessage()
  }

  return (
    <div className="bizbot-wrapper">
      <div className={`bizbot-panel ${open ? 'open' : ''}`}>
        <div className="bizbot-header">
          <div className="bizbot-header-left">
            <div className="bizbot-avatar">🤖</div>
            <div className="bizbot-title">
              <strong>BizBot AI</strong>
              <span>Online</span>
            </div>
          </div>
          <button className="bizbot-close" onClick={() => setOpen(false)}>&times;</button>
        </div>

        <div className="bizbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`msg-row ${msg.sender}`}>
              <div className="msg-bubble">
                {msg.text}
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="msg-row bot">
              <div className="msg-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bizbot-quick-actions">
          <button className="quick-chip" onClick={() => handleUserMessage("What is my revenue?")}>📊 Revenue</button>
          <button className="quick-chip" onClick={() => handleUserMessage("Show me sentiment")}>💬 Sentiment</button>
          <button className="quick-chip" onClick={() => handleUserMessage("What are the predictions?")}>🔮 Predict</button>
          <button className="quick-chip" onClick={() => handleUserMessage("Tell me about SDG goals")}>🌱 SDGs</button>
        </div>

        <div className="bizbot-input-area">
          <input
            type="text"
            className="bizbot-input"
            placeholder="Ask BizBot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="bizbot-send" onClick={() => handleUserMessage()} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>

      <button className={`bizbot-btn ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Open AI Assistant">
        <div className="bizbot-pulse"></div>
        <div className="bizbot-pulse"></div>
        🤖
      </button>
    </div>
  )
}
