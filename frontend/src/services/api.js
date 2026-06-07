import axios from 'axios'

const BASE = 'http://localhost:5000'

const api = axios.create({ baseURL: BASE, timeout: 8000 })

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getMetrics: () => api.get('/api/analytics').then(r => r.data),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDetailed: () => api.get('/api/analytics/detailed').then(r => r.data),
}

// ── Sentiment ─────────────────────────────────────────────────────────────────
export const sentimentAPI = {
  getData: () => api.get('/api/sentiment').then(r => r.data),
}

// ── Competitor ────────────────────────────────────────────────────────────────
export const competitorAPI = {
  getData: () => api.get('/api/competitor').then(r => r.data),
}

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictionsAPI = {
  getData: () => api.get('/api/predictions').then(r => r.data),
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsAPI = {
  getData: () => api.get('/api/settings').then(r => r.data),
}

// ── Live / External APIs ──────────────────────────────────────────────────────
export const liveAPI = {
  getCrypto:   () => api.get('/api/live/crypto').then(r => r.data),
  getExchange: () => api.get('/api/live/exchange').then(r => r.data),
  getWeather:  () => api.get('/api/live/weather').then(r => r.data),
  getNews:     () => api.get('/api/live/news').then(r => r.data),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:     () => api.get('/api/admin/stats').then(r => r.data),
  getUsers:     () => api.get('/api/admin/users').then(r => r.data),
  createUser:   (data) => api.post('/api/admin/users', data).then(r => r.data),
  deleteUser:   (id) => api.delete(`/api/admin/users/${id}`).then(r => r.data),
  updateUser:   (id, data) => api.put(`/api/admin/users/${id}`, data).then(r => r.data),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsAPI = {
  getData: () => api.get('/api/reports').then(r => r.data),
}

export default api
