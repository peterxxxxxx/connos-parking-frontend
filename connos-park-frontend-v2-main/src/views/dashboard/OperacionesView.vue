<template>
  <div class="operaciones-container">
    <div class="header-section">
      <h2>Operaciones y Control</h2>
      <button class="btn-primary" @click="showRegistrarCajon = true">
        + Agregar Cajón
      </button>
    </div>
    
    <div v-if="loading" class="loading-text">Cargando mapa de operaciones...</div>

    <div v-else class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th class="col-cajon">Cajón</th>
            <th class="col-estado">Estado</th>
            <th class="col-asignacion">Asignación</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in mapaCajones" :key="item.cajon.id">
            <td class="cajon-id">{{ item.cajon.numero }}</td>
            <td>
              <span :class="['status-badge', getEstadoClass(item)]">
                {{ getEstadoLabel(item) }}
              </span>
            </td>
            <td class="asignacion">
              {{ item.clienteNombre || '---' }}
            </td>
            <td>
              <button class="btn-action" @click="abrirAcciones(item)">🔧</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AccionesModal 
      v-if="showAcciones" 
      :data="itemSeleccionado"
      @close="cerrarAcciones"
      @guardar="handleGuardarCambios"
      @open-payment="abrirPago"
    />

    <PagoModal 
      v-if="showPago" 
      :contrato-id="itemSeleccionado?.contrato?.id"
      :monto-contrato="itemSeleccionado?.contrato?.monto_mensual"
      @close="showPago = false" 
      @pago-registrado="handlePagoExitoso"
    />

    <RegistrarCajonModal
      v-if="showRegistrarCajon"
      @close="showRegistrarCajon = false"
      @cajon-creado="handleCajonCreado"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import operacionesService from '@/services/operacionesService';
import contratoService from '@/services/contratoService';
import clientService from '@/services/clientService';
import AccionesModal from './AccionesModal.vue';
import PagoModal from './PagoModal.vue';
import RegistrarCajonModal from './RegistrarCajonModal.vue'; // Importar el nuevo modal

// ... (Tus variables existentes: loading, rawCajones, etc.) ...
const loading = ref(true);
const rawCajones = ref([]);
const rawContratos = ref([]);
const rawClientes = ref([]);

const showAcciones = ref(false);
const showPago = ref(false);
const showRegistrarCajon = ref(false); // Nueva variable reactiva
const itemSeleccionado = ref(null);

// ... (Mantén tu función cargarDatos, onMounted y mapaCajones IGUAL) ...
const cargarDatos = async () => {
  /* ... tu código existente ... */
  loading.value = true;
  try {
    const [resCajones, resContratos, resClientes] = await Promise.all([
      operacionesService.getCajones(),
      contratoService.getContratos(),
      clientService.getClients()
    ]);
    rawCajones.value = resCajones.results || resCajones;
    rawContratos.value = resContratos.results || resContratos;
    rawClientes.value = resClientes.results || resClientes;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { cargarDatos(); });

const mapaCajones = computed(() => {
  /* ... tu código existente ... */
  return rawCajones.value.map(cajon => {
    const contratoActivo = rawContratos.value.find(c => c.cajon === cajon.id && c.activo);
    let clienteNombre = '';
    if (contratoActivo) {
      const cliente = rawClientes.value.find(cl => cl.id === contratoActivo.cliente);
      clienteNombre = cliente ? cliente.nombre : 'Cliente Desconocido';
    }
    return {
      cajon: cajon,
      contrato: contratoActivo || null,
      clienteNombre: clienteNombre
    };
  });
});

// ... (Tus helpers getEstadoClass, getEstadoLabel IGUAL) ...
const getEstadoClass = (item) => {
  if (item.cajon.estado === 'MANTENIMIENTO') return 'mantenimiento';
  if (item.contrato) return 'ocupado';
  return 'libre';
};
const getEstadoLabel = (item) => {
  if (item.cajon.estado === 'MANTENIMIENTO') return 'Mantenimiento';
  if (item.contrato) return 'Ocupado';
  return 'Libre';
};

// ... (Tus funciones de modales existentes) ...
const abrirAcciones = (item) => {
  itemSeleccionado.value = item;
  showAcciones.value = true;
};
const cerrarAcciones = () => {
  showAcciones.value = false;
  itemSeleccionado.value = null;
};
const abrirPago = () => {
  showPago.value = true;
};
const handleGuardarCambios = async () => {
  await cargarDatos();
  showAcciones.value = false;
};
const handlePagoExitoso = () => {
  showPago.value = false;
};

// --- NUEVA FUNCIÓN ---
const handleCajonCreado = async () => {
  await cargarDatos(); // Recargar la tabla para ver el nuevo cajón
  showRegistrarCajon.value = false;
};
</script>

<style scoped>
/* Agrega estos estilos para la cabecera */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.btn-primary {
  background: #7C5CFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.3s;
}
.btn-primary:hover {
  background: #6a4be0;
}

/* ... (El resto de tus estilos anteriores) ... */
.operaciones-container { padding: 20px; }
h2 { font-size: 2rem; color: #333; margin: 0; } /* Ajusté margin porque ahora lo maneja header-section */
.loading-text { text-align: center; color: #666; padding: 20px; }
.table-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.custom-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.custom-table th { text-align: left; padding: 15px; color: #666; font-weight: 600; border-bottom: 2px solid #f0f0f0; font-size: 1.1rem; }
.col-cajon { width: 10%; text-align: center; }
.col-estado { width: 20%; text-align: center; }
.col-asignacion { width: 50%; }
.col-acciones { width: 20%; text-align: center; }
.custom-table td { padding: 20px 15px; border-bottom: 1px solid #f9f9f9; color: #333; font-size: 1.2rem; vertical-align: middle; }
.custom-table td:first-child { text-align: center; font-size: 1.5rem; color: #444; }
.custom-table td:last-child { text-align: center; }
.status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; color: white; font-size: 0.9rem; font-weight: bold; min-width: 120px; text-align: center; }
.status-badge.ocupado { background-color: #4CAF50; }
.status-badge.libre { background-color: #FF4081; }
.status-badge.mantenimiento { background-color: #FF5252; }
.btn-action { background: none; border: none; cursor: pointer; font-size: 1.5rem; transition: transform 0.2s; }
.btn-action:hover { transform: scale(1.2); }
</style>