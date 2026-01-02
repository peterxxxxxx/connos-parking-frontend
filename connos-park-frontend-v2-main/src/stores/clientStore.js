import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import clientService from '@/services/clientService'

export const useClientStore = defineStore('client', () => {
  const clients = ref([])
  const currentClient = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)

  const fetchClients = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await clientService.getClients(params)
      clients.value = response.results || response
      totalCount.value = response.count || response.length
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchClientById = async (id) => {
    try {
      currentClient.value = await clientService.getClientById(id)
      return currentClient.value
    } catch (err) {
      error.value = err.message
    }
  }

  const createClient = async (clientData) => {
    try {
      const newClient = await clientService.createClient(clientData)
      clients.value.push(newClient)
      return newClient
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateClient = async (id, clientData) => {
    try {
      const updated = await clientService.updateClient(id, clientData)
      const index = clients.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clients.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteClient = async (id) => {
    try {
      await clientService.deleteClient(id)
      clients.value = clients.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    clients,
    currentClient,
    isLoading,
    error,
    totalCount,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
  }
})
