import api from './api'

export default {
  getDocumentos() {
    return api.get('/documentos/')
  },
  
  uploadDocumento(formData) {
    // Es importante mandar headers multipart/form-data para subir archivos
    return api.post('/documentos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}