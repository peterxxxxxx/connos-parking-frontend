<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <h3>Registrar Nuevo Usuario</h3>
      
      <form @submit.prevent="handleSubmit" class="form-grid">
        
        <div class="form-group">
          <label>Nombre de usuario (Login)</label>
          <input v-model="form.username" type="text" required class="input-field" placeholder="Ej. juanperez" />
        </div>
        
        <div class="form-group">
          <label>Rol Asignado</label>
          <select v-model="form.rol" class="input-field" required>
            <option value="" disabled>Selecciona...</option>
            <option v-for="r in rolesList" :key="r.id" :value="r.id">
              {{ r.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Nombre(s)</label>
          <input v-model="form.first_name" type="text" required class="input-field" placeholder="Ej. Juan" />
        </div>

        <div class="form-group">
          <label>Apellido(s)</label>
          <input v-model="form.last_name" type="text" required class="input-field" placeholder="Ej. Pérez" />
        </div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input v-model="form.email" type="email" required class="input-field" placeholder="juan@connos.com" />
        </div>

        <div class="form-group">
          <label>Teléfono</label>
          <input v-model="form.telefono" type="tel" class="input-field" placeholder="55 1234 5678" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" required class="input-field" />
        </div>

        <div class="form-group">
          <label>Confirmar Contraseña</label>
          <input v-model="confirmPassword" type="password" required class="input-field" />
        </div>

        <p v-if="error" class="error-text full-width">{{ error }}</p>

        <div class="modal-footer full-width">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '@/services/api';
import usuarioService from '@/services/usuarioService';

const emit = defineEmits(['close']);
const loading = ref(false);
const error = ref('');
const confirmPassword = ref('');
const rolesList = ref([]);

onMounted(async () => {
  try {
    const res = await usuarioService.getRoles();
    rolesList.value = res.results || res;
  } catch (err) {
    console.error("Error roles", err);
  }
});

const form = reactive({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  telefono: '',
  password: '',
  rol: ''
});

const handleSubmit = async () => {
  if (form.password !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden";
    return;
  }
  
  loading.value = true;
  error.value = '';

  try {
    await api.post('/usuarios/', {
      ...form,
      rol_id: form.rol 
    });
    alert('Usuario creado con éxito');
    emit('close');
  } catch (err) {
    console.error(err);
    error.value = 'Error al crear usuario. Verifica que el usuario o correo no existan ya.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: white; padding: 30px; border-radius: 15px; width: 700px; max-width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
.full-width { grid-column: span 2; }
.form-group label { display: block; font-weight: bold; font-size: 0.85rem; margin-bottom: 5px; color: #555; }
.input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-save { background: #7C5CFF; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: #ccc; color: #333; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.error-text { color: red; font-size: 0.9rem; text-align: center; }
</style>