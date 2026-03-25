import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

export interface User {
  id: string
  email: string
  name: string
  plan: string
  videos_used: number
  videos_limit: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string, name: string) => Promise<void>
  googleLogin: (idToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch (e) {
        localStorage.removeItem('token')
        setUser(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, pass: string) => {
    const { data } = await api.post('/auth/login', { email, password: pass })
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
  }

  const register = async (email: string, pass: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password: pass, name })
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
  }

  const googleLogin = async (idToken: string) => {
    const { data } = await api.post('/auth/google', { id_token: idToken })
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
