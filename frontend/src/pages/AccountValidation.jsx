'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { useNotification, ConfirmDialog } from '../components/Notifications.jsx'

function AccountValidation() {
  const { showNotification } = useNotification()
  const [moderators, setModerators] = useState({})
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [selectedModerator, setSelectedModerator] = useState(null)

  // Charger la liste des modérateurs en attente
  useEffect(() => {
    fetchModerators()
  }, [])

  const fetchModerators = async () => {
    try {
      setLoading(true)
      const response = await api.get('/moderators/pending/')
      console.log('[+] Modérateurs récupérés:', response.data)
      setModerators(response.data || {})
    } catch (err) {
      console.log('[v0] Erreur lors de la récupération des modérateurs:', err.message)
      showNotification('error', 'Erreur lors du chargement des modérateurs')
      setModerators([])
    } finally {
      setLoading(false)
    }
  }

  const fetchModeratorDetail = async (id) => {
    try {
      const response = await api.get(`/moderators/pending/${id}`)
      console.log('[v0] Détail du modérateur:', response.data)
      setSelectedModerator(response.data)
    } catch (err) {
      console.log('[v0] Erreur lors de la récupération du détail:', err.message)
      showNotification('error', 'Erreur lors du chargement du profil')
    }
  }

  const handleViewDetail = (moderator) => {
    fetchModeratorDetail(moderator.id_employe)
  }

  const handleStatusChange = (id, action, name) => {
    setConfirmAction({ id, action, name })
    setShowConfirm(true)
  }

  const confirmStatusChange = async () => {
    if (!confirmAction) return
    
    try {
      const endpoint = confirmAction.action === 'validate' 
        ? `/moderators/${confirmAction.id}/validate`
        : `/moderators/${confirmAction.id}/reject`
      
      await api.post(endpoint, {})
      
      const message = confirmAction.action === 'validate'
        ? `Modérateur ${confirmAction.name} validé`
        : `Modérateur ${confirmAction.name} rejeté`
      
      showNotification('success', message)
      setConfirmAction(null)
      setSelectedModerator(null)
      await fetchModerators()
    } catch (err) {
      console.log('[v0] Erreur lors de l\'action:', err.message)
      showNotification('error', 'Erreur lors de l\'action')
    }
  }

  // Séparer les modérateurs en attente et validés
  console.log('Liste complète des modérateurs:', moderators)
  const pendingModerators = moderators.pending || []
  const validatedModerators = moderators.validated || []

  const getVerifiedBadge = (isVerified) => {
    return isVerified 
      ? '<span className="badge badge-success">Vérifié</span>'
      : '<span className="badge badge-warning">Non vérifié</span>'
  }

  const getValidatedBadge = (isValidated) => {
    return isValidated
      ? '<span className="badge badge-success">Validé</span>'
      : '<span className="badge badge-warning">En attente</span>'
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">
              <span>⏳</span>
              Chargement...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {selectedModerator ? (
        <div className="section-card">
          <div className="section-header">
            <button
              className="back-button"
              onClick={() => setSelectedModerator(null)}
              style={{ marginRight: 'auto' }}
            >
              <span>←</span>
              <span>Retour</span>
            </button>
            <h2 className="section-title">
              <span>👤</span>
              Détail du modérateur
            </h2>
          </div>
          <div className="section-body">
            {/* Informations personnelles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Nom complet</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedModerator.nom}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Email</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedModerator.email}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>CIN</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedModerator.cin}</div>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Région</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedModerator.moderateurDetails?.region || 'N/A'}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Vérifié</div>
                  <span className={selectedModerator.moderateurDetails?.is_verified ? 'badge badge-success' : 'badge badge-warning'}>
                    {selectedModerator.moderateurDetails?.is_verified ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Validé</div>
                  <span className={selectedModerator.moderateurDetails?.is_validated ? 'badge badge-success' : 'badge badge-warning'}>
                    {selectedModerator.moderateurDetails?.is_validated ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo de profil */}
            {selectedModerator.photo && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Photo de profil</div>
                <img src={selectedModerator.photo || "/placeholder.svg"} alt="Photo profil" style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              </div>
            )}

            {/* Pièces d'identité */}
            {selectedModerator.moderateurDetails?.piece_identite_recto && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Pièce d'identité - Recto</div>
                <img src={selectedModerator.moderateurDetails.piece_identite_recto || "/placeholder.svg"} alt="CIN Recto" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            )}

            {selectedModerator.moderateurDetails?.piece_identite_face && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Pièce d'identité - Verso</div>
                <img src={selectedModerator.moderateurDetails.piece_identite_face || "/placeholder.svg"} alt="CIN Verso" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            )}

            {/* Actions si en attente */}
            {!selectedModerator.moderateurDetails?.is_validated && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleStatusChange(selectedModerator.id_employe, 'validate', selectedModerator.nom)
                    setSelectedModerator(null)
                  }}
                >
                  ✓ Valider
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleStatusChange(selectedModerator.id_employe, 'reject', selectedModerator.nom)
                    setSelectedModerator(null)
                  }}
                >
                  ✕ Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Modérateurs en attente */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <span>⏳</span>
                Modérateurs en attente ({pendingModerators.length})
              </h2>
            </div>
            <div className="section-body no-padding">
              {pendingModerators.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Région</th>
                        <th>Vérifié</th>
                        <th>Validé</th>
                        <th>Date demande</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingModerators.map(moderator => (
                        <tr key={moderator.id_employe}>
                          <td style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleViewDetail(moderator)}>
                            {moderator.nom}
                          </td>
                          <td>{moderator.email}</td>
                          <td>{moderator.moderateurDetails?.region || 'N/A'}</td>
                          <td>
                            <span className={moderator.moderateurDetails?.is_verified ? 'badge badge-success' : 'badge badge-warning'}>
                              {moderator.moderateurDetails?.is_verified ? 'Oui' : 'Non'}
                            </span>
                          </td>
                          <td>
                            <span className={moderator.moderateurDetails?.is_validated ? 'badge badge-success' : 'badge badge-warning'}>
                              {moderator.moderateurDetails?.is_validated ? 'Validé' : 'En attente'}
                            </span>
                          </td>
                          <td>{new Date(moderator.createdAt).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <button
                              className="action-btn action-btn-success"
                              onClick={() => handleStatusChange(moderator.id_employe, 'validate', moderator.nom)}
                            >
                              Valider
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleStatusChange(moderator.id_employe, 'reject', moderator.nom)}
                            >
                              Rejeter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">✓</div>
                  <p>Aucun modérateur en attente</p>
                </div>
              )}
            </div>
          </div>

          {/* Tous les modérateurs */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <span>👥</span>
                Tous les modérateurs ({validatedModerators.length})
              </h2>
            </div>
            <div className="section-body no-padding">
              {validatedModerators.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Région</th>
                        <th>Vérifié</th>
                        <th>Validé</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validatedModerators.map(moderator => (
                        <tr key={moderator.id_employe}>
                          <td style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleViewDetail(moderator)}>
                            {moderator.nom}
                          </td>
                          <td>{moderator.email}</td>
                          <td>{moderator.moderateurDetails?.region || 'N/A'}</td>
                          <td>
                            <span className={moderator.moderateurDetails?.is_verified ? 'badge badge-success' : 'badge badge-warning'}>
                              {moderator.moderateurDetails?.is_verified ? 'Oui' : 'Non'}
                            </span>
                          </td>
                          <td>
                            <span className={moderator.moderateurDetails?.is_validated ? 'badge badge-success' : 'badge badge-warning'}>
                              {moderator.moderateurDetails?.is_validated ? 'Validé' : 'En attente'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="action-btn action-btn-primary"
                              onClick={() => handleViewDetail(moderator)}
                            >
                              Détail
                            </button>
                            {!moderator.moderateurDetails?.is_validated && (
                              <>
                                <button
                                  className="action-btn action-btn-success"
                                  onClick={() => handleStatusChange(moderator.id_employe, 'validate', moderator.nom)}
                                >
                                  Valider
                                </button>
                                <button
                                  className="action-btn action-btn-delete"
                                  onClick={() => handleStatusChange(moderator.id_employe, 'reject', moderator.nom)}
                                >
                                  Rejeter
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>Aucun modérateur</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setConfirmAction(null) }}
        onConfirm={confirmStatusChange}
        title={confirmAction?.action === 'validate' ? 'Valider le modérateur' : 'Rejeter le modérateur'}
        message={
          confirmAction?.action === 'validate'
            ? `Êtes-vous sûr de vouloir valider ${confirmAction?.name} ?`
            : `Êtes-vous sûr de vouloir rejeter ${confirmAction?.name} ?`
        }
        confirmText={confirmAction?.action === 'validate' ? 'Valider' : 'Rejeter'}
        confirmStyle={confirmAction?.action === 'validate' ? 'primary' : 'danger'}
      />
    </div>
  )
}

export default AccountValidation
