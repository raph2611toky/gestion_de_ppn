'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../components/Notifications'

function AddReport() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { success: showSuccess, error: showError } = useNotification()
  
  const [ppns, setPpns] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ppnid: '',
    prixunitairemin: '',
    prixunitairemax: '',
    prixgrosmin: '',
    prixgrosmax: '',
    district: user?.moderateurDetails?.region || '',
    observation: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const isEditing = !!location.state?.rapport

  // Charger les PPNs
  useEffect(() => {
    const fetchPpns = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/ppns')
        setPpns(response.data)
      } catch (err) {
        console.log('[+] Erreur lors du chargement des PPNs:', err.message)
        showError('Impossible de charger les PPNs')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPpns()

    // Si mode édition, pré-remplir le formulaire
    if (location.state?.rapport) {
      const rapport = location.state.rapport
      setFormData({
        ppnid: rapport.ppnid,
        prixunitairemin: rapport.prixunitairemin,
        prixunitairemax: rapport.prixunitairemax,
        prixgrosmin: rapport.prixgrosmin,
        prixgrosmax: rapport.prixgrosmax,
        district: rapport.district,
        observation: rapport.observation,
        date: rapport.date.split(' ')[0],
      })
    }
  }, [location, showError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.ppnid || !formData.prixunitairemin || !formData.prixunitairemax ||
        !formData.prixgrosmin || !formData.prixgrosmax || !formData.district || !formData.date) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (parseFloat(formData.prixunitairemin) > parseFloat(formData.prixunitairemax)) {
      setError('Le prix unitaire minimum ne peut pas être supérieur au maximum')
      return
    }

    if (parseFloat(formData.prixgrosmin) > parseFloat(formData.prixgrosmax)) {
      setError('Le prix gros minimum ne peut pas être supérieur au maximum')
      return
    }

    if (formData.date > today) {
      setError('La date ne peut pas être dans le futur')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ppn_id: parseInt(formData.ppnid),
        prix_unitaire_min: parseFloat(formData.prixunitairemin),
        prix_unitaire_max: parseFloat(formData.prixunitairemax),
        prix_gros_min: parseFloat(formData.prixgrosmin),
        prix_gros_max: parseFloat(formData.prixgrosmax),
        district: formData.district,
        observation: formData.observation,
        date: formData.date,
      }

      if (isEditing) {
        // Modification
        const rapport = location.state.rapport
        await api.put(`/rapports/${rapport.idrapport}`, payload)
        console.log('[+] Rapport modifié:', rapport.idrapport)
        showSuccess('Rapport modifié avec succès')
      } else {
        // Création
        const response = await api.post('/rapports', payload)
        console.log('[+] Rapport créé:', response.data)
        showSuccess('Rapport créé avec succès')
      }
      
      setTimeout(() => {
        navigate('/dashboard/regional-reports')
      }, 500)
    } catch (err) {
      console.log('[+] Erreur lors de la soumission:', err.message)
      if (err.response?.status === 403) {
        setError('Vous ne pouvez modifier que vos propres rapports')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Erreur lors de la soumission du rapport')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="animate-fade-in form-container">
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>➕</span>
            {isEditing ? 'Modifier le rapport' : 'Nouveau rapport de prix'}
          </h2>
        </div>
        <div className="section-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Produit PPN *</label>
              <select
                className="form-select"
                value={formData.ppnid}
                onChange={(e) => handleFormChange('ppnid', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Sélectionner un produit</option>
                {ppns.map(ppn => (
                  <option key={ppn.id_ppn} value={ppn.id_ppn}>{ppn.nom_ppn}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prix unitaire min (Ar) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 2000"
                  value={formData.prixunitairemin}
                  onChange={(e) => handleFormChange('prixunitairemin', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix unitaire max (Ar) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 2500"
                  value={formData.prixunitairemax}
                  onChange={(e) => handleFormChange('prixunitairemax', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prix gros min (Ar) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 1800"
                  value={formData.prixgrosmin}
                  onChange={(e) => handleFormChange('prixgrosmin', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix gros max (Ar) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 2200"
                  value={formData.prixgrosmax}
                  onChange={(e) => handleFormChange('prixgrosmax', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              {/* <input
                type="text"
                className="form-input"
                placeholder="Ex: Antananarivo"
                value={formData.district}
                onChange={(e) => handleFormChange('district', e.target.value)}
              /> */}
              <div className="form-input">{formData.district}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Observation</label>
              <textarea
                className="form-input"
                placeholder="Observations sur les prix..."
                value={formData.observation}
                onChange={(e) => handleFormChange('observation', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date du relevé *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                max={today}
              />
              <p className="form-helper">La date ne peut pas être dans le futur</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/regional-reports')}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Enregistrer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddReport
