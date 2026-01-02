import api from './api'

export default {
  // Obtener todos los cajones
  getCajones() {
    return api.get('/cajones/')
  },
  
  // Obtener un cajón específico por ID
  getCajonById(id) {
    return api.get(`/cajones/${id}/`)
  },

  // --- NUEVO: Crear Cajón ---
  createCajon(data) {
    return api.post('/cajones/', data)
  }
}