import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    // Demo credentials for testing without backend
    if (username === 'admin' && password === 'admin123') {
      const demoUser = {
        id: 1,
        name: 'Quản trị viên',
        username: 'admin',
        email: 'admin@schoolbus.com',
        role: 'admin',
      }
      const demoToken = 'demo-token-' + Date.now()
      
      localStorage.setItem('user', JSON.stringify(demoUser))
      localStorage.setItem('token', demoToken)
      
      setUser(demoUser)
      setIsAuthenticated(true)
      
      return { success: true }
    }
    
    // Try API login if demo credentials don't match
    try {
      const response = await apiLogin(username, password)
      const { user, token } = response.data
      
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng' 
      }
    }
  }

  const logout = () => {
    apiLogout()
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

