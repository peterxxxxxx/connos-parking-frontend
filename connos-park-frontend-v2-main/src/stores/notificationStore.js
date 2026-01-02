// src/stores/notificationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notification = ref({
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  })

  const showNotification = (message, type = 'success') => {
    notification.value = {
      show: true,
      message,
      type
    }
    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  }

  return { notification, showNotification }
})