'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import '../styles/account-validation.css'

function AccountValidation() {
  const { users, approveRegistration, rejectRegistration, updateUserStatus, pendingRegistrations } =
    useAuth()
  const { addNotification } = useData()
  const [filter, setFilter] = useState('all')

  const regionalUsers = users.filter((u) => u.role === 'region')
  const approvedUsers = regionalUsers.filter((u) => u.status === 'approved')
  const rejectedUsers = regionalUsers.filter((u) => u.status === 'rejected')

  let displayUsers = regionalUsers
  if (filter === 'approved') displayUsers = approvedUsers
  if (filter === 'rejected') displayUsers = rejectedUsers
  if (filter === 'pending') displayUsers = pendingRegistrations

  const handleApprove = (userId) => {
    approveRegistration(userId)
    addNotification('Compte validé avec succès', 'success')
  }

  const handleReject = (userId) => {
    rejectRegistration(userId)
    addNotification('Compte refusé', 'success')
  }

  const handleRevokeApproval = (userId) => {
    updateUserStatus(userId, 'rejected')
    addNotification('Validation révoquée', 'success')
  }

  return (
    <div className="validation-container">
      <div className="validation-tabs">
        <button
          className={`tab-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({regionalUsers.length})
        </button>
        <button
          className={`tab-button ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Validés ({approvedUsers.length})
        </button>
        <button
          className={`tab-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente ({pendingRegistrations.length})
        </button>
        <button
          className={`tab-button ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Refusés ({rejectedUsers.length})
        </button>
      </div>

      <div className="validation-content">
        {displayUsers.length > 0 ? (
          <table className="validation-table">
            <thead>
              <tr>
                <th>Région</th>
                <th>Email</th>
                <th>Utilisateur</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.regionName}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status === 'approved'
                        ? 'Validé'
                        : user.status === 'pending'
                          ? 'En attente'
                          : 'Refusé'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {user.status === 'pending' && (
                      <>
                        <button
                          className="btn-success btn-small"
                          onClick={() => handleApprove(user.id)}
                        >
                          Valider
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleReject(user.id)}
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {user.status === 'approved' && (
                      <button
                        className="btn-warning btn-small"
                        onClick={() => handleRevokeApproval(user.id)}
                      >
                        Révoquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Aucun compte à afficher</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountValidation
