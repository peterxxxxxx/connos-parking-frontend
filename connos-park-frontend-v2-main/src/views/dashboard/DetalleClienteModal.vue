<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Detalles y Acciones</h2>
      </div>

      <div class="modal-content-grid">
        
        <div class="card-section">
          <div class="section-header">
            <h4>Información del Cliente</h4>
            <button v-if="canEdit && !isEditingCliente" class="btn-icon-edit" @click="startEditCliente">✏️</button>
          </div>
          <div class="client-layout">
            <div class="avatar-placeholder">👤</div>
            <div v-if="!isEditingCliente" class="text-details">
              <p><strong>Nombre:</strong> {{ cliente.nombre }}</p>
              <p><strong>Teléfono:</strong> {{ cliente.telefono }}</p>
              <p class="small"><strong>Dirección:</strong> {{ cliente.direccion }}</p>
              <p class="small"><strong>Correo:</strong> {{ cliente.correo }}</p>
              <div class="cochera-badge" v-if="cajonActual"><strong>Cochera:</strong> {{ cajonActual.numero }}</div>
              <div v-else class="cochera-badge empty">Sin cochera asignada</div>
            </div>
            <div v-else class="edit-form">
              <input v-model="formCliente.nombre" class="input-mini" placeholder="Nombre" />
              <input v-model="formCliente.telefono" class="input-mini" placeholder="Teléfono" />
              <input v-model="formCliente.direccion" class="input-mini" placeholder="Dirección" />
              <input v-model="formCliente.correo" class="input-mini" placeholder="Correo" />
              <div class="actions-mini">
                <button class="btn-save-mini" @click="guardarCliente">Guardar</button>
                <button class="btn-cancel-mini" @click="isEditingCliente = false">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="section-header">
            <h4>Información del Vehículo</h4>
            <button v-if="canEdit && vehiculo && !isEditingVehiculo" class="btn-icon-edit" @click="startEditVehiculo">✏️</button>
          </div>

          <div v-if="vehiculo" class="vehicle-layout">
            <div class="car-avatar">🚗</div>
            
            <div v-if="!isEditingVehiculo" class="vehicle-details-grid">
              <div class="detail-item"><span class="label">Placa:</span> <span class="value">{{ vehiculo.placa }}</span></div>
              <div class="detail-item"><span class="label">Marca:</span> <span class="value">{{ vehiculo.marca }}</span></div>
              <div class="detail-item"><span class="label">Modelo:</span> <span class="value">{{ vehiculo.modelo }}</span></div>
              <div class="detail-item"><span class="label">Año:</span> <span class="value">{{ vehiculo.año }}</span></div>
              <div class="detail-item"><span class="label">Color:</span> <span class="value">{{ vehiculo.color }}</span></div>
            </div>

            <div v-else class="edit-form full-width">
              <div class="grid-2">
                <input v-model="formVehiculo.placa" class="input-mini" placeholder="Placa" />
                <input v-model="formVehiculo.marca" class="input-mini" placeholder="Marca" />
                <input v-model="formVehiculo.modelo" class="input-mini" placeholder="Modelo" />
                <input v-model="formVehiculo.año" class="input-mini" type="number" placeholder="Año" />
                <input v-model="formVehiculo.color" class="input-mini span-2" placeholder="Color" />
              </div>
              <div class="actions-mini">
                <button class="btn-save-mini" @click="guardarVehiculo">Actualizar</button>
                <button class="btn-cancel-mini" @click="isEditingVehiculo = false">Cancelar</button>
              </div>
            </div>
          </div>

          <div v-else class="no-data-section">
            <p>No hay vehículo registrado</p>
            <button v-if="canEdit && !isCreatingVehiculo" class="btn-registrar-mini" @click="isCreatingVehiculo = true">
              + Registrar Vehículo
            </button>

            <div v-if="isCreatingVehiculo" class="edit-form full-width slide-down">
              <h5 class="mini-title">Nuevo Vehículo</h5>
              <div class="grid-2">
                <input v-model="formVehiculo.placa" class="input-mini" placeholder="Placa" />
                <input v-model="formVehiculo.marca" class="input-mini" placeholder="Marca" />
                <input v-model="formVehiculo.modelo" class="input-mini" placeholder="Modelo" />
                <input v-model="formVehiculo.año" class="input-mini" type="number" placeholder="Año" />
                <input v-model="formVehiculo.color" class="input-mini span-2" placeholder="Color" />
              </div>
              <div class="actions-mini">
                <button class="btn-save-mini" @click="crearNuevoVehiculo">Registrar</button>
                <button class="btn-cancel-mini" @click="isCreatingVehiculo = false">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section contract-section">
          <div class="section-header">
            <h4>Contrato</h4>
          </div>
          
          <div v-if="isEditingContrato || isCreatingContrato" class="edit-mode">
            <h5 v-if="isCreatingContrato" class="mini-title">Reactivar / Asignar Contrato</h5>
            <div class="form-group">
              <label>Cajón Asignado:</label>
              <select v-model="editForm.cajon" class="input-mini">
                <option value="" disabled>Seleccionar...</option>
                <option v-if="cajonActual" :value="cajonActual.id">{{ cajonActual.numero }} (Actual)</option>
                <option v-for="c in cajonesFuncionalesParaEdit" :key="c.id" :value="c.id" :disabled="c.ocupado">{{ c.numero }} - {{ c.ocupado ? '🔴 Ocupado' : '🟢 Libre' }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Monto Mensual:</label>
              <input type="number" v-model="editForm.monto_mensual" class="input-mini">
            </div>
            <div class="actions-mini">
              <button class="btn-save-mini" @click="guardarContratoLogica">
                {{ isCreatingContrato ? 'Reactivar Contrato' : 'Guardar Cambios' }}
              </button>
              <button class="btn-cancel-mini" @click="cancelarEdicionContrato">Cancelar</button>
            </div>
          </div>

          <div v-else-if="contrato" class="contract-grid">
            <div class="contract-left">
              <div class="header-row">
                <p class="label">Fecha Inicio</p>
                <button v-if="canEdit" class="btn-icon-edit" @click="iniciarEdicionContrato" title="Editar contrato">✏️</button>
              </div>
              
              <div class="date-box">{{ formatDate(contrato.fecha_inicio) }}</div>
              
              <div class="monto-box">
                <small>Monto:</small> ${{ contrato.monto_mensual }}
              </div>

              <div class="toggle-row">
                <div class="toggle" :class="{ active: contrato.activo, disabled: !canEdit }"></div>
                <span class="small-label">{{ contrato.activo ? 'Activo' : 'Inactivo' }}</span>
              </div>

              <button class="btn-pago" @click="$emit('pago', contrato.id, contrato.monto_mensual)">
                💳 Realizar Pago
              </button>
            </div>

            <div class="contract-right">
              <p class="label text-center">Documentos</p>
              <div class="upload-area">
                <input v-if="canEdit" type="file" ref="fileInputContrato" @change="e => subirArchivo(e, 'CONTRATO')" accept="image/*" hidden>
                <button class="btn-icon-upload" @click="canEdit ? $refs.fileInputContrato.click() : null" :class="{ 'disabled': !canEdit }">
                  {{ docContrato ? '🔄' : '📄 +' }}
                </button>
              </div>
              <button v-if="docContrato" class="btn-purple-small" @click="verImagen(docContrato.archivo)">Ver Contrato</button>
            </div>
          </div>
          
          <div v-else class="no-data-section">
            <p>Sin contrato activo</p>
            <button v-if="canEdit" class="btn-registrar-mini" @click="iniciarReactivacionContrato">
              📋 Asignar / Reactivar Contrato
            </button>
          </div>
        </div>

        <div class="card-section photo-section">
          <h4>Fotografía del vehículo</h4>
          <div class="photo-layout">
            <input v-if="canEdit" type="file" ref="fileInputVehiculo" @change="e => subirArchivo(e, 'VEHICULO')" accept="image/*" hidden>
            <button class="btn-icon-upload big" @click="canEdit ? $refs.fileInputVehiculo.click() : null" :class="{ 'disabled': !canEdit }">
              {{ docVehiculo ? '🔄' : '📸 +' }}
            </button>
            <button v-if="docVehiculo" class="btn-purple-small" @click="verImagen(docVehiculo.archivo)">Ver Vehículo</button>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-save" @click="$emit('close')">Cerrar</button>
      </div>
    </div>

    <div v-if="imagenSeleccionada" class="lightbox" @click="imagenSeleccionada = null">
      <img :src="imagenSeleccionada" alt="Documento" />
      <button class="close-lightbox">✖</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import contratoService from '@/services/contratoService';
import operacionesService from '@/services/operacionesService';
import vehiculoService from '@/services/vehiculoService';
import clientService from '@/services/clientService';
import documentoService from '@/services/documentoService';
import api from '@/services/api';

const props = defineProps(['cliente']);
const emit = defineEmits(['close', 'pago']);
const authStore = useAuthStore();

const canEdit = computed(() => authStore.isAdmin || authStore.isAccountant);

const loading = ref(true);
const contrato = ref(null);
const cajonActual = ref(null);
const vehiculo = ref(null);
const docContrato = ref(null);
const docVehiculo = ref(null);
const imagenSeleccionada = ref(null);
const cajonesList = ref([]);

// --- CLIENTE ---
const isEditingCliente = ref(false);
const formCliente = reactive({ nombre: '', telefono: '', direccion: '', correo: '' });

const startEditCliente = () => {
  Object.assign(formCliente, { ...props.cliente });
  isEditingCliente.value = true;
};
const guardarCliente = async () => {
  try {
    await clientService.updateClient(props.cliente.id, formCliente);
    Object.assign(props.cliente, formCliente); 
    isEditingCliente.value = false;
    alert("Cliente actualizado");
  } catch (error) { alert("Error al actualizar cliente"); }
};

// --- VEHÍCULO (Edición y Creación) ---
const isEditingVehiculo = ref(false);
const isCreatingVehiculo = ref(false); // Estado para crear
const formVehiculo = reactive({ placa: '', marca: '', modelo: '', año: '', color: '' });

const startEditVehiculo = () => {
  Object.assign(formVehiculo, { ...vehiculo.value });
  isEditingVehiculo.value = true;
};

const limpiarFormVehiculo = () => {
  Object.assign(formVehiculo, { placa: '', marca: '', modelo: '', año: '', color: '' });
};

const guardarVehiculo = async () => {
  try {
    const updated = await vehiculoService.updateVehiculo(vehiculo.value.id, formVehiculo);
    vehiculo.value = updated;
    isEditingVehiculo.value = false;
    alert("Vehículo actualizado");
  } catch (error) { alert("Error al actualizar vehículo"); }
};

const crearNuevoVehiculo = async () => {
  try {
    const nuevo = await vehiculoService.createVehiculo({
      cliente: props.cliente.id,
      ...formVehiculo
    });
    vehiculo.value = nuevo;
    isCreatingVehiculo.value = false;
    limpiarFormVehiculo();
    alert("Vehículo registrado correctamente");
  } catch (error) { alert("Error al registrar vehículo"); }
};

// --- CONTRATO (Edición y Reactivación) ---
const isEditingContrato = ref(false);
const isCreatingContrato = ref(false); // Estado para reactivar/crear
const editForm = reactive({ cajon: '', monto_mensual: '' });

const cajonesFuncionalesParaEdit = computed(() => {
  return cajonesList.value.filter(c => 
    c.estado === 'FUNCIONAL' && c.id !== cajonActual.value?.id
  );
});

const iniciarEdicionContrato = () => {
  if (contrato.value) {
    editForm.cajon = contrato.value.cajon; 
    editForm.monto_mensual = contrato.value.monto_mensual;
    isEditingContrato.value = true;
  }
};

const iniciarReactivacionContrato = () => {
  // Inicializar formulario vacío o con defecto
  editForm.cajon = '';
  editForm.monto_mensual = 450; // Monto base por defecto
  isCreatingContrato.value = true;
};

const cancelarEdicionContrato = () => {
  isEditingContrato.value = false;
  isCreatingContrato.value = false;
};

const guardarContratoLogica = async () => {
  if (isCreatingContrato.value) {
    // CREAR / REACTIVAR
    try {
      await contratoService.createContrato({
        cliente: props.cliente.id,
        cajon: editForm.cajon,
        monto_mensual: editForm.monto_mensual,
        fecha_inicio: new Date().toISOString().split('T')[0], // FECHA ACTUAL
        activo: true
      });
      alert('Contrato asignado/reactivado');
      isCreatingContrato.value = false;
      await cargarDatos();
    } catch (error) { alert("Error al crear contrato"); }
  } else {
    // EDITAR EXISTENTE
    try {
      await api.patch(`/contratos/${contrato.value.id}/`, {
        cajon: editForm.cajon,
        monto_mensual: editForm.monto_mensual
      });
      alert('Contrato actualizado');
      isEditingContrato.value = false;
      await cargarDatos(); 
    } catch (error) { alert('Error al actualizar contrato.'); }
  }
};

// --- CARGA DE DATOS (Igual) ---
const cargarDatos = async () => {
  /* ... tu lógica existente de carga ... */
  try {
    loading.value = true;
    const [resContratos, resCajones, resVehiculos, resDocs] = await Promise.all([
      contratoService.getContratos(),
      operacionesService.getCajones(),
      vehiculoService.getVehiculos(),
      documentoService.getDocumentos()
    ]);

    const listaContratos = resContratos.results || resContratos;
    cajonesList.value = resCajones.results || resCajones;
    const listaVehiculos = resVehiculos.results || resVehiculos;
    const listaDocs = resDocs.results || resDocs;

    const contratoEncontrado = listaContratos.find(c => c.cliente === props.cliente.id && c.activo === true);
    if (contratoEncontrado) {
      contrato.value = contratoEncontrado;
      cajonActual.value = cajonesList.value.find(c => c.id === contratoEncontrado.cajon);
    } else {
      contrato.value = null; // Asegurar reset
      cajonActual.value = null;
    }

    vehiculo.value = listaVehiculos.find(v => v.cliente === props.cliente.id);

    const misDocs = listaDocs.filter(d => d.cliente === props.cliente.id);
    misDocs.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
    
    docContrato.value = misDocs.find(d => d.tipo === 'CONTRATO');
    docVehiculo.value = misDocs.find(d => d.tipo === 'VEHICULO');

  } catch (error) {
    console.error("Error cargando datos:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { cargarDatos(); });

const subirArchivo = async (event, tipo) => { /* ... Lógica existente ... */ 
  const file = event.target.files[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append('cliente', props.cliente.id);
    formData.append('tipo', tipo);
    formData.append('archivo', file);
    const nuevoDoc = await documentoService.uploadDocumento(formData);
    if (tipo === 'CONTRATO') docContrato.value = nuevoDoc;
    if (tipo === 'VEHICULO') docVehiculo.value = nuevoDoc;
    alert(docContrato.value ? 'Documento actualizado' : 'Documento subido');
  } catch (error) {
    console.error(error);
    alert('Error al subir imagen');
  }
};
const verImagen = (url) => imagenSeleccionada.value = url;
const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES');
};
</script>

<style scoped>
/* ESTILOS EXISTENTES + NUEVOS */
/* ... (Copia todos tus estilos anteriores) ... */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: #F5F6FA; width: 900px; max-width: 98%; border-radius: 20px; padding: 20px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto; } /* Agregado overflow */
.modal-header h2 { text-align: center; color: #444; font-family: serif; margin-bottom: 25px; font-weight: 500; font-size: 2rem; }
.modal-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.card-section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-header h4 { margin: 0; font-size: 1rem; color: #333; }
.btn-icon-edit { background: none; border: none; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s; }
.btn-icon-edit:hover { transform: scale(1.2); }
.client-layout, .vehicle-layout { display: flex; gap: 15px; }
.avatar-placeholder { width: 60px; height: 60px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #555; }
.car-avatar { width: 80px; height: 50px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
.text-details p { margin: 2px 0; font-size: 0.9rem; color: #333; }
.vehicle-details-grid { width: 100%; }
.detail-item { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; display: flex; justify-content: space-between; margin-bottom: 5px; }
.edit-form { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.span-2 { grid-column: span 2; }
.input-mini { padding: 6px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; background: #F9F9F9; width: 100%; box-sizing: border-box; }
.actions-mini { display: flex; gap: 10px; justify-content: flex-end; margin-top: 5px; }
.btn-save-mini { background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.btn-cancel-mini { background: #ccc; color: #333; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.cochera-badge { margin-top: 10px; background: #eee; padding: 5px 10px; border-radius: 5px; font-size: 0.9rem; display: inline-block; font-weight: bold; color: #333; }
.contract-grid { display: flex; justify-content: space-between; }
.header-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.date-box { background: #fff; border: 1px solid #ccc; padding: 8px 15px; border-radius: 6px; font-weight: bold; color: #333; margin: 5px 0; display: inline-block; }
.monto-box { margin: 5px 0 10px 0; font-size: 0.95rem; color: #555; }
.toggle { width: 40px; height: 20px; background: #ccc; border-radius: 20px; position: relative; }
.toggle.active { background: #7C5CFF; }
.toggle.disabled { opacity: 0.5; }
.toggle::after { content:''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle.active::after { left: 22px; }
.btn-pago { background-color: #7C5CFF; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; font-size: 0.9rem; }
.btn-icon-upload { border: 2px dashed #bbb; background: #fafafa; border-radius: 10px; width: 50px; height: 50px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: 0.2s; }
.btn-icon-upload.disabled { opacity: 0.5; cursor: not-allowed; }
.btn-purple-small { background: #8B5CF6; color: white; border: none; padding: 6px 15px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; width: 100%; margin-top: 5px; }
.modal-footer { display: flex; justify-content: center; gap: 20px; margin-top: 10px; }
.btn-save { background: #22c55e; color: white; border: none; padding: 10px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.lightbox { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 3000; display: flex; justify-content: center; align-items: center; }
.lightbox img { max-width: 90%; max-height: 90%; border-radius: 5px; }
.close-lightbox { position: absolute; top: 20px; right: 30px; background: none; border: none; color: white; font-size: 3rem; cursor: pointer; }
/* NUEVOS ESTILOS PARA ESTADOS VACÍOS */
.no-data-section { text-align: center; color: #999; margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.btn-registrar-mini { background: #7C5CFF; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; margin-top: 5px; }
.mini-title { margin: 0 0 10px 0; color: #333; font-weight: bold; font-size: 0.95rem; }
.slide-down { animation: slideDown 0.3s ease-out; margin-top: 10px; border-top: 1px dashed #eee; padding-top: 10px; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.edit-mode { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; background: #fafafa; padding: 10px; border-radius: 8px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
</style>