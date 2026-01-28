'use client';

import React, { createContext, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([
    // Mock admin user
    {
      id: 'admin-001',
      username: 'admin',
      password: 'admin123',
      email: 'admin@ministere.gov',
      role: 'admin',
      fullName: 'Administrateur Principal',
      status: 'approved',
      createdAt: new Date('2024-01-01'),
    },
    // Mock regional users
    {
      id: 'region-001',
      username: 'region_nord',
      password: 'nord123',
      email: 'nord@region.gov',
      role: 'region',
      fullName: 'Région Nord',
      regionName: 'Nord',
      status: 'approved',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'region-002',
      username: 'region_sud',
      password: 'sud123',
      email: 'sud@region.gov',
      role: 'region',
      fullName: 'Région Sud',
      regionName: 'Sud',
      status: 'approved',
      createdAt: new Date('2024-01-20'),
    },
    {
      id: 'region-003',
      username: 'region_est',
      password: 'est123',
      email: 'est@region.gov',
      role: 'region',
      fullName: 'Région Est',
      regionName: 'Est',
      status: 'pending',
      createdAt: new Date('2024-02-01'),
    },
    {
      id: 'region-004',
      username: 'region_ouest',
      password: 'ouest123',
      email: 'ouest@region.gov',
      role: 'region',
      fullName: 'Région Ouest',
      regionName: 'Ouest',
      status: 'approved',
      createdAt: new Date('2024-01-25'),
    },
  ])

  const [pendingRegistrations, setPendingRegistrations] = useState([
    {
      id: 'pending-001',
      username: 'region_centre',
      email: 'centre@region.gov',
      regionName: 'Centre',
      status: 'pending',
      createdAt: new Date('2024-02-10'),
    },
  ])

  const login = useCallback((username, password) => {
    const foundUser = users.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      if (foundUser.status !== 'approved') {
        throw new Error(`Compte non validé. Statut: ${foundUser.status}`)
      }
      const loggedInUser = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        fullName: foundUser.fullName,
        regionName: foundUser.regionName || null,
      }
      setUser(loggedInUser)
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser))
      return loggedInUser
    }
    throw new Error('Identifiants invalides')
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }, [])

  const register = useCallback((username, email, regionName, password) => {
    if (users.some((u) => u.username === username)) {
      throw new Error('Cet utilisateur existe déjà')
    }
    const newUser = {
      id: `region-${Date.now()}`,
      username,
      password,
      email,
      regionName,
      role: 'region',
      fullName: `Région ${regionName}`,
      status: 'pending',
      createdAt: new Date(),
    }
    setPendingRegistrations((prev) => [...prev, newUser])
    return newUser
  }, [users])

  const approveRegistration = useCallback((userId) => {
    setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId))
    const pendingUser = pendingRegistrations.find((u) => u.id === userId)
    if (pendingUser) {
      const approvedUser = {
        ...pendingUser,
        status: 'approved',
      }
      setUsers((prev) => [...prev, approvedUser])
    }
  }, [pendingRegistrations])

  const rejectRegistration = useCallback((userId) => {
    setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  const updateUserStatus = useCallback((userId, status) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    )
  }, [])

  const value = {
    user,
    users,
    pendingRegistrations,
    login,
    logout,
    register,
    approveRegistration,
    rejectRegistration,
    updateUserStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
