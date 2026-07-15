import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../api/authService'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On mount, verify existing token is still valid via /auth/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .getMe()
      .then((me) => {
        setUser(me)
        localStorage.setItem(USER_KEY, JSON.stringify(me))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const data = await authService.login(email, password)
      localStorage.setItem(TOKEN_KEY, data.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } catch (err) {
      const message = err?.message || 'Invalid email or password.'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    user,
    // Backend serializes UserRole as UPPERCASE ("ADMIN"/"HR"/"EMPLOYEE");
    // normalize to lowercase to match MANAGER_ROLES / ROLES constants.
    role: user?.role ? String(user.role).toLowerCase() : null,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}