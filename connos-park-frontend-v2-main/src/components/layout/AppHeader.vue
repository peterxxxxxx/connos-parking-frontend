<template>
  <header class="app-header">
    
    <div class="search-container" ref="searchContainer">
      <div class="input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar Cliente..." 
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showResults = true"
          class="search-input"
        />
        <button v-if="searchQuery" @click="limpiarBusqueda" class="clear-btn">×</button>
      </div>

      <div v-if="showResults && searchResults.length > 0" class="search-results">
        <ul>
          <li 
            v-for="cliente in searchResults" 
            :key="cliente.id" 
            @click="irACliente(cliente)"
          >
            <div class="result-item">
              <span class="result-name">{{ cliente.nombre }}</span>
              <span class="result-info">{{ cliente.correo }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else-if="showResults && searchQuery && searchResults.length === 0 && !loading" class="search-results">
        <div class="no-results">No se encontraron clientes.</div>
      </div>
    </div>
    
    <div class="user-profile">
      <span>
        Bienvenido, 
        <strong>{{ userDisplayName }}</strong>
      </span>
      <div class="user-avatar">
        {{ userInitials }}
      </div>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import clientService from '@/services/clientService';

const router = useRouter();
const authStore = useAuthStore();

// --- LÓGICA USUARIO (I) ---
const userDisplayName = computed(() => {
  const u = authStore.user;
  if (!u) return 'Usuario';
  // Si tiene nombre y apellido, úsalos. Si no, usa el username.
  if (u.first_name) return `${u.first_name} ${u.last_name || ''}`;
  return u.username;
});

const userInitials = computed(() => {
  const name = userDisplayName.value;
  return name.charAt(0).toUpperCase();
});

// --- LÓGICA BUSCADOR (H) ---
const searchQuery = ref('');
const searchResults = ref([]);
const showResults = ref(false);
const loading = ref(false);
const searchContainer = ref(null);
let debounceTimeout = null;

const handleSearch = () => {
  loading.value = true;
  showResults.value = true;
  
  // Debounce: Esperar 300ms a que el usuario termine de escribir para no saturar la API
  clearTimeout(debounceTimeout);
  
  if (searchQuery.value.trim() === '') {
    searchResults.value = [];
    loading.value = false;
    return;
  }

  debounceTimeout = setTimeout(async () => {
    try {
      // Llamamos al servicio con el parámetro 'search' que configuramos en Django
      const response = await clientService.getClients({ search: searchQuery.value });
      searchResults.value = response.results || response;
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      loading.value = false;
    }
  }, 300);
};

const irACliente = (cliente) => {
  showResults.value = false;
  searchQuery.value = ''; // Limpiar input
  
  // Navegar a ClientesView pasando un query param para identificar a quién resaltar
  router.push({ 
    name: 'Clientes', 
    query: { highlight: cliente.id } 
  });
};

const limpiarBusqueda = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
};

// Cerrar resultados si hago click fuera del buscador
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    showResults.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: white; /* Un fondo blanco se ve mejor en encabezados */
  box-shadow: 0 2px 10px rgba(0,0,0,0.03); /* Sombra sutil */
  position: relative;
  z-index: 100;
}

/* ESTILOS BUSCADOR */
.search-container {
  position: relative;
  width: 400px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #F5F6FA;
  border-radius: 12px;
  padding: 8px 15px;
  border: 1px solid transparent;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #7C5CFF;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.1);
}

.search-icon { margin-right: 10px; color: #999; }

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  color: #333;
}

.clear-btn {
  background: none; border: none; font-size: 1.2rem; color: #999; cursor: pointer;
}
.clear-btn:hover { color: #333; }

/* DROPDOWN RESULTADOS */
.search-results {
  position: absolute;
  top: 110%; /* Justo debajo del input */
  left: 0;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  padding: 10px 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 200;
}

.search-results ul { list-style: none; padding: 0; margin: 0; }

.search-results li {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}
.search-results li:hover { background-color: #F3F0FF; }
.search-results li:last-child { border-bottom: none; }

.result-item { display: flex; flex-direction: column; }
.result-name { font-weight: 600; color: #333; font-size: 0.95rem; }
.result-info { font-size: 0.8rem; color: #888; }
.no-results { padding: 15px; text-align: center; color: #999; font-style: italic; }

/* ESTILO USUARIO */
.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1rem;
  color: #444;
}

.user-avatar {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #7C5CFF 0%, #599ee9 100%);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>