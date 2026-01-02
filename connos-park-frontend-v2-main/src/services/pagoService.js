import api from './api'

export default {
  // Registrar un nuevo pago
  createPago(data) {
    return api.post('/pagos/', data)
  }
}