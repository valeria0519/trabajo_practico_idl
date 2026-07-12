// ============================================================================
// js/views/usuarios.js — Vista de Control del Padrón Unificado de Usuarios
// Administra el listado, ordenación, mutación de puntajes (reputación) y CRUD.
// ============================================================================

// Importa la función controladora desde el módulo del modal genérico para abrir formularios dinámicos
import { abrirModal } from '../modal.js';

// Estado local de la vista: Almacena de manera temporal la lista de usuarios recuperada del backend
let localUsuarios = [];
// Configuración de ordenamiento activa: Guarda la columna actual seleccionada y su sentido (ascendente/descendente)
let sortConfig = { field: null, asc: true };

/**
 * Función principal de renderizado que inicializa la interfaz de la sección de usuarios.
 * @param {HTMLElement} container - El elemento raíz del DOM donde se inyectará todo el HTML de esta vista
 */
export async function renderUsuarios(container) {
  // Consume de forma asíncrona el listado global de usuarios expuesto en el objeto window por la API
  localUsuarios = await window.StudyRoomAPI.getUsuarios();

  /**
   * Función interna encargada de dibujar o redibujar la UI cada vez que mutan los datos o cambia el ordenamiento.
   */
  function drawView() {
    // Inyección de la estructura de la vista utilizando Template Literals de JavaScript
    container.innerHTML = `
      <div class="data-section">
        <div class="data-header">
          <h2 class="data-title">Padrón Unificado de Usuarios</h2>
        </div>
        <table class="data-table">
          <thead>
            <tr>
             
              <th style="cursor:pointer;" data-col="legajo">Legajo/ID ${getArrow('legajo')}</th>
              <th style="cursor:pointer;" data-col="nombre">Nombre Completo ${getArrow('nombre')}</th>
              <th style="cursor:pointer;" data-col="email">Email Institucional ${getArrow('email')}</th>
              <th style="cursor:pointer;" data-col="rol">Rol de Cuenta ${getArrow('rol')}</th>
              <th style="cursor:pointer;" data-col="puntaje">Reputación ${getArrow('puntaje')}</th>
              <th>Nivel de Acceso</th>
              <th style="min-width: 260px;">Operaciones</th>
            </tr>
          </thead>
          <tbody>
           
            ${localUsuarios.map(u => {
              // Invoca la función helper de la API para obtener dinámicamente la etiqueta y color del nivel (PREMIUM, NORMAL, etc.)
              const nivel = window.StudyRoomAPI.nivelAcceso(u.puntaje);
              return `
                <tr>
                 
                  <td><strong>#${u.legajo || u.id}</strong></td>
                  <td>${u.nombre}</td>
                  <td>${u.email}</td>
                 
                  <td><span class="admin-tag" style="background:#ddd; color:#333; padding:2px 6px; border-radius:4px; font-size:8pt;">${u.rol.toUpperCase()}</span></td>
                  <td style="font-weight:700; color:var(--color-primary);">${u.puntaje} pts</td>
                 
                  <td><span style="font-weight:600; color:${nivel.color};">${nivel.label}</span></td>
                  <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
                     
                      <button class="btn-primary" style="padding:4px 6px; font-size:8pt; background:#ef4444; border-color:#ef4444;" data-action="restar" data-id="${u.id}">-20pts</button>
                      <button class="btn-primary" style="padding:4px 6px; font-size:8pt; background:#10b981; border-color:#10b981;" data-action="sumar" data-id="${u.id}">+20pts</button>
                     
                      <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt;" data-action="editar" data-id="${u.id}">Editar</button>
                     
                      <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt; background:var(--color-accent-red); border-color:var(--color-accent-red);" data-action="eliminar" data-id="${u.id}">Eliminar</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') /* Convierte la lista mapeada en una cadena HTML consolidada eliminando las comas de separación nativas */}
          </tbody>
        </table>
      </div>
    `;

    // --- VINCULACIÓN DE EVENTOS DE CABECERAS PARA ENFOQUE DE ORDENACIÓN ---
    // Agrega un escuchador de clicks a cada celda th reactiva configurada con el atributo data-col
    container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-col');
        // Invierte la dirección si se repite click en la misma columna, de lo contrario setea por defecto ascendente
        sortConfig.asc = (sortConfig.field === field) ? !sortConfig.asc : true;
        sortConfig.field = field;

        // Ejecuta el algoritmo de ordenación nativa mutando la disposición del padrón local
        localUsuarios.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          // Evaluación lexicográfica regional si las propiedades corresponden a cadenas de texto (nombre, email, rol)
          if (typeof valA === 'string') return sortConfig.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          // Evaluación aritmética para identificadores y puntajes numéricos
          return sortConfig.asc ? valA - valB : valB - valA;
        });
        drawView(); // Redibuja la estructura HTML de la tabla para ver reflejado el nuevo ordenamiento
      });
    });

    // --- VINCULAR AJUSTES RÁPIDOS DE REPUTACIÓN DINÁMICA Y OPERACIONES CRUD ---
    // Enlaza la reducción rápida de puntos a todos los elementos con data-action="restar"
    container.querySelectorAll('[data-action="restar"]').forEach(btn => {
      btn.addEventListener('click', () => modificarPuntos(btn.getAttribute('data-id'), -20));
    });
    // Enlaza el incremento rápido de puntos a todos los elementos con data-action="sumar"
    container.querySelectorAll('[data-action="sumar"]').forEach(btn => {
      btn.addEventListener('click', () => modificarPuntos(btn.getAttribute('data-id'), 20));
    });
    // Vincula la apertura del modal de edición profunda al hacer click en el botón "Editar" de la fila
    container.querySelectorAll('[data-action="editar"]').forEach(btn => {
      btn.addEventListener('click', () => abrirEditorUsuario(btn.getAttribute('data-id')));
    });
    // Vincula la confirmación y proceso de borrado al presionar el botón "Eliminar"
    container.querySelectorAll('[data-action="eliminar"]').forEach(btn => {
      btn.addEventListener('click', () => eliminarUsuario(btn.getAttribute('data-id')));
    });
  }

  /**
   * Helper que retorna el indicador visual en flecha para la ordenación de columnas.
   */
  function getArrow(field) {
    if (sortConfig.field !== field) return '↕';
    return sortConfig.asc ? '▲' : '▼';
  }

  /**
   * Modifica velozmente el puntaje de reputación de un usuario y persiste el cambio asíncronamente.
   * @param {string} id - ID único del usuario a modificar
   * @param {number} delta - Variación numérica de puntos (positivo o negativo)
   */
  async function modificarPuntos(id, delta) {
    const user = localUsuarios.find(u => u.id === parseInt(id));
    if (!user) return; // Salvaguarda: si el usuario no es localizado, frena la ejecución
    // Garantiza que la reputación nunca caiga por debajo de cero puntos mediante Math.max
    const nuevoPuntaje = Math.max(0, (user.puntaje || 0) + delta);
    // Despacha la actualización parcial del campo hacia la API simulada
    await window.StudyRoomAPI.actualizarUsuario(user.id, { puntaje: nuevoPuntaje });
    renderUsuarios(container); // Refresca completamente la vista unificada para reflejar los nuevos tags de acceso
  }

  /**
   * Despacha una solicitud de baja para remover al usuario del sistema.
   * @param {string} id - ID único del usuario a eliminar
   */
  async function eliminarUsuario(id) {
    // Lanza un cuadro modal de confirmación nativo para resguardar la destrucción de datos
    if (confirm("¿Está completamente seguro de que desea dar de baja a este usuario de los registros de StudyRoom?")) {
      // Envía una solicitud DELETE HTTP al backend simulado local
      await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: 'DELETE' })
        // Cláusula catch para tolerar entornos donde no corre el servidor real, alertando la ejecución en memoria simulada
        .catch(() => alert('Usuario eliminado en simulación backend local.'));
      renderUsuarios(container); // Vuelve a cargar y dibujar la sección actualizada
    }
  }

  /**
   * Extrae los datos actuales del usuario y despliega el modal interactivo con el formulario de edición.
   * @param {string} id - ID único del usuario a editar
   */
  function abrirEditorUsuario(id) {
    const usuario = localUsuarios.find(u => u.id === parseInt(id));
    if (!usuario) return;

    // Construcción del esqueleto de controles de formulario inyectando de forma dinámica las propiedades actuales
    const camposHTML = `
      <div class="form-group">
        <label>Nombre y Apellido Institucional:</label>
        <input type="text" name="nombre" value="${usuario.nombre}" required class="form-control">
      </div>
      <div class="form-group">
        <label>Legajo Universitario / ID Control:</label>
        <input type="text" name="legajo" value="${usuario.legajo || usuario.id}" required class="form-control">
      </div>
      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input type="email" name="email" value="${usuario.email}" required class="form-control">
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label>Rol Interno:</label>
          <select name="rol" class="form-control">
            <option value="usuario" ${usuario.rol === 'usuario' ? 'selected' : ''}>Estudiante / Docente</option>
            <option value="administrador" ${usuario.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
          </select>
        </div>
        <div class="form-group">
          <label>Puntaje (Reputación Base):</label>
          <input type="number" name="puntaje" value="${usuario.puntaje}" min="0" required class="form-control">
        </div>
      </div>
    `;

    // Invoca la apertura del componente dialog inyectando campos y definiendo la persistencia en el callback asíncrono
    abrirModal(
      `Editar Cuenta: ${usuario.nombre}`,
      "Modifique los datos generales, el número de legajo unificado o el nivel de reputación operativa del usuario.",
      camposHTML,
      // Callback gatillado al validar y despachar exitosamente el formulario interno del diálogo
      async (datosFormulario) => {
        const payload = {
          ...datosFormulario,
          puntaje: parseInt(datosFormulario.puntaje) // Fuerza el casteo estricto de la cadena del input a entero numérico
        };
        // Ejecuta la actualización definitiva consumiendo el método correspondiente de la API global
        await window.StudyRoomAPI.actualizarUsuario(usuario.id, payload);
        renderUsuarios(container); // Refresca el listado general en pantalla con los nuevos cambios
      }
    );
  }

  // Lanza el primer renderizado visual inmediato de los elementos apenas se invoca externamente la función 'renderUsuarios'
  drawView();
}