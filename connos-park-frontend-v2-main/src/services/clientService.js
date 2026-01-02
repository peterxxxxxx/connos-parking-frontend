import api from './api'

export default {
  // Obtener lista de clientes (soporta filtros si los mandas en params)
  getClients(params) {
    return api.get('/clientes/', { params })
  },

  // Obtener un solo cliente por ID
  getClientById(id) {
    return api.get(`/clientes/${id}/`)
  },

  // Crear un nuevo cliente
  createClient(data) {
    return api.post('/clientes/', data)
  },

  // Actualizar un cliente existente
  updateClient(id, data) {
    return api.put(`/clientes/${id}/`, data) // O api.patch si prefieres actualizaciones parciales
  },

  // Borrar un cliente (o desactivarlo)
  deleteClient(id) {
    return api.delete(`/clientes/${id}/`)
  }
}