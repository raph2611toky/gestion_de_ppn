'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'
import { useNotification } from '../components/Notifications.jsx'

function AddReport({ onNavigate }) {
  const { user } = useAuth()
  const { ppnList, addPriceReport } = useData()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState({
    ppnId: '',
    price: '',
    district: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.ppnId || !formData.price || !formData.district || !formData.date) {
      setError('Veuillez remplir tous les champs')
      return
    }

    // Validate date is not in the future
    if (formData.date > today) {
      setError('La date ne peut pas etre dans le futur')
      return
    }

    const selectedPPN = ppnList.find(p => p.id === formData.ppnId)
    if (!selectedPPN) {
      setError('Produit PPN invalide')
      return
    }

    addPriceReport({
      ppnId: formData.ppnId,
      ppnName: selectedPPN.name,
      price: parseFloat(formData.price),
      region: user?.region || '',
      district: formData.district,
      date: formData.date,
      reportedBy: user?.name || '',
    })

    showNotification('success', 'Rapport de prix ajoute avec succes')
    onNavigate('regional-reports')
  }

  return (
    <div className="animate-fade-in form-container">
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>➕</span>
            Nouveau rapport de prix
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
                value={formData.ppnId}
                onChange={(e) => setFormData({ ...formData, ppnId: e.target.value })}
              >
                <option value="">Selectionner un produit</option>
                {ppnList.map(ppn => (
                  <option key={ppn.id} value={ppn.id}>{ppn.name} ({ppn.unit})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prix (Ariary) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 2500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Antananarivo-Renivohitra"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date du releve *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={today}
              />
              <p className="form-helper">La date ne peut pas etre dans le futur</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('regional-reports')}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddReport
