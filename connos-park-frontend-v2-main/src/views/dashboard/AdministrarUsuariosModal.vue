<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card wide">
      <div class="modal-header">
        <h3>Administrar Personal</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <table class="user-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id">
              <td class="username-cell">@{{ u.username }}</td>
              <td>{{ u.first_name }} {{ u.last_name }}</td>
              <td>
                <span :class="['role-badge', getRolClass(u.rol?.nombre)]">
                  {{ u.rol?.nombre || 'Sin Rol' }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-icon edit" @click="editar(u)" title="Editar">✏️</button>
                <button class="btn-icon delete" @click="eliminar(u)" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="editUser" class="edit-overlay">
        <div class="edit-card expanded">
          <h4>Editar a {{ editUser.username }}</h4>
          
          <div class="edit-form-grid">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="editForm.first_name" class="input-field" />
            </div>
            
            <div class="form-group">
              <label>Apellido:</label>
              <input v-model="editForm.last_name" class="input-field" />
            </div>

            <div class="form-group">
              <label>Email:</label>
              <input v-model="editForm.email" class="input-field" type="email" />
            </div>

            <div class="form-group">
              <label>Teléfono:</label>
              <input v-model="editForm.telefono" class="input-field" />
            </div>

            <div class="form-group full-width">
              <label>Rol:</label>
              <select v-model="editForm.rol" class="input-field">
                <option v-for="r in roles" :key="r.id" :value="r.id">
                  {{ r.nombre }}
                </option>
              </select>
            </div>

            <div class="password-reset-section full-width">
              <div class="toggle-password" @click="showPasswordReset = !showPasswordReset">
                <span class="icon">{{ showPasswordReset ? '🔓' : '🔒' }}</span>
                <span>Restablecer Contraseña del usuario</span>
              </div>
              
              <div v-if="showPasswordReset" class="password-input-area">
                <input 
                  v-model="editForm.newPassword" 
                  type="text" 
                  class="input-field warning-border" 
                  placeholder="Escribe la nueva contraseña aquí..." 
                />
                <small class="warning-text">⚠️ Al guardar, esta será la nueva contraseña del usuario.</small>
              </div>
            </div>
          </div>

          <div class="edit-actions">
            <button class="btn-cancel" @click="cerrarEdicion">Cancelar</button>
            <button class="btn-save" @click="guardarCambios">Guardar Cambios</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import usuarioService from '@/services/usuarioService';

const emit = defineEmits(['close']);
const usuarios = ref([]);
const roles = ref([]);
const editUser = ref(null);
const showPasswordReset = ref(false); // Controla si se muestra el input de password

const editForm = reactive({ 
  first_name: '', 
  last_name: '', 
  email: '', 
  telefono: '', 
  rol: '',
  newPassword: '' // Campo especial para el cambio de pass
});

// Cargar datos
const cargarDatos = async () => {
  try {
    const [resUsers, resRoles] = await Promise.all([
      usuarioService.getUsuarios(),
      usuarioService.getRoles()
    ]);
    usuarios.value = resUsers.results || resUsers;
    roles.value = resRoles.results || resRoles;
  } catch (error) { console.error(error); }
};

onMounted(cargarDatos);

const getRolClass = (nombre) => {
  if (nombre === 'Administrador') return 'role-admin';
  if (nombre === 'Contador') return 'role-contador';
  return 'role-encargado';
};

const eliminar = async (usuario) => {
  if (confirm(`¿Eliminar a ${usuario.username}?`)) {
    try {
      await usuarioService.deleteUsuario(usuario.id);
      await cargarDatos();
    } catch (e) { alert("Error al eliminar"); }
  }
};

const editar = (usuario) => {
  editUser.value = usuario;
  // Llenar formulario con datos existentes
  editForm.first_name = usuario.first_name;
  editForm.last_name = usuario.last_name;
  editForm.email = usuario.email;
  editForm.telefono = usuario.telefono;
  editForm.rol = usuario.rol?.id || '';
  
  // Limpiar zona de contraseña
  editForm.newPassword = '';
  showPasswordReset.value = false;
};

const cerrarEdicion = () => {
  editUser.value = null;
  editForm.newPassword = '';
};

const guardarCambios = async () => {
  try {
    // Preparamos el objeto a enviar
    const payload = {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      email: editForm.email,
      telefono: editForm.telefono,
      rol_id: editForm.rol 
    };

    // Solo si el admin escribió una contraseña, la agregamos al payload
    if (showPasswordReset.value && editForm.newPassword.trim() !== '') {
      payload.password = editForm.newPassword;
    }

    await usuarioService.updateUsuario(editUser.value.id, payload);
    alert("Usuario actualizado correctamente");
    cerrarEdicion();
    await cargarDatos();
  } catch (e) {
    console.error(e);
    alert("Error al actualizar. Revisa los datos.");
  }
};
</script>

<style scoped>
/* Estilos base (heredados de tu versión anterior, ajustados) */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 3000; backdrop-filter: blur(2px); }
.modal-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 15px 50px rgba(0,0,0,0.3); display: flex; flex-direction: column; max-height: 90vh; position: relative; animation: fadeIn 0.3s ease-out; }
.modal-card.wide { width: 900px; max-width: 95%; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #999; }
.modal-body { overflow-y: auto; }
.user-table { width: 100%; border-collapse: collapse; }
.user-table th { text-align: left; padding: 12px; color: #666; border-bottom: 2px solid #f0f0f0; }
.user-table td { padding: 12px; border-bottom: 1px solid #f9f9f9; vertical-align: middle; }
.role-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.role-admin { background-color: #F3E5F5; color: #7B1FA2; }
.role-contador { background-color: #E3F2FD; color: #1976D2; }
.role-encargado { background-color: #E8F5E9; color: #388E3C; }
.btn-icon { border: none; background: none; cursor: pointer; font-size: 1.1rem; margin-right: 8px; }

/* --- EDIT CARD EXPANDIDA --- */
.edit-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; justify-content: center; align-items: center; border-radius: 16px; z-index: 10; }
.edit-card { width: 500px; padding: 30px; background: white; border: 1px solid #eee; box-shadow: 0 10px 40px rgba(0,0,0,0.15); border-radius: 12px; max-height: 95%; overflow-y: auto; }

.edit-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
.full-width { grid-column: span 2; }
.form-group label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; }
.input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }

/* SECCIÓN CONTRASEÑA */
.password-reset-section { margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 15px; }
.toggle-password { cursor: pointer; display: flex; align-items: center; gap: 8px; color: #7C5CFF; font-weight: bold; user-select: none; }
.toggle-password:hover { color: #6a4be0; }
.password-input-area { margin-top: 10px; animation: slideDown 0.3s ease; }
.warning-border { border-color: #FFB74D; background-color: #FFF8E1; }
.warning-text { display: block; margin-top: 5px; color: #F57C00; font-size: 0.8rem; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.edit-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-save { background: #7C5CFF; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-cancel { background: #eee; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>