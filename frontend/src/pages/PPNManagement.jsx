'use client';

import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { useNotification } from '../components/Notifications'
import '../styles/ppn-management.css'

function PPNManagement() {
  const [ppns, setPpns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPPN, setSelectedPPN] = useState(null)
  const [formData, setFormData] = useState({ 
    nom_ppn: '', 
    description: '', 
    unite_mesure_unitaire: '', 
    unite_mesure_gros: '', 
    observation: '' 
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success: showSuccess, error: showError } = useNotification()
  const itemsPerPage = 10

  const unitOptions = ['KG', 'GRAMME', 'LITRE', 'SAC', 'KP']

  // Charger la liste des PPNs
  useEffect(() => {
    fetchPpns()
  }, [])

  const fetchPpns = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/ppns')
      console.log('[v0] PPNs loaded:', response.data)
      setPpns(response.data)
    } catch (err) {
      console.log('[v0] Erreur lors du chargement des PPNs:', err.message)
      showError('Impossible de charger la liste des PPNs')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPPNList = ppns.filter(ppn => {
    const searchLower = searchQuery.toLowerCase()
    return ppn.nom_ppn.toLowerCase().includes(searchLower) ||
           ppn.description.toLowerCase().includes(searchLower)
  })

  const totalPages = Math.ceil(filteredPPNList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPPNList = filteredPPNList.slice(startIndex, endIndex)

  const handleAdd = async () => {
    if (!formData.nom_ppn.trim()) {
      showError('Le nom du PPN est obligatoire')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await api.post('/ppns', formData)
      console.log('[v0] PPN created:', response.data)
      setPpns([...ppns, response.data])
      showSuccess('Produit PPN ajouté avec succès')
      setShowAddModal(false)
      setFormData({ nom_ppn: '', description: '', unite_mesure_unitaire: '', unite_mesure_gros: '', observation: '' })
    } catch (err) {
      console.log('[v0] Erreur lors de la création:', err.message)
      if (err.response?.data?.message) {
        showError(err.response.data.message)
      } else {
        showError('Erreur lors de la création du PPN')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPPN) return
    
    setIsSubmitting(true)
    try {
      await api.delete(`/ppns/${selectedPPN.id_ppn}`)
      console.log('[v0] PPN deleted:', selectedPPN.id_ppn)
      setPpns(ppns.filter(p => p.id_ppn !== selectedPPN.id_ppn))
      showSuccess('Produit PPN supprimé avec succès')
      setShowDeleteConfirm(false)
      setSelectedPPN(null)
    } catch (err) {
      console.log('[v0] Erreur lors de la suppression:', err.message)
      showError('Erreur lors de la suppression du PPN')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirm = (ppn) => {
    setSelectedPPN(ppn)
    setShowDeleteConfirm(true)
  }

  const openEditModal = (ppn) => {
    setSelectedPPN(ppn)
    setFormData({ 
      nom_ppn: ppn.nom_ppn, 
      description: ppn.description, 
      unite_mesure_unitaire: ppn.unite_mesure_unitaire, 
      unite_mesure_gros: ppn.unite_mesure_gros, 
      observation: ppn.observation 
    })
    setShowEditModal(true)
  }

  const handleEdit = async () => {
    if (!selectedPPN || !formData.nom_ppn.trim()) {
      showError('Le nom du PPN est obligatoire')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await api.put(`/ppns/${selectedPPN.id_ppn}`, formData)
      console.log('[v0] PPN updated:', response.data)
      const updatedPpns = ppns.map(p => p.id_ppn === selectedPPN.id_ppn ? response.data : p)
      setPpns(updatedPpns)
      showSuccess('Produit PPN modifié avec succès')
      setShowEditModal(false)
      setSelectedPPN(null)
      setFormData({ nom_ppn: '', description: '', unite_mesure_unitaire: '', unite_mesure_gros: '', observation: '' })
    } catch (err) {
      console.log('[v0] Erreur lors de la modification:', err.message)
      if (err.response?.data?.message) {
        showError(err.response.data.message)
      } else {
        showError('Erreur lors de la modification du PPN')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetail = async (id_ppn) => {
    try {
      const response = await api.get(`/ppns/${id_ppn}`)
      console.log('[v0] PPN detail loaded:', response.data)
      setSelectedPPN(response.data)
    } catch (err) {
      console.log('[v0] Erreur lors du chargement du détail:', err.message)
      showError('Impossible de charger les détails du PPN')
    }
  }

  const PPNForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Nom du produit *</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ex: Riz blanc local"
          value={formData.nom_ppn}
          onChange={(e) => setFormData({ ...formData, nom_ppn: e.target.value })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          placeholder="Description détaillée du PPN"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Unité de mesure (unitaire)</label>
        <select
          className="form-select"
          value={formData.unite_mesure_unitaire}
          onChange={(e) => setFormData({ ...formData, unite_mesure_unitaire: e.target.value })}
        >
          <option value="">Sélectionner</option>
          {unitOptions.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Unité de mesure (gros)</label>
        <select
          className="form-select"
          value={formData.unite_mesure_gros}
          onChange={(e) => setFormData({ ...formData, unite_mesure_gros: e.target.value })}
        >
          <option value="">Sélectionner</option>
          {unitOptions.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Observation</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ex: Produit saisonnier"
          value={formData.observation}
          onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
        />
      </div>
    </div>
  )

  // Vue détail d'un PPN
  if (selectedPPN && selectedPPN.id_ppn) {
    return (
      <div className="animate-fade-in">
        <div className="section-card">
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedPPN(null)}
            style={{ marginBottom: '1rem' }}
          >
            ← Retour à la liste
          </button>
          
          <div className="section-header">
            <h2 className="section-title">
              <span>📦</span>
              {selectedPPN.nom_ppn}
            </h2>
          </div>

          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Détails du produit</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nom:</label>
                    <p>{selectedPPN.nom_ppn}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Description:</label>
                    <p>{selectedPPN.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Unité (unitaire):</label>
                    <p>{selectedPPN.unite_mesure_unitaire || 'N/A'}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Unité (gros):</label>
                    <p>{selectedPPN.unite_mesure_gros || 'N/A'}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Observation:</label>
                    <p>{selectedPPN.observation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedPPN.employe && (
                <div>
                  <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Créé par</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nom:</label>
                      <p>{selectedPPN.employe.nom}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Email:</label>
                      <p>{selectedPPN.employe.email}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>CIN:</label>
                      <p>{selectedPPN.employe.cin}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Région:</label>
                      <p>{selectedPPN.employe.region || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Fonction:</label>
                      <p>{selectedPPN.employe.fonction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>📦</span>
            Liste des produits PPN ({filteredPPNList.length})
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Ajouter un PPN
          </button>
        </div>

        <div className="section-body" style={{ paddingBottom: 0 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        <div className="section-body no-padding">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom du produit</th>
                    <th>Description</th>
                    <th>Unité (unitaire)</th>
                    <th>Unité (gros)</th>
                    <th>Créé par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPPNList.length > 0 ? (
                    paginatedPPNList.map(ppn => (
                      <tr key={ppn.id_ppn}>
                        <td style={{ fontWeight: 500 }}>{ppn.nom_ppn}</td>
                        <td>{ppn.description}</td>
                        <td>{ppn.unite_mesure_unitaire}</td>
                        <td>{ppn.unite_mesure_gros}</td>
                        <td>{ppn.employe?.nom || 'N/A'}</td>
                        <td>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleViewDetail(ppn.id_ppn)}
                          >
                            Voir
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => openDeleteConfirm(ppn)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucun produit trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span>📦</span>
                Ajouter un produit PPN
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PPNForm />
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button 
                className="modal-btn modal-btn-primary"
                onClick={handleAdd}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedPPN && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Supprimer le produit</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedppn.nom_ppn}</strong> ? Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button 
                className="modal-btn modal-btn-danger"
                onClick={handleDelete}
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

export default PPNManagement
