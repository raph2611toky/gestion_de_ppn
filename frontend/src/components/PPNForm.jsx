'use client'

import React from 'react'

const PPNForm = React.memo(({ formData, onFormChange, unitOptions }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">Nom du produit *</label>
      <input
        type="text"
        className="form-input"
        placeholder="Ex: Riz blanc local"
        value={formData.nom_ppn}
        onChange={(e) => onFormChange('nom_ppn', e.target.value)}
      />
    </div>
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">Description</label>
      <textarea
        className="form-input"
        placeholder="Description détaillée du PPN"
        value={formData.description}
        onChange={(e) => onFormChange('description', e.target.value)}
        rows="3"
      />
    </div>
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">Unité de mesure (unitaire)</label>
      <select
        className="form-select"
        value={formData.unite_mesure_unitaire}
        onChange={(e) => onFormChange('unite_mesure_unitaire', e.target.value)}
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
        onChange={(e) => onFormChange('unite_mesure_gros', e.target.value)}
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
        onChange={(e) => onFormChange('observation', e.target.value)}
      />
    </div>
  </div>
))

PPNForm.displayName = 'PPNForm'

export default PPNForm
