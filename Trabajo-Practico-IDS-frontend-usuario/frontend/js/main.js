// ============================================================
// main.js — StudyRoom FIUBA
// Utilidades COMPARTIDAS entre pantallas (por ahora, el toast).
// No confundir con main-usuario.js / main-admin.js, que son los
// enrutadores de cada panel: este archivo no depende de ninguno
// de los dos y se puede importar desde cualquier vista.
// ============================================================

/*
  Muestra una notificacion flotante temporal (toast) en la esquina
  inferior derecha. Requiere que el HTML tenga un elemento
  <div class="toast" id="toast"></div> (usuario.html ya lo tiene).

  tipo puede ser 'ok', 'warn' o 'err' (ver los estilos .toast-ok,
  .toast-warn y .toast-err en css/global.css).
*/
export function mostrarToast(mensaje, tipo = 'ok') {
  const toast = document.getElementById('toast');
  if (!toast) return; // si la pantalla no tiene toast, no rompemos nada

  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  // Truco para reiniciar la animacion CSS aunque el toast ya estuviera visible
  void toast.offsetWidth;
  toast.classList.add('toast-show');
  setTimeout(() => toast.classList.remove('toast-show'), 2500);
}
