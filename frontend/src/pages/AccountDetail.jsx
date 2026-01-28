'use client';

import React, { useState, useEffect } from 'react'
import { useNotification } from '../components/Notifications.jsx'
import '../styles/account-detail.css'

function AccountDetail({ accountId, onClose, onApprove, onReject }) {
  const { showNotification } = useNotification()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const mockAccount = {
        id: accountId,
        name: 'John Doe',
        username: 'johndoe',
        cin: '123456789012',
        region: 'Antananarivo',
        email: 'john@example.com',
        photo: null,
        cinFront: null,
        cinBack: null,
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      setAccount(mockAccount)
      setLoading(false)
    }, 300)
  }, [accountId])

  const handleApprove = () => {
    setActionLoading(true)
    setTimeout(() => {
      onApprove?.(accountId)
      showNotification('success', 'Compte approuve avec succes')
      setActionLoading(false)
      onClose()
    }, 500)
  }

  const handleReject = () => {
    setActionLoading(true)
    setTimeout(() => {
      onReject?.(accountId)
      showNotification('success', 'Compte rejete')
      setActionLoading(false)
      onClose()
    }, 500)
  }

  if (loading) {
    return (
      <div className="account-detail-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-detail-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content account-detail-content">
        <div className="modal-header">
          <h2>Details du compte</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="account-detail-body">
          <div className="detail-section">
            <h3 className="detail-section-title">Informations personnelles</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Nom complet</label>
                <p>{account?.name}</p>
              </div>
              <div className="detail-item">
                <label>Nom d'utilisateur</label>
                <p>{account?.username}</p>
              </div>
              <div className="detail-item">
                <label>CIN</label>
                <p>{account?.cin}</p>
              </div>
              <div className="detail-item">
                <label>Region</label>
                <p>{account?.region}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{account?.email}</p>
              </div>
              <div className="detail-item">
                <label>Date de demande</label>
                <p>{new Date(account?.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Photo et pieces d'identite</h3>
            <div className="detail-documents">
              <div className="document-item">
                <label>Photo de profil</label>
                <div className="document-placeholder">
                  {account?.photo ? (
                    <img src={account.photo} alt="Photo" />
                  ) : (
                    <p>Aucune photo</p>
                  )}
                </div>
              </div>
              <div className="document-item">
                <label>CIN - Recto</label>
                <div className="document-placeholder">
                  {account?.cinFront ? (
                    <img src={account.cinFront} alt="CIN Recto" />
                  ) : (
                    <p>Non fourni</p>
                  )}
                </div>
              </div>
              <div className="document-item">
                <label>CIN - Verso</label>
                <div className="document-placeholder">
                  {account?.cinBack ? (
                    <img src={account.cinBack} alt="CIN Verso" />
                  ) : (
                    <p>Non fourni</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-success"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? 'En cours...' : 'Approuver'}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? 'En cours...' : 'Rejeter'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={actionLoading}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountDetail
