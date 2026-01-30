'use client';

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/sidebar.css'

function Sidebar({ currentPath, user, onLogout, onThemeToggle, theme }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activePage = location.pathname.split('/').pop(); // Declare activePage variable

  const adminNavItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/dashboard/account-validation', label: 'Validation modérateurs', icon: '👥' },
    { path: '/dashboard/ppn-management', label: 'Gestion PPN', icon: '📦' },
    { path: '/dashboard/analytics', label: 'Analytiques', icon: '📈' },
  ]

  const regionalNavItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/dashboard/regional-reports', label: 'Rapports de prix', icon: '📋' },
    { path: '/dashboard/add-report', label: 'Nouveau rapport', icon: '➕' },
  ]

  const navItems = user?.fonction === 'ADMINISTRATEUR' ? adminNavItems : regionalNavItems
  const onNavigate = (path) => navigate(path); // Declare onNavigate function

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
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Parametres</p>
          <button
            className={`sidebar-nav-item ${location.pathname === '/dashboard/profile' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/profile')}
          >
            <span className="sidebar-nav-item-icon">👤</span>
            <span>Mon profil</span>
          </button>
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
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.nom}</p>
            <p className="sidebar-user-role">{user.fonction === 'ADMINISTRATEUR' ? 'Administrateur' : user.moderateurDetails?.region}</p>
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
