<template>
  <div class="login-bg">
    <div class="login-container">
      <img src="@/assets/images/logoTransparenteBlancoRedi.png" alt="Logo" class="logo" />
      <h2>CONNOS Park</h2>
      <h1>Recuperar Contraseña</h1>
      
      <div class="info-text">
        <p>Para restablecer tu contraseña, debes solicitarlo al administrador del sistema.</p>
        <p>Ingresa tu correo para generar la solicitud automática.</p>
      </div>

      <form @submit.prevent="handleMailTo" class="form">
        <div class="input-box">
          <input 
            type="email" 
            v-model="email" 
            placeholder="tucorreo@ejemplo.com" 
            required 
          />
        </div>
        
        <button type="submit" class="btn-primary">
          Redactar Correo a Soporte
        </button>
        
        <button type="button" class="btn-secondary" @click="toLogin">
          Regresar al Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const router = useRouter();

// Configura aquí el correo real del administrador (o uno genérico de la empresa)
const ADMIN_EMAIL = 'soporte@connospark.com'; 

const handleMailTo = () => {
  if (!email.value) return;

  const subject = encodeURIComponent("Solicitud de Restablecimiento de Contraseña - Connos Park");
  const body = encodeURIComponent(
    `Hola Administrador,\n\n` +
    `Soy el usuario con correo: ${email.value}\n` +
    `He olvidado mi contraseña y solicito que sea restablecida.\n\n` +
    `Gracias.`
  );

  // Esto abrirá la app de correo predeterminada del usuario o una pestaña de Gmail
  window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
};

const toLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
/* Estilos heredados del Login */
.login-bg {
  background-image: url('@/assets/images/fondoLogin_OlvCont.png');
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: rgba(34, 18, 56, 0.85); /* Un poco más oscuro para legibilidad */
  border-radius: 24px;
  padding: 40px 32px;
  width: 420px;
  max-width: 92vw;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.logo { width: 112px; margin-bottom: 14px; }
h1 { color: #fff; font-size: 1.8rem; margin-bottom: 15px; font-weight: bold; }
h2 { color: #ddd; margin-bottom: -10px; font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; }

.info-text {
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.input-box input {
  width: 90%;
  padding: 12px 15px;
  background: #2d174b;
  color: #fff;
  border: 1px solid #4a3b69;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1rem;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
  transition: transform 0.2s;
}

.btn-primary { background: linear-gradient(90deg, #7C5CFF 0%, #599ee9 100%); color: white; }
.btn-primary:hover { filter: brightness(1.1); }

.btn-secondary { background: transparent; color: #aaa; border: 1px solid #aaa; }
.btn-secondary:hover { color: white; border-color: white; }
</style>