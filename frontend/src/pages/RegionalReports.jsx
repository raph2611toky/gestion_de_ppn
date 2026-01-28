'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'
import { useNotification } from '../components/Notifications.jsx'
import { generateRegionReportPDF } from '../utils/pdfGenerator.js'

function RegionalReports({ onNavigate }) {
  const { user } = useAuth()
  const { priceReports, ppnList } = useData()
  const { showNotification } = useNotification()
  const [filterPPN, setFilterPPN] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const myReports = priceReports.filter(r => r.region === user?.region)

  const filteredReports = myReports.filter(report => {
    const matchesPPN = !filterPPN || report.ppnId === filterPPN
    const matchesMonth = !filterMonth || report.date.startsWith(filterMonth)
    return matchesPPN && matchesMonth
  })

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">Produit</label>
          <select
            className="filter-select"
            value={filterPPN}
            onChange={(e) => setFilterPPN(e.target.value)}
          >
            <option value="">Tous les produits</option>
            {ppnList.map(ppn => (
              <option key={ppn.id} value={ppn.id}>{ppn.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Mois</label>
          <input
            type="month"
            className="filter-input"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button
            className="btn btn-secondary"
            onClick={async () => {
              setIsGeneratingPDF(true)
              try {
                await generateRegionReportPDF(user?.region, filteredReports, ppnList)
                showNotification('success', 'PDF genere avec succes')
              } catch (error) {
                showNotification('error', 'Erreur lors de la generation du PDF')
              }
              setIsGeneratingPDF(false)
            }}
            disabled={isGeneratingPDF || filteredReports.length === 0}
          >
            {isGeneratingPDF ? 'Generation...' : 'Telecharger PDF'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('add-report')}
          >
            + Nouveau rapport
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            Mes rapports de prix ({filteredReports.length})
          </h2>
        </div>
        <div className="section-body no-padding">
          {filteredReports.length > 0 ? (
            <div className="table-container">
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix Unit. Min</th>
                      <th>Prix Unit. Max</th>
                      <th>Prix Gros Min</th>
                      <th>Prix Gros Max</th>
                      <th>District</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr key={report.id}>
                        <td style={{ fontWeight: 500 }}>{report.ppnName}</td>
                        <td>{report.prix_unitaire_min?.toLocaleString('fr-FR') || '0'} Ar</td>
                        <td>{report.prix_unitaire_max?.toLocaleString('fr-FR') || '0'} Ar</td>
                        <td>{report.prix_gros_min?.toLocaleString('fr-FR') || '0'} Ar</td>
                        <td>{report.prix_gros_max?.toLocaleString('fr-FR') || '0'} Ar</td>
                        <td>{report.district}</td>
                        <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>Aucun rapport trouve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionalReports
