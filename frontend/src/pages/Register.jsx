'use client'

import React, { useState } from 'react'
import api from '../utils/api'
import { REGIONS } from '../contexts/DataContext.jsx'
import { useNotification } from '../components/Notifications.jsx'
import '../styles/login.css'

function Register({ onBack, onRegistered }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // on garde les champs UI existants
    name: '',
    username: '',
    cin: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    photo: null,
    cinFront: null,
    cinBack: null,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previews, setPreviews] = useState({
    photo: null,
    cinFront: null,
    cinBack: null,
  })
  const { showNotification } = useNotification()

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: file })
        setPreviews({ ...previews, [fieldName]: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.cin) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (!/^\d{12}$/.test(formData.cin)) {
      setError('Le CIN doit contenir exactement 12 chiffres')
      return
    }

    if (!previews.cinFront || !previews.cinBack) {
      setError('Veuillez ajouter les deux faces de votre CIN')
      return
    }

    setStep(2)
  }

  const handlePreviousStep = () => {
    setError('')
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // on garde tes validations UI (username est toujours obligatoire côté UI)
    if (!formData.username || !formData.email || !formData.password || !formData.region) {
      setError('Veuillez remplir tous les champs obligatoires')
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide')
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

    try {
      // IMPORTANT: le backend attend nom (pas name), et les fichiers piece_identite_face/recto (pas cinFront/cinBack) [file:25]
      const payload = new FormData()
      payload.append('cin', formData.cin)
      payload.append('nom', formData.name)
      payload.append('email', formData.email)
      payload.append('password', formData.password)
      payload.append('region', formData.region)

      if (formData.photo) payload.append('photo', formData.photo)

      // mapping UI -> backend
      if (formData.cinFront) payload.append('piece_identite_recto', formData.cinFront)
      if (formData.cinBack) payload.append('piece_identite_face', formData.cinBack)

      console.log('cinFront file:', formData.cinFront);
      console.log('cinBack file:', formData.cinBack);


      // ton api.js a déjà baseURL + json headers; ici on force multipart sur cette requête [file:25]
      const response = await api.post('/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log("reponse: ", response)

      showNotification('success', 'Compte créé. Vérifiez votre email pour activer votre compte.')

      if (typeof onRegistered === 'function') {
        onRegistered(formData.email)
        return
      }

      // sinon comportement actuel: retour login
      setTimeout(() => onBack(), 1500)
    } catch (err) {
      const msg =
        err.response?.data?.erreur ||
        err.response?.data?.message ||
        'Erreur lors de l’inscription'
      setError(msg)
      showNotification('error', msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card register">
        <div className="login-header-simple">
          <h1 className="login-title-simple">PPN Manager</h1>
          <p className="login-subtitle-simple">Demande d'acces - Etape {step}/2</p>
        </div>

        {step === 1 ? (
          <form className="login-form" onSubmit={handleNextStep}>
            {error && (
              <div className="login-error">
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-section-title">Informations personnelles</div>

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

            <div className="form-section-title">Pieces d'identite</div>

            <div className="register-documents">
              <div className="document-upload">
                <label className="upload-label">CIN - Recto *</label>
                {previews.cinFront ? (
                  <div className="upload-preview">
                    <img src={previews.cinFront} alt="CIN Recto" />
                  </div>
                ) : (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cinFront')}
                    />
                    <span className="upload-placeholder">
                      <span>+ Cliquez pour ajouter</span>
                    </span>
                  </label>
                )}
                {previews.cinFront && (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cinFront')}
                    />
                    <span className="upload-placeholder" style={{ opacity: 0.7 }}>
                      <span>Changer l'image</span>
                    </span>
                  </label>
                )}
              </div>

              <div className="document-upload">
                <label className="upload-label">CIN - Verso *</label>
                {previews.cinBack ? (
                  <div className="upload-preview">
                    <img src={previews.cinBack} alt="CIN Verso" />
                  </div>
                ) : (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cinBack')}
                    />
                    <span className="upload-placeholder">
                      <span>+ Cliquez pour ajouter</span>
                    </span>
                  </label>
                )}
                {previews.cinBack && (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cinBack')}
                    />
                    <span className="upload-placeholder" style={{ opacity: 0.7 }}>
                      <span>Changer l'image</span>
                    </span>
                  </label>
                )}
              </div>
            </div>

            <button type="submit" className="login-submit">
              Continuer
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-section-title">Photo de profil</div>

            <div className="register-documents">
              <div className="document-upload">
                <label className="upload-label">Photo de profil</label>
                {previews.photo ? (
                  <div className="upload-preview">
                    <img src={previews.photo} alt="Photo de profil" />
                  </div>
                ) : (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photo')}
                    />
                    <span className="upload-placeholder">
                      <span>+ Cliquez pour ajouter</span>
                    </span>
                  </label>
                )}
                {previews.photo && (
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photo')}
                    />
                    <span className="upload-placeholder" style={{ opacity: 0.7 }}>
                      <span>Changer l'image</span>
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="form-section-title">Infos de connexion</div>

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
              <label className="login-label">Email *</label>
              <input
                type="email"
                className="login-input no-icon"
                placeholder="votre.email@exemple.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
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

            <div className="login-input-group">
              <label className="login-label">Region *</label>
              <select
                className="login-select"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <option value="">Selectionner une region</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions-register">
              <button
                type="button"
                className="back-button"
                onClick={handlePreviousStep}
              >
                <span>←</span>
                <span>Retour</span>
              </button>
              <button type="submit" className="login-submit" disabled={isLoading} style={{ flex: 1 }}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer la demande'
                )}
              </button>
            </div>
          </form>
        )}

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
