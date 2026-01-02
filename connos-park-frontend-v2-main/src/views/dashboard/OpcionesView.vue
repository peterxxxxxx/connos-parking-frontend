<template>
  <div class="opciones-container">
    <div class="card">
      <h2>Opciones</h2>
      
      <div class="user-info">
        <h3 class="role">{{ userRoleName }}</h3>
        
        <h1 class="welcome-text">
          Bienvenido, {{ userDisplayName }}
        </h1>
        
        <div class="debug-info">
          <p class="small-text">Usuario: @{{ userData.username }}</p>
          <p class="small-text">Email: {{ userData.email }}</p>
        </div>
      </div>

      <div v-if="isAdmin" class="admin-actions">
        <button class="btn-admin" @click="showModalRegistro = true">
          Registrar Usuario
        </button>
        <button class="btn-admin outline" @click="showModalGestion = true">
          Administrar Usuarios
        </button>
      </div>

      <div class="action-area">
        <button @click="handleLogout" class="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </div>

    <RegistrarUsuarioModal 
      v-if="showModalRegistro" 
      @close="showModalRegistro = false" 
    />
    
    <AdministrarUsuariosModal 
      v-if="showModalGestion" 
      @close="showModalGestion = false" 
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import RegistrarUsuarioModal from './RegistrarUsuarioModal.vue';
import AdministrarUsuariosModal from './AdministrarUsuariosModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const showModalRegistro = ref(false);
const showModalGestion = ref(false);

// Accedemos al usuario de forma reactiva
const userData = computed(() => authStore.user || {});
const isAdmin = computed(() => authStore.isAdmin);

// Lógica para mostrar nombre (Prioridad: Nombre > Username > 'Usuario')
const userDisplayName = computed(() => {
  return userData.value.first_name || userData.value.username || 'Usuario';
});

// Lógica para mostrar rol
const userRoleName = computed(() => {
  return userData.value.rol_nombre || 'Sin Rol';
});

const handleLogout = () => {
  if(confirm("¿Estás seguro de cerrar sesión?")) {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.opciones-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.card {
  background: white;
  width: 100%;
  max-width: 800px;
  min-height: 70vh;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 20px;
}

h2 {
  font-size: 1.8rem;
  color: #000;
  margin: 0;
  font-weight: 500;
}

.user-info {
  text-align: center;
  margin-top: 20px;
}

.role {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.welcome-text {
  font-size: 2.2rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
}

.small-text {
  color: #888;
  font-size: 1rem;
  margin: 2px 0;
}

/* Botones Admin */
.admin-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-admin {
  background-color: #7C5CFF;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.btn-admin:hover { background-color: #6a4be0; }

.btn-admin.outline {
  background-color: white;
  border: 2px solid #7C5CFF;
  color: #7C5CFF;
}
.btn-admin.outline:hover { background-color: #F3F0FF; }

/* Logout */
.action-area {
  display: flex;
  justify-content: center;
  margin-top: auto; 
}

.btn-logout {
  background-color: #FFEBEE;
  color: #D32F2F;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 500;
  min-width: 200px;
}

.btn-logout:hover {
  background-color: #FFCDD2;
}
</style>