export default function authGuard(to, from, next) {
  // 1. Buscamos si hay un token guardado (esto simula estar logueado)
  // Nota: Cuando hagas el login real, asegúrate de guardar 'access_token' en localStorage
  const isAuthenticated = localStorage.getItem('access_token'); 

  // 2. Reglas de navegación
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta requiere permiso y NO estás logueado -> Al Login
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Si ya estás logueado e intentas ir al Login -> Al Dashboard
    next('/dashboard');
  } else {
    // Si todo está bien -> Adelante
    next();
  }
}