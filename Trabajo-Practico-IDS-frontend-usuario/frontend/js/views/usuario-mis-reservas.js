import { mostrarToast } from '../main.js';

export async function renderUsuarioMisReservas(root) {
  root.innerHTML = `
    <div class="confirm-main">
      <div class="confirm-card hidden" id="confirm-card">
        <div class="confirm-icon">OK</div>
        <h1 class="confirm-title">Reserva creada</h1>
        <p class="confirm-sub">Tu turno fue registrado correctamente.</p>
        <div class="confirm-badge"><div class="badge-dot-state"></div>Estado: pendiente de confirmacion</div>
        <div class="confirm-details" id="confirm-details"></div>
        <div class="confirm-actions">
          <button type="button" class="btn-secondary" data-tab="reserva">Nueva reserva</button>
          <button type="button" class="btn-primary" data-tab="salas">Ver salas -></button>
        </div>
      </div>

      <div class="historial-section">
        <div class="historial-title">Mis reservas activas</div>
        <div class="historial-list" id="historial-list">
          <div class="loading-reservas">Cargando reservas...</div>
        </div>
      </div>
    </div>
  `;

  cargarDetalles();
  await cargarHistorial();
}

function cargarDetalles() {
  const raw = sessionStorage.getItem('reserva');
  const confirmCard = document.getElementById('confirm-card');

  if (!raw) {
    confirmCard.classList.add('hidden');
    return;
  }

  const reserva = JSON.parse(raw);
  confirmCard.classList.remove('hidden');
  let fechaFormateada = reserva.fecha;

  if (reserva.fecha?.includes('-')) {
    const [y, m, d] = reserva.fecha.split('-');
    fechaFormateada = `${d}/${m}/${y}`;
  }

  const filas = [
    { key: 'Nro. de reserva', val: reserva.id || '-' },
    { key: 'Sala', val: reserva.sala || '-', hl: true },
    { key: 'Ubicacion', val: reserva.loc || '-' },
    { key: 'Fecha', val: fechaFormateada || '-' },
    { key: 'Horario', val: reserva.hora || '-', hl: true },
    { key: 'Personas', val: reserva.personas || '-' },
    { key: 'Motivo', val: reserva.motivo || '-' },
  ];

  document.getElementById('confirm-details').innerHTML = filas
    .map((f) => `
      <div class="detail-row">
        <span class="detail-key">${f.key}</span>
        <span class="detail-val ${f.hl ? 'hl' : ''}">${f.val}</span>
      </div>
    `)
    .join('');

  sessionStorage.removeItem('reserva');
}

async function cargarHistorial() {
  const lista = document.getElementById('historial-list');
  const usuario = StudyRoomAPI.usuarioActual();
  const idUsuario = usuario?.id || 1;

  try {
    const reservas = await StudyRoomAPI.getReservasUsuario(idUsuario);
    const activas = reservas.filter((r) => r.estado !== 'finalizada' && r.estado !== 'cancelada');

    if (!activas.length) {
      lista.innerHTML = '<div class="empty-reservas">No tenes reservas activas.</div>';
      return;
    }

    lista.innerHTML = '';
    activas.forEach((res) => {
      const fecha = new Date(res.fecha_hora_inicio).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const horaI = new Date(res.fecha_hora_inicio).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const horaF = new Date(res.fecha_hora_fin).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const badgeClass = {
        pendiente: 'badge-busy',
        'en curso': 'badge-celeste',
      }[res.estado] || 'badge-ok';

      const item = document.createElement('div');
      item.className = 'historial-item';
      item.innerHTML = `
        <div class="hist-info">
          <span class="hist-sala">${res.salon_nombre || `Sala #${res.id_salon}`}</span>
          <span class="hist-fecha">${fecha} - ${horaI}-${horaF} - ID #${res.id}</span>
        </div>
        <div class="hist-actions">
          <span class="badge ${badgeClass}">${res.estado}</span>
          <button class="btn-cancel-res" data-reserva-id="${res.id}">Cancelar</button>
        </div>
      `;
      item.querySelector('.btn-cancel-res').addEventListener('click', async (event) => {
        await cancelarReserva(res.id, event.currentTarget);
      });
      lista.appendChild(item);
    });
  } catch (err) {
    lista.innerHTML = '<div class="empty-reservas">No se pudieron cargar las reservas.</div>';
  }
}

async function cancelarReserva(id, btn) {
  if (!confirm(`Cancelar la reserva #${id}?`)) return;

  try {
    await StudyRoomAPI.cambiarEstadoReserva(id, 'cancelada');
    const item = btn.closest('.historial-item');
    item?.classList.add('fade-out');
    setTimeout(() => item?.remove(), 300);
    mostrarToast('Reserva cancelada', 'ok');
  } catch (err) {
    mostrarToast(err.message || 'Error al cancelar la reserva', 'err');
  }
}
