import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => { res.redirect('http://localhost:5173'); });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BizInsight API is running', timestamp: new Date().toISOString() });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  res.json({
    metrics: {
      totalRevenue: 84392,
      activeUsers: 1204,
      sentimentScore: 4.8,
      uptime: 99.9
    }
  });
});

// ─── Sentiment Analysis ───────────────────────────────────────────────────────
app.get('/api/sentiment', (req, res) => {
  res.json({
    overall: { score: 4.2, label: 'Positive', totalReviews: 3847, change: +0.3 },
    breakdown: [
      { label: 'Positive', pct: 68, count: 2616, color: '#10b981' },
      { label: 'Neutral',  pct: 22, count: 847,  color: '#6366f1' },
      { label: 'Negative', pct: 10, count: 384,  color: '#ef4444' }
    ],
    trend: [
      { month: 'Jan', positive: 62, neutral: 24, negative: 14, score: 3.8 },
      { month: 'Feb', positive: 60, neutral: 26, negative: 14, score: 3.7 },
      { month: 'Mar', positive: 65, neutral: 22, negative: 13, score: 4.0 },
      { month: 'Apr', positive: 67, neutral: 21, negative: 12, score: 4.1 },
      { month: 'May', positive: 66, neutral: 23, negative: 11, score: 4.1 },
      { month: 'Jun', positive: 69, neutral: 21, negative: 10, score: 4.3 },
      { month: 'Jul', positive: 68, neutral: 22, negative: 10, score: 4.2 }
    ],
    categories: [
      { name: 'Product Quality',   score: 4.6, reviews: 1204 },
      { name: 'Customer Support',  score: 3.9, reviews: 876  },
      { name: 'Pricing',           score: 3.7, reviews: 654  },
      { name: 'Ease of Use',       score: 4.5, reviews: 543  },
      { name: 'Delivery Speed',    score: 4.1, reviews: 378  },
      { name: 'Overall Value',     score: 4.3, reviews: 192  }
    ],
    keywords: [
      { word: 'excellent',  count: 412, sentiment: 'positive' },
      { word: 'fast',       count: 381, sentiment: 'positive' },
      { word: 'reliable',   count: 294, sentiment: 'positive' },
      { word: 'easy',       count: 261, sentiment: 'positive' },
      { word: 'helpful',    count: 218, sentiment: 'positive' },
      { word: 'slow',       count: 154, sentiment: 'negative' },
      { word: 'expensive',  count: 132, sentiment: 'negative' },
      { word: 'confusing',  count: 98,  sentiment: 'negative' },
      { word: 'okay',       count: 201, sentiment: 'neutral'  },
      { word: 'average',    count: 178, sentiment: 'neutral'  }
    ],
    recentReviews: [
      { id: 1, author: 'Sarah M.',  avatar: 'SM', rating: 5, sentiment: 'positive', text: 'Absolutely love the platform. The analytics are incredibly insightful and have helped us grow 30% this quarter.', date: '2 hours ago',  source: 'Google'     },
      { id: 2, author: 'James K.',  avatar: 'JK', rating: 4, sentiment: 'positive', text: 'Great product overall. The dashboard is clean and the predictions are surprisingly accurate.',                   date: '5 hours ago',  source: 'Trustpilot' },
      { id: 3, author: 'Priya L.',  avatar: 'PL', rating: 2, sentiment: 'negative', text: 'Support response time is too slow. Had an issue for 3 days before it was resolved. Needs improvement.',           date: '1 day ago',    source: 'G2'         },
      { id: 4, author: 'Tom R.',    avatar: 'TR', rating: 3, sentiment: 'neutral',  text: 'Decent tool. Does what it says. Would be better with more integration options.',                                    date: '2 days ago',   source: 'Capterra'   },
      { id: 5, author: 'Nina W.',   avatar: 'NW', rating: 5, sentiment: 'positive', text: 'BizInsight transformed how we approach customer data. Sentiment analysis is spot on!',                             date: '3 days ago',   source: 'Google'     },
      { id: 6, author: 'Carlos D.', avatar: 'CD', rating: 4, sentiment: 'positive', text: 'Easy to set up and use. The competitor analysis module is worth the price alone.',                                  date: '4 days ago',   source: 'Trustpilot' }
    ]
  });
});

// ─── Analytics Detailed ────────────────────────────────────────────────────────
app.get('/api/analytics/detailed', (req, res) => {
  res.json({
    kpis: [
      { label: 'Total Revenue',     value: '$84,392', change: +12.5, icon: '💵' },
      { label: 'Monthly Recurring', value: '$12,340', change: +8.1,  icon: '🔄' },
      { label: 'Conversion Rate',   value: '3.24%',   change: +0.6,  icon: '🎯' },
      { label: 'Avg Session',       value: '4m 38s',  change: -5.2,  icon: '⏱️' },
      { label: 'Bounce Rate',       value: '38.4%',   change: -2.1,  icon: '↩️' },
      { label: 'Customer LTV',      value: '$1,284',  change: +19.3, icon: '⭐' }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 54200, expenses: 31000, profit: 23200 },
      { month: 'Feb', revenue: 61800, expenses: 33500, profit: 28300 },
      { month: 'Mar', revenue: 58400, expenses: 30200, profit: 28200 },
      { month: 'Apr', revenue: 67300, expenses: 35400, profit: 31900 },
      { month: 'May', revenue: 72100, expenses: 37800, profit: 34300 },
      { month: 'Jun', revenue: 78900, expenses: 39200, profit: 39700 },
      { month: 'Jul', revenue: 84392, expenses: 41000, profit: 43392 }
    ],
    trafficSources: [
      { name: 'Organic Search', value: 38, color: '#6366f1' },
      { name: 'Direct',         value: 24, color: '#10b981' },
      { name: 'Social Media',   value: 18, color: '#f59e0b' },
      { name: 'Referral',       value: 12, color: '#06b6d4' },
      { name: 'Email',          value: 8,  color: '#ec4899' }
    ],
    funnelStages: [
      { stage: 'Visitors',   count: 48320, pct: 100  },
      { stage: 'Leads',      count: 12840, pct: 26.6 },
      { stage: 'Prospects',  count: 5124,  pct: 10.6 },
      { stage: 'Qualified',  count: 2307,  pct: 4.8  },
      { stage: 'Customers',  count: 1204,  pct: 2.5  }
    ],
    topPages: [
      { page: '/dashboard',    sessions: 12430, bounce: '28%', avgTime: '5:12' },
      { page: '/pricing',      sessions: 9870,  bounce: '45%', avgTime: '2:48' },
      { page: '/features',     sessions: 8210,  bounce: '32%', avgTime: '4:01' },
      { page: '/sentiment',    sessions: 6540,  bounce: '19%', avgTime: '6:33' },
      { page: '/integrations', sessions: 5320,  bounce: '38%', avgTime: '3:15' }
    ]
  });
});

// ─── Competitor Analysis ───────────────────────────────────────────────────────
app.get('/api/competitor', (req, res) => {
  res.json({
    competitors: [
      { name: 'BizInsight',   color: '#6366f1', isUs: true,  marketShare: 18, revenue: 84392,  growth: 12.5, nps: 72, pricing: '$99/mo',  rating: 4.8, users: 1204, radar: { analytics: 92, sentiment: 95, predictions: 88, support: 78, pricing: 70, integrations: 82 } },
      { name: 'DataPulse',    color: '#10b981', isUs: false, marketShare: 31, revenue: 142000, growth: 6.2,  nps: 58, pricing: '$149/mo', rating: 4.1, users: 3820, radar: { analytics: 88, sentiment: 72, predictions: 76, support: 80, pricing: 55, integrations: 90 } },
      { name: 'InsightHub',   color: '#f59e0b', isUs: false, marketShare: 24, revenue: 108000, growth: 4.1,  nps: 45, pricing: '$119/mo', rating: 3.8, users: 2910, radar: { analytics: 75, sentiment: 68, predictions: 70, support: 72, pricing: 60, integrations: 78 } },
      { name: 'AnalyticsPro', color: '#ec4899', isUs: false, marketShare: 14, revenue: 61000,  growth: 1.8,  nps: 39, pricing: '$79/mo',  rating: 3.5, users: 1640, radar: { analytics: 70, sentiment: 55, predictions: 60, support: 65, pricing: 80, integrations: 65 } }
    ],
    features: [
      { feature: 'Real-time Analytics',  bizinsight: true,  datapulse: true,  insighthub: true,  analyticspro: false },
      { feature: 'Sentiment Analysis',   bizinsight: true,  datapulse: false, insighthub: true,  analyticspro: false },
      { feature: 'AI Predictions',       bizinsight: true,  datapulse: true,  insighthub: false, analyticspro: false },
      { feature: 'Competitor Tracking',  bizinsight: true,  datapulse: false, insighthub: false, analyticspro: true  },
      { feature: 'Custom Reports',       bizinsight: true,  datapulse: true,  insighthub: true,  analyticspro: true  },
      { feature: 'API Access',           bizinsight: true,  datapulse: true,  insighthub: false, analyticspro: false },
      { feature: 'White Label',          bizinsight: false, datapulse: true,  insighthub: true,  analyticspro: false },
      { feature: 'Multi-workspace',      bizinsight: true,  datapulse: true,  insighthub: false, analyticspro: false }
    ],
    marketTrend: [
      { month: 'Jan', bizinsight: 14, datapulse: 33, insighthub: 26, analyticspro: 15 },
      { month: 'Feb', bizinsight: 15, datapulse: 32, insighthub: 25, analyticspro: 15 },
      { month: 'Mar', bizinsight: 16, datapulse: 32, insighthub: 25, analyticspro: 14 },
      { month: 'Apr', bizinsight: 16, datapulse: 31, insighthub: 25, analyticspro: 15 },
      { month: 'May', bizinsight: 17, datapulse: 31, insighthub: 24, analyticspro: 14 },
      { month: 'Jun', bizinsight: 17, datapulse: 31, insighthub: 24, analyticspro: 14 },
      { month: 'Jul', bizinsight: 18, datapulse: 31, insighthub: 24, analyticspro: 14 }
    ]
  });
});

// ─── AI Predictions ───────────────────────────────────────────────────────────
app.get('/api/predictions', (req, res) => {
  res.json({
    summary: { revenueNext30: 94800, revenueGrowth: 12.3, churnRisk: 'Low', churnPct: 4.2, topOpportunity: 'Enterprise Upsell', confidence: 87 },
    revenueForecast: [
      { month: 'Aug', actual: null, forecast: 91200,  lower: 86000,  upper: 96400  },
      { month: 'Sep', actual: null, forecast: 94800,  lower: 88900,  upper: 100700 },
      { month: 'Oct', actual: null, forecast: 98400,  lower: 91000,  upper: 105800 },
      { month: 'Nov', actual: null, forecast: 105600, lower: 97300,  upper: 113900 },
      { month: 'Dec', actual: null, forecast: 118200, lower: 108000, upper: 128400 },
      { month: 'Jan', actual: null, forecast: 112400, lower: 102000, upper: 122800 }
    ],
    historicalRevenue: [
      { month: 'Jan', actual: 54200 }, { month: 'Feb', actual: 61800 },
      { month: 'Mar', actual: 58400 }, { month: 'Apr', actual: 67300 },
      { month: 'May', actual: 72100 }, { month: 'Jun', actual: 78900 },
      { month: 'Jul', actual: 84392 }
    ],
    churnRisk: [
      { segment: 'Enterprise', risk: 2.1,  count: 34,  color: '#10b981' },
      { segment: 'Mid-Market', risk: 4.8,  count: 127, color: '#f59e0b' },
      { segment: 'Startup',    risk: 8.3,  count: 289, color: '#ef4444' },
      { segment: 'Freelancer', risk: 11.2, count: 412, color: '#ef4444' }
    ],
    growthOpportunities: [
      { opportunity: 'Enterprise Upsell',    potential: '$18,400/mo', probability: 78, icon: '🚀' },
      { opportunity: 'Geographic Expansion', potential: '$12,100/mo', probability: 65, icon: '🌍' },
      { opportunity: 'API Monetization',     potential: '$8,900/mo',  probability: 82, icon: '⚡' },
      { opportunity: 'Referral Program',     potential: '$6,200/mo',  probability: 71, icon: '🤝' }
    ],
    userGrowth: [
      { month: 'Jan', users: 820,  forecast: null }, { month: 'Feb', users: 896,  forecast: null },
      { month: 'Mar', users: 943,  forecast: null }, { month: 'Apr', users: 1021, forecast: null },
      { month: 'May', users: 1098, forecast: null }, { month: 'Jun', users: 1156, forecast: null },
      { month: 'Jul', users: 1204, forecast: null },
      { month: 'Aug', users: null, forecast: 1290 }, { month: 'Sep', users: null, forecast: 1381 },
      { month: 'Oct', users: null, forecast: 1472 }
    ]
  });
});

// ─── Settings ────────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json({
    user: { name: 'Shijo Varghese', email: 'shijo@bizinsight.io', role: 'Super Admin', avatar: 'SV' },
    preferences: { theme: 'dark', notifications: true, weeklyReport: true, timezone: 'Asia/Kolkata' }
  });
});

// ─── Live: Crypto (CoinGecko) ────────────────────────────────────────────────
app.get('/api/live/crypto', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false',
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error('CoinGecko fetch failed');
    const data = await response.json();
    res.json(data);
  } catch (e) {
    // Fallback mock data
    res.json([
      { id: 'bitcoin',   symbol: 'btc',  name: 'Bitcoin',   current_price: 67420,  price_change_percentage_24h: 2.1,  market_cap: 1320000000000, image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum',  symbol: 'eth',  name: 'Ethereum',  current_price: 3580,   price_change_percentage_24h: 3.4,  market_cap: 430000000000,  image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'binancecoin', symbol: 'bnb', name: 'BNB',      current_price: 412,    price_change_percentage_24h: -0.8, market_cap: 63000000000,   image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'solana',    symbol: 'sol',  name: 'Solana',    current_price: 178,    price_change_percentage_24h: 5.2,  market_cap: 82000000000,   image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'ripple',    symbol: 'xrp',  name: 'XRP',       current_price: 0.62,   price_change_percentage_24h: 1.3,  market_cap: 35000000000,   image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
      { id: 'cardano',   symbol: 'ada',  name: 'Cardano',   current_price: 0.48,   price_change_percentage_24h: -1.2, market_cap: 17000000000,   image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png' },
      { id: 'dogecoin',  symbol: 'doge', name: 'Dogecoin',  current_price: 0.165,  price_change_percentage_24h: 4.7,  market_cap: 23000000000,   image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png' },
      { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 38.2, price_change_percentage_24h: 2.9, market_cap: 16000000000,   image: 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
      { id: 'polkadot',  symbol: 'dot',  name: 'Polkadot',  current_price: 8.74,   price_change_percentage_24h: -2.1, market_cap: 12000000000,   image: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png' },
      { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 14.8,   price_change_percentage_24h: 3.6,  market_cap: 9000000000,    image: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png' }
    ]);
  }
});

// ─── Live: Exchange Rates ─────────────────────────────────────────────────────
app.get('/api/live/exchange', async (req, res) => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Exchange fetch failed');
    const data = await response.json();
    const rates = {};
    ['EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'CHF', 'CNY'].forEach(c => {
      if (data.rates[c]) rates[c] = data.rates[c];
    });
    res.json({ base: 'USD', rates, updated: data.time_last_update_utc });
  } catch (e) {
    res.json({
      base: 'USD',
      rates: { EUR: 0.921, GBP: 0.789, INR: 83.42, JPY: 149.8, CAD: 1.362, AUD: 1.531, SGD: 1.341, AED: 3.672, CHF: 0.896, CNY: 7.241 },
      updated: new Date().toUTCString()
    });
  }
});

// ─── Live: Weather (Open-Meteo — no key needed) ───────────────────────────────
app.get('/api/live/weather', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=9.9312&longitude=76.2673&current=temperature_2m,windspeed_10m,weathercode&timezone=Asia%2FKolkata'
    );
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();
    const code = data.current.weathercode;
    const weatherDesc = code <= 3 ? 'Clear / Partly Cloudy' : code <= 48 ? 'Foggy' : code <= 67 ? 'Rainy' : code <= 77 ? 'Snowy' : 'Stormy';
    res.json({
      location: 'Kochi, Kerala',
      temperature: data.current.temperature_2m,
      windspeed: data.current.windspeed_10m,
      weathercode: code,
      description: weatherDesc,
      unit: '°C'
    });
  } catch (e) {
    res.json({ location: 'Kochi, Kerala', temperature: 31, windspeed: 14, description: 'Partly Cloudy', unit: '°C' });
  }
});

// ─── Live: Business News (RSS via rss2json) ───────────────────────────────────
app.get('/api/live/news', async (req, res) => {
  try {
    const rssUrl = encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml');
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=6`);
    if (!response.ok) throw new Error('News fetch failed');
    const data = await response.json();
    if (data.status !== 'ok') throw new Error('News parse failed');
    res.json(data.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: 'BBC Business',
      thumbnail: item.thumbnail || null
    })));
  } catch (e) {
    res.json([
      { title: 'AI Investment Surges to Record $200B in 2025',       link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' },
      { title: 'SMEs Adopting Analytics Tools at Record Pace',        link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' },
      { title: 'Global Markets Rally on Strong Tech Earnings',        link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' },
      { title: 'Data-Driven Firms Report 3x Higher Profitability',    link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' },
      { title: 'Sentiment Analysis Becomes Core Business Metric',     link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' },
      { title: 'India SME Sector Posts 18% Growth in Digital Adoption', link: '#', pubDate: new Date().toISOString(), source: 'BizInsight News' }
    ]);
  }
});

// ─── Admin: Users ────────────────────────────────────────────────────────────
let mockUsers = [
  { id: 1, name: 'Shijo Varghese',  email: 'shijo@bizinsight.io',    role: 'Super Admin', status: 'Active',   avatar: 'SV', joined: '2024-01-10', lastActive: '2 min ago' },
  { id: 2, name: 'Anika Sharma',    email: 'anika@bizinsight.io',    role: 'Admin',       status: 'Active',   avatar: 'AS', joined: '2024-02-15', lastActive: '1 hour ago' },
  { id: 3, name: 'Rohan Mehta',     email: 'rohan@bizinsight.io',    role: 'Admin',       status: 'Active',   avatar: 'RM', joined: '2024-03-08', lastActive: '3 hours ago' },
  { id: 4, name: 'Priya Nair',      email: 'priya@bizinsight.io',    role: 'Admin',       status: 'Inactive', avatar: 'PN', joined: '2024-04-22', lastActive: '2 days ago' },
  { id: 5, name: 'David Chen',      email: 'david@bizinsight.io',    role: 'Admin',       status: 'Active',   avatar: 'DC', joined: '2024-05-11', lastActive: '5 hours ago' },
  { id: 6, name: 'Fatima Al-Zahra', email: 'fatima@bizinsight.io',   role: 'Admin',       status: 'Active',   avatar: 'FZ', joined: '2024-06-01', lastActive: 'Just now' }
];

app.get('/api/admin/users', (req, res) => { res.json(mockUsers); });

app.post('/api/admin/users', (req, res) => {
  const { name, email, role } = req.body;
  const newUser = {
    id: Date.now(), name, email, role: role || 'Admin',
    status: 'Active', avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    joined: new Date().toISOString().split('T')[0], lastActive: 'Just now'
  };
  mockUsers.push(newUser);
  res.json(newUser);
});

app.delete('/api/admin/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  mockUsers = mockUsers.filter(u => u.id !== id);
  res.json({ success: true });
});

app.put('/api/admin/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = mockUsers.findIndex(u => u.id === id);
  if (idx !== -1) { mockUsers[idx] = { ...mockUsers[idx], ...req.body }; }
  res.json(mockUsers[idx] || {});
});

// ─── Admin: System Stats ──────────────────────────────────────────────────────
app.get('/api/admin/stats', (req, res) => {
  res.json({
    systemHealth: { cpu: 34, memory: 61, disk: 47, network: 82 },
    apiCalls: { today: 14820, week: 98430, month: 384920, limit: 500000 },
    activeModules: [
      { name: 'Sentiment Analysis', status: 'Running', requests: 4821, errorRate: 0.2 },
      { name: 'Predictive Analytics', status: 'Running', requests: 3204, errorRate: 0.1 },
      { name: 'Competitor Analysis',  status: 'Running', requests: 2891, errorRate: 0.4 },
      { name: 'Data Visualization',   status: 'Running', requests: 6102, errorRate: 0.0 },
      { name: 'Recommendation Engine', status: 'Running', requests: 1948, errorRate: 0.3 }
    ],
    recentActivity: [
      { time: '2 min ago',  event: 'User Anika exported Analytics Report', type: 'export' },
      { time: '8 min ago',  event: 'AI Pipeline completed full run — 99.1% accuracy', type: 'ai' },
      { time: '15 min ago', event: 'Competitor data refreshed from 4 sources', type: 'data' },
      { time: '1 hr ago',   event: 'New user David Chen added by Super Admin', type: 'user' },
      { time: '2 hr ago',   event: 'Sentiment model retrained on 1,240 new reviews', type: 'ai' },
      { time: '4 hr ago',   event: 'System health check passed — all modules nominal', type: 'system' }
    ]
  });
});

// ─── Reports ─────────────────────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  res.json({
    summary: {
      totalReports: 24,
      scheduledReports: 3,
      lastExport: '2026-05-27T10:30:00Z'
    },
    reports: [
      { id: 1, name: 'Monthly Revenue Report',      type: 'Financial',   date: '2026-05-01', status: 'Ready',   size: '2.4 MB' },
      { id: 2, name: 'Q2 Sentiment Analysis',       type: 'Sentiment',   date: '2026-04-30', status: 'Ready',   size: '1.8 MB' },
      { id: 3, name: 'Competitor Benchmark Q2',     type: 'Competitor',  date: '2026-04-29', status: 'Ready',   size: '3.1 MB' },
      { id: 4, name: 'AI Predictions Forecast',     type: 'Predictions', date: '2026-05-15', status: 'Ready',   size: '1.2 MB' },
      { id: 5, name: 'User Growth Analysis',        type: 'Analytics',   date: '2026-05-20', status: 'Ready',   size: '0.9 MB' },
      { id: 6, name: 'Weekly Performance Summary',  type: 'Executive',   date: '2026-05-26', status: 'Ready',   size: '0.5 MB' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ BizInsight API running on http://localhost:${PORT}`);
});
