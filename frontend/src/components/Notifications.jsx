'use client';

import React from 'react'
import { useData } from '../contexts/DataContext'
import '../styles/notifications.css'

function Notifications() {
  const { notifications, removeNotification } = useData()

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Notifications
