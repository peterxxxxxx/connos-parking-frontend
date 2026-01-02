import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const isAdmin = computed(() => authStore.isAdmin)
  const isAccountant = computed(() => authStore.isAccountant)
  const isManager = computed(() => authStore.isManager)

  const login = async (email, password) => {
    return authStore.login(email, password)
  }

  const logout = () => {
    authStore.logout()
  }

  return {
    isAuthenticated,
    user,
    userRole,
    isAdmin,
    isAccountant,
    isManager,
    login,
    logout,
  }
}
