import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export interface User {
  id: number
  email: string
  name: string
  role: string
  company: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Client-side auth functions
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store token in localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', data.token)
    }

    return data
  },

  async register(userData: {
    email: string
    password: string
    name: string
    company: string
  }): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    // Store token in localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', data.token)
    }

    return data
  },

  async verifyToken(): Promise<User | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
      }
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }
}

// Server-side auth utilities
export function verifyTokenServer(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role,
      company: decoded.company
    }
  } catch (error) {
    return null
  }
}

export function generateToken(user: Partial<User>): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      company: user.company
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}