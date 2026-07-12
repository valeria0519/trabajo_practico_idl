// ============================================================
// js/modal.js — Controlador Genérico de Diálogos (Modales)
// Gestiona el ciclo de vida de la etiqueta HTML5 <dialog> y el envío de formularios.
// ============================================================

// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
// Se capturan las referencias del HTML para poder manipular el modal de forma dinámica.

// Elemento contenedor principal del diálogo (<dialog>)
const dialog = document.getElementById('modal-generico');
// Elemento de texto para el título principal del modal
const modalTitle = document.getElementById('modal-title');
// Elemento para renderizar textos informativos o descripciones contextuales
const modalInfo = document.getElementById('modal-info-contextual');
// Contenedor dinámico donde se inyectarán los inputs/campos específicos de cada formulario
const modalFields = document.getElementById('modal-fields-container');
// El elemento formulario interno que procesará los datos ingresados por el usuario
const modalForm = document.getElementById('modal-form');

// Declaración explícita de la variable que almacenará la función callback activa al enviar el formulario.
// Se define globalmente en este módulo para prevenir ReferenceErrors bajo el Modo Estricto de JS (Strict Mode).
let activeSubmitCallback = null;

/**
 * Inicializa los escuchadores de eventos (Event Listeners) globales del modal.
 * Debe ejecutarse una sola vez al arrancar la aplicación.
 */
export function initModal() {
  // Escucha todos los clicks dentro del elemento <dialog>
  dialog.addEventListener('click', (e) => {
    // Patrón de delegación de eventos: si el click ocurrió en (o dentro de) un elemento con el atributo data-action="cerrar-modal"
    if (e.target.closest('[data-action="cerrar-modal"]')) cerrarModal();
  });

  // Escucha el evento de envío (submit) del formulario interno
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Cancela el comportamiento por defecto del navegador (recargar la página)
    // Verifica de manera segura si hay un callback asignado y si efectivamente es una función
    if (typeof activeSubmitCallback === 'function') {
      // Instancia la utilidad FormData pasándole el formulario para recolectar de forma automática todos sus inputs con atributo 'name'
      const formData = new FormData(modalForm);
      // Transforma el objeto iterable FormData en un objeto plano nativo de JS (ej: { nombre: "Juan", piso: 2 })
      const data = Object.fromEntries(formData.entries());
      // Ejecuta la función callback pasando los datos recolectados como argumento para que la vista o API haga su trabajo
      activeSubmitCallback(data);
    }
    cerrarModal(); // Cierra el modal automáticamente después de procesar y enviar el formulario
  });
}

/**
 * Abre el modal de forma nativa e inyecta dinámicamente los textos, campos y comportamientos requeridos.
 * @param {string} titulo - El título que se mostrará en la cabecera del modal
 * @param {string} infoContextual - Código HTML o texto descriptivo de ayuda
 * @param {string} camposHTML - Estructura HTML de los inputs específicos del formulario
 * @param {Function} onSubmit - Función callback que define qué hacer con los datos cuando el usuario envíe el formulario
 */
export function abrirModal(titulo, infoContextual, camposHTML, onSubmit) {
  modalForm.reset(); // Limpia cualquier residuo de datos o valores anteriores que hayan quedado en el formulario
  modalTitle.textContent = titulo; // Asigna de manera segura el texto plano para el título
  modalInfo.innerHTML = infoContextual; // Inyecta el contenido HTML/texto de contexto informativo
  modalFields.innerHTML = camposHTML; // Inyecta dinámicamente el HTML de los campos o controles de formulario requeridos
  activeSubmitCallback = onSubmit; // Guarda la referencia de la función encargada de procesar el submit para este caso de uso
  
  dialog.showModal(); // Método nativo de la API HTML5 <dialog> que abre la ventana flotante de forma modal (bloqueando el fondo)
}

/**
 * Cierra el modal de forma nativa y limpia el estado para prevenir fugas de memoria o datos duplicados.
 */
export function cerrarModal() {
  dialog.close(); // Método nativo de HTML5 <dialog> que oculta la ventana flotante
  activeSubmitCallback = null; // Remueve la referencia de la función callback para que no se ejecute accidentalmente después
  modalFields.innerHTML = ''; // Vacía por completo el contenedor de inputs para limpiar el DOM
}