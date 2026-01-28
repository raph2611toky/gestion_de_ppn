'use client';

import React, { createContext, useState, useCallback } from 'react'

export const DataContext = createContext(null)

// Mock PPN data
const INITIAL_PPNS = [
  {
    id: 'ppn-001',
    name: 'Riz blanc',
    description: 'Riz blanc de qualité standard',
    unitMeasure: 'kilogramme',
    bulkMeasure: 'sac',
    bulkSize: 50,
    observation: 'Riz de consommation courante',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ppn-002',
    name: 'Huile de palme',
    description: 'Huile de palme brute',
    unitMeasure: 'litre',
    bulkMeasure: 'bidon',
    bulkSize: 25,
    observation: 'Huile alimentaire',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'ppn-003',
    name: 'Sucre blanc',
    description: 'Sucre blanc cristallisé',
    unitMeasure: 'kilogramme',
    bulkMeasure: 'sac',
    bulkSize: 50,
    observation: 'Sucre de consommation',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'ppn-004',
    name: 'Farine de blé',
    description: 'Farine de blé tendre',
    unitMeasure: 'kilogramme',
    bulkMeasure: 'sac',
    bulkSize: 50,
    observation: 'Farine panifiable',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'ppn-005',
    name: 'Sel alimentaire',
    description: 'Sel fin alimentaire',
    unitMeasure: 'kilogramme',
    bulkMeasure: 'sac',
    bulkSize: 50,
    observation: 'Sel de cuisine',
    createdAt: new Date('2024-01-15'),
  },
]

// Mock price reports
const INITIAL_REPORTS = [
  {
    id: 'report-001',
    ppnId: 'ppn-001',
    ppnName: 'Riz blanc',
    regionId: 'region-001',
    regionName: 'Nord',
    district: 'District Nord-1',
    minUnitPrice: 850,
    maxUnitPrice: 950,
    minBulkPrice: 40000,
    maxBulkPrice: 45000,
    observation: 'Prix stables',
    date: new Date('2024-02-20'),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'report-002',
    ppnId: 'ppn-001',
    ppnName: 'Riz blanc',
    regionId: 'region-002',
    regionName: 'Sud',
    district: 'District Sud-1',
    minUnitPrice: 900,
    maxUnitPrice: 1000,
    minBulkPrice: 42000,
    maxBulkPrice: 48000,
    observation: 'Légère hausse',
    date: new Date('2024-02-20'),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'report-003',
    ppnId: 'ppn-002',
    ppnName: 'Huile de palme',
    regionId: 'region-001',
    regionName: 'Nord',
    district: 'District Nord-1',
    minUnitPrice: 1200,
    maxUnitPrice: 1400,
    minBulkPrice: 28000,
    maxBulkPrice: 32000,
    observation: 'Approvisionnement régulier',
    date: new Date('2024-02-19'),
    createdAt: new Date('2024-02-19'),
  },
  {
    id: 'report-004',
    ppnId: 'ppn-003',
    ppnName: 'Sucre blanc',
    regionId: 'region-004',
    regionName: 'Ouest',
    district: 'District Ouest-1',
    minUnitPrice: 1100,
    maxUnitPrice: 1300,
    minBulkPrice: 50000,
    maxBulkPrice: 60000,
    observation: 'Prix en hausse',
    date: new Date('2024-02-18'),
    createdAt: new Date('2024-02-18'),
  },
]

export function DataProvider({ children }) {
  const [ppns, setPpns] = useState(INITIAL_PPNS)
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [notifications, setNotifications] = useState([])

  const addPpn = useCallback((ppnData) => {
    const newPpn = {
      id: `ppn-${Date.now()}`,
      ...ppnData,
      createdAt: new Date(),
    }
    setPpns((prev) => [...prev, newPpn])
    addNotification('PPN créé avec succès', 'success')
    return newPpn
  }, [])

  const updatePpn = useCallback((ppnId, ppnData) => {
    setPpns((prev) =>
      prev.map((p) => (p.id === ppnId ? { ...p, ...ppnData } : p))
    )
    addNotification('PPN mis à jour avec succès', 'success')
  }, [])

  const deletePpn = useCallback((ppnId) => {
    setPpns((prev) => prev.filter((p) => p.id !== ppnId))
    setReports((prev) => prev.filter((r) => r.ppnId !== ppnId))
    addNotification('PPN supprimé avec succès', 'success')
  }, [])

  const addReport = useCallback((reportData) => {
    const ppn = ppns.find((p) => p.id === reportData.ppnId)
    const newReport = {
      id: `report-${Date.now()}`,
      ...reportData,
      ppnName: ppn?.name || '',
      createdAt: new Date(),
      date: reportData.date || new Date(),
    }
    setReports((prev) => [...prev, newReport])
    addNotification('Rapport de prix ajouté avec succès', 'success')
    return newReport
  }, [ppns])

  const updateReport = useCallback((reportId, reportData) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, ...reportData } : r))
    )
    addNotification('Rapport mis à jour avec succès', 'success')
  }, [])

  const deleteReport = useCallback((reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    addNotification('Rapport supprimé avec succès', 'success')
  }, [])

  const getReportsByRegion = useCallback(
    (regionId) => {
      return reports.filter((r) => r.regionId === regionId)
    },
    [reports]
  )

  const getReportsByPpn = useCallback(
    (ppnId) => {
      return reports.filter((r) => r.ppnId === ppnId)
    },
    [reports]
  )

  const getReportsByDate = useCallback(
    (startDate, endDate) => {
      return reports.filter((r) => {
        const reportDate = new Date(r.date)
        return reportDate >= startDate && reportDate <= endDate
      })
    },
    [reports]
  )

  const addNotification = useCallback((message, type = 'info') => {
    const id = `notification-${Date.now()}`
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const value = {
    ppns,
    reports,
    notifications,
    addPpn,
    updatePpn,
    deletePpn,
    addReport,
    updateReport,
    deleteReport,
    getReportsByRegion,
    getReportsByPpn,
    getReportsByDate,
    addNotification,
    removeNotification,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = React.useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
