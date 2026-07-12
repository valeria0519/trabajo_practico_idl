// ============================================================================
// js/views/reservas.js — Vista de Gestión e Historial de Reservas Administrativas
// Controla el listado, ordenamiento por columnas y la validación de solicitudes.
// ============================================================================

// Importa la función controladora desde el módulo del modal genérico para abrir formularios dinámicos
import { abrirModal } from '../modal.js';

// Estados locales de la vista: Almacenan los registros necesarios para cruzar los IDs y mostrar datos legibles
let localReservas = [];
let localSalones = [];
let localUsuarios = [];
// Configuración de ordenamiento activa: Guarda la columna actual por la que se ordena y la dirección (ascendente/descendente)
let sortConfig = { field: null, asc: true };

/**
 * Función principal de renderizado que inicializa la interfaz de la sección de reservas.
 * @param {HTMLElement} container - El elemento raíz del DOM donde se inyectará todo el HTML de esta vista
 */
export async function renderReservas(container) {
  // Resuelve en paralelo las tres consultas asíncronas de la API global antes de proceder con el dibujo de la vista
  const [reservas, salones, usuarios] = await Promise.all([
    window.StudyRoomAPI.getReservas(),
    window.StudyRoomAPI.getSalones(),
    window.StudyRoomAPI.getUsuarios()
  ]);

  // Traspasa los datos recuperados del almacenamiento distribuido a las variables de estado locales
  localReservas = reservas;
  localSalones = salones;
  localUsuarios = usuarios;

  /**
   * Función interna encargada de dibujar o redibujar la UI cada vez que mutan los datos o cambia el ordenamiento.
   */
  function drawView() {
    // Inyección de la estructura de la vista utilizando Template Literals de JavaScript
    container.innerHTML = `
      <div class="data-section">
        <div class="data-header">
          <h2 class="data-title">Historial de Reservas Administrativas</h2>
         
          <button type="button" class="btn-primary" id="btn-crear-reserva">+ Crear Reserva de Oficina</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
             
              <th style="cursor:pointer;" data-col="id">ID ${getArrow('id')}</th>
              <th style="cursor:pointer;" data-col="id_usuario">Asignado a ${getArrow('id_usuario')}</th>
              <th style="cursor:pointer;" data-col="id_salon">Espacio Físico ${getArrow('id_salon')}</th>
              <th style="cursor:pointer;" data-col="fecha_hora_inicio">Horario de Inicio ${getArrow('fecha_hora_inicio')}</th>
              <th style="cursor:pointer;" data-col="fecha_hora_fin">Horario de Cierre ${getArrow('fecha_hora_fin')}</th>
              <th style="cursor:pointer;" data-col="estado">Estado ${getArrow('estado')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
           
            ${localReservas.map(res => {
              // Busca la información detallada del salón cruzando el ID de la reserva con la lista local de salones
              const sala = localSalones.find(s => s.id === res.id_salon);
              // Busca la información detallada del usuario cruzando el ID de la reserva con la lista local de usuarios
              const user = localUsuarios.find(u => u.id === res.id_usuario);
              const nombreUsuario = res.usuario_nombre || user?.nombre || `Usuario #${res.id_usuario || '-'}`;
              const nombreSala = res.salon_nombre || sala?.salon_nombre || `Sala #${res.id_salon || '-'}`;
              return `
                <tr>
                  <td><strong>#${res.id}</strong></td>
                 
                  <td>${nombreUsuario}</td>
                 
                  <td>${nombreSala}</td>
                 
                  <td>${new Date(res.fecha_hora_inicio).toLocaleString('es-AR')}</td>
                  <td>${new Date(res.fecha_hora_fin).toLocaleString('es-AR')}</td>
                  <td>
                   
                    <span class="badge" style="padding:4px 6px; border-radius:4px; color:#fff; background: ${
                      ['en curso', 'finalizada'].includes(res.estado) ? 'var(--color-accent-green)' : res.estado === 'pendiente' ? 'var(--color-accent-orange)' : 'var(--color-accent-red)'
                    };">${res.estado.toUpperCase()}</span>
                  </td>
                  <td>
                   
                    <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt;" data-action="editar" data-id="${res.id}">Ajustar</button>
                  </td>
                </tr>
              `;
            }).join('') /* Une el array de fragmentos HTML en una única cadena limpia libre de comas residuales */}
          </tbody>
        </table>
      </div>
    `;

    // --- FILTROS DE ORDENACIÓN BIDIRECCIONAL POR COLUMNA ---
    // Recorre todas las cabeceras de tabla que posean el atributo interactivo data-col
    container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        // Captura la columna cliqueada (ej: 'id', 'fecha_hora_inicio')
        const field = th.getAttribute('data-col');
        // Si se cliqueó la columna activa, invierte la dirección. Si es una nueva, establece orden ascendente (true)
        sortConfig.asc = (sortConfig.field === field) ? !sortConfig.asc : true;
        // Actualiza el estado global de la columna seleccionada
        sortConfig.field = field;

        // Aplica el método nativo .sort() mutando el ordenamiento del array de reservas en memoria
        localReservas.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          // Aplica comparación alfabética regional si las propiedades son de tipo String
          if (typeof valA === 'string') return sortConfig.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          // Aplica resta aritmética estándar si son identificadores numéricos o enteros
          return sortConfig.asc ? valA - valB : valB - valA;
        });
        drawView(); // Redibuja el HTML de la tabla con las filas reordenadas estructuralmente
      });
    });

    // --- ENLACE DE EVENTOS PARA FORMULARIOS (CREACIÓN Y AJUSTES) ---
    // Vincula el click del botón de creación para levantar el modal en modo inserción (esEdicion = false)
    container.querySelector('#btn-crear-reserva').addEventListener('click', () => abrirFormularioReserva(false));
    // Recorre todos los botones de ajuste y les asigna un escuchador de click individual
    container.querySelectorAll('[data-action="editar"]').forEach(btn => {
      // Al dispararse, extrae el ID de la fila y abre el formulario en modo actualización (esEdicion = true)
      btn.addEventListener('click', () => abrirFormularioReserva(true, btn.getAttribute('data-id')));
    });
  }

  /**
   * Función auxiliar encargada de retornar el indicador visual (flecha) de ordenamiento de una columna.
   * @param {string} field - Nombre de la propiedad analizada
   */
  function getArrow(field) {
    // Retorna indicador neutro si la columna no es la activa de ordenación
    if (sortConfig.field !== field) return '↕';
    // Retorna flecha ascendente o descendente según corresponda en el estado actual
    return sortConfig.asc ? '▲' : '▼';
  }

  /**
   * Construye el formulario específico e invoca al modal dinámico para dar de alta o ajustar una reserva.
   */
  function abrirFormularioReserva(esEdicion = false, id = null) {
    // Objeto con la estructura inicial limpia para un escenario de creación de reservas
    let resExistente = { id_usuario: '', id_salon: '', fecha_hora_inicio: '', fecha_hora_fin: '', estado: 'pendiente' };
    // Si se encuentra en modo edición, localiza la reserva específica por ID numérico en el estado local
    if (esEdicion) {
      resExistente = localReservas.find(r => r.id === parseInt(id));
    }

    // Construcción del string de inputs y selects inyectando de forma condicional los datos preexistentes
    const camposHTML = `
      <div class="form-group">
        <label>Asignación de Usuario (Solicitante):</label>
       
        <select name="id_usuario" class="form-control" ${esEdicion ? 'disabled' : ''}>
         
          ${localUsuarios.map(u => `<option value="${u.id}" ${resExistente.id_usuario === u.id ? 'selected' : ''}>${u.nombre} (Legajo: ${u.legajo || u.id})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Asignación de Aula / Espacio Físico:</label>
        <select name="id_salon" class="form-control">
         
          ${localSalones.map(s => `<option value="${s.id}" ${resExistente.id_salon === s.id ? 'selected' : ''}>${s.salon_nombre} (Piso ${s.piso})</option>`).join('')}
        </select>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label>Fecha y Hora Inicio:</label>
         
          <input type="datetime-local" id="f_inicio" name="fecha_hora_inicio" value="${resExistente.fecha_hora_inicio ? resExistente.fecha_hora_inicio.substring(0,16) : ''}" required class="form-control">
        </div>
        <div class="form-group">
          <label>Fecha y Hora Cierre (Fin):</label>
          <input type="datetime-local" id="f_fin" name="fecha_hora_fin" value="${resExistente.fecha_hora_fin ? resExistente.fecha_hora_fin.substring(0,16) : ''}" required class="form-control">
        </div>
      </div>
      ${esEdicion ? `
      <div class="form-group">
        <label>Estado de Aprobación Administrativa:</label>
        <select name="estado" class="form-control">
          <option value="pendiente" ${resExistente.estado === 'pendiente' ? 'selected' : ''}>Pendiente de Confirmación</option>
          <option value="en curso" ${resExistente.estado === 'en curso' ? 'selected' : ''}>En curso / Confirmada</option>
          <option value="finalizada" ${resExistente.estado === 'finalizada' ? 'selected' : ''}>Finalizada</option>
          <option value="cancelada" ${resExistente.estado === 'cancelada' ? 'selected' : ''}>Cancelada / Rechazada</option>
        </select>
      </div>
      ` : ''}
    `;

    // Ejecuta el controlador genérico del modal inyectando toda la estructura y configurando el callback del submit
    abrirModal(
      esEdicion ? `Ajustar Reserva #${resExistente.id}` : "Emitir Reserva Administrativa",
      "Gestione el uso seguro de espacios físicos. Nota: La fecha de cierre debe ser estrictamente posterior al inicio.",
      camposHTML,
      // Callback asíncrono gatillado al enviar el formulario
      async (datosFormulario) => {
        // Convierte las cadenas de texto del datetime-local a marcas de tiempo Unix (milisegundos) para validación estricta
        const inicioTimestamp = new Date(datosFormulario.fecha_hora_inicio).getTime();
        const finTimestamp = new Date(datosFormulario.fecha_hora_fin).getTime();

        // VALIDACIÓN TEMPORAL SOLICITADA
        // Comprueba si el cierre ocurre antes o en el mismo instante que el inicio
        if (finTimestamp <= inicioTimestamp) {
          // Dispara un cuadro de alerta nativo informando sobre la incongruencia cronológica
          alert("❌ Error Crítico de Fechas: El horario de cierre de la reserva debe ser estrictamente posterior al horario de inicio seleccionado.");
          return; // Detiene el flujo de envío asíncrono previniendo la persistencia de datos inconsistentes
        }

        // Construye el payload final unificando campos y forzando el casteo a enteros numéricos de las claves externas (FK)
        const payload = {
          ...datosFormulario,
          // Si el input de usuario está deshabilitado por edición, preserva el ID del registro preexistente
          id_usuario: parseInt(datosFormulario.id_usuario || resExistente.id_usuario),
          id_salon: parseInt(datosFormulario.id_salon),
          estado: datosFormulario.estado || 'pendiente'
        };

        // Bifurca los flujos HTTP de persistencia externa hacia el entorno o backend en local
        if (esEdicion) {
          await window.StudyRoomAPI.editarReserva(id, payload);
        } else {
          await window.StudyRoomAPI.crearReserva(payload);
        }
        // Vuelve a invocar el renderizado de la sección para refrescar los datos desde el origen asíncrono
        renderReservas(container);
      }
    );
  }

  // Dispara el primer renderizado visual inmediato apenas se invoca externamente la función 'renderReservas'
  drawView();
}
