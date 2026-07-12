let slotSeleccionado = null;
let salaActual = null;

const SLOTS = [
  { label: '08:00-10:00' },
  { label: '10:00-12:00' },
  { label: '12:00-14:00' },
  { label: '14:00-16:00' },
  { label: '16:00-18:00' },
  { label: '18:00-20:00' },
];

export async function renderUsuarioReserva(root, params = {}) {
  slotSeleccionado = null;
  salaActual = null;
  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Nueva reserva</h1>
        <p class="page-sub">Selecciona una sala y completa los datos</p>
      </div>
      <button type="button" class="btn-secondary" data-tab="salas">Volver a salas</button>
    </div>

    <div class="reserva-layout">
      <div class="reserva-form-col">
        <div class="form-card">
          <div class="form-card-title">Sala</div>
          <div class="form-group">
            <label class="form-label" for="sel-sala">Sala a reservar</label>
            <select class="form-input-field" id="sel-sala"><option value="">Selecciona una sala...</option></select>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card-title">Fecha y personas</div>
          <div class="form-grid-2">
            <div class="form-group"><label class="form-label" for="inp-fecha">Fecha</label><input class="form-input-field" id="inp-fecha" type="date"></div>
            <div class="form-group"><label class="form-label" for="inp-personas">Personas</label><input class="form-input-field" id="inp-personas" type="number" min="1" max="50" value="4"></div>
          </div>
          <div class="val-msg val-ok hidden" id="val-cap">Capacidad valida</div>
          <div class="val-msg val-warn hidden" id="val-cap-error">Supera la capacidad</div>
        </div>

        <div class="form-card">
          <div class="form-card-title">Horario</div>
          <div class="form-group">
            <label class="form-label">Selecciona una franja horaria</label>
            <div class="time-slots" id="time-slots"></div>
          </div>
          <div class="val-msg val-ok hidden" id="val-hora">Horario disponible</div>
        </div>

        <div class="form-card">
          <div class="form-card-title">Datos adicionales</div>
          <div class="form-group"><label class="form-label" for="inp-motivo">Motivo de la reserva</label><input class="form-input-field" id="inp-motivo" type="text" placeholder="Ej: TP Final Sistemas Operativos"></div>
          <div class="form-group"><label class="form-label" for="inp-obs">Observaciones (opcional)</label><input class="form-input-field" id="inp-obs" type="text" placeholder="Equipamiento adicional, etc."></div>
        </div>
      </div>

      <div class="resumen-col">
        <div class="resumen-card">
          <div class="resumen-title">Resumen de reserva</div>
          <div class="resumen-rows">
            <div class="resumen-row"><span class="resumen-key">Sala</span><span class="resumen-val hl" id="res-sala">-</span></div>
            <div class="resumen-row"><span class="resumen-key">Ubicacion</span><span class="resumen-val" id="res-loc">-</span></div>
            <div class="resumen-row"><span class="resumen-key">Fecha</span><span class="resumen-val" id="res-fecha">-</span></div>
            <div class="resumen-row"><span class="resumen-key">Horario</span><span class="resumen-val hl" id="res-hora">-</span></div>
            <div class="resumen-row"><span class="resumen-key">Personas</span><span class="resumen-val" id="res-per">-</span></div>
          </div>
          <div class="error-msg hidden" id="form-error">Completa todos los campos.</div>
          <button class="btn-primary btn-confirmar" id="btn-confirmar">Confirmar reserva -></button>
          <button type="button" class="btn-cancelar" data-tab="salas">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  setFechaHoy();
  renderSlots();
  await cargarSalas();
  bindReservaEvents();
  if (params.salaId) {
    document.getElementById('sel-sala').value = params.salaId;
    await onSalaChange();
  }
}

async function cargarSalas() {
  const salas = await StudyRoomAPI.getSalones();
  const sel = document.getElementById('sel-sala');
  sel.innerHTML = '<option value="">Selecciona una sala...</option>';
  salas.filter((s) => s.estado === 'disponible').forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    const reqStr = s.puntaje_minimo > 0 ? ` [min. ${s.puntaje_minimo} pts]` : '';
    opt.textContent = `${s.salon_nombre} - Piso ${s.piso} - Cap. ${s.capacidad}${reqStr}`;
    sel.appendChild(opt);
  });
}

function bindReservaEvents() {
  document.getElementById('sel-sala').addEventListener('change', onSalaChange);
  document.getElementById('inp-fecha').addEventListener('change', actualizarResumen);
  document.getElementById('inp-personas').addEventListener('change', validarPersonas);
  document.getElementById('btn-confirmar').addEventListener('click', confirmarReserva);
}

