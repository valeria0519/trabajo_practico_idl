import { renderUsuarioSalas } from './views/usuario-salas.js';
import { renderUsuarioReserva } from './views/usuario-reserva.js';
import { renderUsuarioMisReservas } from './views/usuario-mis-reservas.js';
import { renderUsuarioPerfil } from './views/usuario-perfil.js';

// Router del panel estudiante: para agregar vistas nuevas, sumar una clave
// data-tab aca y crear el boton correspondiente en usuario.html.
const ROUTES = {
  salas: { title: 'Salas disponibles', render: renderUsuarioSalas },
  reserva: { title: 'Nueva reserva', render: renderUsuarioReserva },
  'mis-reservas': { title: 'Mis reservas', render: renderUsuarioMisReservas },
  perfil: { title: 'Mi perfil', render: renderUsuarioPerfil },
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('usuario-content-root');
  const title = document.getElementById('usuario-page-title');
  const sidebar = document.querySelector('.sidebar-usuario');

  async function navigateTo(tabKey, params = {}) {
    const route = ROUTES[tabKey];
    if (!route) return;

    title.textContent = route.title;
    document.querySelectorAll('[data-tab]').forEach((item) => {
      item.classList.toggle('active', item.dataset.tab === tabKey);
    });

    root.innerHTML = '<div class="data-section"><p>Cargando informacion del servidor...</p></div>';

    try {
      await route.render(root, params);
      updateUserChrome();
    } catch (error) {
      root.innerHTML = `<div class="data-section"><h2 class="data-title">Error</h2><p>${error.message}</p></div>`;
    }
  }

  // Los botones data-tab se conectan con ROUTES mediante delegacion de eventos.
  document.body.addEventListener('click', (event) => {
    const tabButton = event.target.closest('[data-tab]');
    if (!tabButton) return;
    const tabKey = tabButton.dataset.tab;
    if (!ROUTES[tabKey]) return;
    event.preventDefault();
    navigateTo(tabKey);
  });

  window.navigateUsuario = navigateTo;
  navigateTo('salas');

  // Cerrar sesion: borra el usuario simulado de sessionStorage antes de
  // volver al login. El href="login.html" del enlace hace de respaldo.
  document.getElementById('btn-logout-usuario')?.addEventListener('click', () => {
    sessionStorage.removeItem('usuario');
  });
});

export function updateUserChrome() {
  const usuario = StudyRoomAPI.usuarioActual() || {
    nombre: 'Usuario',
    puntaje: 100,
  };
  const iniciales = usuario.nombre
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  document.getElementById('topbar-avatar').textContent = iniciales;
  document.getElementById('topbar-nombre').textContent = usuario.nombre?.split(' ')[0] || 'Usuario';
  document.getElementById('sidebar-puntaje').textContent = `${usuario.puntaje ?? '-'} pts`;
}
