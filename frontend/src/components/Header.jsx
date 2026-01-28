'use client';

import React from 'react'
import '../styles/header.css'

function Header({ title, onThemeToggle, theme }) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onThemeToggle}
          title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}

export default Header
