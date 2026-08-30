import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'

const RoleContext = createContext()

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Standard User'
}

export function RoleProvider({ children }) {
  const { currentUser } = useAuth()

  const value = useMemo(() => {
    const role = currentUser?.role || 'viewer'
    return {
      role,
      roleLabel: ROLE_LABELS[role] || 'Standard User',
      isSuperAdmin: role === 'superadmin',
      isAdmin: role === 'admin' || role === 'superadmin',
      isViewer: role === 'viewer',
      setRole: () => {}
    }
  }, [currentUser])

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
