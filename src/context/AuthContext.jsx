import { createContext, useContext, useState, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password })
    const { token, role } = res.data
    // role from API is a string like "admin" or "superadmin"
    const userData = { role }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // token already invalid, continue
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isSuperadmin = user?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperadmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