async function onSalaChange() {
  const id = document.getElementById('sel-sala').value;
  if (!id) {
    salaActual = null;
    limpiarResumen();
    ocultarMensajesValidacion();
    return;
  }

  salaActual = await StudyRoomAPI.getSalon(id);
  actualizarResumen();
  validarPersonas();

  const usuario = StudyRoomAPI.usuarioActual();
  if (usuario && salaActual.puntaje_minimo > usuario.puntaje) {
    mostrarError(`Tu puntaje (${usuario.puntaje}) es insuficiente para esta sala (minimo ${salaActual.puntaje_minimo})`);
  } else {
    ocultarError();
  }
}

function renderSlots() {
  const container = document.getElementById('time-slots');
  container.innerHTML = '';
  SLOTS.forEach((slot) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';
    btn.textContent = slot.label;
    btn.dataset.hora = slot.label;
    btn.addEventListener('click', () => seleccionarSlot(slot.label));
    container.appendChild(btn);
  });
}

function seleccionarSlot(hora) {
  slotSeleccionado = hora;
  document.querySelectorAll('.time-slot').forEach((btn) => btn.classList.toggle('selected', btn.dataset.hora === hora));
  document.getElementById('val-hora').classList.remove('hidden');
  actualizarResumen();
}

function setFechaHoy() {
  document.getElementById('inp-fecha').value = new Date().toISOString().slice(0, 10);
}

function validarPersonas() {
  const personas = parseInt(document.getElementById('inp-personas').value, 10) || 0;
  const valOk = document.getElementById('val-cap');
  const valErr = document.getElementById('val-cap-error');

  if (!salaActual) {
    ocultarMensajesValidacion();
    actualizarResumen();
    return;
  }

  valOk.classList.toggle('hidden', !(personas > 0 && personas <= salaActual.capacidad));
  valErr.classList.toggle('hidden', !(personas > salaActual.capacidad));
  valOk.textContent = `Capacidad valida - ${personas} de ${salaActual.capacidad}`;
  valErr.textContent = `Capacidad maxima: ${salaActual.capacidad} personas`;
  actualizarResumen();
}

function actualizarResumen() {
  const fechaVal = document.getElementById('inp-fecha')?.value;
  const personas = document.getElementById('inp-personas')?.value;
  if (salaActual) {
    document.getElementById('res-sala').textContent = salaActual.salon_nombre;
    document.getElementById('res-loc').textContent = `Piso ${salaActual.piso} - ${salaActual.tipo}`;
  }
  if (fechaVal) {
    const [yyyy, mm, dd] = fechaVal.split('-');
    document.getElementById('res-fecha').textContent = `${dd}/${mm}/${yyyy}`;
  }
  document.getElementById('res-hora').textContent = slotSeleccionado || '-';
  document.getElementById('res-per').textContent = personas || '-';
}

function limpiarResumen() {
  ['res-sala', 'res-loc', 'res-hora', 'res-per'].forEach((id) => {
    document.getElementById(id).textContent = '-';
  });
}

async function confirmarReserva() {
  const salaId = document.getElementById('sel-sala').value;
  const fecha = document.getElementById('inp-fecha').value;
  const personas = parseInt(document.getElementById('inp-personas').value, 10) || 0;
  const motivo = document.getElementById('inp-motivo').value.trim();

  if (!salaId || !fecha || !slotSeleccionado || !motivo || personas < 1) {
    mostrarError('Completa todos los campos obligatorios.');
    return;
  }
  if (salaActual && personas > salaActual.capacidad) {
    mostrarError('La cantidad de personas supera la capacidad.');
    return;
  }

  const [horaInicio, horaFin] = slotSeleccionado.split('-');
  const usuario = StudyRoomAPI.usuarioActual();
  const resultado = await StudyRoomAPI.crearReserva({
    id_usuario: usuario?.id || 1,
    id_salon: parseInt(salaId, 10),
    fecha_hora_inicio: `${fecha}T${horaInicio}:00`,
    fecha_hora_fin: `${fecha}T${horaFin}:00`,
  });

  sessionStorage.setItem('reserva', JSON.stringify({
    id: resultado.id,
    sala: salaActual?.salon_nombre || salaId,
    loc: `Piso ${salaActual?.piso}`,
    fecha,
    hora: slotSeleccionado,
    personas,
    motivo,
  }));
  window.navigateUsuario('mis-reservas');
}

function ocultarMensajesValidacion() {
  document.getElementById('val-cap')?.classList.add('hidden');
  document.getElementById('val-cap-error')?.classList.add('hidden');
  document.getElementById('val-hora')?.classList.add('hidden');
}

function mostrarError(msg) {
  const el = document.getElementById('form-error');
  el.classList.remove('hidden');
  el.textContent = msg;
}

function ocultarError() {
  document.getElementById('form-error')?.classList.add('hidden');
}
