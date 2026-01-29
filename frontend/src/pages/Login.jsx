'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../components/Notifications'
import '../styles/login.css'

function Login({ onThemeToggle, theme, onRegister }) {
  const [portal, setPortal] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, getProfile } = useAuth()
  const { showNotification } = useNotification()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    try {
      // Appeler la méthode login du contexte (sauvegarde le token)
      const loginSuccess = await login(email, password, portal)

      if (loginSuccess) {
        console.log('[v0] Connexion réussie, token sauvegardé')
        
        // Récupérer le profil complet avec le token envoyé dans l'en-tête
        const profileData = await getProfile()
        
        if (profileData) {
          console.log('[v0] Profil récupéré:', profileData)
          // Afficher une notification de succès
          showNotification('success', 'Connexion réussie!')
          
        } else {
          setError('Erreur lors de la récupération du profil')
          showNotification('error', 'Erreur lors de la récupération du profil')
        }
      } else {
        // La méthode login a échoué
        setError('Identifiants incorrects')
        showNotification('error', 'Identifiants incorrects')
      }
    } catch (err) {
      console.log('[v0] Erreur de connexion:', err.message)
      const errorMsg = 'Une erreur est survenue lors de la connexion'
      setError(errorMsg)
      showNotification('error', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <button
        className="login-theme-toggle"
        onClick={onThemeToggle}
        title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-card">
        <div className="login-header-simple">
          <h1 className="login-title-simple">PPN Manager</h1>
          <p className="login-subtitle-simple">Connexion</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Portal Selection */}
          <div className="login-input-group">
            <label className="login-label">Sélectionner un portail</label>
            <div className="login-portal-tabs">
              <button
                type="button"
                className={`login-portal-tab ${portal === 'admin' ? 'active' : ''}`}
                onClick={() => setPortal('admin')}
              >
                👨‍💼 Admin
              </button>
              <button
                type="button"
                className={`login-portal-tab ${portal === 'moderator' ? 'active' : ''}`}
                onClick={() => setPortal('moderator')}
              >
                🛡️ Modérateur
              </button>
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">📧</span>
              <input
                type="email"
                className="login-input"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">Mot de passe</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Pas encore de compte ?{' '}
            <button className="login-footer-link" onClick={onRegister} disabled={isLoading}>
              Demander un acces
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
