import api from './api'

export default {
  // Crear un nuevo contrato
  createContrato(data) {
    return api.post('/contratos/', data)
  },
  
  // Obtener lista de contratos (para buscar cuál pertenece al cliente)
  getContratos() {
    return api.get('/contratos/')
  }
}