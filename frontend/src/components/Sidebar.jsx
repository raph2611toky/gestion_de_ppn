'use client';

import React from 'react'
import '../styles/sidebar.css'

function Sidebar({ activePage, onNavigate, user, onLogout, onThemeToggle, theme }) {
  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'account-validation', label: 'Validation comptes', icon: '👥' },
    { id: 'ppn-management', label: 'Gestion PPN', icon: '📦' },
    { id: 'analytics', label: 'Analytiques', icon: '📈' },
  ]

  const regionalNavItems = [
    { id: 'regional-dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'regional-reports', label: 'Rapports de prix', icon: '📋' },
    { id: 'add-report', label: 'Nouveau rapport', icon: '➕' },
  ]

  const navItems = user.role === 'admin' ? adminNavItems : regionalNavItems

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">📦</div>
          <div className="sidebar-brand-text">
            <h1 className="sidebar-brand-title">PPN Manager</h1>
            <p className="sidebar-brand-subtitle">Systeme de gestion</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Navigation</p>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Parametres</p>
          <button
            className="sidebar-nav-item"
            onClick={onThemeToggle}
          >
            <span className="sidebar-nav-item-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role === 'admin' ? 'Administrateur' : user.region}</p>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <span>🚪</span>
          <span>Deconnexion</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
