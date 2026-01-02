<template>
  <div class="clientes-container">
    <div class="header-section">
      <h2>Clientes</h2>
      <button class="btn-primary" @click="modalState.showRegistrarCliente = true">
        + Nuevo Cliente
      </button>
    </div>

    <div v-if="clientStore.error" class="error-alert">{{ clientStore.error }}</div>
    <div v-if="clientStore.isLoading" class="loading-state">Cargando clientes...</div>

    <div v-else class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientStore.clients" :key="cliente.id" :id="`cliente-row-${cliente.id}`">
            <td class="nombre-cell"><span class="avatar-mini">👤</span>{{ cliente.nombre }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.correo }}</td>
            <td>
              <span :class="cliente.activo ? 'badge-active' : 'badge-inactive'">
                {{ cliente.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-center">
              <button class="btn-icon eye-btn" @click="verDetalles(cliente)">👁️</button>
            </td>
          </tr>
          <tr v-if="clientStore.clients.length === 0">
            <td colspan="5" class="text-center">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DetalleClienteModal
      v-if="showDetalleModal"
      :cliente="clienteSeleccionado"  
      @close="showDetalleModal = false"
      @pago="handleAbrirPago" 
    />

    <PagoModal 
      v-if="showPagoModal" 
      :contrato-id="contratoIdSeleccionado"
      @close="showPagoModal = false" 
      @pago-registrado="handlePagoExitoso"
    />

    <RegistrarClienteModal
      v-if="modalState.showRegistrarCliente"
      @close="modalState.showRegistrarCliente = false"
      @registrar="handleRegistrarCliente"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { modalState } from '@/stores/modalState';
import { useRoute } from 'vue-router';
// Importamos componentes
import DetalleClienteModal from './DetalleClienteModal.vue';
import RegistrarClienteModal from './RegistrarClienteModal.vue';
import PagoModal from './PagoModal.vue'; // <--- Importante

const clientStore = useClientStore();
const route = useRoute();

const showDetalleModal = ref(false);
const clienteSeleccionado = ref(null);

// Variables para el Pago
const showPagoModal = ref(false);
const contratoIdSeleccionado = ref(null);

onMounted(async () => {
  await clientStore.fetchClients();
  resaltarCliente();
});

const verDetalles = (cliente) => {
  clienteSeleccionado.value = cliente;
  showDetalleModal.value = true;
};

// Función que se activa al dar click en "Realizar Pago" dentro del detalle
const handleAbrirPago = (contratoId) => {
  contratoIdSeleccionado.value = contratoId;
  showDetalleModal.value = false; // Cerramos el detalle para enfocar el pago
  showPagoModal.value = true;     // Abrimos el modal de pago
};

const handlePagoExitoso = () => {
  showPagoModal.value = false;
  // Opcional: Podrías volver a abrir el detalle si quisieras
};

// ... (Resto de lógica: resaltarCliente, handleRegistrarCliente IGUAL) ...
const resaltarCliente = async () => {
  const clienteId = route.query.highlight;
  if (clienteId && clientStore.clients.length > 0) {
    await nextTick();
    const row = document.getElementById(`cliente-row-${clienteId}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('highlight-row');
      setTimeout(() => { row.classList.remove('highlight-row'); }, 3000);
    }
  }
};

watch(() => route.query.highlight, () => resaltarCliente());

const handleRegistrarCliente = async (nuevoClienteData) => {
  try {
    await clientStore.createClient(nuevoClienteData);
    modalState.showRegistrarCliente = false;
    await clientStore.fetchClients();
    alert("Cliente registrado exitosamente");
  } catch (error) {
    console.error(error);
    alert("Error al registrar: " + error);
  }
};
</script>

<style scoped>
/* ... (Tus estilos anteriores se mantienen IGUAL) ... */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { background: #7C5CFF; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-primary:hover { background: #6a4be0; }
.error-alert { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
.loading-state { text-align: center; padding: 40px; color: #666; }
.table-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { text-align: left; padding: 15px; color: #666; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.custom-table td { padding: 15px; border-bottom: 1px solid #f9f9f9; color: #333; vertical-align: middle; }
.text-center { text-align: center; }
.nombre-cell { display: flex; align-items: center; font-weight: 500; }
.avatar-mini { margin-right: 10px; background: #E0E7FF; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.8rem; }
.badge-active { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
.badge-inactive { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.4rem; transition: transform 0.2s; }
.eye-btn:hover { transform: scale(1.2); }
.clientes-container { padding: 20px; }

@keyframes flashHighlight {
  0% { background-color: rgba(124, 92, 255, 0.3); }
  100% { background-color: transparent; }
}
.highlight-row {
  animation: flashHighlight 2s ease-out forwards;
  background-color: rgba(124, 92, 255, 0.1);
  border-left: 4px solid #7C5CFF;
}
</style>