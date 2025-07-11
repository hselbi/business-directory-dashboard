"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, User, AuthState } from '@/lib/auth'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    name: string
    company: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const user = await authService.verifyToken()
      const token = authService.getToken()
      
      if (user && token) {
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { user, token } = await authService.login(email, password)
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    company: string
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { user, token } = await authService.register(userData)
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}