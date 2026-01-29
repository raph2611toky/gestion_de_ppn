'use client';

import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import { NotificationProvider } from './components/Notifications.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import EmailOTP from './pages/EmailOTP.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import RegionalDashboard from './pages/RegionalDashboard.jsx'
import AccountValidation from './pages/AccountValidation.jsx'
import PPNManagement from './pages/PPNManagement.jsx'
import Analytics from './pages/Analytics.jsx'
import RegionalReports from './pages/RegionalReports.jsx'
import AddReport from './pages/AddReport.jsx'
import Profile from './pages/Profile.jsx'
import './styles/app.css'

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activePage, setActivePage] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!activePage) {
        setActivePage(user.fonction === 'ADMINISTRATEUR' ? 'admin-dashboard' : 'regional-dashboard')
      }
    }
  }, [isAuthenticated, user, activePage])

  if (!isAuthenticated) {
    if (showOTP) {
      return (
        <EmailOTP
          email={otpEmail}
          onVerify={(code) => {
            console.log('OTP verified:', code)
            setShowOTP(false)
          }}
          onBack={() => setShowOTP(false)}
        />
      )
    }
    if (showRegister) {
      return <Register onBack={() => setShowRegister(false)} />
    }
    return <Login onThemeToggle={toggleTheme} theme={theme} onRegister={() => setShowRegister(true)} />
  }

  if (!user) return null

  const getPageTitle = () => {
    switch (activePage) {
      case 'admin-dashboard': return 'Tableau de bord administrateur'
      case 'regional-dashboard': return 'Tableau de bord regional'
      case 'account-validation': return 'Validation des comptes'
      case 'ppn-management': return 'Gestion des PPN'
      case 'analytics': return 'Analytiques'
      case 'regional-reports': return 'Rapports de prix'
      case 'add-report': return 'Nouveau rapport'
      case 'profile': return 'Mon profil'
      default: return 'PPN Manager'
    }
  }

  const renderPage = () => {
    console.log('Rendering page:', activePage)
    switch (activePage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setActivePage} />
      case 'regional-dashboard':
        return <RegionalDashboard onNavigate={setActivePage} />
      case 'account-validation':
        return <AccountValidation />
      case 'ppn-management':
        return <PPNManagement />
      case 'analytics':
        return <Analytics />
      case 'regional-reports':
        return <RegionalReports onNavigate={setActivePage} />
      case 'add-report':
        return <AddReport onNavigate={setActivePage} />
      case 'profile':
        return <Profile onNavigate={setActivePage} />
      default:
        return user.fonction === 'ADMINISTRATEUR'
          ? <AdminDashboard onNavigate={setActivePage} />
          : <RegionalDashboard onNavigate={setActivePage} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={logout}
        onThemeToggle={toggleTheme}
        theme={theme}
      />
      <main className="main-content">
        <Header title={getPageTitle()} onThemeToggle={toggleTheme} theme={theme} />
        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
