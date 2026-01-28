'use client';

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import '../styles/dashboard.css'

function RegionalDashboard() {
  const { user } = useAuth()
  const { reports, ppns } = useData()

  const regionReports = reports.filter((r) => r.regionId === user.id)
  const totalReports = regionReports.length
  const ppnCount = ppns.length
  const recentReports = regionReports.slice(-5).reverse()

  const getAveragePrices = () => {
    if (regionReports.length === 0) return { min: 0, max: 0 }
    const minPrices = regionReports.map((r) => r.minUnitPrice)
    const maxPrices = regionReports.map((r) => r.maxUnitPrice)
    const avgMin =
      minPrices.reduce((a, b) => a + b, 0) / minPrices.length
    const avgMax =
      maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length
    return { min: avgMin.toFixed(0), max: avgMax.toFixed(0) }
  }

  const avgPrices = getAveragePrices()

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="dashboard-card stat-card">
          <h3>Rapports saisis</h3>
          <p className="stat-number">{totalReports}</p>
          <p className="stat-label">
            {totalReports === 1 ? 'rapport' : 'rapports'}
          </p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>PPN disponibles</h3>
          <p className="stat-number">{ppnCount}</p>
          <p className="stat-label">
            {ppnCount === 1 ? 'produit' : 'produits'}
          </p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>Prix moyen minimum</h3>
          <p className="stat-number">{avgPrices.min}</p>
          <p className="stat-label">derniers rapports</p>
        </div>

        <div className="dashboard-card stat-card">
          <h3>Prix moyen maximum</h3>
          <p className="stat-number">{avgPrices.max}</p>
          <p className="stat-label">derniers rapports</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Rapports récents</h2>
        {recentReports.length > 0 ? (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>PPN</th>
                <th>District</th>
                <th>Prix min (unitaire)</th>
                <th>Prix max (unitaire)</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id}>
                  <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                  <td>{report.ppnName}</td>
                  <td>{report.district}</td>
                  <td>{report.minUnitPrice}</td>
                  <td>{report.maxUnitPrice}</td>
                  <td>{report.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Aucun rapport saisi pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegionalDashboard
