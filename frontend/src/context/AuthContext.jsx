import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

// ── Hardcoded user store (acts like a DB for demo) ─────────────────────────
const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Shijo Varghese',
    email: 'shijo@bizinsight.io',
    password: 'Admin@123',
    role: 'superadmin',
    avatar: 'SV',
    status: 'Active',
    joined: '2024-01-10',
    lastActive: 'Just now',
  },
  {
    id: 2,
    name: 'Anika Sharma',
    email: 'anika@bizinsight.io',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'AS',
    status: 'Active',
    joined: '2024-02-15',
    lastActive: '1 hour ago',
  },
  {
    id: 3,
    name: 'Rohan Mehta',
    email: 'rohan@bizinsight.io',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'RM',
    status: 'Active',
    joined: '2024-03-08',
    lastActive: '3 hours ago',
  },
]

// ── Cookie helpers ──────────────────────────────────────────────────────────
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// ── Load user list from localStorage, seed defaults if empty ───────────────
function loadUsers() {
  try {
    const stored = localStorage.getItem('bizinsight-users')
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  localStorage.setItem('bizinsight-users', JSON.stringify(DEFAULT_USERS))
  return DEFAULT_USERS
}
function saveUsers(users) {
  localStorage.setItem('bizinsight-users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [users, setUsersState] = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Restore session from cookie / localStorage on mount ────────────────
  useEffect(() => {
    const sessionRaw = getCookie('bizinsight-session') || localStorage.getItem('bizinsight-session')
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw)
        const freshUsers = loadUsers()
        const found = freshUsers.find(u => u.id === session.id && u.email === session.email)
        if (found) {
          const { password: _, ...safe } = found
          setCurrentUser(safe)
        }
      } catch (_) {}
    }
    setAuthLoading(false)
  }, [])

  const persistSession = (user) => {
    const { password: _, ...safe } = user
    const raw = JSON.stringify(safe)
    setCookie('bizinsight-session', raw, 7)
    localStorage.setItem('bizinsight-session', raw)
    setCurrentUser(safe)
  }

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const freshUsers = loadUsers()
    const found = freshUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) return { success: false, error: 'Invalid email or password' }
    if (found.status === 'Inactive')
      return { success: false, error: 'This account has been deactivated' }
    persistSession(found)
    return { success: true, user: found }
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    deleteCookie('bizinsight-session')
    localStorage.removeItem('bizinsight-session')
    localStorage.removeItem('bizinsight-role')
    setCurrentUser(null)
  }, [])

  // ── Add admin user ──────────────────────────────────────────────────────
  const addUser = useCallback((userData) => {
    const fresh = loadUsers()
    const exists = fresh.find(u => u.email.toLowerCase() === userData.email.toLowerCase())
    if (exists) return { success: false, error: 'A user with that email already exists' }
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password || 'Admin@123',
      role: userData.role || 'admin',
      avatar: userData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      status: 'Active',
      joined: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    }
    const updated = [...fresh, newUser]
    saveUsers(updated)
    setUsersState(updated)
    return { success: true, user: newUser }
  }, [])

  // ── Remove user ─────────────────────────────────────────────────────────
  const removeUser = useCallback((id) => {
    const fresh = loadUsers()
    const updated = fresh.filter(u => u.id !== id)
    saveUsers(updated)
    setUsersState(updated)
  }, [])

  // ── Toggle user status ──────────────────────────────────────────────────
  const toggleUserStatus = useCallback((id) => {
    const fresh = loadUsers()
    const updated = fresh.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    )
    saveUsers(updated)
    setUsersState(updated)
  }, [])

  // ── Update user role ────────────────────────────────────────────────────
  const updateUserRole = useCallback((id, role) => {
    const fresh = loadUsers()
    const updated = fresh.map(u => (u.id === id ? { ...u, role } : u))
    saveUsers(updated)
    setUsersState(updated)
  }, [])

  const isAuthenticated = !!currentUser
  const isSuperAdmin   = currentUser?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isSuperAdmin,
      authLoading,
      users: users.map(({ password: _, ...u }) => u), // never expose passwords
      login,
      logout,
      addUser,
      removeUser,
      toggleUserStatus,
      updateUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
