'use client';

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import '../styles/form.css'

function AddReport() {
  const { user } = useAuth()
  const { ppns, addReport } = useData()
  const [formData, setFormData] = useState({
    ppnId: '',
    district: '',
    minUnitPrice: '',
    maxUnitPrice: '',
    minBulkPrice: '',
    maxBulkPrice: '',
    observation: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
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

    if (!formData.ppnId) newErrors.ppnId = 'Le PPN est obligatoire'
    if (!formData.district) newErrors.district = 'Le district est obligatoire'
    if (!formData.minUnitPrice) {
      newErrors.minUnitPrice = 'Prix unitaire min. requis'
    } else if (isNaN(formData.minUnitPrice) || formData.minUnitPrice < 0) {
      newErrors.minUnitPrice = 'Doit être un nombre positif'
    }
    if (!formData.maxUnitPrice) {
      newErrors.maxUnitPrice = 'Prix unitaire max. requis'
    } else if (isNaN(formData.maxUnitPrice) || formData.maxUnitPrice < 0) {
      newErrors.maxUnitPrice = 'Doit être un nombre positif'
    }
    if (
      formData.minUnitPrice &&
      formData.maxUnitPrice &&
      Number(formData.minUnitPrice) > Number(formData.maxUnitPrice)
    ) {
      newErrors.maxUnitPrice = 'Max doit être >= Min'
    }

    if (!formData.minBulkPrice) {
      newErrors.minBulkPrice = 'Prix de gros min. requis'
    } else if (isNaN(formData.minBulkPrice) || formData.minBulkPrice < 0) {
      newErrors.minBulkPrice = 'Doit être un nombre positif'
    }
    if (!formData.maxBulkPrice) {
      newErrors.maxBulkPrice = 'Prix de gros max. requis'
    } else if (isNaN(formData.maxBulkPrice) || formData.maxBulkPrice < 0) {
      newErrors.maxBulkPrice = 'Doit être un nombre positif'
    }
    if (
      formData.minBulkPrice &&
      formData.maxBulkPrice &&
      Number(formData.minBulkPrice) > Number(formData.maxBulkPrice)
    ) {
      newErrors.maxBulkPrice = 'Max doit être >= Min'
    }

    if (!formData.date) newErrors.date = 'La date est obligatoire'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      addReport({
        ppnId: formData.ppnId,
        regionId: user.id,
        regionName: user.regionName,
        district: formData.district,
        minUnitPrice: Number(formData.minUnitPrice),
        maxUnitPrice: Number(formData.maxUnitPrice),
        minBulkPrice: Number(formData.minBulkPrice),
        maxBulkPrice: Number(formData.maxBulkPrice),
        observation: formData.observation,
        date: new Date(formData.date),
      })

      setFormData({
        ppnId: '',
        district: '',
        minUnitPrice: '',
        maxUnitPrice: '',
        minBulkPrice: '',
        maxBulkPrice: '',
        observation: '',
        date: new Date().toISOString().split('T')[0],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Ajouter un rapport de prix</h2>
        <p className="form-subtitle">Saisissez les informations sur les prix des PPN</p>

        <form onSubmit={handleSubmit} className="ppn-form">
          <div className="form-section">
            <h3>Informations générales</h3>

            <div className="form-group">
              <label htmlFor="ppnId">Produit (PPN) *</label>
              <select
                id="ppnId"
                name="ppnId"
                value={formData.ppnId}
                onChange={handleChange}
                className={`form-control ${errors.ppnId ? 'has-error' : ''}`}
              >
                <option value="">-- Sélectionner un PPN --</option>
                {ppns.map((ppn) => (
                  <option key={ppn.id} value={ppn.id}>
                    {ppn.name} ({ppn.unitMeasure})
                  </option>
                ))}
              </select>
              {errors.ppnId && (
                <span className="error-text">{errors.ppnId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="district">District *</label>
              <input
                id="district"
                type="text"
                name="district"
                placeholder="Ex: District Nord-1"
                value={formData.district}
                onChange={handleChange}
                className={`form-control ${errors.district ? 'has-error' : ''}`}
              />
              {errors.district && (
                <span className="error-text">{errors.district}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date de rapport *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-control ${errors.date ? 'has-error' : ''}`}
              />
              {errors.date && (
                <span className="error-text">{errors.date}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Prix unitaires</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minUnitPrice">Prix minimum *</label>
                <input
                  id="minUnitPrice"
                  type="number"
                  name="minUnitPrice"
                  placeholder="0"
                  value={formData.minUnitPrice}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.minUnitPrice ? 'has-error' : ''
                  }`}
                />
                {errors.minUnitPrice && (
                  <span className="error-text">{errors.minUnitPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="maxUnitPrice">Prix maximum *</label>
                <input
                  id="maxUnitPrice"
                  type="number"
                  name="maxUnitPrice"
                  placeholder="0"
                  value={formData.maxUnitPrice}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.maxUnitPrice ? 'has-error' : ''
                  }`}
                />
                {errors.maxUnitPrice && (
                  <span className="error-text">{errors.maxUnitPrice}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Prix de gros</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minBulkPrice">Prix minimum *</label>
                <input
                  id="minBulkPrice"
                  type="number"
                  name="minBulkPrice"
                  placeholder="0"
                  value={formData.minBulkPrice}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.minBulkPrice ? 'has-error' : ''
                  }`}
                />
                {errors.minBulkPrice && (
                  <span className="error-text">{errors.minBulkPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="maxBulkPrice">Prix maximum *</label>
                <input
                  id="maxBulkPrice"
                  type="number"
                  name="maxBulkPrice"
                  placeholder="0"
                  value={formData.maxBulkPrice}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.maxBulkPrice ? 'has-error' : ''
                  }`}
                />
                {errors.maxBulkPrice && (
                  <span className="error-text">{errors.maxBulkPrice}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="observation">Observations</label>
              <textarea
                id="observation"
                name="observation"
                placeholder="Saisissez toute observation pertinente"
                value={formData.observation}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReport
