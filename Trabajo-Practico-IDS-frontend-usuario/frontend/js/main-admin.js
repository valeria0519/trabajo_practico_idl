// ============================================================================
// js/main-admin.js — Enrutador Central y Orquestador del Panel Administrador
// Conecta los eventos de navegación de la barra lateral con las vistas modulares.
//
// Se llama "main-admin.js" (no "main.js") a propósito: js/main.js ya existe en
// este proyecto y es una utilidad distinta (el toast compartido de login y
// usuario). Este archivo es el equivalente, pero exclusivo del panel admin.
// ============================================================================

// --- IMPORTACIÓN DE MÓDULOS Y VISTAS ---
// Se importan las funciones de inicialización y renderizado desde sus respectivos archivos.
import { StudyRoomAPI } from './api-mockup.js';
import { initModal } from './modal.js'; // Controlador genérico para diálogos flotantes
import { renderAulas } from './views/admin-aulas.js'; // Vista de gestión de espacios/salones
import { renderReservas } from './views/admin-reservas.js'; // Vista del historial de solicitudes
import { renderUsuarios } from './views/admin-usuarios.js'; // Vista de administración de usuarios
import { renderObjetos } from './views/admin-objetos.js'; // Vista del inventario de equipamiento
import { renderPerfilAdmin } from './views/admin-perfil.js'; // Vista de datos del administrador actual
import { renderRankingAulas, renderRankingUsuarios } from './views/admin-rankings.js'; // Vistas estadísticas de uso y reputación

/**
 * Diccionario de Configuración de Rutas del Sistema (Mapeo de Vistas).
 * Asocia una clave de pestaña ('tabKey') con su título visual y la función encargada de renderizar su contenido.
 */
const ROUTES = {
  'aulas': { title: 'Gestión de Aulas', render: renderAulas },
  'usuarios': { title: 'Control de Usuarios', render: renderUsuarios },
  'reservas': { title: 'Historial de Reservas', render: renderReservas },
  'objetos': { title: 'Inventario de Objetos', render: renderObjetos },
  'ranking-aulas': { title: 'Ranking de Aulas Universatarias', render: renderRankingAulas },
  'ranking-usuarios': { title: 'Ranking de Reputación de Usuarios', render: renderRankingUsuarios },
  'perfil': { title: 'Mi Perfil Administrador', render: renderPerfilAdmin },
  // Ruta estática definida mediante una función flecha en línea para mostrar la versión del software
  'sobre-la-pagina': {
    title: 'Sobre la Página',
    render: (root) => root.innerHTML = '<div class="data-section"><h2 class="data-title">Información</h2><p>StudyRoom FIUBA v2.0 - Panel Modular Multi-Gestión.</p></div>'
  }
};

// Escucha el evento de ciclo de vida del navegador: se ejecuta de forma segura cuando todo el DOM (HTML) fue completamente parseado
document.addEventListener('DOMContentLoaded', () => {
  // Contenedor principal (contenedor raíz) donde se inyectará dinámicamente el HTML de cada sección
  const rootElement = document.getElementById('dinamic-content-root');
  // Elemento HTML de la cabecera destinado a mostrar el título de la sección activa
  const pageTitleElement = document.getElementById('admin-page-title');
  // Contenedor de la barra de navegación lateral que aloja los botones de cambio de sección
  const sidebar = document.querySelector('.sidebar-admin');

  // Inicializa el controlador del modal para escuchar eventos de envío y cierre del formulario flotante
  initModal();

  // Cerrar sesion: borra el usuario simulado antes de volver al login.
  // No hace falta preventDefault porque el href="login.html" ya funciona
  // como respaldo si este script no llegara a cargar.
  document.getElementById('btn-logout-admin')?.addEventListener('click', () => {
    sessionStorage.removeItem('usuario');
  });

  /**
   * Función asíncrona principal encargada de manejar la transición e inyección de datos entre pantallas.
   * @param {string} tabKey - Clave única de la ruta que se desea cargar (ej: 'aulas', 'reservas')
   */
  async function navigateTo(tabKey) {
    // Busca la configuración de la ruta solicitada en el diccionario ROUTES
    const route = ROUTES[tabKey];
    if (!route) return; // Cláusula de salvaguarda: si la ruta no existe en el diccionario, frena la ejecución

    // Actualiza el título principal de la interfaz con el texto correspondiente a la sección elegida
    pageTitleElement.textContent = route.title;

    // Actualiza visualmente el estado "activo" en la barra lateral
    sidebar.querySelectorAll('.sidebar-item').forEach(btn => {
      // Si el botón coincide con el identificador de la sección, le añade la clase CSS 'active', de lo contrario se la remueve
      if (btn.getAttribute('data-tab') === tabKey) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Muestra un estado de carga temporal (Spinner/Skeleton simulado) en el contenedor raíz mientras se procesa la asincronía
    rootElement.innerHTML = '<div class="data-section"><p>Cargando información del servidor...</p></div>';

    try {
      // Llama a la función de renderizado de la ruta correspondiente pasándole el nodo raíz del DOM para que inyecte su estructura
      // Lleva un 'await' porque las vistas invocan métodos asíncronos de la API (simulación de latencia con promesas)
      await route.render(rootElement);
    } catch (error) {
      // Captura cualquier falla o promesa rechazada producida durante la carga de datos e inyecta un banner de error visual en la UI
      rootElement.innerHTML = `<div class="data-section"><h2 class="data-title" style="color:var(--color-accent-red);">Error</h2><p>${error.message}</p></div>`;
    }
  }

  // Escucha los clicks en la barra lateral utilizando delegación de eventos para optimizar el rendimiento del DOM
  sidebar.addEventListener('click', (e) => {
    // Busca si el click ocurrió en un botón de navegación o en uno de sus nodos hijos (iconos, textos)
    const tabButton = e.target.closest('.sidebar-item');
    if (tabButton) {
      // Extrae la clave de la ruta asociada al atributo personalizado 'data-tab' del botón HTML
      const tabKey = tabButton.getAttribute('data-tab');
      // Si el atributo existe, dispara la función de transición de pantalla
      if (tabKey) navigateTo(tabKey);
    }
  });

  // Carga inicial por defecto: Fuerza al sistema a renderizar la sección de 'aulas' inmediatamente al abrir o refrescar la aplicación
  navigateTo('aulas');
});
