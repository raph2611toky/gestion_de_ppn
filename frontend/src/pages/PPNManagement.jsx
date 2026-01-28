'use client';

import React, { useState } from 'react'
import { useData } from '../contexts/DataContext.jsx'
import { useNotification, Modal, ConfirmDialog } from '../components/Notifications.jsx'

function PPNManagement() {
  const { ppnList, addPPN, updatePPN, deletePPN } = useData()
  const { showNotification } = useNotification()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPPN, setSelectedPPN] = useState(null)
  const [formData, setFormData] = useState({ name: '', unit: '', category: '' })

  const categories = ['Cereales', 'Huiles', 'Epicerie', 'Produits laitiers', 'Viandes', 'Legumes', 'Fruits']
  const units = ['kg', 'litre', 'unite', 'boite', 'paquet', 'bouteille']

  const handleAdd = () => {
    if (!formData.name || !formData.unit || !formData.category) {
      showNotification('error', 'Veuillez remplir tous les champs')
      return
    }
    addPPN(formData)
    showNotification('success', 'Produit PPN ajoute avec succes')
    setShowAddModal(false)
    setFormData({ name: '', unit: '', category: '' })
  }

  const handleEdit = () => {
    if (!selectedPPN || !formData.name || !formData.unit || !formData.category) {
      showNotification('error', 'Veuillez remplir tous les champs')
      return
    }
    updatePPN(selectedPPN.id, formData)
    showNotification('success', 'Produit PPN modifie avec succes')
    setShowEditModal(false)
    setSelectedPPN(null)
    setFormData({ name: '', unit: '', category: '' })
  }

  const handleDelete = () => {
    if (!selectedPPN) return
    deletePPN(selectedPPN.id)
    showNotification('success', 'Produit PPN supprime avec succes')
    setSelectedPPN(null)
  }

  const openEditModal = (ppn) => {
    setSelectedPPN(ppn)
    setFormData({ name: ppn.name, unit: ppn.unit, category: ppn.category })
    setShowEditModal(true)
  }

  const openDeleteConfirm = (ppn) => {
    setSelectedPPN(ppn)
    setShowDeleteConfirm(true)
  }

  const PPNForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Nom du produit *</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ex: Riz local"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Unite de mesure *</label>
        <select
          className="form-select"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        >
          <option value="">Selectionner une unite</option>
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Categorie *</label>
        <select
          className="form-select"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Selectionner une categorie</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>📦</span>
            Liste des produits PPN ({ppnList.length})
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Ajouter un PPN
          </button>
        </div>
        <div className="section-body no-padding">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom du produit</th>
                  <th>Unite</th>
                  <th>Categorie</th>
                  <th>Date creation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ppnList.map(ppn => (
                  <tr key={ppn.id}>
                    <td style={{ fontWeight: 500 }}>{ppn.name}</td>
                    <td>{ppn.unit}</td>
                    <td>
                      <span className="badge badge-info">{ppn.category}</span>
                    </td>
                    <td>{new Date(ppn.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button
                        className="action-btn action-btn-edit"
                        onClick={() => openEditModal(ppn)}
                      >
                        Modifier
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => openDeleteConfirm(ppn)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormData({ name: '', unit: '', category: '' }) }}
        title="Ajouter un produit PPN"
        icon="📦"
        footer={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => { setShowAddModal(false); setFormData({ name: '', unit: '', category: '' }) }}
            >
              Annuler
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleAdd}>
              Ajouter
            </button>
          </>
        }
      >
        <PPNForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedPPN(null); setFormData({ name: '', unit: '', category: '' }) }}
        title="Modifier le produit PPN"
        icon="✏️"
        footer={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => { setShowEditModal(false); setSelectedPPN(null); setFormData({ name: '', unit: '', category: '' }) }}
            >
              Annuler
            </button>
            <button className="modal-btn modal-btn-primary" onClick={handleEdit}>
              Enregistrer
            </button>
          </>
        }
      >
        <PPNForm />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedPPN(null) }}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Etes-vous sur de vouloir supprimer "${selectedPPN?.name}" ? Cette action est irreversible et supprimera egalement tous les rapports de prix associes.`}
        confirmText="Supprimer"
        confirmStyle="danger"
      />
    </div>
  )
}

export default PPNManagement
