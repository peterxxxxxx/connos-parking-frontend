<template>
  <div class="chats-container">
    <div class="header-section">
      <h2>Avisos Generales</h2>
    </div>

    <div class="chat-history" ref="historyContainer">
      
      <div v-for="(grupo, index) in historialAgrupado" :key="index" class="message-group">
        <div class="date-divider">
          <span>{{ grupo.fecha }}</span>
        </div>
        
        <div v-for="msg in grupo.mensajes" :key="msg.id" class="message-card">
          <div class="message-content">{{ msg.texto }}</div>
          <div class="message-time">{{ msg.hora }}</div>
        </div>
      </div>

      <div v-if="historialAgrupado.length === 0" class="no-messages">
        <p>No hay avisos recientes.</p>
        <small>Escribe el primer aviso abajo 👇</small>
      </div>

    </div>

    <div class="chat-input-area">
      <input 
        v-model="nuevoMensaje" 
        @keyup.enter="enviarMensaje"
        type="text" 
        placeholder="Escribe un aviso para los clientes..." 
        class="input-message" 
      />
      <button class="btn-send" @click="enviarMensaje">
        ➤
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import avisosService from '@/services/avisosService';

const nuevoMensaje = ref('');
const historyContainer = ref(null);
const historialAgrupado = ref([]); 

const cargarAvisos = async () => {
  try {
    const response = await avisosService.getAvisos();
    const data = response.results || response; 
    procesarAvisos(data);
    hacerScrollAbajo();
  } catch (error) {
    console.error("Error cargando avisos:", error);
  }
};

const procesarAvisos = (avisos) => {
  const grupos = {};
  
  // Procesamos la respuesta del backend
  avisos.forEach(aviso => {
    // Usamos los campos 'fecha_formato' y 'hora_formato' que definimos en el Serializer de Django
    const fechaKey = aviso.fecha_formato || 'Fecha desconocida'; 
    
    if (!grupos[fechaKey]) {
      grupos[fechaKey] = {
        fecha: fechaKey,
        mensajes: []
      };
    }
    
    grupos[fechaKey].mensajes.push({
      id: aviso.id,
      texto: aviso.mensaje,
      hora: aviso.hora_formato || '--:--'
    });
  });

  historialAgrupado.value = Object.values(grupos);
};

const enviarMensaje = async () => {
  if (nuevoMensaje.value.trim() === '') return;

  try {
    await avisosService.createAviso(nuevoMensaje.value);
    nuevoMensaje.value = '';
    await cargarAvisos(); // Recargar para ver el nuevo mensaje
  } catch (error) {
    console.error("Error enviando:", error);
    alert("No se pudo enviar. Verifica tu conexión o permisos.");
  }
};

const hacerScrollAbajo = () => {
  nextTick(() => {
    if (historyContainer.value) {
      historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  cargarAvisos();
});
</script>

<style scoped>
.chats-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px); /* Ajuste para que no se salga de la pantalla */
  background: #f0f2f5;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin: 20px;
}

.header-section {
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}
.header-section h2 { margin: 0; color: #7C5CFF; font-size: 1.5rem; }

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.date-divider {
  text-align: center;
  margin: 10px 0;
}
.date-divider span {
  background: #e1e4e8;
  color: #555;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.message-card {
  background: #fff;
  padding: 10px 15px;
  border-radius: 0 15px 15px 15px; /* Estilo burbuja de chat */
  align-self: flex-start;
  max-width: 70%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
}

.message-content {
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

.no-messages {
  text-align: center;
  margin-top: 50px;
  color: #888;
}

/* Área de input fija abajo */
.chat-input-area {
  background: #fff;
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
}

.input-message {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.3s;
}
.input-message:focus {
  border-color: #7C5CFF;
}

.btn-send {
  background: #7C5CFF;
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.btn-send:hover {
  transform: scale(1.1);
  background: #6a4be0;
}
</style>