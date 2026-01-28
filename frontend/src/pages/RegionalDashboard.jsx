'use client';

import React from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'

function RegionalDashboard({ onNavigate }) {
  const { user } = useAuth()
  const { priceReports, ppnList } = useData()
  
  const myReports = priceReports.filter(r => r.region === user?.region)
  const thisMonthReports = myReports.filter(r => {
    const reportDate = new Date(r.date)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  })

  const stats = [
    { 
      id: 'regional-reports',
      label: 'Mes rapports', 
      value: myReports.length, 
      icon: '📋', 
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    { 
      id: 'add-report',
      label: 'Ce mois', 
      value: thisMonthReports.length, 
      icon: '📅', 
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      id: 'add-report',
      label: 'Produits PPN', 
      value: ppnList.length, 
      icon: '📦', 
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
  ]

  const recentReports = [...myReports]
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
            Mes derniers rapports
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('add-report')}
          >
            + Nouveau rapport
          </button>
        </div>
        <div className="section-body no-padding">
          {recentReports.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>District</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(report => (
                    <tr key={report.id}>
                      <td>{report.ppnName}</td>
                      <td style={{ fontWeight: 600 }}>{report.price.toLocaleString()} Ar</td>
                      <td>{report.district}</td>
                      <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
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
                onClick={() => onNavigate('add-report')}
                style={{ marginTop: '1rem' }}
              >
                Creer mon premier rapport
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionalDashboard
