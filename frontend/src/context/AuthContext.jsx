import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

// ── Fallback permissions (used while DB loads or if offline) ──
const DEFAULT_PERMISSIONS = {
  admin: {
    dashboard: true, analytics: true, sentiment: true, competitor: true,
    predictions: true, liveData: true, dataSources: true, reports: true, settings: true
  },
  viewer: {
    dashboard: true, analytics: false, sentiment: false, competitor: false,
    predictions: false, liveData: true, dataSources: false, reports: false, settings: false
  }
}

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

export function AuthProvider({ children }) {
  const [users, setUsers]               = useState([])
  const [permissions, setPermissions]   = useState(DEFAULT_PERMISSIONS)
  const [currentUser, setCurrentUser]   = useState(null)
  const [authLoading, setAuthLoading]   = useState(true)

  // ── Fetch users from DB ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/users')
      setUsers(res.data)
    } catch (err) {
      console.warn('[Auth] Could not fetch users from DB:', err.message)
    }
  }, [])

  // ── Fetch permissions from DB ────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/permissions')
      if (res.data && Object.keys(res.data).length > 0) {
        setPermissions(res.data)
      }
    } catch (err) {
      console.warn('[Auth] Could not fetch permissions from DB, using defaults:', err.message)
    }
  }, [])

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const sessionRaw = getCookie('bizinsight-session') || localStorage.getItem('bizinsight-session')
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw)
        if (session?.id && session?.email) setCurrentUser(session)
      } catch (_) {}
    }
    setAuthLoading(false)
    fetchUsers()
    fetchPermissions()
  }, [fetchUsers, fetchPermissions])

  const persistSession = (user) => {
    const raw = JSON.stringify(user)
    setCookie('bizinsight-session', raw, 7)
    localStorage.setItem('bizinsight-session', raw)
    setCurrentUser(user)
  }

  // ── Login — calls real backend ───────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password })
      if (res.data.success) {
        persistSession(res.data.user)
        return { success: true, user: res.data.user }
      }
      return { success: false, error: 'Login failed.' }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email or password'
      return { success: false, error: msg }
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    deleteCookie('bizinsight-session')
    localStorage.removeItem('bizinsight-session')
    localStorage.removeItem('bizinsight-role')
    setCurrentUser(null)
  }, [])

  // ── Add user — calls real backend ────────────────────────────────────────
  const addUser = useCallback(async (userData) => {
    try {
      const res = await api.post('/api/auth/users', {
        name:     userData.name,
        email:    userData.email,
        password: userData.password || 'Admin@123',
        role:     userData.role || 'viewer',
      })
      if (res.data.success) {
        await fetchUsers()
        return { success: true, user: res.data.user }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add user'
      return { success: false, error: msg }
    }
  }, [fetchUsers])

  // ── Remove user — calls real backend ────────────────────────────────────
  const removeUser = useCallback(async (id) => {
    try {
      await api.delete(`/api/auth/users/${id}`)
      await fetchUsers()
    } catch (err) {
      console.error('[Auth] Remove user failed:', err.message)
    }
  }, [fetchUsers])

  // ── Toggle user status ───────────────────────────────────────────────────
  const toggleUserStatus = useCallback(async (id) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.patch(`/api/auth/users/${id}`, { status: newStatus })
      await fetchUsers()
    } catch (err) {
      console.error('[Auth] Toggle status failed:', err.message)
    }
  }, [users, fetchUsers])

  // ── Update user role ─────────────────────────────────────────────────────
  const updateUserRole = useCallback(async (id, role) => {
    try {
      await api.patch(`/api/auth/users/${id}`, { role })
      await fetchUsers()
      if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, role }))
    } catch (err) {
      console.error('[Auth] Update role failed:', err.message)
    }
  }, [currentUser, fetchUsers])

  // ── Update user profile (local only for now) ─────────────────────────────
  const updateUser = useCallback(async (id, updates) => {
    if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, ...updates }))
    await fetchUsers()
    return { success: true }
  }, [currentUser, fetchUsers])

  // ── Update role permissions — calls real backend ─────────────────────────
  const updateRolePermissions = useCallback(async (role, newPerms) => {
    // Optimistically update UI
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], ...newPerms }
    }))
    // Persist each changed module to DB
    try {
      await Promise.all(
        Object.entries(newPerms).map(([module, enabled]) =>
          api.patch('/api/auth/permissions', { role, module, enabled })
        )
      )
    } catch (err) {
      console.error('[Auth] Update permissions failed:', err.message)
      await fetchPermissions() // revert on failure
    }
  }, [fetchPermissions])

  const isAuthenticated = !!currentUser
  const isSuperAdmin   = currentUser?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isSuperAdmin,
      authLoading,
      users,
      permissions,
      login,
      logout,
      addUser,
      removeUser,
      toggleUserStatus,
      updateUserRole,
      updateUser,
      updateRolePermissions,
      refreshUsers: fetchUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
