<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Agregar Cajón</h3>
      </div>
      
      <form @submit.prevent="guardarCajon" class="modal-body form-grid">
        
        <div class="form-group full-width">
          <label>Número de Cajón:</label>
          <input 
            type="text" 
            v-model="form.numero" 
            placeholder="Ej. 10, B-5..." 
            class="input-field" 
            required 
          />
        </div>

        <div class="form-group full-width">
          <label>Estado Inicial:</label>
          <select v-model="form.estado" class="input-field" required>
            <option value="FUNCIONAL">Funcional</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label>Descripción (Opcional):</label>
          <textarea 
            v-model="form.descripcion" 
            placeholder="Detalles sobre la ubicación o características..." 
            rows="3" 
            class="input-field"
          ></textarea>
        </div>

        <div class="modal-footer full-width">
          <button type="button" class="btn-cancelar" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-registrar-modal" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Cajón' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import operacionesService from '@/services/operacionesService';

const emit = defineEmits(['close', 'cajon-creado']);
const loading = ref(false);

const form = reactive({
  numero: '',
  estado: 'FUNCIONAL',
  descripcion: ''
});

const guardarCajon = async () => {
  loading.value = true;
  try {
    await operacionesService.createCajon(form);
    alert('Cajón creado exitosamente');
    emit('cajon-creado'); // Avisamos al padre para que recargue la lista
    emit('close');
  } catch (error) {
    console.error(error);
    // Manejo de errores común en Django (ej. número duplicado)
    let msg = "Error al crear cajón.";
    if (error.response?.data?.numero) {
      msg = `Error: ${error.response.data.numero[0]}`;
    }
    alert(msg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Reutilizamos los estilos de tus otros modales para consistencia */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: white; border-radius: 15px; padding: 25px; width: 500px; max-width: 95%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header h3 { text-align: center; margin: 0 0 25px 0; color: #333; font-size: 1.5rem; }
.form-grid { display: grid; gap: 15px; } /* Una sola columna para este modal simple */
.full-width { width: 100%; }
.form-group label { display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #333; }
.input-field { width: 100%; padding: 12px; background-color: #F5F6FA; border: 1px solid #E0E0E0; border-radius: 8px; box-sizing: border-box; font-size: 1rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
.btn-cancelar { background: transparent; color: #666; border: 1px solid #ccc; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-registrar-modal { background: #7C5CFF; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-registrar-modal:disabled { background: #ccc; cursor: not-allowed; }
</style>