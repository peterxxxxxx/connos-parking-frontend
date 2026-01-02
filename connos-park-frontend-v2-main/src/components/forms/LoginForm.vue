<template>
  <div class="login-bg">
    <div class="login-container">
      <img src="@/assets/images/logoTransparenteBlancoRedi.png" alt="Logo" class="logo" />
      <h2>CONNOS PARK</h2>
      <h1>INICIAR SESIÓN</h1>
      
      <form @submit.prevent="handleLogin" class="form">
        <div class="input-box">
          <input type="text" v-model="username" placeholder="Usuario" required />
        </div>
        <div class="input-box">
          <input type="password" v-model="password" placeholder="Contraseña" required />
        </div>
        
        <div v-if="authStore.error" class="error-message">{{ authStore.error }}</div>
        
        <button type="submit" class="btn-primary" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Entrando...' : 'Iniciar Sesión' }}
        </button>
        
        <router-link :to="{ name: 'PasswordReset' }" class="btn-secondary link-button">
          ¿Olvidaste tu contraseña?
        </router-link>
      </form>
      
      <p class="terms">By registering you with our <a href="#">Terms and Conditions</a></p>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const username = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  // Usamos la acción del store en lugar de axios directo
  const success = await authStore.login(username.value, password.value)
  
  if (success) {
    // Si el login fue exitoso, el store ya tiene los datos del usuario
    router.push('/dashboard')//Se redirige al dashboard principal
  }
}

</script>

<style scoped>
.login-bg {
  background-image: url('@/assets/images/fondoLogin_OlvCont.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: rgba(34, 18, 56, 0.75);
  border-radius: 24px;
  padding: 40px 32px;
  width: 420px;
  max-width: 92vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 112px;
  margin-bottom: 14px;
}

h1 {
  color: #fff;
  font-size: 2.2rem;
  margin-bottom: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  /* Corrige separación con el logo y subtítulo */
}
.error-message{
  color: #ff4d4d;
  font-size: 1rem;
  margin-bottom: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}

h2 {
  color: #fff;
  margin-bottom: -14px;
  font-size: 1.2rem;
  font-weight: normal;
}

.input-box input {
  width: 90%;
  padding: 12px 18px;
  background: #2d174b;
  color: #fff;
  border: none;
  border-radius: 7px;
  margin-bottom: 18px;
  font-size: 1rem;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 7px;
  font-size: 1.12rem;
  margin-bottom: 10px;
  margin-top: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(90deg, #8754e7 0%, #599ee9 100%);
  color: #fff;
}

.btn-secondary {
  background: linear-gradient(90deg, #9659c3 0%, #699bc4 100%);
  color: #fff;
}

.terms {
  margin-top: 24px;
  color: #d4d0fa;
  font-size: 0.85rem;
}
.terms a {
  color: #aa95e8;
  text-decoration: underline;
}

@media (max-width: 520px) {
  .login-container {
    width: 95vw;
    padding: 28px 12px;
  }
  h1 {
    font-size: 1.3rem;
  }
  .logo {
    width: 75px;
  }
}

.link-button {
  display: block;            /* Se comporta como una caja, no como texto */
  width: 100%;               /* Ocupa todo el ancho */
  box-sizing: border-box;    /* El padding no deforma el tamaño */
  text-decoration: none;     /* QUITA EL SUBRAYADO FEO */
  text-align: center;        /* Centra el texto */
  margin-top: 10px;          /* Separación con el botón de arriba */
  color: #fff !important;    /* Fuerza el color blanco del texto */
  
  /* Aseguramos que herede las propiedades del botón si alguna falló */
  padding: 14px 0;
  border-radius: 7px;
  font-size: 1.12rem;
  font-weight: bold;
}

/* Efecto al pasar el mouse */
.link-button:hover {
  filter: brightness(1.1); 
}

</style>