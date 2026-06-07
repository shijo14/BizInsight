import { createContext, useContext, useState, useEffect } from 'react'

const RoleContext = createContext()

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem('bizinsight-role') || 'superadmin')

  const setRole = (r) => {
    setRoleState(r)
    localStorage.setItem('bizinsight-role', r)
  }

  const isSuperAdmin = role === 'superadmin'

  return (
    <RoleContext.Provider value={{ role, setRole, isSuperAdmin }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
