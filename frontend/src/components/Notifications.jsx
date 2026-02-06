'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import '../styles/notifications.css'

/* =========================================================
   CONTEXT
========================================================= */
const NotificationContext = createContext(null)

/* =========================================================
   HOOK
========================================================= */
export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

/* =========================================================
   PROVIDER
========================================================= */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = Date.now() + Math.random()

      setNotifications((prev) => [
        ...prev,
        { id, message, type },
      ])

      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration)
      }

      return id
    },
    [removeNotification]
  )

  const success = useCallback(
    (message, duration = 3000) =>
      addNotification(message, 'success', duration),
    [addNotification]
  )

  const error = useCallback(
    (message, duration = 5000) =>
      addNotification(message, 'error', duration),
    [addNotification]
  )

  const info = useCallback(
    (message, duration = 3000) =>
      addNotification(message, 'info', duration),
    [addNotification]
  )

  const warning = useCallback(
    (message, duration = 4000) =>
      addNotification(message, 'warning', duration),
    [addNotification]
  )

  /* =========================================================
     🎯 showNotification (CE QUE TU VOULAIS)
     utilisable via:
     const { showNotification } = useNotification()
  ========================================================= */
  const showNotification = useCallback(
    (type, message, duration) => {
      switch (type) {
        case 'success':
          return success(message, duration)
        case 'error':
          return error(message, duration)
        case 'warning':
          return warning(message, duration)
        case 'info':
        default:
          return info(message, duration)
      }
    },
    [success, error, warning, info]
  )

  return (
    <NotificationContext.Provider
      value={{
        // API bas niveau
        addNotification,
        removeNotification,

        // raccourcis
        success,
        error,
        info,
        warning,

        // ⭐ API générique
        showNotification,

        notifications,
      }}
    >
      {children}

      {/* UI notifications */}
      <div className="notifications-container">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification notification-${notif.type}`}
          >
            <span className="notification-message">
              {notif.message}
            </span>
            <button
              className="notification-close"
              onClick={() => removeNotification(notif.id)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

/* =========================================================
   CONFIRM DIALOG
========================================================= */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDangerous = false,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onCancel}
          >
            ✖
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={
              isDangerous
                ? 'modal-btn modal-btn-danger'
                : 'modal-btn modal-btn-primary'
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationContext