'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { useNotification, ConfirmDialog } from '../components/Notifications.jsx'
import { useNavigate } from 'react-router-dom'

function RegionalDashboard({ onNavigate }) {
  console.log('[+] Rendering RegionalDashboard...')
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [allRapports, setAllRapports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRegion, setFilterRegion] = useState('mine')
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRapportId, setSelectedRapportId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rapports, setRapports] = useState([]); // Declare setRapports
  const [ppns, setPpns] = useState([]); // Declare setPpns

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      console.log('[+] Fetching dashboard data...')
      const response = await api.get('/dashboard')
      setDashboardData(response.data)
      setRapports(response.data.rapports); // Assign rapports data
      setPpns(response.data.ppns); // Assign ppns data
      console.log('[+] Dashboard data:', response.data)
    } catch (err) {
      console.log('[+] Erreur lors du chargement du dashboard:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllRapports = async () => {
    try {
      console.log('[+] Fetching all rapports...')
      const response = await api.get('/rapports')
      setAllRapports(response.data)
      setRapports(response.data); // Assign all rapports data
    } catch (err) {
      console.log('[+] Erreur lors du chargement de tous les rapports:', err.message)
      showNotification('error', 'Impossible de charger les rapports')
    }
  }

  useEffect(() => {
    if (filterRegion === 'all') {
      fetchAllRapports()
    }
  }, [filterRegion])

  const handleDeleteRapport = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/rapports/${selectedRapportId}`)
      showNotification('success', 'Rapport supprimé avec succès')
      setShowConfirm(false)
      setSelectedRapportId(null)
      fetchDashboardData()
    } catch (err) {
      console.log('[+] Erreur lors de la suppression:', err.message)
      showNotification('error', 'Impossible de supprimer le rapport')
    } finally {
      setDeleteLoading(false)
    }
  }

  const stats = [
    { 
      id: 'my-reports',
      label: 'Mes rapports', 
      value: dashboardData?.stats?.totalRapports || 0, 
      icon: '📋', 
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    { 
      id: 'this-month',
      label: 'Ce mois', 
      value: dashboardData?.stats?.rapportsThisMonth || 0, 
      icon: '📅', 
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      id: 'ppns',
      label: 'Produits PPN', 
      value: dashboardData?.stats?.produitsPpn || 0, 
      icon: '📦', 
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
  ]

  const displayRapports = filterRegion === 'mine' 
    ? (dashboardData?.latestRapports || [])
    : allRapports

  const recentReports = [...displayRapports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.id + index}
            className="stat-card"
            style={{ cursor: 'pointer' }}
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
          <div>
            <h2 className="section-title">
              <span>📋</span>
              {filterRegion === 'mine' ? 'Mes derniers rapports' : 'Tous les rapports'}
            </h2>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilterRegion('mine')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: filterRegion === 'mine' ? '#2563eb' : '#e5e7eb',
                  color: filterRegion === 'mine' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Mes rapports
              </button>
              <button
                onClick={() => setFilterRegion('all')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: filterRegion === 'all' ? '#2563eb' : '#e5e7eb',
                  color: filterRegion === 'all' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Toutes les régions
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/add-report')} 
          >
            + Nouveau rapport
          </button>
        </div>
        <div className="section-body no-padding">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
          ) : recentReports.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unitaire</th>
                    <th>Prix gros</th>
                    <th>District</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(rapport => (
                    <tr key={rapport.id_rapport || rapport.idrapport}>
                      <td style={{ fontWeight: 500 }}>
                        {rapport.ppn?.nomppn}
                      </td>
                      <td>
                        {rapport.prix_unitaire_min || rapport.prixunitairemin} - {rapport.prix_unitaire_max || rapport.prixunitairemax}
                      </td>
                      <td>
                        {rapport.prix_gros_min || rapport.prixgrosmin} - {rapport.prix_gros_max || rapport.prixgrosmax}
                      </td>
                      <td>{rapport.district}</td>
                      <td>{new Date(rapport.date).toLocaleDateString('fr-FR')}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            const rapportId = rapport.id_rapport || rapport.idrapport
                            console.log('[+] Viewing rapport:', rapportId)
                            if (onNavigate) {
                              onNavigate(rapportId)
                            }
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Voir
                        </button>
                        {filterRegion === 'mine' && (
                          <>
                            <button
                              onClick={() => navigate(`/dashboard/edit-report/${rapport.id_rapport || rapport.idrapport}`)} // Use navigate for navigation
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRapportId(rapport.id_rapport || rapport.idrapport)
                                setShowConfirm(true)
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>Aucun rapport pour le moment</p>
              {filterRegion === 'mine' && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/dashboard/add-report')} // Use navigate for navigation
                  style={{ marginTop: '1rem' }}
                >
                  Créer mon premier rapport
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Supprimer le rapport"
        message="Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action ne peut pas être annulée."
        onConfirm={handleDeleteRapport}
        onCancel={() => {
          setShowConfirm(false)
          setSelectedRapportId(null)
        }}
        isDangerous
        confirmText="Supprimer"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default RegionalDashboard
