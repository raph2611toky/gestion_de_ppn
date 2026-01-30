'use client';

import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
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

// Composant pour les routes protégées
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Composant pour les pages d'authentification
function AuthPage({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// Composant pour la redirection de la route racine
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Chargement...</div>
    </div>
  )
}

// Composant pour le layout du dashboard
function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const getPageTitle = () => {
    const titles = {
      '/dashboard': user?.fonction === 'ADMINISTRATEUR' ? 'Tableau de bord administrateur' : 'Tableau de bord régional',
      '/dashboard/account-validation': 'Validation des comptes',
      '/dashboard/ppn-management': 'Gestion des PPN',
      '/dashboard/analytics': 'Analytiques',
      '/dashboard/regional-reports': 'Rapports de prix',
      '/dashboard/add-report': 'Nouveau rapport',
      '/dashboard/profile': 'Mon profil',
    }
    return titles[location.pathname] || 'PPN Manager'
  }

  return (
    <div className="app-container">
      <Sidebar
        currentPath={location.pathname}
        user={user}
        onLogout={logout}
        onThemeToggle={toggleTheme}
        theme={theme}
      />
      <main className="main-content">
        <Header title={getPageTitle()} onThemeToggle={toggleTheme} theme={theme} />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <Routes>
      {/* Routes d'authentification */}
      <Route path="/login" element={<AuthPage><Login onThemeToggle={toggleTheme} theme={theme} /></AuthPage>} />
      <Route path="/register" element={<AuthPage><Register /></AuthPage>} />
      <Route path="/otp-verify" element={<AuthPage><EmailOTP /></AuthPage>} />

      {/* Routes du dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            {isAuthenticated && <AdminDashboard />}
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/account-validation" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AccountValidation />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/ppn-management" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PPNManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/regional-reports" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RegionalReports />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/add-report" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AddReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Redirection par défaut */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
