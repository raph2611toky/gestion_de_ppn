'use client';

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import '../styles/admin-dashboard.css'

function AdminDashboard() {
  const { users, pendingRegistrations } = useAuth()
  const { reports, ppns } = useData()

  const approvedRegions = users.filter(
    (u) => u.role === 'region' && u.status === 'approved'
  )
  const totalReports = reports.length
  const totalPpns = ppns.length
  const pendingCount = pendingRegistrations.length

  const getRecentReports = (count = 5) => {
    return reports.slice(-count).reverse()
  }

  const getRegionStats = () => {
    return approvedRegions.map((region) => {
      const regionReports = reports.filter((r) => r.regionId === region.id)
      return {
        name: region.fullName,
        reportCount: regionReports.length,
        lastReport: regionReports[regionReports.length - 1]?.date,
      }
    })
  }

  const recentReports = getRecentReports(10)
  const regionStats = getRegionStats()

  return (
    <div className="admin-dashboard-container">
      <div className="admin-grid">
        <div className="dashboard-card stat-card">
          <h3>Régions approuvées</h3>
          <p className="stat-number">{approvedRegions.length}</p>
          <p className="stat-label">
            {approvedRegions.length === 1 ? 'région' : 'régions'}
          </p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>Demandes en attente</h3>
          <p className="stat-number">{pendingCount}</p>
          <p className="stat-label">
            {pendingCount === 1 ? 'demande' : 'demandes'}
          </p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>Total des rapports</h3>
          <p className="stat-number">{totalReports}</p>
          <p className="stat-label">
            {totalReports === 1 ? 'rapport' : 'rapports'}
          </p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>PPN disponibles</h3>
          <p className="stat-number">{totalPpns}</p>
          <p className="stat-label">
            {totalPpns === 1 ? 'produit' : 'produits'}
          </p>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-section">
          <h2>Rapports récents</h2>
          {recentReports.length > 0 ? (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Région</th>
                  <th>PPN</th>
                  <th>District</th>
                  <th>Prix min</th>
                  <th>Prix max</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id}>
                    <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                    <td>{report.regionName}</td>
                    <td>{report.ppnName}</td>
                    <td>{report.district}</td>
                    <td>{report.minUnitPrice}</td>
                    <td>{report.maxUnitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Aucun rapport à afficher</p>
            </div>
          )}
        </div>

        <div className="admin-section">
          <h2>Activité par région</h2>
          {regionStats.length > 0 ? (
            <table className="region-stats-table">
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Rapports</th>
                  <th>Dernier rapport</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((stat, idx) => (
                  <tr key={idx}>
                    <td>{stat.name}</td>
                    <td>
                      <span className="badge-primary">{stat.reportCount}</span>
                    </td>
                    <td>
                      {stat.lastReport
                        ? new Date(stat.lastReport).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Aucune région approuvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
