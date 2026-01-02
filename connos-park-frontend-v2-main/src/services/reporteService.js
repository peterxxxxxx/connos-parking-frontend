import api from './api'

export default {
  // Obtener todos los pagos para calcular ingresos
  getPagosReporte() {
    return api.get('/pagos/')
  },
  
  // En el futuro, aquí podrías llamar a un endpoint específico:
  // getIngresosMensuales() { return api.get('/reportes/ingresos/') }
}