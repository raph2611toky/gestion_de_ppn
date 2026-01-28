'use client';

import React, { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

// Regions of Madagascar
export const REGIONS = [
  'Analamanga', 'Vakinankaratra', 'Itasy', 'Bongolava', 
  'Haute Matsiatra', "Amoron'i Mania", 'Vatovavy', 'Fitovinany', 
  'Atsimo Atsinanana', 'Atsinanana', 'Analanjirofo', 'Alaotra-Mangoro'
]

// Initial PPN data
const INITIAL_PPN = [
  { id: '1', name: 'Riz local', unit: 'kg', category: 'Cereales', createdAt: '2024-01-01' },
  { id: '2', name: 'Huile vegetale', unit: 'litre', category: 'Huiles', createdAt: '2024-01-01' },
  { id: '3', name: 'Sucre', unit: 'kg', category: 'Epicerie', createdAt: '2024-01-01' },
  { id: '4', name: 'Farine de ble', unit: 'kg', category: 'Cereales', createdAt: '2024-01-01' },
  { id: '5', name: 'Lait concentre', unit: 'boite', category: 'Produits laitiers', createdAt: '2024-01-01' },
]

// Initial price reports
const INITIAL_REPORTS = [
  { id: '1', ppnId: '1', ppnName: 'Riz local', price: 2800, region: 'Analamanga', district: 'Antananarivo', date: '2024-01-15', reportedBy: 'Agent Nord' },
  { id: '2', ppnId: '2', ppnName: 'Huile vegetale', price: 12000, region: 'Analamanga', district: 'Antananarivo', date: '2024-01-15', reportedBy: 'Agent Nord' },
  { id: '3', ppnId: '1', ppnName: 'Riz local', price: 2600, region: 'Vakinankaratra', district: 'Antsirabe', date: '2024-01-15', reportedBy: 'Agent Sud' },
  { id: '4', ppnId: '3', ppnName: 'Sucre', price: 5500, region: 'Analamanga', district: 'Antananarivo', date: '2024-01-20', reportedBy: 'Agent Nord' },
  { id: '5', ppnId: '1', ppnName: 'Riz local', price: 2900, region: 'Analamanga', district: 'Antananarivo', date: '2024-12-15', reportedBy: 'Agent Nord' },
  { id: '6', ppnId: '1', ppnName: 'Riz local', price: 2750, region: 'Vakinankaratra', district: 'Antsirabe', date: '2024-12-15', reportedBy: 'Agent Sud' },
  { id: '7', ppnId: '2', ppnName: 'Huile vegetale', price: 12500, region: 'Analamanga', district: 'Antananarivo', date: '2024-12-20', reportedBy: 'Agent Nord' },
  { id: '8', ppnId: '1', ppnName: 'Riz local', price: 3000, region: 'Itasy', district: 'Miarinarivo', date: '2024-12-18', reportedBy: 'Agent Nord' },
]

// Initial accounts
const INITIAL_ACCOUNTS = [
  { id: '1', username: 'new_agent1', name: 'Nouveau Agent 1', region: 'Itasy', status: 'pending', createdAt: '2024-01-10' },
  { id: '2', username: 'new_agent2', name: 'Nouveau Agent 2', region: 'Bongolava', status: 'pending', createdAt: '2024-01-12' },
  { id: '3', username: 'agent_approved', name: 'Agent Approuve', region: 'Haute Matsiatra', status: 'approved', createdAt: '2024-01-05' },
]

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export function DataProvider({ children }) {
  const [ppnList, setPPNList] = useState(INITIAL_PPN)
  const [priceReports, setPriceReports] = useState(INITIAL_REPORTS)
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS)

  const addPPN = (ppn) => {
    const newPPN = {
      ...ppn,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPPNList(prev => [...prev, newPPN])
  }

  const updatePPN = (id, data) => {
    setPPNList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }

  const deletePPN = (id) => {
    setPPNList(prev => prev.filter(p => p.id !== id))
  }

  const addPriceReport = (report) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
    }
    setPriceReports(prev => [...prev, newReport])
  }

  const updateAccountStatus = (id, status) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAccounts(prev => [...prev, newAccount])
  }

  return (
    <DataContext.Provider value={{
      ppnList,
      priceReports,
      accounts,
      addPPN,
      updatePPN,
      deletePPN,
      addPriceReport,
      updateAccountStatus,
      addAccount,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext
