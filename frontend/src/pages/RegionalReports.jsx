'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import '../styles/reports.css'

function RegionalReports() {
  const { user } = useAuth()
  const { reports, deleteReport } = useData()
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterPpn, setFilterPpn] = useState('')
  const [filterRegion, setFilterRegion] = useState('')

  const regionReports = reports.filter((r) => r.regionId === user.id)
  const otherRegionReports = reports.filter((r) => r.regionId !== user.id)

  let filteredRegionReports = regionReports
  if (filterDistrict) {
    filteredRegionReports = filteredRegionReports.filter(
      (r) => r.district.toLowerCase().includes(filterDistrict.toLowerCase())
    )
  }
  if (filterPpn) {
    filteredRegionReports = filteredRegionReports.filter(
      (r) => r.ppnId === filterPpn
    )
  }

  let filteredOtherReports = otherRegionReports
  if (filterRegion) {
    filteredOtherReports = filteredOtherReports.filter(
      (r) => r.regionId === filterRegion
    )
  }

  const districts = [...new Set(regionReports.map((r) => r.district))]
  const ppnIds = [...new Set(regionReports.map((r) => r.ppnId))]
  const uniqueRegions = [...new Set(otherRegionReports.map((r) => r.regionId))]

  const handleDelete = (reportId) => {
    if (
      window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport?')
    ) {
      deleteReport(reportId)
    }
  }

  const ReportTable = ({ reports, title, showDelete = false }) => (
    <div className="reports-section">
      <h3>{title}</h3>
      {reports.length > 0 ? (
        <table className="reports-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>PPN</th>
              <th>District</th>
              <th>Prix min</th>
              <th>Prix max</th>
              <th>Gros min</th>
              <th>Gros max</th>
              <th>Observation</th>
              {showDelete && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{new Date(report.date).toLocaleDateString('fr-FR')}</td>
                <td>{report.ppnName}</td>
                <td>{report.district}</td>
                <td>{report.minUnitPrice}</td>
                <td>{report.maxUnitPrice}</td>
                <td>{report.minBulkPrice}</td>
                <td>{report.maxBulkPrice}</td>
                <td>{report.observation}</td>
                {showDelete && (
                  <td>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(report.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                )}
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
  )

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Mes rapports</h2>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filtrer par district"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterPpn}
            onChange={(e) => setFilterPpn(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les PPN</option>
            {ppnIds.map((ppnId) => {
              const ppn = reports.find((r) => r.ppnId === ppnId)
              return (
                <option key={ppnId} value={ppnId}>
                  {ppn?.ppnName}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <ReportTable
        reports={filteredRegionReports}
        title={`Rapports de la région (${filteredRegionReports.length})`}
        showDelete={true}
      />

      <div className="reports-divider" />

      <h2>Rapports des autres régions</h2>
      <div className="filter-group">
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les régions</option>
          {uniqueRegions.map((regionId) => {
            const region = otherRegionReports.find(
              (r) => r.regionId === regionId
            )
            return (
              <option key={regionId} value={regionId}>
                {region?.regionName}
              </option>
            )
          })}
        </select>
      </div>

      <ReportTable
        reports={filteredOtherReports}
        title={`Rapports en lecture seule (${filteredOtherReports.length})`}
        showDelete={false}
      />
    </div>
  )
}

export default RegionalReports
