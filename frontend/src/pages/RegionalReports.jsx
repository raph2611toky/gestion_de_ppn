'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../components/Notifications'
import { generateRegionReportPDF } from '../utils/pdfGenerator'

function RegionalReports() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success: showSuccess, error: showError } = useNotification()
  const [rapports, setRapports] = useState([])
  const [ppns, setPpns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterPPN, setFilterPPN] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRapport, setSelectedRapport] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Declare setIsSubmitting variable
  const itemsPerPage = 10

  // Charger mes rapports
  const fetchMyRapports = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/rapports/my')
      console.log('[+] Mes rapports chargés:', response.data)
      setRapports(response.data)
    } catch (err) {
      console.log('[+] Erreur lors du chargement des rapports:', err.message)
      showError('Impossible de charger les rapports')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  // Charger les PPNs
  const fetchPpns = useCallback(async () => {
    try {
      const response = await api.get('/ppns')
      setPpns(response.data)
    } catch (err) {
      console.log('[+] Erreur lors du chargement des PPNs:', err.message)
    }
  }, [])

  useEffect(() => {
    fetchMyRapports()
    fetchPpns()
  }, [fetchMyRapports, fetchPpns])

  const filteredReports = rapports.filter(rapport => {
    const matchesPPN = !filterPPN || rapport.ppn_id === parseInt(filterPPN)
    const matchesMonth = !filterMonth || rapport.date.startsWith(filterMonth)
    return matchesPPN && matchesMonth
  })

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  const handleDeleteRapport = async () => {
    if (!selectedRapport) return
    
    setIsSubmitting(true)
    try {
      await api.delete(`/rapports/${selectedRapport.id_rapport}`)
      console.log('[+] Rapport supprimé:', selectedRapport.id_rapport)
      setRapports(rapports.filter(r => r.id_rapport !== selectedRapport.id_rapport))
      showSuccess('Rapport supprimé avec succès')
      setShowDeleteConfirm(false)
      setSelectedRapport(null)
    } catch (err) {
      console.log('[+] Erreur lors de la suppression:', err.message)
      if (err.response?.status === 403) {
        showError('Vous ne pouvez supprimer que vos propres rapports')
      } else {
        showError('Erreur lors de la suppression du rapport')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRapport = (rapport) => {
    navigate('/dashboard/add-report', { state: { rapport } })
  }

  if (selectedRapport && selectedRapport.id_rapport) {
    return (
      <div className="animate-fade-in">
        <div className="section-card">
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedRapport(null)}
            style={{ marginBottom: '1rem' }}
          >
            ← Retour à la liste
          </button>
          
          <div className="section-header">
            <h2 className="section-title">
              <span>📋</span>
              {selectedRapport.ppn?.nomppn || 'Rapport'}
            </h2>
          </div>

          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Détails du rapport</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Produit:</label>
                    <p>{selectedRapport.ppn?.nomppn}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Prix unitaire (min - max):</label>
                    <p>{selectedRapport.prix_unitaire_min} - {selectedRapport.prix_unitaire_max} Ar</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Prix gros (min - max):</label>
                    <p>{selectedRapport.prix_gros_min} - {selectedRapport.prix_gros_max} Ar</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>District:</label>
                    <p>{selectedRapport.district}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Observation:</label>
                    <p>{selectedRapport.observation || 'N/A'}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Date:</label>
                    <p>{new Date(selectedRapport.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleEditRapport(selectedRapport)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDeleteConfirm(true)
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Supprimer le rapport</h3>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button className="modal-btn modal-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Annuler
                </button>
                <button 
                  className="modal-btn modal-btn-danger"
                  onClick={handleDeleteRapport}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

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
            {ppns.map(ppn => (
              <option key={ppn.id_ppn} value={ppn.id_ppn}>{ppn.nom_ppn}</option>
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
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/add-report')}
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
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
          ) : paginatedReports.length > 0 ? (
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map(rapport => (
                      <tr key={rapport.id_rapport}>
                        <td style={{ fontWeight: 500 }}>{rapport.ppn?.nom_ppn}</td>
                        <td>{rapport.prix_unitaire_min}</td>
                        <td>{rapport.prix_unitaire_max}</td>
                        <td>{rapport.prix_gros_min}</td>
                        <td>{rapport.prix_gros_max}</td>
                        <td>{rapport.district}</td>
                        <td>{new Date(rapport.date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => setSelectedRapport(rapport)}
                          >
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>Aucun rapport trouvé</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="section-body" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegionalReports
