'use client';

import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock users for demo
const USERS = [
  { 
    username: 'admin', 
    password: 'admin123', 
    user: { id: '1', username: 'admin', role: 'admin', name: 'Administrateur' } 
  },
  { 
    username: 'region_nord', 
    password: 'nord123', 
    user: { id: '2', username: 'region_nord', role: 'regional', region: 'Analamanga', name: 'Agent Nord' } 
  },
  { 
    username: 'region_sud', 
    password: 'sud123', 
    user: { id: '3', username: 'region_sud', role: 'regional', region: 'Vakinankaratra', name: 'Agent Sud' } 
  },
]

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password)
    if (found) {
      setUser(found.user)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
