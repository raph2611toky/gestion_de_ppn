'use client';

import React, { useState } from 'react'
import { useData } from '../contexts/DataContext'
import '../styles/ppn-management.css'

function PPNManagement() {
  const { ppns, addPpn, updatePpn, deletePpn } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitMeasure: '',
    bulkMeasure: '',
    bulkSize: '',
    observation: '',
  })
  const [errors, setErrors] = useState({})

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nom requis'
    if (!formData.description.trim()) newErrors.description = 'Description requise'
    if (!formData.unitMeasure) newErrors.unitMeasure = 'Unité requise'
    if (!formData.bulkMeasure) newErrors.bulkMeasure = 'Unité de gros requise'
    if (!formData.bulkSize || isNaN(formData.bulkSize) || formData.bulkSize <= 0) {
      newErrors.bulkSize = 'Taille de gros valide requise'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (editingId) {
      updatePpn(editingId, {
        ...formData,
        bulkSize: Number(formData.bulkSize),
      })
      setEditingId(null)
    } else {
      addPpn({
        ...formData,
        bulkSize: Number(formData.bulkSize),
      })
    }

    setFormData({
      name: '',
      description: '',
      unitMeasure: '',
      bulkMeasure: '',
      bulkSize: '',
      observation: '',
    })
    setShowForm(false)
  }

  const handleEdit = (ppn) => {
    setFormData({
      name: ppn.name,
      description: ppn.description,
      unitMeasure: ppn.unitMeasure,
      bulkMeasure: ppn.bulkMeasure,
      bulkSize: ppn.bulkSize,
      observation: ppn.observation || '',
    })
    setEditingId(ppn.id)
    setShowForm(true)
  }

  const handleDelete = (ppnId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce PPN?')) {
      deletePpn(ppnId)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      unitMeasure: '',
      bulkMeasure: '',
      bulkSize: '',
      observation: '',
    })
    setErrors({})
  }

  return (
    <div className="ppn-management-container">
      <div className="ppn-header">
        <h2>Gestion des PPN</h2>
        {!showForm && (
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Ajouter un PPN
          </button>
        )}
      </div>

      {showForm && (
        <div className="ppn-form-card">
          <h3>{editingId ? 'Modifier le PPN' : 'Ajouter un nouveau PPN'}</h3>

          <form onSubmit={handleSubmit} className="ppn-form">
            <div className="form-group">
              <label htmlFor="name">Nom du PPN *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Ex: Riz blanc"
                value={formData.name}
                onChange={handleFormChange}
                className={`form-control ${errors.name ? 'has-error' : ''}`}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Décrivez le PPN"
                value={formData.description}
                onChange={handleFormChange}
                className={`form-control ${errors.description ? 'has-error' : ''}`}
              />
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitMeasure">Unité unitaire *</label>
                <select
                  id="unitMeasure"
                  name="unitMeasure"
                  value={formData.unitMeasure}
                  onChange={handleFormChange}
                  className={`form-control ${errors.unitMeasure ? 'has-error' : ''}`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="kilogramme">Kilogramme</option>
                  <option value="gramme">Gramme</option>
                  <option value="litre">Litre</option>
                  <option value="millilitre">Millilitre</option>
                  <option value="unité">Unité</option>
                </select>
                {errors.unitMeasure && (
                  <span className="error-text">{errors.unitMeasure}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bulkMeasure">Unité de gros *</label>
                <select
                  id="bulkMeasure"
                  name="bulkMeasure"
                  value={formData.bulkMeasure}
                  onChange={handleFormChange}
                  className={`form-control ${errors.bulkMeasure ? 'has-error' : ''}`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="sac">Sac</option>
                  <option value="bidon">Bidon</option>
                  <option value="carton">Carton</option>
                  <option value="bouteille">Bouteille</option>
                  <option value="caisse">Caisse</option>
                </select>
                {errors.bulkMeasure && (
                  <span className="error-text">{errors.bulkMeasure}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bulkSize">Taille de gros *</label>
                <input
                  id="bulkSize"
                  type="number"
                  name="bulkSize"
                  placeholder="Ex: 50"
                  value={formData.bulkSize}
                  onChange={handleFormChange}
                  className={`form-control ${errors.bulkSize ? 'has-error' : ''}`}
                />
                {errors.bulkSize && (
                  <span className="error-text">{errors.bulkSize}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observation">Observations</label>
              <textarea
                id="observation"
                name="observation"
                placeholder="Observations optionnelles"
                value={formData.observation}
                onChange={handleFormChange}
                className="form-control"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingId ? 'Mettre à jour' : 'Créer le PPN'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ppn-list-card">
        <h3>Liste des PPN ({ppns.length})</h3>
        {ppns.length > 0 ? (
          <table className="ppn-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Unité</th>
                <th>Gros (unité)</th>
                <th>Taille gros</th>
                <th>Observations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ppns.map((ppn) => (
                <tr key={ppn.id}>
                  <td>
                    <strong>{ppn.name}</strong>
                  </td>
                  <td>{ppn.description}</td>
                  <td>{ppn.unitMeasure}</td>
                  <td>{ppn.bulkMeasure}</td>
                  <td>{ppn.bulkSize}</td>
                  <td>{ppn.observation || '-'}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-primary btn-small"
                      onClick={() => handleEdit(ppn)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(ppn.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Aucun PPN. Créez-en un pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PPNManagement
