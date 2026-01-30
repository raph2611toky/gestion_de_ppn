'use client';

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../components/Notifications'

function RegionalDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { error: showError } = useNotification()
  
  const [rapports, setRapports] = useState([])
  const [ppns, setPpns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const myReports = rapports; // Declare myReports variable
  const ppnList = ppns; // Declare ppnList variable

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [rapportsRes, ppnsRes] = await Promise.all([
          api.get('/rapports/my'),
          api.get('/ppns')
        ])
        setRapports(rapportsRes.data)
        setPpns(ppnsRes.data)
      } catch (err) {
        console.log('[v0] Erreur lors du chargement des données:', err.message)
        showError('Impossible de charger les données')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [showError])

  const thisMonthReports = rapports.filter(r => {
    const reportDate = new Date(r.date)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  })

  const stats = [
    { 
      id: 'my-reports',
      label: 'Mes rapports', 
      value: rapports.length, 
      icon: '📋', 
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    { 
      id: 'this-month',
      label: 'Ce mois', 
      value: thisMonthReports.length, 
      icon: '📅', 
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      id: 'ppns',
      label: 'Produits PPN', 
      value: ppns.length, 
      icon: '📦', 
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
  ]

  const recentReports = [...rapports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleStatClick = (id) => {
    switch (id) {
      case 'my-reports':
        navigate('/dashboard/regional-reports')
        break
      case 'this-month':
        navigate('/dashboard/regional-reports')
        break
      case 'ppns':
        navigate('/dashboard/ppn-management')
        break
      default:
        break
    }
  }

  const onNavigate = (id) => {
    handleStatClick(id)
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.id + index}
            className="stat-card"
            onClick={() => handleStatClick(stat.id)}
            style={{ cursor: 'pointer' }}
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
            Mes derniers rapports
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/add-report')}
          >
            + Nouveau rapport
          </button>
        </div>
        <div className="section-body no-padding">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
          ) : recentReports.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unitaire</th>
                    <th>Prix gros</th>
                    <th>District</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(rapport => (
                    <tr key={rapport.idrapport}>
                      <td style={{ fontWeight: 500 }}>{rapport.ppn?.nomppn}</td>
                      <td>{rapport.prixunitairemin} - {rapport.prixunitairemax}</td>
                      <td>{rapport.prixgrosmin} - {rapport.prixgrosmax}</td>
                      <td>{rapport.district}</td>
                      <td>{new Date(rapport.date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>Aucun rapport pour le moment</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard/add-report')}
                style={{ marginTop: '1rem' }}
              >
                Créer mon premier rapport
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionalDashboard
