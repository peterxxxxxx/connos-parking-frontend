import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'


export const useAuthStore = defineStore('auth', () => {
  // Inicializamos leyendo de localStorage
  const token = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  
  // Recuperar usuario del storage de forma segura
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null
    }
  }
  const user = ref(getUserFromStorage())
  
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  
  // Computed para el ROL en respuesta del backend (rol_nombre)
  const userRole = computed(() => user.value?.rol_nombre || null)
  
  // logica de roles
  const isAdmin = computed(() => userRole.value === 'Administrador')
  const isAccountant = computed(() => userRole.value === 'Contador')
  const isManager = computed(() => userRole.value === 'Encargado')

  // Puede generar reportes si es Admin O es Contador
  const canViewReports = computed(() => isAdmin.value || isAccountant.value)

  // Puede gestionar usuarios (Solo Admin)
  const canManageUsers = computed(() => isAdmin.value)

  const login = async (username, password) => {
    isLoading.value = true
    error.value = null
    try {
      // Llamamos al servicio
      const response = await authService.login(username, password)
      
      // 1. Guardar en Estado de Pinia (Memoria)
      token.value = response.access
      refreshToken.value = response.refresh
      user.value = response.user // <--- se guarda los datos del usuario
      
      // 2. Guardar en LocalStorage (Persistencia)
      localStorage.setItem('access_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      // Guardamos el objeto user entero como string
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return true
    } catch (err) {
      console.error(err)
      error.value = 'Credenciales incorrectas o error de servidor'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    authService.logout() // Usamos la función del servicio para limpiar localStorage
  }

  const refreshAccessToken = async () => {
    try {
      const response = await authService.refreshToken(refreshToken.value)
      token.value = response.access
      localStorage.setItem('access_token', response.access)
      return true
    } catch (err) {
      logout()
      return false
    }
  }

  return {
    token,
    refreshToken,
    user,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isAccountant,
    isManager,
    login,
    logout,
    refreshAccessToken,
    canViewReports,
    canManageUsers
  }
})