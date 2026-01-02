import api from './api'

export default {
  getVehiculos() {
    return api.get('/vehiculos/')
  },
  
  // metodo para actaulizar datos del vehiculo
  updateVehiculo(id, data) {
    return api.patch(`/vehiculos/${id}/`, data)
  },

  createVehiculo(data) {
    return api.post('/vehiculos/', data)
  }
}
