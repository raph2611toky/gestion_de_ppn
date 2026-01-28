'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'

function RegionalReports({ onNavigate }) {
  const { user } = useAuth()
  const { priceReports, ppnList } = useData()
  const [filterPPN, setFilterPPN] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

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

        <div style={{ marginLeft: 'auto' }}>
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
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td style={{ fontWeight: 500 }}>{report.ppnName}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {report.price.toLocaleString()} Ar
                      </td>
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
              <p>Aucun rapport trouve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionalReports
