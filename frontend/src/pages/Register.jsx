'use client';

import React, { useState } from 'react'
import { useData, REGIONS } from '../contexts/DataContext.jsx'
import { useNotification } from '../components/Notifications.jsx'
import '../styles/login.css'

function Register({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    region: '',
  })
  const [error, setError] = useState('')
  const { showNotification } = useNotification()
  const { addAccount } = useData()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.username || !formData.password || !formData.region) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    addAccount({
      name: formData.name,
      username: formData.username,
      region: formData.region,
    })

    showNotification('success', 'Demande envoyee ! Un administrateur validera votre compte.')
    onBack()
  }

  return (
    <div className="login-container">
      <div className="login-card register">
        <div className="login-header">
          <div className="login-logo">📝</div>
          <h1 className="login-title">Demande d'acces</h1>
          <p className="login-subtitle">Creez votre compte pour acceder au systeme</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label">Nom complet *</label>
            <input
              type="text"
              className="login-input no-icon"
              placeholder="Votre nom complet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Nom d'utilisateur *</label>
            <input
              type="text"
              className="login-input no-icon"
              placeholder="Choisissez un nom d'utilisateur"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Region *</label>
            <select
              className="login-select"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            >
              <option value="">Selectionner une region</option>
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="login-input-group">
            <label className="login-label">Mot de passe *</label>
            <input
              type="password"
              className="login-input no-icon"
              placeholder="Minimum 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Confirmer le mot de passe *</label>
            <input
              type="password"
              className="login-input no-icon"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button type="submit" className="login-submit">
            Envoyer la demande
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Deja un compte ?{' '}
            <button className="login-footer-link" onClick={onBack}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
