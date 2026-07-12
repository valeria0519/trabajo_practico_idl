// ============================================================================
// js/views/rankings.js — Panel de Auditoría, Estadísticas y Rankings de Calidad
// Módulo de interfaz para evaluar el rendimiento de espacios y reputación de usuarios.
// ============================================================================

// Arreglo local intermedio para almacenar el listado de valoración de las aulas 
let localRankingSalones = []; 
// Arreglo local intermedio para almacenar el padrón de reputación de usuarios 
let localRankingUsers = []; 
// Configuración de ordenamiento por defecto para las aulas: prioriza mayor cantidad de estrellas 
let sortAulasConfig = { field: 'estrellas', asc: false }; 
// Configuración de ordenamiento por defecto para usuarios: prioriza mayor puntaje acumulado 
let sortUsersConfig = { field: 'puntaje', asc: false }; 

/**
 * Renderiza el ranking de valoración y comentarios de las aulas universitarias.
 * @param {HTMLElement} container - Elemento del DOM donde se inyectará la vista.
 */
export async function renderRankingAulas(container) { 
  localRankingSalones = (await window.StudyRoomAPI.getRankingSalones() || []).map(s => ({
    id: s.id,
    salon_nombre: s.salon_nombre,
    estrellas: parseFloat(s.media_puntuacion) || 0,
    comentarios: parseInt(s.total_calificaciones) || 0,
    reservas: parseInt(s.total_reservas) || 0
  }));

  /**
   * Genera e inyecta la interfaz de usuario para la tabla de posiciones de las aulas.
   */
  function draw() { 
    // Inyección de la estructura visual mediante Template Literals de JavaScript 
    container.innerHTML = ` 
      <div class="data-section"> 
        <div class="data-header"> 
          <h2 class="data-title">Aulas Mejor Valoradas por la Comunidad</h2> 
        </div> 
        <table class="data-table"> 
          <thead> 
            <tr> 
              <th style="cursor:pointer;" data-col="id">ID ${getArrow('id')}</th> 
              <th style="cursor:pointer;" data-col="salon_nombre">Espacio Universitario ${getArrow('salon_nombre')}</th> 
              <th style="cursor:pointer;" data-col="estrellas">Puntuación Promedio ${getArrow('estrellas')}</th> 
              <th style="cursor:pointer;" data-col="comentarios">Reseñas Registradas ${getArrow('comentarios')}</th> 
              <th style="cursor:pointer;" data-col="reservas">Reservas Finalizadas ${getArrow('reservas')}</th> 
            </tr> 
          </thead> 
          <tbody> 
            ${localRankingSalones.map(s => ` 
              <tr> 
                <td>#${s.id}</td> 
                <td><strong>${s.salon_nombre}</strong></td> 
                <td style="font-weight:700; color: #eab308;">⭐ ${s.estrellas.toFixed(1)} / 5.0</td> 
                <td>${s.comentarios} opiniones</td> 
                <td>${s.reservas} reservas</td> 
              </tr> 
            `).join('')} 
          </tbody> 
        </table> 
      </div> 
    `; 

    // Escucha de eventos de ordenación en las cabeceras de la sección de aulas 
    container.querySelectorAll('th[data-col]').forEach(th => { 
      th.addEventListener('click', () => { 
        const field = th.getAttribute('data-col'); 
        // Invierte el sentido del ordenamiento si se pulsa sobre la misma columna 
        sortAulasConfig.asc = (sortAulasConfig.field === field) ? !sortAulasConfig.asc : true; 
        sortAulasConfig.field = field; 
        
        // Ejecuta la clasificación por ordenación aritmética simple 
        localRankingSalones.sort((a,b) => sortAulasConfig.asc ? a[field] - b[field] : b[field] - a[field]); 
        // Aplica un fallback de ordenación lexicográfica regional si la celda a evaluar contiene cadenas de texto 
        if(typeof localRankingSalones[0]?.[field] === 'string') { 
          localRankingSalones.sort((a,b) => sortAulasConfig.asc ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])); 
        } 
        draw(); // Redibuja la vista local con los nuevos índices posicionados 
      }); 
    }); 
  } 

  /**
   * Helper privado para resolver las flechas indicadoras de ordenación de salones.
   */
  function getArrow(field) { 
    if (sortAulasConfig.field !== field) return '↕'; 
    return sortAulasConfig.asc ? '▲' : '▼'; 
  } 

  // Lanza el ciclo de renderizado inmediato al inicializar el módulo 
  draw(); 
} 

