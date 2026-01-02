<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Acciones</h2>
      </div>

      <div class="modal-content">
        
        <div class="top-section">
          <div class="info-box">
            <h4>Información del Cliente</h4>
            <div class="client-details">
              <div class="avatar-placeholder">👤</div>
              <div class="text-details">
                <p><strong>Nombre:</strong> {{ data.clienteNombre || 'Sin Cliente' }}</p>
                <p v-if="!data.clienteNombre" class="small">Lugar disponible</p>
              </div>
            </div>
          </div>

          <div class="contract-box">
            <div class="contract-info" v-if="data.contrato">
              <p>Inicio contrato</p>
              <h3>{{ formatDate(data.contrato.fecha_inicio) }}</h3>
              
              <div class="toggle-group">
                <span>Contrato ({{ form.contratoActivo ? 'Activo' : 'Inactivo' }})</span>
                <div 
                  class="toggle" 
                  :class="{ active: form.contratoActivo }"
                  @click="form.contratoActivo = !form.contratoActivo"
                ></div>
              </div>
            </div>
            <div v-else class="no-contract">
              <p>No hay contrato activo</p>
            </div>
            
            <button 
              v-if="data.contrato" 
              class="btn-pago" 
              @click="$emit('open-payment')"
            >
              💳 Realizar Pago
            </button>
          </div>
        </div>

        <div class="bottom-section">
          <div class="lugar-info">
            <h4>Información del Lugar</h4>
            <div class="lugar-row">
              <h1 class="cajon-number">{{ data.cajon.numero }}</h1>
              
              <div class="status-control">
                <span>Estado ({{ form.esFuncional ? 'Funcional' : 'Mantenimiento' }})</span>
                <div 
                  class="toggle" 
                  :class="{ active: form.esFuncional }"
                  @click="form.esFuncional = !form.esFuncional"
                ></div>
              </div>

              <!-- <div class="assign-control">
                <label>Cliente Asignado</label>
                <select class="input-field" disabled>
                  <option selected>{{ data.clienteNombre || 'Sin Asignar' }}</option>
                </select>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-guardar" @click="guardarCambios" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
        <button class="btn-cancelar" @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '@/services/api'; // Usamos axios directo para patches rápidos

const props = defineProps(['data']);
const emit = defineEmits(['close', 'open-payment', 'guardar']);
const loading = ref(false);

const form = reactive({
  contratoActivo: false,
  esFuncional: true
});

onMounted(() => {
  // Inicializamos el estado de los toggles según los datos reales
  if (props.data) {
    form.esFuncional = props.data.cajon.estado === 'FUNCIONAL';
    form.contratoActivo = props.data.contrato ? props.data.contrato.activo : false;
  }
});

const formatDate = (date) => {
  if (!date) return '--/--/----';
  return new Date(date).toLocaleDateString('es-ES');
};

const guardarCambios = async () => {
  loading.value = true;
  try {
    const promises = [];

    // 1. Actualizar estado del cajón si cambió
    const nuevoEstadoCajon = form.esFuncional ? 'FUNCIONAL' : 'MANTENIMIENTO';
    if (nuevoEstadoCajon !== props.data.cajon.estado) {
      promises.push(api.patch(`/cajones/${props.data.cajon.id}/`, { estado: nuevoEstadoCajon }));
    }

    // 2. Actualizar estado del contrato si existe y cambió
    if (props.data.contrato && form.contratoActivo !== props.data.contrato.activo) {
      promises.push(api.patch(`/contratos/${props.data.contrato.id}/`, { activo: form.contratoActivo }));
    }

    await Promise.all(promises);
    alert('Cambios guardados correctamente');
    emit('guardar'); // Avisa al padre para recargar la tabla

  } catch (error) {
    console.error(error);
    alert('Error al guardar cambios');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* (Mantén tus estilos CSS existentes aquí, son idénticos al paso anterior) */
/* ... Copia los estilos de tu archivo AccionesModal.vue actual ... */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: #F5F6FA; width: 800px; max-width: 95%; border-radius: 20px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.modal-header h2 { text-align: center; color: #333; margin-bottom: 20px; }
.top-section { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px; }
.info-box, .contract-box, .bottom-section { background: #EAEAEA; padding: 15px; border-radius: 12px; }
.client-details { display: flex; gap: 15px; margin-top: 10px; }
.avatar-placeholder { width: 60px; height: 60px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
.contract-box { display: flex; flex-direction: column; justify-content: space-between; text-align: right; }
.btn-pago { background-color: #7C5CFF; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; }
.lugar-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; }
.cajon-number { font-size: 3rem; margin: 0; color: #333; }
.input-field { padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 200px; }
.modal-footer { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
.btn-guardar { background: #28a745; color: white; padding: 10px 30px; border: none; border-radius: 5px; cursor: pointer; }
.btn-cancelar { background: #dc3545; color: white; padding: 10px 30px; border: none; border-radius: 5px; cursor: pointer; }
.toggle-group, .status-control { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.toggle { width: 50px; height: 26px; background: #ccc; border-radius: 20px; position: relative; cursor: pointer; transition: background 0.3s; }
.toggle.active { background: #7C5CFF; }
.toggle::after { content: ''; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.toggle.active::after { transform: translateX(24px); }
</style>