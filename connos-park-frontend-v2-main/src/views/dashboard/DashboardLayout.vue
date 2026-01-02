<template>
  <div class="dashboard-container">
    <AppSidebar class="sidebar" />

    <div class="main-content">
      <AppHeader />

      <div class="content-page">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'; // Ajusta la ruta si es necesario
import AppHeader from '@/components/layout/AppHeader.vue';   // Ajusta la ruta si es necesario
</script>

<style scoped>
.dashboard-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #F5F6FA; /* Color de fondo gris claro de tu diseño */
  overflow: hidden;
}

.sidebar {
  width: 250px; /* Ancho fijo del menú */
  flex-shrink: 0;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-page {
  padding: 20px;
  overflow-y: auto; /* Para que puedas hacer scroll si el contenido es largo */
  height: 100%;
}
</style>