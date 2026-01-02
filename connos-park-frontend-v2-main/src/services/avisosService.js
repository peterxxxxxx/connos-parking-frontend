import api from './api'

export default {
  getAvisos() {
    return api.get('/avisos/')
  },
  createAviso(texto) {
    return api.post('/avisos/', { mensaje: texto })
  }
}