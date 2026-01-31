import api from './api'

export const fetchPpns = async (setPpns, showError) => {
  try {
    const response = await api.get('/ppns')
    console.log('[+] PPNs loaded:', response.data)
    setPpns(response.data)
  } catch (err) {
    console.log('[+] Erreur lors du chargement des PPNs:', err.message)
    if (showError) {
      showError('Impossible de charger la liste des PPNs')
    }
  } finally {
    console.log('[+] fetchPpns() terminée')
  }
}
