'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotification } from '../components/Notifications.jsx'
import '../styles/profile.css'

function Profile({ onNavigate }) {
  const { user, updatePassword } = useAuth()
  const { showNotification } = useNotification()
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setIsLoadingPassword(true)

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showNotification('error', 'Veuillez remplir tous les champs')
      setIsLoadingPassword(false)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'Les mots de passe ne correspondent pas')
      setIsLoadingPassword(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'Le mot de passe doit contenir au moins 6 caracteres')
      setIsLoadingPassword(false)
      return
    }

    setTimeout(() => {
      updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      showNotification('success', 'Mot de passe modifie avec succes')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsEditingPassword(false)
      setIsLoadingPassword(false)
    }, 500)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewPhoto(reader.result)
        setProfilePhoto(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = () => {
    if (!profilePhoto) return
    showNotification('success', 'Photo de profil mise a jour')
    setProfilePhoto(null)
    setPreviewPhoto(null)
  }

  return (
    <div className="animate-fade-in">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-photo-section">
            <div className="profile-photo">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Profile" />
              ) : (
                <div className="profile-photo-placeholder">{user?.name?.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <label className="profile-photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="profile-photo-input"
              />
              <span className="profile-photo-button">Modifier photo</span>
            </label>
            {previewPhoto && (
              <button className="btn btn-small btn-primary" onClick={handlePhotoUpload}>
                Confirmer
              </button>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-role">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur Regional'}</p>
            <p className="profile-region">{user?.region || 'Non specifie'}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <h2 className="profile-card-title">Informations personnelles</h2>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <label className="profile-label">Nom complet</label>
                <p className="profile-value">{user?.name}</p>
              </div>
              <div className="profile-info-item">
                <label className="profile-label">Nom d'utilisateur</label>
                <p className="profile-value">{user?.username}</p>
              </div>
              <div className="profile-info-item">
                <label className="profile-label">Email</label>
                <p className="profile-value">{user?.email || 'Non specifie'}</p>
              </div>
              <div className="profile-info-item">
                <label className="profile-label">Region</label>
                <p className="profile-value">{user?.region || 'Non specifie'}</p>
              </div>
              {user?.cin && (
                <div className="profile-info-item">
                  <label className="profile-label">CIN</label>
                  <p className="profile-value">{user.cin}</p>
                </div>
              )}
              <div className="profile-info-item">
                <label className="profile-label">Date d'inscription</label>
                <p className="profile-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2 className="profile-card-title">Securite</h2>
            {!isEditingPassword ? (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditingPassword(true)}
              >
                Modifier le mot de passe
              </button>
            ) : (
              <form className="profile-password-form" onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Mot de passe actuel</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Entrez votre mot de passe actuel"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Entrez le nouveau mot de passe"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirmez le nouveau mot de passe"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoadingPassword}
                  >
                    {isLoadingPassword ? 'Mise a jour...' : 'Confirmer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditingPassword(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
