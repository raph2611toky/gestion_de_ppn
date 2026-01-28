'use client';

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/sidebar.css'

function Sidebar({ currentPage, onNavigate }) {
  const { user } = useAuth()

  const regionMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'reports', label: 'Rapports de prix' },
    { id: 'add-report', label: 'Ajouter un rapport' },
  ]

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Tableau de bord' },
    { id: 'accounts', label: 'Gestion des comptes' },
    { id: 'ppn-management', label: 'Gestion des PPN' },
    { id: 'analytics', label: 'Analyses et graphiques' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : regionMenuItems

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">PPN</div>
          <span>Gestion PPN</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.fullName?.[0] || 'U'}</div>
          <div className="user-details">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role">
              {user?.role === 'admin' ? 'Administrateur' : 'Région'}
            </p>
            {user?.regionName && <p className="user-region">{user.regionName}</p>}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
