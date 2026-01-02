<template>
  <aside class="sidebar-container">
    <div class="logo-area">
      <img src="@/assets/images/LogoTransparente.png" alt="CONNOS Park" class="logo" />
    </div>

    <nav class="menu">
      <ul>
        <li>
          <router-link to="/dashboard" exact-active-class="active-link">
            <span class="icon">▣</span> Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/operaciones" active-class="active-link">
            <span class="icon">📅</span> Operaciones
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/clientes" active-class="active-link">
            <span class="icon">👥</span> Clientes
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/reportes" active-class="active-link">
            <span class="icon">📄</span> Reportes
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/chats" active-class="active-link">
            <span class="icon">💬</span> Chats
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="spacer"></div>

    <div class="sidebar-footer">
      <button class="btn-registrar" @click="irARegistrarCliente">
        + Registrar cliente
      </button>

      <router-link to="/dashboard/opciones" class="opciones-link" active-class="active-link-opciones">
        <span class="icon">⚙️</span> Opciones
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { modalState } from '@/stores/modalState';
import { useRouter, useRoute } from 'vue-router'; // Importar router y route

const router = useRouter();
const route = useRoute();

const irARegistrarCliente = () => {
  // 1. Activar el flag del modal en el estado global
  modalState.showRegistrarCliente = true;

  // 2. Si no estamos en la vista de clientes, navegar hacia ella.
  if (route.name !== 'Clientes') {
    router.push('/dashboard/clientes');
  }
};
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ocupa toda la altura de la pantalla */
  padding: 20px;
  background-color: #fff;
  box-sizing: border-box;
}

.logo-area {
  margin-bottom: 40px;
  text-align: center;
}

.logo {
  max-width: 120px;
  height: auto;
}

/* Estilos del Menú */
.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  margin-bottom: 10px;
}

.menu a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #666; /* Gris oscuro */
  font-weight: 500;
  padding: 12px 15px;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.menu a:hover {
  background-color: #f5f5f5;
  color: #333;
}

/* Estilo cuando un link del menú está activo */
.active-link {
  background-color: #F3F0FF; /* Fondo morado claro */
  color: #7C5CFF !important; /* Texto morado */
  font-weight: 600;
}

.icon {
  margin-right: 12px;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

/* El espaciador empuja el footer hacia abajo */
.spacer {
  flex-grow: 1;
}

/* Área Inferior */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

/* Botón F: Registrar Cliente */
.btn-registrar {
  width: 100%;
  background-color: #7C5CFF;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-registrar:hover {
  background-color: #6a4be0;
}

/* Enlace G: Opciones */
.opciones-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #999; /* Gris más claro para opciones */
  font-weight: 500;
  padding: 10px 15px;
  border-radius: 8px;
  transition: color 0.3s;
}

.opciones-link:hover {
  color: #666;
  background-color: #f9f9f9;
}

.active-link-opciones {
  color: #333 !important;
  font-weight: bold;
}
</style>