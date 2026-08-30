import { useState, useRef, useEffect } from 'react'
import { dashboardAPI, predictionsAPI, sentimentAPI } from '../services/api'
import './Chatbot.css'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am BizInsight AI. Ask me about your revenue, predictions, sentiment, or live data.' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  // Voice Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  if (recognition) {
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Small timeout to allow state to update before sending
      setTimeout(() => {
        document.getElementById('chatbot-send-btn')?.click()
      }, 100)
    }
  }

  const toggleVoice = () => {
    if (!recognition) return alert("Voice recognition is not supported in this browser.")
    isListening ? recognition.stop() : recognition.start()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    // Simulate network delay and "thinking"
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600))

    let aiResponse = ''
    const lowerQ = userMsg.toLowerCase()

    try {
      if (lowerQ.includes('revenue') || lowerQ.includes('sales')) {
        const metricsData = await dashboardAPI.getMetrics()
        const rev = metricsData.metrics.totalRevenue
        aiResponse = `Your total revenue is currently **₹${rev.toLocaleString('en-IN')}**. This represents a solid upward trend. Anything else you'd like to see?`
      } 
      else if (lowerQ.includes('predict') || lowerQ.includes('forecast') || lowerQ.includes('future')) {
        const predData = await predictionsAPI.getData()
        const nextMonth = predData.summary.revenueNext30
        aiResponse = `Based on my ML models, your projected revenue for the next 30 days is **₹${nextMonth.toLocaleString('en-IN')}** with a ${predData.summary.confidence}% confidence interval.`
      }
      else if (lowerQ.includes('sentiment') || lowerQ.includes('review') || lowerQ.includes('customer')) {
        const sentData = await sentimentAPI.getData()
        aiResponse = `Your overall customer sentiment is **${sentData.overall.score}/5** (${sentData.overall.label}). We analyzed ${sentData.overall.totalReviews} reviews to determine this.`
      }
      else if (lowerQ.includes('churn') || lowerQ.includes('risk')) {
        const predData = await predictionsAPI.getData()
        aiResponse = `Your overall churn risk is currently **${predData.summary.churnPct}%** (${predData.summary.churnRisk} risk). The 'Starter' and 'Trial' segments show the highest vulnerability right now.`
      }
      else if (lowerQ.includes('hello') || lowerQ.includes('hi ') || lowerQ.includes('hey')) {
        aiResponse = "Hello! I'm here to help you analyze your business data. Try asking 'What is my revenue?' or 'Show me churn risk'."
      }
      else {
        aiResponse = "I'm not quite sure how to answer that yet. I'm currently optimized to answer questions about **revenue, predictions, sentiment, and churn**. Try asking about one of those!"
      }
    } catch (e) {
      aiResponse = "Sorry, I couldn't access the data right now. Please check your connection or try again."
    }

    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Ask AI Assistant"
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🤖</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>BizInsight AI</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}></span>
                  Online
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
                <div className="chat-bubble">
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: msg.role === 'ai' ? 'var(--text)' : '#fff' }}>{part}</strong> : part)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-bubble-wrapper ai">
                <div className="chat-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <button 
              className={`chatbot-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoice}
              title={isListening ? "Listening..." : "Voice input"}
            >
              🎙️
            </button>
            <input 
              type="text" 
              placeholder={isListening ? "Listening..." : "Ask about revenue, sentiment..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <button id="chatbot-send-btn" onClick={handleSend} disabled={!input.trim() || isTyping}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
