'use client';

import React, { useState, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import SimpleChart from '../components/SimpleChart'
import '../styles/analytics.css'

function Analytics() {
  const { reports } = useData()
  const [filterRegion, setFilterRegion] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  const filteredReports = useMemo(() => {
    let filtered = reports

    if (filterRegion) {
      filtered = filtered.filter((r) => r.regionId === filterRegion)
    }

    if (filterMonth) {
      filtered = filtered.filter((r) => {
        const reportDate = new Date(r.date)
        return reportDate.toISOString().startsWith(filterMonth)
      })
    }

    return filtered
  }, [reports, filterRegion, filterMonth])

  const uniqueRegions = [...new Set(reports.map((r) => r.regionId))]
  const uniqueMonths = [
    ...new Set(
      reports.map((r) => new Date(r.date).toISOString().split('T')[0].slice(0, 7))
    ),
  ].sort().reverse()

  const getPricesByPpn = () => {
    const ppnPrices = {}
    filteredReports.forEach((report) => {
      if (!ppnPrices[report.ppnName]) {
        ppnPrices[report.ppnName] = {
          minPrices: [],
          maxPrices: [],
          avgMin: 0,
          avgMax: 0,
        }
      }
      ppnPrices[report.ppnName].minPrices.push(report.minUnitPrice)
      ppnPrices[report.ppnName].maxPrices.push(report.maxUnitPrice)
    })

    Object.keys(ppnPrices).forEach((ppnName) => {
      const prices = ppnPrices[ppnName]
      prices.avgMin = Math.round(
        prices.minPrices.reduce((a, b) => a + b, 0) / prices.minPrices.length
      )
      prices.avgMax = Math.round(
        prices.maxPrices.reduce((a, b) => a + b, 0) / prices.maxPrices.length
      )
    })

    return ppnPrices
  }

  const getPricesByRegion = () => {
    const regionPrices = {}
    filteredReports.forEach((report) => {
      if (!regionPrices[report.regionName]) {
        regionPrices[report.regionName] = {
          minPrices: [],
          maxPrices: [],
          avgMin: 0,
          avgMax: 0,
        }
      }
      regionPrices[report.regionName].minPrices.push(report.minUnitPrice)
      regionPrices[report.regionName].maxPrices.push(report.maxUnitPrice)
    })

    Object.keys(regionPrices).forEach((regionName) => {
      const prices = regionPrices[regionName]
      prices.avgMin = Math.round(
        prices.minPrices.reduce((a, b) => a + b, 0) / prices.minPrices.length
      )
      prices.avgMax = Math.round(
        prices.maxPrices.reduce((a, b) => a + b, 0) / prices.maxPrices.length
      )
    })

    return regionPrices
  }

  const ppnPrices = getPricesByPpn()
  const regionPrices = getPricesByRegion()

  return (
    <div className="analytics-container">
      <div className="analytics-filters">
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les régions</option>
          {uniqueRegions.map((regionId) => {
            const region = reports.find((r) => r.regionId === regionId)
            return (
              <option key={regionId} value={regionId}>
                {region?.regionName}
              </option>
            )
          })}
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les mois</option>
          {uniqueMonths.map((month) => (
            <option key={month} value={month}>
              {new Date(`${month}-01`).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h2>Prix par PPN</h2>
          {Object.keys(ppnPrices).length > 0 ? (
            <SimpleChart
              data={Object.entries(ppnPrices).map(([name, data]) => ({
                name,
                min: data.avgMin,
                max: data.avgMax,
              }))}
              title="Prix min/max par produit"
            />
          ) : (
            <div className="empty-state">
              <p>Aucune donnée à afficher</p>
            </div>
          )}
        </div>

        <div className="analytics-section">
          <h2>Prix par région</h2>
          {Object.keys(regionPrices).length > 0 ? (
            <SimpleChart
              data={Object.entries(regionPrices).map(([name, data]) => ({
                name,
                min: data.avgMin,
                max: data.avgMax,
              }))}
              title="Prix min/max par région"
            />
          ) : (
            <div className="empty-state">
              <p>Aucune donnée à afficher</p>
            </div>
          )}
        </div>
      </div>

      <div className="analytics-table-section">
        <h2>Détails des prix par PPN</h2>
        {Object.keys(ppnPrices).length > 0 ? (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>PPN</th>
                <th>Prix min moyen</th>
                <th>Prix max moyen</th>
                <th>Écart</th>
                <th>Rapports</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ppnPrices).map(([ppnName, data]) => {
                const spread = data.avgMax - data.avgMin
                return (
                  <tr key={ppnName}>
                    <td>
                      <strong>{ppnName}</strong>
                    </td>
                    <td>{data.avgMin}</td>
                    <td>{data.avgMax}</td>
                    <td>{spread}</td>
                    <td>{data.minPrices.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Aucune donnée à afficher</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
