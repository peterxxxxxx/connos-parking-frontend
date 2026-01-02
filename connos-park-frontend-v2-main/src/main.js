import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importar createPinia
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 2. Usar Pinia en la app
app.use(createPinia()) 
app.use(router)

app.mount('#app')
