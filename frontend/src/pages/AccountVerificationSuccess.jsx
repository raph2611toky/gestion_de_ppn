'use client';

import React, { useEffect, useState } from 'react'
import '../styles/login.css'

function AccountVerificationSuccess({ email }) {
  const [timeRemaining, setTimeRemaining] = useState(72 * 60 * 60) // 72 heures en secondes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="login-container">
      <div className="login-card otp-card" style={{ maxWidth: '500px' }}>
        <div className="login-header-simple">
          <div style={{
            fontSize: '3rem',
            textAlign: 'center',
            marginBottom: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            ✓
          </div>
          <h1 className="login-title-simple">Vérification en cours</h1>
          <p className="login-subtitle-simple">Votre demande a été reçue</p>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1rem',
            color: '#16a34a',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Compte en attente de validation
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#4ade80',
            lineHeight: '1.6'
          }}>
            Votre demande d'accès en tant que modérateur a été reçue.
            Un administrateur examinera votre profil et vous confirmera l'accès via email.
          </p>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: '#92400e',
            marginBottom: '1rem'
          }}>
            Actions recommandées:
          </h3>
          <ul style={{
            fontSize: '0.875rem',
            color: '#b45309',
            lineHeight: '1.8',
            paddingLeft: '1.25rem'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Vérifiez régulièrement votre email <strong>{email}</strong>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Consultez aussi le dossier Spam ou Courrier indésirable
            </li>
            <li>
              Vous recevrez une confirmation dans <strong>72 heures maximum</strong>
            </li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#e0e7ff',
          border: '1px solid #a5b4fc',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#3730a3',
            marginBottom: '0.5rem'
          }}>
            Délai de réponse restant:
          </p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2563eb',
            fontFamily: 'monospace'
          }}>
            {formatTime(timeRemaining)}
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>

        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '1rem'
          }}>
            Vous pouvez fermer cette fenêtre en toute sécurité.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountVerificationSuccess
