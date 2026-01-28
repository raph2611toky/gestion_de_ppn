'use client';

import React from 'react'
import { useData } from '../contexts/DataContext.jsx'

function AdminDashboard({ onNavigate }) {
  const { ppnList, priceReports, accounts } = useData()
  
  const pendingAccounts = accounts.filter(a => a.status === 'pending').length
  const totalReportsThisMonth = priceReports.filter(r => {
    const reportDate = new Date(r.date)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    { 
      id: 'ppn-management',
      label: 'Produits PPN', 
      value: ppnList.length, 
      icon: '📦', 
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    { 
      id: 'account-validation',
      label: 'Comptes en attente', 
      value: pendingAccounts, 
      icon: '👥', 
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    { 
      id: 'analytics',
      label: 'Rapports ce mois', 
      value: totalReportsThisMonth, 
      icon: '📊', 
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      id: 'analytics',
      label: 'Total rapports', 
      value: priceReports.length, 
      icon: '📈', 
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
  ]

  const recentReports = [...priceReports]
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
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Region</th>
                  <th>Date</th>
                  <th>Agent</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report.id}>
                    <td>{report.ppnName}</td>
                    <td style={{ fontWeight: 600 }}>{report.price.toLocaleString()} Ar</td>
                    <td>{report.region}</td>
                    <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                    <td>{report.reportedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
