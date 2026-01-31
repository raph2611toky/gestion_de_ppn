'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { useNotification } from '../components/Notifications.jsx'
import { fetchPpns } from '../utils/produits.js'

const REGIONS = [
  'Toutes les régions',
  'Analamanga', 'Vakinankaratra', 'Itasy', 'Bongolava', 
  'Haute Matsiatra', "Amoron'i Mania", 'Vatovavy', 'Fitovinany', 
  'Atsimo Atsinanana', 'Atsinanana', 'Analanjirofo', 'Alaotra-Mangoro'
]

function Analytics() {
  const { showNotification } = useNotification()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [products, setProducts] = useState([{ value: 'all', label: 'Tous les produits' }])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('Toutes les régions')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [reportCount, setReportCount] = useState(0)
  const [chartData, setChartData] = useState([])
  const [chartViewMode, setChartViewMode] = useState('month') // 'month' ou 'date'
  const [chartMonthData, setChartMonthData] = useState([]) // Declare chartMonthData variable

  // Auto-fetch quand les filtres changent
  useEffect(() => {
    fetchAnalyticsData(selectedProduct, selectedRegion, selectedYear, selectedMonth, startDate, endDate)
  }, [selectedProduct, selectedRegion, selectedYear, selectedMonth, startDate, endDate])

  useEffect(() => {
    // Charger les PPNs au montage
    const handleSetPpns = (ppnList) => {
      const productsData = [
        { value: 'all', label: 'Tous les produits' },
        ...ppnList.map(ppn => ({
          value: ppn.id_ppn || ppn.idppn,
          label: ppn.nom_ppn || ppn.nomppn
        }))
      ]
      setProducts(productsData)
      setProductsLoading(false)
    }

    const handleError = (message) => {
      showNotification('error', message)
    }

    fetchPpns(handleSetPpns, handleError)
    // Appel initial sans paramètres
    fetchAnalyticsData('all', 'Toutes les régions', '', '', '', '')
  }, [])

  const fetchAnalyticsData = async (ppnId = 'all', region = 'Toutes les régions', year = '', month = '', startDt = '', endDt = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (ppnId && ppnId !== 'all') params.append('ppn_id', ppnId)
      if (region && region !== 'Toutes les régions') params.append('region', region)
      if (year) params.append('year', year)
      if (month) params.append('month', month)
      if (startDt) params.append('start_date', startDt)
      if (endDt) params.append('end_date', endDt)
      
      const url = `/rapports/dashboard/full?${params.toString()}`
      console.log('[v0] Fetching:', url)
      
      const response = await api.get(url)
      console.log('[v0] Analytics data:', response.data)
      setAnalyticsData(response.data)
      
      // Extraire tous les rapports du by_date pour le tableau
      const allRapports = []
      if (response.data.by_date && Array.isArray(response.data.by_date)) {
        response.data.by_date.forEach(dateGroup => {
          if (dateGroup.rapports && Array.isArray(dateGroup.rapports)) {
            allRapports.push(...dateGroup.rapports)
          }
        })
      }
      
      setTableData(allRapports)
      setCurrentPage(1)
      setReportCount(allRapports.length)
      setChartData(response.data.by_month || [])
      setChartMonthData(response.data.by_month || []) // Set chartMonthData with response data
    } catch (err) {
      console.log('[v0] Erreur lors du chargement:', err.message)
      showNotification('error', 'Impossible de charger les données')
      setAnalyticsData(null)
      setTableData([])
      setReportCount(0)
      setChartData([])
      setChartMonthData([]) // Reset chartMonthData on error
    } finally {
      setLoading(false)
    }
  }

  // Générer les années disponibles
  const getAvailableYears = () => {
    if (!analyticsData?.by_year) return []
    return analyticsData.by_year.map(item => item.year).sort((a, b) => b - a)
  }

  // Générer les mois disponibles (filtrés par année si sélectionnée)
  const getAvailableMonths = () => {
    if (!analyticsData?.by_month) return []
    
    let months = analyticsData.by_month.map(item => item.month)
    
    // Si une année est sélectionnée, filtrer par année
    if (selectedYear) {
      months = months.filter(month => month.startsWith(selectedYear))
    }
    
    return months.sort().reverse()
  }

  const handleApplyFilters = () => {
    fetchAnalyticsData(selectedProduct, selectedRegion)
  }

  const handleFilterChange = () => {
    fetchAnalyticsData(selectedProduct, selectedRegion)
  }

  const generatePDF = async () => {
    if (selectedRegion === 'Toutes les régions') {
      showNotification('error', 'Sélectionnez une région pour générer le PDF')
      return
    }

    setPdfLoading(true)
    try {
      console.log('[v0] Generating PDF for region:', selectedRegion)
      const response = await api.get(`/rapports/export/pdf`, {
        params: {
          region: selectedRegion,
          ppn_id: selectedProduct !== 'all' ? selectedProduct : undefined,
          month: selectedMonth
        },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_${selectedRegion}_${selectedMonth}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      showNotification('success', 'PDF généré et téléchargé')
    } catch (err) {
      console.log('[v0] Erreur lors de la génération du PDF:', err.message)
      showNotification('error', 'Impossible de générer le PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  // Préparer les données pour les charts
  const getChartData = () => {
    if (chartViewMode === 'month') {
      // Par an (utilise by_month)
      return analyticsData?.by_month || []
    } else {
      // Par mois (utilise by_date du mois courant par défaut)
      return analyticsData?.by_date || []
    }
  }

  const chartDisplayData = getChartData()
  const chartLabel = chartViewMode === 'month' ? 'Mois' : 'Jour'
  const dateField = chartViewMode === 'month' ? 'month' : 'date'

  const totalPages = Math.ceil(tableData.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedData = tableData.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div style={{ padding: '2rem' }}>
      {/* Filtres */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Produit PPN */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Produit PPN
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {products.map(product => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </select>
          </div>

          {/* Région */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Région
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {REGIONS.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Année
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value)
                setSelectedMonth('')
              }}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Toutes les années</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Mois */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Tous les mois</option>
              {getAvailableMonths().map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Date début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Date fin */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
              Date fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        {/* Bouton PDF */}
        {selectedRegion !== 'Toutes les régions' && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={generatePDF}
              disabled={pdfLoading || !analyticsData}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                opacity: pdfLoading || !analyticsData ? 0.5 : 1
              }}
            >
              {pdfLoading ? 'Génération...' : 'Générer PDF'}
            </button>
          </div>
        )}

        {/* Compteur de rapports */}
        {analyticsData && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Total rapports: </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                {analyticsData.total_rapports}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Prix unitaire moyen: </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                {parseFloat(analyticsData.avg_prix_unitaire || 0).toLocaleString()} Ar
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Prix gros moyen: </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                {parseFloat(analyticsData.avg_prix_gros || 0).toLocaleString()} Ar
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          Chargement des données...
        </div>
      ) : analyticsData ? (
        <>
          {/* Boutons de sélection du mode chart */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setChartViewMode('month')}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: chartViewMode === 'month' ? '#2563eb' : '#e5e7eb',
                color: chartViewMode === 'month' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Par an
            </button>
            <button
              onClick={() => setChartViewMode('date')}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: chartViewMode === 'date' ? '#2563eb' : '#e5e7eb',
                color: chartViewMode === 'date' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Par mois
            </button>
          </div>

          {/* Deux charts côte à côte */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Histogramme - Nombre de rapports */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
                Nombre de rapports par {chartLabel}
              </h3>
              {chartDisplayData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {chartDisplayData.map((item, idx) => {
                    const maxCount = Math.max(...chartDisplayData.map(d => d.count))
                    const height = (item.count / maxCount) * 100
                    return (
                      <div key={idx} style={{ flex: '0 0 auto', minWidth: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%',
                          height: `${height}%`,
                          backgroundColor: '#2563eb',
                          borderRadius: '0.25rem 0.25rem 0 0',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {item.count > 0 && <span>{item.count}</span>}
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', textAlign: 'center', color: '#666', wordBreak: 'break-word', width: '100%' }}>
                          {item[dateField]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  Aucune donnée
                </div>
              )}
            </div>

            {/* Line Chart - Évolution des prix */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
                Évolution des prix moyens par {chartLabel}
              </h3>
              {chartDisplayData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {chartDisplayData.map((item, idx) => (
                    <div key={idx} style={{ flex: '0 0 auto', minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                        Prix Unit.
                      </div>
                      <div style={{ fontSize: '1rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '0.75rem', textAlign: 'center' }}>
                        {parseFloat(item.avg_prix_unitaire || 0).toLocaleString()} Ar
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                        Prix Gros
                      </div>
                      <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.75rem', textAlign: 'center' }}>
                        {parseFloat(item.avg_prix_gros || 0).toLocaleString()} Ar
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', width: '100%' }}>
                        {item[dateField]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  Aucune donnée
                </div>
              )}
            </div>
          </div>

          {/* Tableau */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
              Liste des rapports
            </h3>
            
            {tableData.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Produit</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Prix unitaire</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Prix gros</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>District</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Date</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Modérateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((rapport, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '0.75rem', color: '#111' }}>{rapport.ppn?.nom_ppn || 'N/A'}</td>
                          <td style={{ padding: '0.75rem', color: '#2563eb', fontWeight: 'bold' }}>
                            {rapport.prix_unitaire_min || 0} - {rapport.prix_unitaire_max || 0}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                            {rapport.prix_gros_min || 0} - {rapport.prix_gros_max || 0}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#111' }}>{rapport.district}</td>
                          <td style={{ padding: '0.75rem', color: '#111' }}>
                            {new Date(rapport.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#111' }}>{rapport.employe?.nom || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentPage === 1 ? '#e5e7eb' : '#2563eb',
                        color: currentPage === 1 ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Précédent
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: currentPage === page ? '#2563eb' : '#e5e7eb',
                          color: currentPage === page ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontWeight: currentPage === page ? 'bold' : 'normal'
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#2563eb',
                        color: currentPage === totalPages ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Aucun rapport à afficher
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          Erreur lors du chargement des données
        </div>
      )}
    </div>
  )
}

export default Analytics
