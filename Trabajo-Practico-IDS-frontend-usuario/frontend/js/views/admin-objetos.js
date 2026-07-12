// ============================================================================
// js/views/objetos.js — Panel de Control de Inventario y Equipamiento Técnico
// Módulo de interfaz encargado del renderizado de activos y su interacción con la API.
// ============================================================================

// Importa el controlador genérico del ciclo de vida del componente modal del sistema
import { abrirModal } from '../modal.js';

// Arreglo intermedio local que almacena la colección aplanada de objetos del hardware institucional
let localInventario = [];
// Arreglo intermedio local que almacena la lista completa de salones para mapear ubicaciones
let localSalones = [];
// Configuración global del estado y orden bidireccional de las cabeceras de la tabla de datos
let sortConfig = { field: null, asc: true };

/**
 * Función principal exportada que coordina la carga asíncrona de datos y renderizado en el contenedor raíz.
 * @param {HTMLElement} container - Nodo del DOM donde se inyectará la interfaz dinámica de la vista.
 */
export async function renderObjetos(container) {
  // Invoca la API global para obtener la colección actualizada de salones y dependencias físicas
  localSalones = await window.StudyRoomAPI.getSalones();
  
  // Resetea y procesa el mapeo de objetos aplanando las subcolecciones incrustadas en cada aula
  localInventario = [];
  localSalones.forEach(sala => {
    // Verifica rigurosamente que la propiedad equipamiento sea un arreglo válido antes de iterar
    if (Array.isArray(sala.equipamiento)) {
      sala.equipamiento.forEach(eq => {
        // Inyecta el objeto extendiéndolo con referencias cruzadas del id y denominación del salón de origen
        localInventario.push({ ...eq, id_salon_actual: sala.id, salon_nombre: sala.salon_nombre });
      });
    }
  });

  /**
   * Función interna encargada de construir e inyectar el árbol HTML y vincular los escuchadores de eventos.
   */
  function drawView() {
    // Inyección dinámica de la grilla de datos y estructura de la tabla mediante Template Literals
    container.innerHTML = `
      <div class="data-section">
        <div class="data-header">
          <h2 class="data-title">Inventario de Objetos y Equipamiento Técnico</h2>
          <button type="button" class="btn-primary" id="btn-alta-objeto">+ Registrar Nuevo Activo / Objeto</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="cursor:pointer;" data-col="id">ID Objeto ${getArrow('id')}</th>
              <th style="cursor:pointer;" data-col="objeto">Descripción Asset ${getArrow('objeto')}</th>
              <th style="cursor:pointer;" data-col="salon_nombre">Ubicación Asignada ${getArrow('salon_nombre')}</th>
              <th style="cursor:pointer;" data-col="funciona">Estado Operativo ${getArrow('funciona')}</th>
              <th>Operaciones Técnicas</th>
            </tr>
          </thead>
          <tbody>
            ${localInventario.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No hay objetos registrados en el sistema.</td></tr>` : ''}
            ${localInventario.map(obj => `
              <tr>
                <td>#${obj.id}</td>
                <td><strong>${obj.objeto}</strong></td>
                <td>${obj.salon_nombre}</td>
                <td>
                  <span style="font-weight:700; color: ${obj.funciona ? 'var(--color-accent-green)' : 'var(--color-accent-red)'};">
                    ${obj.funciona ? '● Operativo (Disponible)' : '▲ Dañado (Fuera de Servicio)'}
                  </span>
                </td>
                <td>
                  <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt;" data-action="editar-obj" data-id="${obj.id}">Gestionar</button>
                  <button class="btn-primary" style="padding:4px 8px; font-size:8.5pt; background:var(--color-accent-red); border-color:var(--color-accent-red);" data-action="eliminar-obj" data-id="${obj.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Filtros de Ordenación Multidireccional: Recorre y asigna el comportamiento de ordenamiento a las columnas válidas
    container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-col');
        // Alterna el flag booleano si se vuelve a clickear la columna activa, de lo contrario inicializa en verdadero
        sortConfig.asc = (sortConfig.field === field) ? !sortConfig.asc : true;
        sortConfig.field = field;

        // Aplica el algoritmo de ordenamiento nativo mutando el arreglo intermedio en memoria
        localInventario.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          // Tratamiento seguro de comparación tipada para cadenas de texto (alfanumérico local)
          if (typeof valA === 'string') return sortConfig.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          // Operación matemática simple para tipos numéricos o booleanos nativos
          return sortConfig.asc ? valA - valB : valB - valA;
        });
        drawView(); // Re-renderiza la vista local tras finalizar el ordenamiento
      });
    });

    // Vincula el manejador de clic para la apertura del formulario de creación de nuevos activos
    container.querySelector('#btn-alta-objeto').addEventListener('click', () => abrirFormularioObjeto(false));
    
    // Vincula individualmente el botón de gestión técnica para modificar los activos existentes
    container.querySelectorAll('[data-action="editar-obj"]').forEach(btn => {
      btn.addEventListener('click', () => abrirFormularioObjeto(true, btn.getAttribute('data-id')));
    });
    
    // Vincula individualmente el botón de eliminación física definitiva para purgar del inventario
    container.querySelectorAll('[data-action="eliminar-obj"]').forEach(btn => {
      btn.addEventListener('click', () => eliminarObjeto(btn.getAttribute('data-id')));
    });
  }

  /**
   * Resuelve visualmente el indicador de dirección o estado de ordenación de una columna.
   * @param {string} field - Atributo técnico de la columna.
   * @returns {string} Símbolo visual de dirección ('▲', '▼' o '↕').
   */
  function getArrow(field) {
    if (sortConfig.field !== field) return '↕';
    return sortConfig.asc ? '▲' : '▼';
  }

  /**
   * Genera e inyecta dinámicamente la estructura del formulario modal para altas o modificaciones de infraestructura.
   * @param {boolean} esEdicion - Define si el contexto operacional corresponde a una actualización.
   * @param {number|string|null} id - ID del objeto a consultar en caso de edición.
   */
  function abrirFormularioObjeto(esEdicion = false, id = null) {
    // Instancia un payload estructural inicial o de respaldo por defecto
    let objetoExistente = { id: Date.now(), objeto: '', id_salon_actual: localSalones[0]?.id, funciona: true };
    if (esEdicion) {
      objetoExistente = localInventario.find(o => o.id === parseInt(id));
    }

    // Construcción de los campos de captura HTML con selectores vinculados al padrón de salones universitarios
    const camposHTML = `
      <div class="form-group">
        <label>Descripción / Denominación del Activo:</label>
        <input type="text" name="objeto" value="${objetoExistente.objeto}" ${esEdicion ? 'disabled' : ''} required class="form-control" placeholder="Ej: Proyector Epson X41+">
      </div>
      <div class="form-group">
        <label>Ubicación Física Asignada (Aula Destino):</label>
        <select name="id_salon_destino" class="form-control">
          ${localSalones.map(s => `<option value="${s.id}" ${objetoExistente.id_salon_actual === s.id ? 'selected' : ''}>${s.salon_nombre}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Estado de Integridad Técnica:</label>
        <select name="funciona" class="form-control">
          <option value="true" ${objetoExistente.funciona ? 'selected' : ''}>Operativo (Disponible Inmediato)</option>
          <option value="false" ${!objetoExistente.funciona ? 'selected' : ''}>Dañado (Fuera de Servicio)</option>
        </select>
      </div>
    `;

    // Lanza la ventana emergente compartida enviando los parámetros estructurales y la rutina callback asíncrona
    abrirModal(
      esEdicion ? `Control de Infraestructura: #${objetoExistente.id}` : "Registrar Objeto en Inventario",
      "Modifique las dependencias de hardware o asigne un nuevo espacio físico para los activos institucionales.",
      camposHTML,
      async (datosFormulario) => {
        const idDestino = parseInt(datosFormulario.id_salon_destino);
        const funcionaBoolean = datosFormulario.funciona === "true"; // Parseo manual a booleano real primitivo

        if (esEdicion) {
          // Si la ubicación seleccionada difiere de la actual, se ejecuta un proceso de transferencia técnica
          if (idDestino !== objetoExistente.id_salon_actual) {
            // Intenta consumir de forma prioritaria el wrapper local expuesto en el objeto global API
            await window.StudyRoomAPI.transferirObjeto?.(objetoExistente.id, idDestino)
              .catch(async () => {
                // Si el método no está implementado o falla, acude al fallback HTTP directo del backend
                await fetch(`http://localhost:3000/api/ranking/transferir`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ id_objeto: objetoExistente.id, id_salon_destino: idDestino })
                });
              });
          }
          // Actualización asíncrona complementaria del estado funcional operativo del ítem
          await fetch(`http://localhost:3000/api/ranking/objeto/${objetoExistente.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ funciona: funcionaBoolean })
          }).catch(() => {}); // Absorbe de manera controlada posibles fallos de red remota
        } else {
          // Flujo alternativo: Inserción y persistencia de un Nuevo Activo físico vía verbo POST
          await fetch(`http://localhost:3000/api/ranking/objeto`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ objeto: datosFormulario.objeto, id_salon: idDestino, funciona: funcionaBoolean })
          }).catch(() => {});
        }

        renderObjetos(container); // Fuerza un ciclo de recarga integral de los datos y reconstrucción de la UI
      }
    );
  }

  /**
   * Envía la solicitud de desvinculación o baja lógica definitiva de un activo tecnológico.
   * @param {number|string} id - ID único del objeto a eliminar del inventario global.
   */
  async function eliminarObjeto(id) {
    // Solicita confirmación explícita mediante un diálogo bloqueante del navegador nativo
    if (confirm(`¿Desea eliminar permanentemente el objeto #${id} del inventario de hardware?`)) {
      // Realiza la petición asíncrona DELETE al endpoint simulado del servidor
      await fetch(`http://localhost:3000/api/ranking/objeto/${id}`, { method: 'DELETE' }).catch(() => {});
      renderObjetos(container); // Re-renderiza de inmediato para sincronizar los cambios reflejados
    }
  }

  // Ejecución inicial de pintado del componente al instanciarse la vista
  drawView();
}