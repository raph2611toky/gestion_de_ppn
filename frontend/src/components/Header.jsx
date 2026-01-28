'use client';

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/header.css'

function Header({ pageTitle, onLogout }) {
  const { user } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="page-title">{pageTitle}</h1>

        <div className="header-right">
          <div className="user-status">
            <span className="role-badge">
              {user?.role === 'admin' ? 'Admin' : 'Région'}
            </span>
            <span className="username">{user?.fullName}</span>
          </div>

          <button onClick={onLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
