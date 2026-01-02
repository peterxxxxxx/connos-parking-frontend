import api from './api'

export default {
  // Obtener lista completa de usuarios
  getUsuarios() {
    return api.get('/usuarios/')
  },
  
  // Crear nuevo usuario
  createUsuario(data) {
    return api.post('/usuarios/', data)
  },

  // Editar usuario existente
  updateUsuario(id, data) {
    return api.patch(`/usuarios/${id}/`, data)
  },

  // Eliminar usuario
  deleteUsuario(id) {
    return api.delete(`/usuarios/${id}/`)
  },

  // Obtener roles (para el select del formulario)
  getRoles() {
    return api.get('/roles/') // Asegúrate de que tu URL en backend sea 'roles' o 'rol'
  }
}