// src/stores/modalState.js
import { reactive } from 'vue';

// Esto es un pequeño estado global para controlar el modal de registro desde cualquier lado
export const modalState = reactive({
  showRegistrarCliente: false
});