/**
 * Renderiza el cuadro de honor y reputación del padrón unificado de usuarios.
 * @param {HTMLElement} container - Elemento del DOM donde se inyectará la vista.
 */
export async function renderRankingUsuarios(container) { 
  localRankingUsers = await window.StudyRoomAPI.getRankingUsuarios(); 

  /**
   * Genera e inyecta la interfaz de usuario para la tabla de posiciones de usuarios.
   */
  function draw() { 
    // Inyección de la estructura de control de usuarios mediante Template Literals 
    container.innerHTML = ` 
      <div class="data-section"> 
        <div class="data-header"> 
          <h2 class="data-title">Cuadro de Honor y Reputación de Usuarios</h2> 
        </div> 
        <table class="data-table"> 
          <thead> 
            <tr> 
              <th>Puesto</th> 
              <th style="cursor:pointer;" data-col="legajo">Legajo / ID Unificado ${getArrow('legajo')}</th> 
              <th style="cursor:pointer;" data-col="nombre">Estudiante / Docente ${getArrow('nombre')}</th> 
              <th style="cursor:pointer;" data-col="puntaje">Puntaje de Reputación ${getArrow('puntaje')}</th> 
              <th>Nivel de Acceso</th> 
            </tr> 
          </thead> 
          <tbody> 
            ${localRankingUsers.map((u, idx) => { 
              // Invoca dinámicamente la lógica empresarial global de la API para obtener etiquetas y colores (PREMIUM, NORMAL, etc.) 
              const nivel = window.StudyRoomAPI.nivelAcceso(u.puntaje); 
              return ` 
                <tr> 
                  <td><strong>#${idx + 1}</strong></td> 
                  <td>#${u.legajo || u.id}</td> 
                  <td><strong>${u.nombre}</strong> (${u.email})</td> 
                  <td style="color: var(--color-primary); font-weight:700;">${u.puntaje} pts</td> 
                  <td><span style="font-weight:600; color:${nivel.color};">${nivel.label}</span></td> 
                </tr> 
              `; 
            }).join('')} 
          </tbody> 
        </table> 
      </div> 
    `; 

    // Escucha de eventos de ordenación en las cabeceras de la sección de usuarios 
    container.querySelectorAll('th[data-col]').forEach(th => { 
      th.addEventListener('click', () => { 
        const field = th.getAttribute('data-col'); 
        // Alterna el indicador de dirección de ordenación si se repite clic en la misma columna 
        sortUsersConfig.asc = (sortUsersConfig.field === field) ? !sortUsersConfig.asc : true; 
        sortUsersConfig.field = field; 
        
        // Aplica el ordenamiento aritmético para puntajes e identificadores numéricos 
        localRankingUsers.sort((a,b) => sortUsersConfig.asc ? a[field] - b[field] : b[field] - a[field]); 
        // Aplica el ordenamiento lexicográfico si los campos a comparar corresponden a cadenas de caracteres string 
        if(typeof localRankingUsers[0]?.[field] === 'string') { 
          localRankingUsers.sort((a,b) => sortUsersConfig.asc ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])); 
        } 
        draw(); // Redibuja la UI local con los nuevos elementos reposicionados 
      }); 
    }); 
  } 

  /**
   * Helper privado para resolver las flechas indicadoras de ordenación de usuarios.
   */
  function getArrow(field) { 
    if (sortUsersConfig.field !== field) return '↕'; 
    return sortUsersConfig.asc ? '▲' : '▼'; 
  } 

  // Ejecuta el primer ciclo de dibujado de la tabla de usuarios 
  draw(); 
}
