<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Realizar Pago</h3>
      </div>
      
      <form @submit.prevent="guardarPago" class="modal-body">
        
        <div class="form-group">
          <label>Monto del pago:</label>
          <div class="input-wrapper">
            <span class="prefix">$</span>
            <input type="number" v-model="form.monto" step="0.01" class="input-field" required />
          </div>
        </div>

        <div class="form-group">
          <label>Fecha de pago:</label>
          <input type="date" v-model="form.fecha_pago" class="input-field" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Periodo inicio:</label>
            <input type="date" v-model="form.periodo_inicio" class="input-field" required />
          </div>
          <div class="form-group">
            <label>Periodo fin:</label>
            <input type="date" v-model="form.periodo_fin" class="input-field" required />
          </div>
        </div>

        <div class="form-group">
          <label>Comentario:</label>
          <textarea v-model="form.comentario" placeholder="Agrega un comentario..." rows="3" class="input-field"></textarea>
        </div>

        <div class="modal-footer">
          <button type="submit" class="btn-guardar" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button> 
          <button type="button" class="btn-cancelar" @click="$emit('close')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'; // Importar onMounted
import pagoService from '@/services/pagoService';

// Agregamos 'montoContrato' a las props
const props = defineProps(['contratoId', 'montoContrato']);
const emit = defineEmits(['close', 'pago-registrado']);
const loading = ref(false);

const form = reactive({
  monto: 0, // Se inicializa en 0 o vacío
  fecha_pago: new Date().toISOString().split('T')[0],
  periodo_inicio: '',
  periodo_fin: '',
  comentario: ''
});

// Al montar, si viene un monto sugerido del contrato, lo usamos
onMounted(() => {
  if (props.montoContrato) {
    form.monto = props.montoContrato;
  }
});

const guardarPago = async () => {
  if (!props.contratoId) {
    alert("Error: No hay contrato asociado.");
    return;
  }

  loading.value = true;
  try {
    const dataToSend = {
      contrato: props.contratoId,
      ...form
    };

    await pagoService.createPago(dataToSend);
    alert('Pago registrado correctamente');
    emit('pago-registrado');
    
  } catch (error) {
    console.error(error);
    alert('Error al registrar el pago: ' + (error.response?.data?.detail || 'Revisa los datos'));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ... (Estilos iguales al anterior) ... */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: white; border-radius: 15px; padding: 25px; width: 450px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header h3 { text-align: center; margin: 0 0 20px 0; color: #333; font-size: 1.3rem; }
.form-group { margin-bottom: 15px; }
.form-row { display: flex; gap: 10px; }
.form-group label { display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555; }
.input-field { width: 100%; padding: 10px; background-color: #E8E8E8; border: none; border-radius: 5px; box-sizing: border-box; font-size: 1rem; }
.input-wrapper { display: flex; align-items: center; background-color: #E8E8E8; border-radius: 5px; padding-left: 10px; }
.prefix { font-weight: bold; color: #555; margin-right: 5px; }
.modal-footer { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }
.btn-guardar { background-color: #28a745; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; }
.btn-cancelar { background-color: #dc3545; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; }
.btn-guardar:disabled { background-color: #ccc; }
</style>