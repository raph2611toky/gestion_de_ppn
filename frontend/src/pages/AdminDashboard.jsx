'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { useNotification } from '../components/Notifications.jsx'

function AdminDashboard({ onNavigate }) {
  const { showNotification } = useNotification()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      console.log('[v0] Fetching admin dashboard data...')
      const response = await api.get('/dashboard')
      setDashboardData(response.data)
      console.log('[v0] Admin dashboard data:', response.data)
    } catch (err) {
      console.log('[v0] Erreur lors du chargement du dashboard admin:', err.message)
      showNotification('error', 'Impossible de charger les données du dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Chargement du dashboard...
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        Erreur lors du chargement des données
      </div>
    )
  }

  const stats = [
    { 
      id: 'ppn-management',
      label: 'Produits PPN', 
      value: dashboardData.stats?.produitsPpn || 0, 
      icon: '📦', 
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    { 
      id: 'account-validation',
      label: 'Comptes en attente', 
      value: dashboardData.stats?.comptesEnAttente || 0, 
      icon: '👥', 
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    { 
      id: 'analytics',
      label: 'Rapports ce mois', 
      value: dashboardData.stats?.rapportsThisMonth || 0, 
      icon: '📊', 
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      id: 'analytics',
      label: 'Total rapports', 
      value: dashboardData.stats?.totalRapports || 0, 
      icon: '📈', 
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      id: 'analytics',
      label: 'Régions', 
      value: dashboardData.stats?.nombreRegions || 0, 
      icon: '🗺️', 
      color: '#ec4899',
      bgColor: '#fce7f3'
    },
  ]

  const recentReports = (dashboardData.latestRapports || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.id + index}
            className="stat-card"
            onClick={() => onNavigate(stat.id)}
          >
            <div 
              className="stat-card-icon"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
            <span className="stat-card-arrow">→</span>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            Derniers rapports de prix
          </h2>
        </div>
        <div className="section-body no-padding">
          {recentReports.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unitaire</th>
                    <th>Prix gros</th>
                    <th>District</th>
                    <th>Date</th>
                    <th>Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(report => (
                    <tr key={report.idrapport || report.id_rapport}>
                      <td style={{ fontWeight: 500 }}>{report.ppn?.nomppn || 'N/A'}</td>
                      <td>
                        {(report.prix_unitaire_min || report.prix_unitaire_min) ? 
                          `${(report.prix_unitaire_min || report.prix_unitaire_min).toLocaleString()} - ${(report.prix_unitaire_max || report.prix_unitaire_max).toLocaleString()} Ar` 
                          : 'N/A'
                        }
                      </td>
                      <td>
                        {(report.prix_gros_min || report.prix_gros_min) ? 
                          `${(report.prix_gros_min || report.prix_gros_min).toLocaleString()} - ${(report.prix_gros_max || report.prix_gros_max).toLocaleString()} Ar` 
                          : 'N/A'
                        }
                      </td>
                      <td>{report.district}</td>
                      <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                      <td>{report.employe?.nom || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              Aucun rapport pour le moment
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
