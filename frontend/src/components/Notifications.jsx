'use client';

import React, { createContext, useContext, useState } from 'react'
import '../styles/notifications.css'

const NotificationContext = createContext(null)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = (type, message) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✕'
      case 'info': return 'ℹ'
      default: return 'ℹ'
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification notification-${notif.type}`}>
            <span className="notification-icon">{getIcon(notif.type)}</span>
            <span className="notification-message">{notif.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

// Modal Component
export function Modal({ isOpen, onClose, title, icon, children, footer, size = 'md' }) {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size}`}>
        <div className="modal-header">
          <h3 className="modal-title">
            {icon && <span>{icon}</span>}
            {title}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Confirm Dialog Component
export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmer', 
  confirmStyle = 'danger' 
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon="⚠️"
      size="sm"
      footer={
        <>
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button 
            className={`modal-btn modal-btn-${confirmStyle === 'danger' ? 'danger' : 'primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  )
}

export default NotificationContext
