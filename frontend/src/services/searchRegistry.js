// Central registry of all searchable actions and pages for the global search bar.
// Each entry has: id, label, description, category, icon, action (function or route string)

const registry = []

export function registerSearchItems(items) {
  items.forEach(item => {
    if (!registry.find(r => r.id === item.id)) registry.push(item)
  })
}

export function searchRegistry(query, navigate, setTheme, setRole) {
  if (!query || query.trim().length < 1) return []
  const q = query.toLowerCase()

  const staticItems = [
    // Pages
    { id: 'page-dashboard',   label: 'Dashboard',            description: 'Go to Dashboard overview',           category: 'Pages',   icon: '⊞',  action: () => navigate('/dashboard')   },
    { id: 'page-analytics',   label: 'Analytics',            description: 'Business analytics deep-dive',       category: 'Pages',   icon: '📊', action: () => navigate('/analytics')   },
    { id: 'page-sentiment',   label: 'Sentiment Analysis',   description: 'Customer NLP sentiment insights',    category: 'Pages',   icon: '💬', action: () => navigate('/sentiment')   },
    { id: 'page-competitor',  label: 'Competitor Analysis',  description: 'Market benchmarking & intelligence', category: 'Pages',   icon: '🔍', action: () => navigate('/competitor')  },
    { id: 'page-predictions', label: 'AI Predictions',       description: 'ML-powered revenue forecasting',     category: 'Pages',   icon: '📈', action: () => navigate('/predictions') },
    { id: 'page-live',        label: 'Live Data',            description: 'Real-time crypto, forex & news',     category: 'Pages',   icon: '🌐', action: () => navigate('/live-data')   },
    { id: 'page-reports',     label: 'Reports',              description: 'Export & view business reports',     category: 'Pages',   icon: '📋', action: () => navigate('/reports')     },
    { id: 'page-settings',    label: 'Settings',             description: 'Configure workspace & preferences',  category: 'Pages',   icon: '⚙️', action: () => navigate('/settings')    },
    { id: 'page-admin',       label: 'Admin Panel',          description: 'System management (Super Admin)',    category: 'Pages',   icon: '🛡️', action: () => navigate('/admin')        },
    // Themes
    { id: 'theme-dark',       label: 'Switch to Dark Mode',  description: 'Enable dark theme',                  category: 'Actions', icon: '🌙', action: () => setTheme('dark')          },
    { id: 'theme-light',      label: 'Switch to Light Mode', description: 'Enable light theme',                 category: 'Actions', icon: '☀️', action: () => setTheme('light')         },
    { id: 'theme-modern',     label: 'Switch to Modern Mode',description: 'Enable modern neon theme',           category: 'Actions', icon: '✨', action: () => setTheme('modern')        },
    // Roles
    { id: 'role-superadmin',  label: 'Switch to Super Admin',description: 'Activate super admin role',          category: 'Actions', icon: '👑', action: () => setRole('superadmin')     },
    { id: 'role-admin',       label: 'Switch to Admin',      description: 'Activate admin role',                category: 'Actions', icon: '👤', action: () => setRole('admin')          },
    // Features info
    { id: 'info-ai',          label: 'AI & Machine Learning',description: 'Pattern recognition & automation',   category: 'Features', icon: '🤖', action: () => navigate('/dashboard')   },
    { id: 'info-pred',        label: 'Predictive Analytics', description: 'Sales & revenue forecasting',        category: 'Features', icon: '🔮', action: () => navigate('/predictions') },
    { id: 'info-sent',        label: 'Sentiment Analysis',   description: 'NLP customer feedback analysis',     category: 'Features', icon: '💡', action: () => navigate('/sentiment')   },
    { id: 'info-comp',        label: 'Competitor Tracking',  description: 'Market share & benchmark data',      category: 'Features', icon: '📡', action: () => navigate('/competitor')  },
    { id: 'info-viz',         label: 'Data Visualization',   description: 'Interactive charts & dashboards',    category: 'Features', icon: '📊', action: () => navigate('/analytics')   },
    { id: 'info-rec',         label: 'Smart Recommendations',description: 'AI-generated business insights',     category: 'Features', icon: '⭐', action: () => navigate('/dashboard')   },
    // SDG
    { id: 'sdg-8',            label: 'SDG 8 — Decent Work',       description: 'Economic growth alignment',    category: 'Info',    icon: '🌱', action: () => navigate('/dashboard')   },
    { id: 'sdg-9',            label: 'SDG 9 — Innovation',         description: 'Industry innovation alignment',category: 'Info',    icon: '🌍', action: () => navigate('/dashboard')   },
    { id: 'sdg-12',           label: 'SDG 12 — Responsible Consumption', description: 'Sustainability goals', category: 'Info',    icon: '♻️', action: () => navigate('/dashboard')   },
    // Metrics (quick look)
    { id: 'metric-revenue',   label: 'Total Revenue: $84,392',    description: '↑ 12.5% this month',           category: 'Metrics', icon: '💵', action: () => navigate('/analytics')   },
    { id: 'metric-users',     label: 'Active Users: 1,204',        description: '↑ 8.2% growth',               category: 'Metrics', icon: '👥', action: () => navigate('/dashboard')   },
    { id: 'metric-sentiment', label: 'Sentiment Score: 4.8/5',     description: '68% positive reviews',         category: 'Metrics', icon: '💬', action: () => navigate('/sentiment')   },
    { id: 'metric-uptime',    label: 'Server Uptime: 99.9%',       description: 'All systems operational',      category: 'Metrics', icon: '⚡', action: () => navigate('/dashboard')   },
  ]

  return staticItems.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  ).slice(0, 12)
}

export const SEARCH_CATEGORIES = ['All', 'Pages', 'Actions', 'Features', 'Metrics', 'Info']
