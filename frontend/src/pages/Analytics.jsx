'use client';

import React, { useState } from 'react'
import { useData, REGIONS } from '../contexts/DataContext.jsx'
import { BarChart, LineChart } from '../components/SimpleChart.jsx'

function Analytics() {
  const { priceReports, ppnList } = useData()
  const [selectedPPN, setSelectedPPN] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Filter reports
  const filteredReports = priceReports.filter(report => {
    const reportDate = new Date(report.date)
    const reportMonth = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`
    
    const matchesPPN = !selectedPPN || report.ppnId === selectedPPN
    const matchesRegion = !selectedRegion || report.region === selectedRegion
    const matchesMonth = !selectedMonth || reportMonth === selectedMonth
    
    return matchesPPN && matchesRegion && matchesMonth
  })

  // Prepare chart data - by region
  const regionData = REGIONS.slice(0, 6).map(region => {
    const regionReports = filteredReports.filter(r => r.region === region)
    const avgPrice = regionReports.length > 0 
      ? Math.round(regionReports.reduce((sum, r) => sum + r.price, 0) / regionReports.length)
      : 0
    return { label: region.slice(0, 8), value: avgPrice }
  }).filter(d => d.value > 0)

  // Prepare chart data - by date (for line chart)
  const dateData = (() => {
    const groupedByDate = {}
    filteredReports.forEach(report => {
      const date = report.date.slice(0, 10)
      if (!groupedByDate[date]) groupedByDate[date] = []
      groupedByDate[date].push(report.price)
    })
    
    return Object.entries(groupedByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, prices]) => ({
        label: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        value: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      }))
  })()

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">Produit PPN</label>
          <select
            className="filter-select"
            value={selectedPPN}
            onChange={(e) => setSelectedPPN(e.target.value)}
          >
            <option value="">Tous les produits</option>
            {ppnList.map(ppn => (
              <option key={ppn.id} value={ppn.id}>{ppn.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Region</label>
          <select
            className="filter-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Toutes les regions</option>
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Mois</label>
          <input
            type="month"
            className="filter-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <span className="filter-badge">
            {filteredReports.length} rapport(s)
          </span>
        </div>
      </div>

      {/* Charts */}
      {filteredReports.length > 0 ? (
        <div className="charts-container">
          <BarChart data={regionData} title="Prix moyen par region (Ar)" />
          <LineChart data={dateData} title="Evolution des prix" />
        </div>
      ) : (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>Aucune donnee disponible pour les filtres selectionnes</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="section-card" style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            Detail des rapports
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
                  <th>District</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.slice(0, 10).map(report => (
                  <tr key={report.id}>
                    <td>{report.ppnName}</td>
                    <td style={{ fontWeight: 600 }}>{report.price.toLocaleString()} Ar</td>
                    <td>{report.region}</td>
                    <td>{report.district}</td>
                    <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
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

export default Analytics
