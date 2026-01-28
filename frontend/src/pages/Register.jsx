'use client';

import React, { useState } from 'react'
import { useData, REGIONS } from '../contexts/DataContext.jsx'
import { useNotification } from '../components/Notifications.jsx'
import '../styles/login.css'

function Register({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    cin: '',
    password: '',
    confirmPassword: '',
    region: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { showNotification } = useNotification()
  const { addAccount } = useData()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.name || !formData.username || !formData.cin || !formData.password || !formData.region) {
      setError('Veuillez remplir tous les champs obligatoires')
      setIsLoading(false)
      return
    }

    if (!/^\d{12}$/.test(formData.cin)) {
      setError('Le CIN doit contenir exactement 12 chiffres')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      addAccount({
        name: formData.name,
        username: formData.username,
        cin: formData.cin,
        region: formData.region,
      })

      showNotification('success', 'Demande envoyee ! Un administrateur validera votre compte.')
      setIsLoading(false)
      onBack()
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-card register">
        <div className="login-header-simple">
          <h1 className="login-title-simple">PPN Manager</h1>
          <p className="login-subtitle-simple">Demande d'acces</p>
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
            <label className="login-label">CIN (12 chiffres) *</label>
            <input
              type="text"
              className="login-input no-icon"
              placeholder="Ex: 123456789012"
              value={formData.cin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                setFormData({ ...formData, cin: value })
              }}
              maxLength="12"
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

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Envoi en cours...
              </>
            ) : (
              'Envoyer la demande'
            )}
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
