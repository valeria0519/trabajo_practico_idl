// ============================================================================
// js/views/aulas.js — Vista de Gestión de Aulas y Espacios de Estudio
// Se encarga de listar, ordenar y disparar altas o modificaciones de salones.
// ============================================================================

// Importa la función controladora desde el módulo del modal genérico para abrir formularios dinámicos
import { abrirModal } from '../modal.js';
import { formatearFechaActual } from '../date-utils.js';

// Estado local de la vista: Almacena temporalmente la lista de salones para no consultar a la API en cada re-render
let localSalones = [];
// Configuración de ordenamiento activa: Guarda la columna actual por la que se ordena y la dirección (ascendente/descendente)
let sortConfig = { field: null, asc: true };

/**
 * Función principal de renderizado que inicializa la interfaz de la sección de aulas.
 * @param {HTMLElement} container - El elemento raíz del DOM donde se inyectará todo el HTML de esta vista
 */
export async function renderAulas(container) {
  // Recupera el array de salones de manera asíncrona llamando a la API simulada expuesta en el entorno global window
  localSalones = await window.StudyRoomAPI.getSalones();
  
  /**
   * Función interna encargada de dibujar o redibujar la UI cada vez que mutan los datos o cambia el ordenamiento.
   */
  function drawView() {
    // Filtra y calcula la cantidad de salones cuyo estado operativo actual sea exactamente 'disponible'
    const disponibles = localSalones.filter(s => s.estado === 'disponible').length;
    // Filtra y calcula la cantidad de salones que se encuentren actualmente bajo 'mantenimiento'
    const mantenimiento = localSalones.filter(s => s.estado === 'mantenimiento').length;

    // Inyección de la estructura de la vista utilizando Template Literals de JavaScript
    container.innerHTML = `
      <div class="page-header">
        <div>
          <p class="page-sub">${formatearFechaActual()}</p>
        </div>
      </div>

      <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
        <div class="stat-card" style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid var(--color-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <small style="color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Salas Totales</small>
          <h3 style="font-size: 24pt; margin: 8px 0 0 0; color: #111827;">${localSalones.length}</h3>
        </div>
        <div class="stat-card" style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid var(--color-accent-green); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <small style="color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Disponibles</small>
          <h3 style="font-size: 24pt; margin: 8px 0 0 0; color: var(--color-accent-green);">${disponibles}</h3>
        </div>
        <div class="stat-card" style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid var(--color-accent-red); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <small style="color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Mantenimiento</small>
          <h3 style="font-size: 24pt; margin: 8px 0 0 0; color: var(--color-accent-red);">${mantenimiento}</h3>
        </div>
      </div>

      <div class="data-section">
        <div class="data-header">
          <h2 class="data-title">Aulas y Espacios de Estudio</h2>
          <button type="button" class="btn-primary" id="btn-alta-aula">+ Registrar Aula</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="cursor:pointer;" data-col="id">ID ${getArrow('id')}</th>
              <th style="cursor:pointer;" data-col="salon_nombre">Denominación ${getArrow('salon_nombre')}</th>
              <th style="cursor:pointer;" data-col="tipo">Tipo ${getArrow('tipo')}</th>
              <th style="cursor:pointer;" data-col="capacidad">Capacidad ${getArrow('capacidad')}</th>
              <th style="cursor:pointer;" data-col="estado">Estado ${getArrow('estado')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${localSalones.map(sala => `
              <tr>
                <td>#${sala.id}</td>
                <td><strong>${sala.salon_nombre}</strong> (Piso ${sala.piso})</td>
                <td><span class="admin-tag" style="background:#e0f2fe; color:#0369a1;">${sala.tipo ? sala.tipo.toUpperCase() : 'ESTUDIO'}</span></td>
                <td><strong>${sala.capacidad}</strong> integrantes</td>
                <td>
                  <span class="badge ${sala.estado === 'disponible' ? 'badge-ok' : 'badge-maint'}" 
                        style="color:#fff; padding:4px 8px; border-radius:4px; background:${sala.estado === 'disponible' ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}">
                    ${sala.estado.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt;" data-action="editar" data-id="${sala.id}">Modificar</button>
                </td>
              </tr>
            `).join('') /* Une el array de strings resultante de .map() en una única cadena HTML limpia */}
          </tbody>
        </table>
      </div>
    `;

    // --- ENLACE (BINDING) DE EVENTOS DE ORDENAMIENTO ---
    // Selecciona todas las cabeceras th de la tabla que tengan asignado el atributo data-col
    container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        // Obtiene la columna cliqueada (ej: 'id', 'capacidad')
        const field = th.getAttribute('data-col');
        // Si se cliqueó la columna que ya estaba activa, invierte el sentido, si no, setea por defecto ascendente (true)
        sortConfig.asc = (sortConfig.field === field) ? !sortConfig.asc : true;
        // Setea el campo activo de ordenamiento global en el estado
        sortConfig.field = field;
        
        // Aplica el algoritmo de ordenamiento nativo .sort() mutando el orden del array localSalones
        localSalones.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          // Comportamiento de ordenamiento alfabético local para campos de tipo String
          if (typeof valA === 'string') return sortConfig.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          // Comportamiento aritmético estándar para campos numéricos (ID, capacidad, piso)
          return sortConfig.asc ? valA - valB : valB - valA;
        });
        drawView(); // Vuelve a ejecutar la inyección del HTML para renderizar las filas con el nuevo orden establecido
      });
    });

    // --- ENLACE DE EVENTOS PARA OPERACIONES CRUD (ALTAS Y MODIFICACIONES) ---
    // Vincula el click del botón de alta para abrir el modal configurado en modo creación (esEdicion = false)
    container.querySelector('#btn-alta-aula').addEventListener('click', () => mostrarFormularioAula(false));
    // Recorre todos los botones de "Modificar" renderizados en las filas de la tabla
    container.querySelectorAll('[data-action="editar"]').forEach(btn => {
      // Al hacer click, extrae el ID almacenado en la fila y abre el formulario en modo edición (esEdicion = true)
      btn.addEventListener('click', () => mostrarFormularioAula(true, btn.getAttribute('data-id')));
    });
  }

  /**
   * Función auxiliar encargada de retornar el indicador visual (flecha) de ordenamiento de una columna.
   * @param {string} field - Nombre de la propiedad de la columna
   */
  function getArrow(field) {
    // Si la columna evaluada no es la columna activa de ordenamiento, devuelve el indicador neutro de doble sentido
    if (sortConfig.field !== field) return '↕';
    // Si está activa, devuelve flecha hacia arriba para ascendente o hacia abajo para descendente
    return sortConfig.asc ? '▲' : '▼';
  }

  /**
   * Genera dinámicamente la estructura del formulario y abre el modal genérico para crear o editar un salón.
   */
  async function mostrarFormularioAula(esEdicion = false, id = null) {
    // Inicializa un objeto de datos vacío con valores por defecto para el caso de un alta nueva
    let salaExistente = { salon_nombre: '', tipo: 'aula', piso: 0, capacidad: '', estado: 'disponible' };
    // Si es una edición, localiza dentro del array del estado el salón que corresponda al ID numérico provisto
    if (esEdicion) {
      salaExistente = localSalones.find(s => s.id === parseInt(id));
    }

    // Define los controles de formulario en formato String inyectando los valores actuales si corresponde editar
    const camposHTML = `
      <div class="form-group">
        <label>Denominación del Aula / Espacio:</label>
        <input type="text" name="salon_nombre" value="${salaExistente.salon_nombre}" required class="form-control" placeholder="Ej: Aula 301 - Thompson">
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label>Clasificación del Espacio:</label>
          <select name="tipo" class="form-control">
            <option value="aula" ${salaExistente.tipo === 'aula' ? 'selected' : ''}>Aula Común</option>
            <option value="laboratorio" ${salaExistente.tipo === 'laboratorio' ? 'selected' : ''}>Laboratorio</option>
            <option value="oficina" ${salaExistente.tipo === 'oficina' ? 'selected' : ''}>Oficina de Consultas</option>
          </select>
        </div>
        <div class="form-group">
          <label>Piso (-2 al 5):</label>
          <input type="number" name="piso" min="-2" max="5" value="${salaExistente.piso}" required class="form-control">
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label>Capacidad Máxima Autorizada:</label>
          <input type="number" name="capacidad" min="1" value="${salaExistente.capacidad}" required class="form-control">
        </div>
        <div class="form-group">
          <label>Estado de Operación:</label>
          <select name="estado" class="form-control">
            <option value="disponible" ${salaExistente.estado === 'disponible' ? 'selected' : ''}>Disponible (Operativa)</option>
            <option value="mantenimiento" ${salaExistente.estado === 'mantenimiento' ? 'selected' : ''}>Mantenimiento Técnico</option>
          </select>
        </div>
      </div>
    `;

    // Invoca la apertura del modal pasándole el título, descripción de ayuda, los campos HTML y la función de retorno (callback)
    abrirModal(
      esEdicion ? "Modificar Aula Universitaria" : "Registrar Nueva Sala",
      "Establezca las dimensiones físicas y capacidades operativas del espacio dentro del predio utilizando los estilos del sistema.",
      camposHTML,
      // Callback asíncrono que se dispara desde modal.js cuando el formulario pasa la validación HTML y se envía
      async (datosFormulario) => {
        // Estructura el objeto final (payload) asegurando el casteo a enteros numéricos de las propiedades requeridas por el negocio
        const payload = {
          ...datosFormulario,
          piso: parseInt(datosFormulario.piso),
          capacidad: parseInt(datosFormulario.capacidad)
        };

        // Elige de forma condicional qué método persistente de la API asíncrona despachar
        if (esEdicion) {
          await window.StudyRoomAPI.editarSalon(parseInt(id), payload);
        } else {
          await window.StudyRoomAPI.crearSalon(payload);
        }
        // Vuelve a invocar el renderizado completo de la sección de aulas para refrescar la lista y leer los nuevos cambios del storage
        renderAulas(container);
      }
    );
  }

  // Dispara el primer renderizado visual inmediato apenas se invoca externamente la función 'renderAulas'
  drawView();
}
