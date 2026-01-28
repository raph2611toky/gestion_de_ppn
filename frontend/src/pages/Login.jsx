'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../styles/login.css'

function Login({ onThemeToggle, theme, onRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!username || !password) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      const success = login(username, password)
      if (!success) {
        setError('Identifiants incorrects')
      }
      setIsLoading(false)
    }, 500)
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

          <div className="login-input-group">
            <label className="login-label">Nom d'utilisateur</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">👤</span>
              <input
                type="text"
                className="login-input"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
            <button className="login-footer-link" onClick={onRegister}>
              Demander un acces
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
