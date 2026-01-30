'use client';

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api.js'
import { useNotification, ConfirmDialog } from '../components/Notifications.jsx'

function RapportDetail({ params, onNavigateBack }) {
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const id_rapport = params?.id_rapport
  const [rapport, setRapport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchRapportDetail()
  }, [id_rapport])

  const fetchRapportDetail = async () => {
    setLoading(true)
    try {
      console.log('[+] Fetching rapport detail for id:', id_rapport)
      const response = await api.get(`/rapports/${id_rapport}`)
      setRapport(response.data)
    } catch (err) {
      console.log('[+] Erreur lors du chargement du rapport:', err.message)
      showNotification('error', 'Impossible de charger le rapport')
      if (onNavigateBack) {
        setTimeout(() => onNavigateBack(), 1000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/rapports/${id_rapport}`)
      showNotification('success', 'Rapport supprimé avec succès')
      setTimeout(() => {
        if (onNavigateBack) onNavigateBack()
      }, 1000)
    } catch (err) {
      console.log('[+] Erreur lors de la suppression:', err.message)
      showNotification('error', 'Impossible de supprimer le rapport')
    } finally {
      setDeleteLoading(false)
      setShowConfirm(false)
    }
  }

  const handleEdit = () => {
    // À implémenter: page d'édition
    showNotification('info', 'Fonctionnalité à venir')
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Chargement du rapport...
      </div>
    )
  }

  if (!rapport) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Rapport non trouvé</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/regional-reports')}
        >
          Retour aux rapports
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => onNavigateBack ? onNavigateBack() : null}
            style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
          >
            ← Retour aux rapports
          </button>
          <h1>Détail du rapport</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleEdit}
          >
            ✏️ Modifier
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirm(true)}
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            {rapport.ppn?.nomppn || 'Produit'}
          </h2>
        </div>
        <div className="section-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Informations du produit */}
            <div>
              <h3 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Produit</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Nom</label>
                  <p>{rapport.ppn?.nomppn}</p>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Description</label>
                  <p>{rapport.ppn?.description}</p>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Unité de mesure (unitaire)</label>
                  <p>{rapport.ppn?.unitemesure}</p>
                </div>
              </div>
            </div>

            {/* Informations de l'agent */}
            <div>
              <h3 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Agent modérateur</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Nom</label>
                  <p>{rapport.employe?.nom}</p>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Email</label>
                  <p>{rapport.employe?.email}</p>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#666' }}>Région</label>
                  <p>{rapport.employe?.region}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de prix */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Prix</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '0.875rem' }}>
                  Prix unitaire min
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginTop: '0.5rem' }}>
                  {(rapport.prixunitairemin || rapport.prix_unitaire_min)?.toLocaleString?.()} Ar
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '0.875rem' }}>
                  Prix unitaire max
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginTop: '0.5rem' }}>
                  {(rapport.prixunitairemax || rapport.prix_unitaire_max)?.toLocaleString?.()} Ar
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.875rem' }}>
                  Prix gros min
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
                  {(rapport.prixgrosmin || rapport.prix_gros_min)?.toLocaleString?.()} Ar
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.875rem' }}>
                  Prix gros max
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
                  {(rapport.prixgrosmax || rapport.prix_gros_max)?.toLocaleString?.()} Ar
                </p>
              </div>
            </div>
          </div>

          {/* Informations géographiques et observation */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                District
              </label>
              <p style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                {rapport.district}
              </p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                Date du rapport
              </label>
              <p style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                {new Date(rapport.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Observation
            </label>
            <p style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', minHeight: '4rem' }}>
              {rapport.observation || 'Aucune observation'}
            </p>
          </div>

          {/* Métadonnées */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Créé le: {new Date(rapport.createdat || rapport.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Supprimer le rapport"
        message="Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action ne peut pas être annulée."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isDangerous
        confirmText="Supprimer"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default RapportDetail
