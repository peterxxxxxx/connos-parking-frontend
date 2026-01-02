import { createRouter, createWebHistory } from 'vue-router';

// 1. Importar tus Guards existentes
import authGuard from './authGuard';
// import roleGuard from './roleGuard'; // Descomenta si ya tienes lógica de roles lista

// 2. Importar tus componentes existentes
import LoginForm from '@/components/forms/LoginForm.vue';
import PasswordResetForm from '@/components/forms/PasswordResetForm.vue';

// 3. Importar los nuevos componentes del Dashboard
import DashboardLayout from '@/views/dashboard/DashboardLayout.vue';
import DashboardHome from '@/views/dashboard/DashboardHome.vue';
import EmptyView from '@/views/dashboard/EmptyView.vue';
import OpcionesView from '@/views/dashboard/OpcionesView.vue'; 
import OperacionesView from '@/views/dashboard/OperacionesView.vue';
import ClientesView from '@/views/dashboard/ClientesView.vue';
import ReportesView from '@/views/dashboard/ReportesView.vue';
import ChatsView from '@/views/dashboard/ChatsView.vue';

const routes = [
  // --- Rutas Públicas ---
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { requiresAuth: false }
  },
  {
    path: '/recuperar-password',
    name: 'PasswordReset',
    component: PasswordResetForm,
    meta: { requiresAuth: false }
  },

  // --- Rutas Privadas (Dashboard) ---
  {
    path: '/dashboard',
    component: DashboardLayout, // El marco con Sidebar y Header
    beforeEnter: authGuard,     // Protege la entrada
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Ruta base: /dashboard
        name: 'DashboardHome',
        component: DashboardHome
      },
      {
        path: 'operaciones',
        name: 'Operaciones',
        component: OperacionesView
      },
      {
        path: 'clientes',
        name: 'Clientes',
        component: ClientesView
      },
      {
        path: 'reportes',
        name: 'Reportes',
        component: ReportesView
      },
      {
        path: 'chats',
        name: 'Chats',
        component: ChatsView
      },
      {
        path: 'opciones',
        name: 'Opciones',
        component: OpcionesView
      }
    ]
  },

  // Ruta comodín para 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;