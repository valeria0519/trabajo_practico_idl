let SALAS = [];

export async function renderUsuarioSalas(root) {
  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Salas disponibles</h1>
        <p class="page-sub" id="fecha-label">Cargando...</p>
      </div>
      <button type="button" class="btn-primary" data-tab="reserva">+ Nueva reserva</button>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-num stat-ok" id="stat-libres">-</div><div class="stat-label">Libres ahora</div></div>
      <div class="stat-card"><div class="stat-num stat-warning" id="stat-ocupadas">-</div><div class="stat-label">Ocupadas</div></div>
      <div class="stat-card"><div class="stat-num stat-error" id="stat-mant">-</div><div class="stat-label">Mantenimiento</div></div>
      <div class="stat-card"><div class="stat-num stat-info" id="stat-total">-</div><div class="stat-label">Total de salas</div></div>
    </div>

    <div class="filter-bar">
      <input class="filter-input" type="date" id="filtro-fecha">
      <select class="filter-input" id="filtro-cap">
        <option value="0">Capacidad: todos</option>
        <option value="4">Cap. >= 4</option>
        <option value="6">Cap. >= 6</option>
        <option value="10">Cap. >= 10</option>
      </select>
      <select class="filter-input" id="filtro-estado">
        <option value="todos">Todos los estados</option>
        <option value="disponible">Solo disponibles</option>
      </select>
      <span class="filter-count" id="resultado-count"></span>
    </div>

    <div class="rooms-grid" id="rooms-grid"></div>
    <div class="empty-state hidden" id="empty-state">
      <div class="empty-icon">?</div>
      <div class="empty-title">Sin resultados</div>
      <p class="empty-sub">No hay salas que coincidan con los filtros.</p>
      <button class="btn-primary" id="btn-reset-filtros">Limpiar filtros</button>
    </div>
  `;

  setFechaHoy();
  await cargarSalones();
  registrarFiltros();
}

async function cargarSalones() {
  try {
    SALAS = await StudyRoomAPI.getSalones();
    actualizarStats(SALAS);
    renderSalas(SALAS);
  } catch (err) {
    document.getElementById('rooms-grid').innerHTML = `
      <div class="server-error">No se pudo conectar al servidor. Verifica que el backend este corriendo.</div>
    `;
  }
}

function setFechaHoy() {
  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById('fecha-label').textContent = `Hoy - ${capitalizar(fechaTexto)}`;
  document.getElementById('filtro-fecha').value = hoy.toISOString().slice(0, 10);
}

function actualizarStats(salas) {
  document.getElementById('stat-libres').textContent = salas.filter((s) => s.estado === 'disponible').length;
  document.getElementById('stat-ocupadas').textContent = salas.filter((s) => s.estado === 'ocupado').length;
  document.getElementById('stat-mant').textContent = salas.filter((s) => s.estado === 'mantenimiento').length;
  document.getElementById('stat-total').textContent = salas.length;
}

function renderSalas(salas) {
  const grid = document.getElementById('rooms-grid');
  const emptyState = document.getElementById('empty-state');
  const count = document.getElementById('resultado-count');

  grid.innerHTML = '';

  if (!salas.length) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    count.textContent = '0 salas';
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  count.textContent = `${salas.length} sala${salas.length !== 1 ? 's' : ''}`;
  salas.forEach((sala, index) => grid.appendChild(crearCard(sala, index)));
}

function crearCard(sala, index) {
  const card = document.createElement('div');
  card.className = `room-card${sala.estado !== 'disponible' ? ' unavailable' : ''}`;
  card.style.setProperty('--delay-i', `${index * 0.05}s`);

  const estado = {
    disponible: ['badge-ok', 'Disponible'],
    ocupado: ['badge-busy', 'Ocupada'],
    mantenimiento: ['badge-maint', 'En mantenimiento'],
  }[sala.estado] || ['badge-maint', sala.estado || 'Sin estado'];

  const media = parseFloat(sala.media_puntuacion) || 0;
  const estrellas = '*'.repeat(Math.round(media)) + '-'.repeat(5 - Math.round(media));
  const equipos = Array.isArray(sala.equipamiento) ? sala.equipamiento : [];

  card.innerHTML = `
    <div class="room-card-top">
      <div>
        <div class="room-card-name">${sala.salon_nombre}</div>
        <div class="room-card-loc">Piso ${sala.piso} - ${sala.tipo}</div>
      </div>
      <span class="badge ${estado[0]}">${estado[1]}</span>
    </div>
    <div class="room-ranking" title="Puntuacion promedio">
      <span class="stars">${estrellas}</span>
      <span class="media-val">${media > 0 ? media.toFixed(1) : 'Sin calificaciones'}</span>
    </div>
    <div class="room-card-chips">
      ${equipos.map((e) => `<span class="chip${e.funciona === false ? ' chip-roto' : ''}">${e.funciona === false ? '! ' : ''}${e.objeto}</span>`).join('') || '<span class="chip">Sin equipamiento registrado</span>'}
    </div>
    <div class="room-card-footer">
      <span class="room-cap-info">Cap. ${sala.capacidad}</span>
      <button type="button" class="btn-reservar" ${sala.estado !== 'disponible' ? 'disabled' : ''}>
        ${sala.estado === 'disponible' ? 'Reservar ->' : 'No disponible'}
      </button>
    </div>
  `;

  if (sala.estado === 'disponible') {
    card.querySelector('.btn-reservar').addEventListener('click', () => {
      window.navigateUsuario('reserva', { salaId: sala.id });
    });
  }

  return card;
}

function registrarFiltros() {
  ['filtro-fecha', 'filtro-cap', 'filtro-estado'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', aplicarFiltros);
  });
  document.getElementById('btn-reset-filtros')?.addEventListener('click', resetFiltros);
}

function aplicarFiltros() {
  const capMin = parseInt(document.getElementById('filtro-cap').value, 10) || 0;
  const estado = document.getElementById('filtro-estado').value;
  const resultado = SALAS.filter((sala) => {
    if (sala.capacidad < capMin) return false;
    if (estado === 'disponible' && sala.estado !== 'disponible') return false;
    return true;
  });
  actualizarStats(resultado);
  renderSalas(resultado);
}

function resetFiltros() {
  document.getElementById('filtro-cap').value = '0';
  document.getElementById('filtro-estado').value = 'todos';
  actualizarStats(SALAS);
  renderSalas(SALAS);
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
