'use client';

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Vérifier le token au chargement
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.log('[v0] Erreur parsing user data:', err)
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  const getProfile = async () => {
    setError(null)
    try {
      const response = await api.get('/employes/profile')
      
      if (response.data) {
        // Mettre à jour l'utilisateur avec les données du profil
        const profileData = {
          id_employe: response.data.id_employe,
          cin: response.data.cin,
          nom: response.data.nom,
          email: response.data.email,
          photo: response.data.photo,
          fonction: response.data.fonction,
          is_active: response.data.is_active,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          // Ajouter moderateurDetails seulement si présent (pour les modérateurs)
          ...(response.data.moderateurDetails && { moderateurDetails: response.data.moderateurDetails })
        }
        
        localStorage.setItem('user', JSON.stringify(profileData))
        setUser(profileData)
        return profileData
      }
      return null
    } catch (err) {
      console.log('[v0] Erreur lors de la récupération du profil:', err.message)
      let errorMessage = 'Erreur lors de la récupération du profil'
      
      if (err.response?.status === 401) {
        // Token expiré
        logout()
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
      return null
    }
  }

  const login = async (email, password, portal = 'admin') => {
    setError(null)
    try {
      const endpoint = portal === 'admin' ? '/login/admin' : '/login'
      const response = await api.post(endpoint, {
        email,
        password
      })

      const { token } = response.data
      console.log(response.data)
      
      if (token) {
        // Sauvegarder le token (localStorage.setItem n'est pas async)
        localStorage.setItem('token', token)
        console.log('[v0] Token sauvegardé, appel getProfile...')
        return true
      }
      return false
    } catch (err) {
      console.log('[v0] Erreur de connexion:', err.message)
      let errorMessage = 'Une erreur est survenue lors de la connexion'
      
      if (err.response?.status === 401) {
        errorMessage = 'Identifiants incorrects'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
      return false
    }
  }

  const logout = async () => {
    try {
      // Envoyer la demande de logout au serveur avec le token
      await api.put('/logout', {})
    } catch (err) {
      console.log('[v0] Erreur lors du logout API:', err.message)
      // Continuer le logout local même si l'API échoue
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setError(null)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      getProfile,
      isAuthenticated: !!user,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
