'use client';

import React, { useState } from 'react'
import { useData } from '../contexts/DataContext.jsx'
import { useNotification, ConfirmDialog } from '../components/Notifications.jsx'

function AccountValidation() {
  const { accounts, updateAccountStatus } = useData()
  const { showNotification } = useNotification()
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const handleStatusChange = (id, status, name) => {
    setConfirmAction({ id, status, name })
    setShowConfirm(true)
  }

  const confirmStatusChange = () => {
    if (!confirmAction) return
    updateAccountStatus(confirmAction.id, confirmAction.status)
    const message = confirmAction.status === 'approved' 
      ? `Compte de ${confirmAction.name} approuve` 
      : confirmAction.status === 'revoked'
      ? `Acces de ${confirmAction.name} revoque`
      : `Demande de ${confirmAction.name} rejetee`
    showNotification('success', message)
    setConfirmAction(null)
  }

  const pendingAccounts = accounts.filter(a => a.status === 'pending')
  const approvedAccounts = accounts.filter(a => a.status === 'approved')
  const revokedAccounts = accounts.filter(a => a.status === 'revoked')

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'badge badge-warning'
      case 'approved': return 'badge badge-success'
      case 'revoked': return 'badge badge-danger'
      default: return 'badge'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'approved': return 'Approuve'
      case 'revoked': return 'Revoque'
      default: return status
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Pending Accounts */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>⏳</span>
            Demandes en attente ({pendingAccounts.length})
          </h2>
        </div>
        <div className="section-body no-padding">
          {pendingAccounts.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Utilisateur</th>
                    <th>Region</th>
                    <th>Date demande</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAccounts.map(account => (
                    <tr key={account.id}>
                      <td style={{ fontWeight: 500 }}>{account.name}</td>
                      <td>{account.username}</td>
                      <td>{account.region}</td>
                      <td>{new Date(account.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button
                          className="action-btn action-btn-success"
                          onClick={() => handleStatusChange(account.id, 'approved', account.name)}
                        >
                          Approuver
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleStatusChange(account.id, 'revoked', account.name)}
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
              <p>Aucune demande en attente</p>
            </div>
          )}
        </div>
      </div>

      {/* All Accounts */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>👥</span>
            Tous les comptes ({accounts.length})
          </h2>
        </div>
        <div className="section-body no-padding">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Utilisateur</th>
                  <th>Region</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...approvedAccounts, ...revokedAccounts].map(account => (
                  <tr key={account.id}>
                    <td style={{ fontWeight: 500 }}>{account.name}</td>
                    <td>{account.username}</td>
                    <td>{account.region}</td>
                    <td>
                      <span className={getStatusBadge(account.status)}>
                        {getStatusLabel(account.status)}
                      </span>
                    </td>
                    <td>
                      {account.status === 'approved' ? (
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleStatusChange(account.id, 'revoked', account.name)}
                        >
                          Revoquer
                        </button>
                      ) : (
                        <button
                          className="action-btn action-btn-success"
                          onClick={() => handleStatusChange(account.id, 'approved', account.name)}
                        >
                          Reactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setConfirmAction(null) }}
        onConfirm={confirmStatusChange}
        title={
          confirmAction?.status === 'approved' ? 'Approuver le compte' :
          confirmAction?.status === 'revoked' ? "Revoquer l'acces" : "Confirmer l'action"
        }
        message={
          confirmAction?.status === 'approved' 
            ? `Etes-vous sur de vouloir approuver le compte de ${confirmAction?.name} ?`
            : `Etes-vous sur de vouloir revoquer l'acces de ${confirmAction?.name} ?`
        }
        confirmText={confirmAction?.status === 'approved' ? 'Approuver' : 'Revoquer'}
        confirmStyle={confirmAction?.status === 'approved' ? 'primary' : 'danger'}
      />
    </div>
  )
}

export default AccountValidation
