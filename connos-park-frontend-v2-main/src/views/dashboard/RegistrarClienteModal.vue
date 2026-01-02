<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Registrar Cliente</h3>
      </div>
      
      <form @submit.prevent="handleRegistrar" class="modal-body form-grid">
        <div class="form-group full-width">
          <label>Nombre completo:</label>
          <input type="text" v-model="form.nombre" placeholder="Nombre Apellido" class="input-field" required />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <input type="tel" v-model="form.telefono" placeholder="5512345678" class="input-field" required maxlength="10" />
        </div>

        <div class="form-group full-width">
          <label>Dirección:</label>
          <input type="text" v-model="form.direccion" placeholder="Calle Ejemplo #123..." class="input-field" required />
        </div>

        <div class="form-group full-width">
          <label>Correo electrónico:</label>
          <input type="email" v-model="form.correo" placeholder="ejemplo@correo.com" class="input-field" required />
        </div>

        <div class="form-group">
          <label>Cajón asignado:</label>
          <select v-model="form.cajon_id" class="input-field" required>
            <option value="" disabled>Selecciona un cajón</option>
            <option v-for="cajon in cajonesFuncionales" :key="cajon.id" :value="cajon.id">
              Cajón {{ cajon.numero }} - ({{ cajon.estado }}-{{ cajon.ocupado ? '🔴 Ocupado' : '🟢 Libre' }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Fecha de inicio contrato:</label>
          <input type="date" v-model="form.fechaInicio" class="input-field" required />
        </div>

        <div class="form-group full-width">
          <label>Esquema de pago (Monto Mensual):</label>
          <select v-model="form.monto" class="input-field" required>
            <option :value="450">Mensual ($450.00)</option>
          </select>
        </div>

        <div class="modal-footer full-width">
          <button type="button" class="btn-cancelar" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-registrar-modal" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Registrar Cliente y Contrato' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import operacionesService from '@/services/operacionesService';
import clientService from '@/services/clientService';
import contratoService from '@/services/contratoService';
import { useClientStore } from '@/stores/clientStore'; // Para recargar la lista al final

const emit = defineEmits(['close', 'registrar']);
const clientStore = useClientStore();

const loading = ref(false);
const cajonesList = ref([]); // Aquí guardaremos los cajones de la API

// Formulario reactivo
const form = reactive({
  nombre: '',
  telefono: '',
  direccion: '',
  correo: '',
  cajon_id: '',
  fechaInicio: new Date().toISOString().split('T')[0], // Hoy por defecto
  monto: 450
});

// Cargar cajones al abrir el modal
onMounted(async () => {
  try {
    const response = await operacionesService.getCajones();
    // Ajusta según cómo responda tu API (si es paginado viene en .results, si no directo)
    cajonesList.value = response.results || response;
  } catch (error) {
    console.error("Error cargando cajones:", error);
  }
});

// Filtramos visualmente (opcional, si quieres mostrar solo los funcionales)
const cajonesFuncionales = computed(() => {
  return cajonesList.value.filter(c => c.estado === 'FUNCIONAL');
});


// --- LÓGICA PRINCIPAL DE GUARDADO ---
const handleRegistrar = async () => {
  // Validación básica
  if (!form.direccion.toLowerCase().startsWith('calle') || form.direccion.length < 10) {
    alert("La dirección debe iniciar con 'Calle' y ser válida.");
    return;
  }

  loading.value = true;

  try {
    // PASO 1: Crear Cliente
    const nuevoCliente = await clientService.createClient({
      nombre: form.nombre,
      telefono: form.telefono,
      direccion: form.direccion,
      correo: form.correo,
      activo: true
    });

    console.log("Cliente creado con ID:", nuevoCliente.id);

    // PASO 2: Crear Contrato usando el ID del cliente recién creado
    await contratoService.createContrato({
      cliente: nuevoCliente.id,      // ID que nos devolvió el paso 1
      cajon: form.cajon_id,          // ID del select
      fecha_inicio: form.fechaInicio,
      monto_mensual: form.monto,
      activo: true
    });

    alert("¡Éxito! Cliente y Contrato registrados correctamente.");
    
    // PASO 3: Actualizar la vista principal
    await clientStore.fetchClients();
    emit('close');

  } catch (error) {
    console.error(error);
    // Manejo de errores básico
    let msg = "Ocurrió un error.";
    if (error.response && error.response.data) {
      msg += " " + JSON.stringify(error.response.data);
    }
    alert(msg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* (Mantén tus estilos CSS existentes aquí) */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: white; border-radius: 15px; padding: 25px; width: 600px; max-width: 95%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header h3 { text-align: center; margin: 0 0 25px 0; color: #333; font-size: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.full-width { grid-column: span 2; }
.form-group label { display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #333; }
.input-field { width: 100%; padding: 12px; background-color: #F5F6FA; border: 1px solid #E0E0E0; border-radius: 8px; box-sizing: border-box; font-size: 1rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
.btn-cancelar { background: transparent; color: #666; border: 1px solid #ccc; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-registrar-modal { background: #7C5CFF; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-registrar-modal:disabled { background: #ccc; cursor: not-allowed; }
</style>