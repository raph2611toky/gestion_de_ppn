'use client';

import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Notifications from './components/Notifications'
import RegionalDashboard from './pages/RegionalDashboard'
import RegionalReports from './pages/RegionalReports'
import AddReport from './pages/AddReport'
import AdminDashboard from './pages/AdminDashboard'
import AccountValidation from './pages/AccountValidation'
import PPNManagement from './pages/PPNManagement'
import Analytics from './pages/Analytics'
import './styles/app.css'

function AppContent() {
  const { user, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (!savedUser && user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  }, [user])

  const handleLogout = () => {
    logout()
    setCurrentPage('login')
  }

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Tableau de bord',
      reports: 'Rapports de prix',
      'add-report': 'Ajouter un rapport',
      'admin-dashboard': 'Tableau de bord administratif',
      accounts: 'Gestion des comptes régionaux',
      'ppn-management': 'Gestion des PPN',
      analytics: 'Analyses et graphiques',
    }
    return titles[currentPage] || 'Dashboard'
  }

  if (!user) {
    return <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="app-main">
        <Header pageTitle={getPageTitle()} onLogout={handleLogout} />

        <main className="app-content">
          {user.role === 'region' && (
            <>
              {currentPage === 'dashboard' && <RegionalDashboard />}
              {currentPage === 'reports' && <RegionalReports />}
              {currentPage === 'add-report' && <AddReport />}
            </>
          )}

          {user.role === 'admin' && (
            <>
              {currentPage === 'admin-dashboard' && <AdminDashboard />}
              {currentPage === 'accounts' && <AccountValidation />}
              {currentPage === 'ppn-management' && <PPNManagement />}
              {currentPage === 'analytics' && <Analytics />}
            </>
          )}
        </main>
      </div>

      <Notifications />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
