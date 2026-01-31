'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { useNotification } from '../components/Notifications.jsx'
import { fetchPpns } from '../utils/produits.js'

const REGIONS = [
  'Toutes les régions',
  'ANALAMANGA',
  'VAKINANKARATRA',
  'ITASY',
  'BONGOLAVA',
  'MENABE',
  'MELAKY',
  'DIANA',
  'SAVA',
  'ANALANJIROFO',
  'AMORON\'I MANIA',
  'VATOVAVY FITOVINANY',
  'ATSIMO ANDREFANA',
  'ATSIMO ATSINANANA',
  'ANDROY',
  'ANOSY',
  'HAUTE_MATSIATRA'
]

function Analytics() {
  const { showNotification } = useNotification()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [products, setProducts] = useState([{ value: 'all', label: 'Tous les produits' }])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('Toutes les régions')
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [chartData, setChartData] = useState([])
  const [reportCount, setReportCount] = useState(0)

  useEffect(() => {
    // Charger les PPNs
    const handleSetPpns = (ppnList) => {
      const productsData = [
        { value: 'all', label: 'Tous les produits' },
        ...ppnList.map(ppn => ({
          value: ppn.id_ppn,
          label: ppn.nom_ppn
        }))
      ]
      setProducts(productsData)
      setProductsLoading(false)
    }

    const handleError = (message) => {
      showNotification('error', message)
    }

    fetchPpns(handleSetPpns, handleError)
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async (ppnId = null, region = null) => {
    setLoading(true)
    try {
      console.log('[v0] Fetching analytics from /rapports/dashboard/full')
      let url = '/rapports/dashboard/full?'
      const params = []
      
      if (ppnId && ppnId !== 'all') params.push(`ppn_id=${ppnId}`)
      if (region && region !== 'Toutes les régions') params.push(`region=${region}`)
      if (selectedMonth) params.push(`month=${selectedMonth}`)
      
      url += params.join('&')
      
      const response = await api.get(url)
      console.log('[v0] Analytics data:', response.data)
      setAnalyticsData(response.data)
      
      // Extraire tous les rapports du by_date
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
    } catch (err) {
      console.log('[v0] Erreur lors du chargement:', err.message)
      showNotification('error', 'Impossible de charger les données')
      setAnalyticsData(null)
      setTableData([])
      setReportCount(0)
      setChartData([])
    } finally {
      setLoading(false)
    }
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
  const chartMonthData = analyticsData?.by_month || []
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
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              opacity: loading ? 0.5 : 1
            }}
          >
            Appliquer les filtres
          </button>

          {selectedRegion !== 'Toutes les régions' && (
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
          )}
        </div>

        {/* Compteur de rapports */}
        {analyticsData && (
          <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
            {analyticsData.total_rapports} rapport(s)
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
          {/* Deux charts côte à côte */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Histogramme - Nombre de rapports par mois */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
                Nombre de rapports par mois
              </h3>
              {chartMonthData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
                  {chartMonthData.map((item, idx) => {
                    const maxCount = Math.max(...chartMonthData.map(d => d.count))
                    const height = (item.count / maxCount) * 100
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', color: '#666' }}>
                          {item.month}
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
                Évolution des prix moyens
              </h3>
              {chartMonthData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {chartMonthData.map((item, idx) => (
                    <div key={idx} style={{ minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        Unit: {parseFloat(item.avg_prix_unitaire).toLocaleString()} Ar
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Gros: {parseFloat(item.avg_prix_gros).toLocaleString()} Ar
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {item.month}
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
