import { mostrarToast } from '../main.js';

let usuarioActual = null;
let datosOriginales = {};

export async function renderUsuarioPerfil(root) {
  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Mi perfil</h1>
        <p class="page-sub">Edita tus datos personales y mira tu historial</p>
      </div>
    </div>

    <div class="perfil-layout">
      <div>
        <div class="perfil-sidebar-card">
          <div class="perfil-avatar" id="p-avatar">-</div>
          <div class="perfil-nombre" id="p-nombre">Cargando...</div>
          <div class="perfil-usuario" id="p-usuario">@usuario</div>
          <div class="perfil-nivel nivel-normal" id="p-nivel">NORMAL</div>
          <div class="puntaje-section">
            <div class="puntaje-label">Puntaje actual</div>
            <div class="puntaje-valor" id="p-puntaje">-</div>
            <div class="puntaje-bar"><div class="puntaje-fill" id="p-puntaje-bar"></div></div>
            <div class="puntaje-escala"><span>0</span><span>80 Normal</span><span>150 Premium</span></div>
          </div>
          <div class="perfil-meta">
            <div class="perfil-meta-item"><span class="perfil-meta-key">Rol</span><span class="perfil-meta-val" id="p-rol">-</span></div>
            <div class="perfil-meta-item"><span class="perfil-meta-key">Email</span><span class="perfil-meta-val" id="p-email">-</span></div>
            <div class="perfil-meta-item"><span class="perfil-meta-key">Miembro desde</span><span class="perfil-meta-val" id="p-desde">-</span></div>
          </div>
        </div>
      </div>

      <div class="perfil-main-col">
        <div class="edit-card">
          <div class="edit-card-title">Editar datos personales</div>
          <div class="form-grid-2">
            <div class="form-group"><label class="form-label" for="edit-nombre">Nombre completo</label><input class="form-input" id="edit-nombre" type="text"></div>
            <div class="form-group"><label class="form-label" for="edit-usuario">Nombre de usuario</label><input class="form-input input-readonly" id="edit-usuario" type="text" readonly></div>
          </div>
          <div class="form-group"><label class="form-label" for="edit-email">Email universitario</label><input class="form-input input-readonly" id="edit-email" type="email" readonly></div>
          <div class="form-group"><label class="form-label" for="edit-telefono">Numero de telefono</label><input class="form-input" id="edit-telefono" type="tel" placeholder="Ej: 11-4521-3322"></div>
          <div class="form-actions">
            <button class="btn-primary" id="btn-guardar-perfil">Guardar cambios</button>
            <button class="btn-outline" id="btn-cancelar-edicion">Cancelar</button>
          </div>
          <div class="success-msg" id="success-msg">Cambios guardados correctamente</div>
        </div>

        <div class="edit-card">
          <div class="edit-card-title">Cambiar contrasena</div>
          <div class="form-group"><label class="form-label" for="pass-actual">Contrasena actual</label><input class="form-input" id="pass-actual" type="password"></div>
          <div class="form-grid-2">
            <div class="form-group"><label class="form-label" for="pass-nueva">Nueva contrasena</label><input class="form-input" id="pass-nueva" type="password"></div>
            <div class="form-group"><label class="form-label" for="pass-repetir">Repetir contrasena</label><input class="form-input" id="pass-repetir" type="password"></div>
          </div>
          <div id="pass-error" class="pass-msg pass-msg-error"></div>
          <div id="pass-ok" class="pass-msg pass-msg-ok">Contrasena actualizada</div>
          <button class="btn-secondary" id="btn-cambiar-password">Actualizar contrasena</button>
        </div>

        <div class="edit-card">
          <div class="edit-card-title">Ultimas reservas</div>
          <div id="historial-perfil"><div class="historial-loading">Cargando reservas...</div></div>
        </div>
      </div>
    </div>
  `;

  await cargarPerfil();
  await cargarHistorial();
  document.getElementById('btn-guardar-perfil').addEventListener('click', guardarPerfil);
  document.getElementById('btn-cancelar-edicion').addEventListener('click', cancelarEdicion);
  document.getElementById('btn-cambiar-password').addEventListener('click', cambiarPassword);
}

async function cargarPerfil() {
  const usuario = StudyRoomAPI.usuarioActual();
  const idUsuario = usuario?.id || 1;

  try {
    usuarioActual = await StudyRoomAPI.getUsuario(idUsuario);
  } catch (err) {
    // DATOS DE PRUEBA: si el backend no responde (por ejemplo, porque
    // todavia no esta corriendo), mostramos el usuario guardado en el
    // login simulado o, si no hay ninguno, un usuario de relleno fijo.
    // Avisamos con un toast para no ocultar el error silenciosamente.
    usuarioActual = usuario || {
      id: 1,
      nombre: 'Valeria Huertas',
      usuario: 'vhuertas',
      email: 'v.huertas@fi.uba.ar',
      puntaje: 130,
      rol: 'usuario',
      num_telefono: '11-4521-3322',
    };
    mostrarToast('No se pudo conectar con el servidor: mostrando datos de prueba', 'warn');
  }

  datosOriginales = { ...usuarioActual };
  renderPerfil(usuarioActual);
}

function renderPerfil(u) {
  const iniciales = u.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const setId = (id) => document.getElementById(id);

  setId('p-avatar').textContent = iniciales;
  setId('p-nombre').textContent = u.nombre;
  // u.usuario puede no existir (ej: el usuario simulado del login solo trae
  // id/nombre/email/rol/puntaje), asi que armamos un alias de respaldo.
  setId('p-usuario').textContent = `@${u.usuario || u.email?.split('@')[0] || 'usuario'}`;
  setId('p-puntaje').textContent = `${u.puntaje} pts`;
  setId('p-rol').textContent = u.rol === 'administrador' ? 'Administrador' : 'Estudiante';
  setId('p-email').textContent = u.email;
  setId('p-desde').textContent = 'FIUBA 2026';
  setId('p-puntaje-bar').style.width = `${Math.min((u.puntaje / 200) * 100, 100)}%`;

  const nivelEl = setId('p-nivel');
  nivelEl.className = 'perfil-nivel';
  if (u.puntaje >= 150) {
    nivelEl.textContent = 'PREMIUM';
    nivelEl.classList.add('nivel-premium');
  } else if (u.puntaje >= 80) {
    nivelEl.textContent = 'NORMAL';
    nivelEl.classList.add('nivel-normal');
  } else {
    nivelEl.textContent = 'RESTRINGIDO';
    nivelEl.classList.add('nivel-restringido');
  }

  setId('edit-nombre').value = u.nombre || '';
  setId('edit-usuario').value = u.usuario || '';
  setId('edit-email').value = u.email || '';
  setId('edit-telefono').value = u.num_telefono || '';
}

async function guardarPerfil() {
  const nombre = document.getElementById('edit-nombre').value.trim();
  const telefono = document.getElementById('edit-telefono').value.trim();

  if (!nombre) {
    mostrarToast('El nombre no puede estar vacio', 'err');
    return;
  }

  try {
    await StudyRoomAPI.actualizarUsuario(usuarioActual.id, {
      nombre,
      num_telefono: telefono || null,
    });
  } catch (err) {
    mostrarToast('Cambios guardados localmente (demo)', 'warn');
  }

  usuarioActual.nombre = nombre;
  usuarioActual.num_telefono = telefono;
  datosOriginales = { ...usuarioActual };

  const raw = sessionStorage.getItem('usuario');
  if (raw) {
    const u = JSON.parse(raw);
    u.nombre = nombre;
    sessionStorage.setItem('usuario', JSON.stringify(u));
  }

  renderPerfil(usuarioActual);
  const msg = document.getElementById('success-msg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 3000);
  mostrarToast('Perfil actualizado', 'ok');
}

function cancelarEdicion() {
  document.getElementById('edit-nombre').value = datosOriginales.nombre || '';
  document.getElementById('edit-telefono').value = datosOriginales.num_telefono || '';
  mostrarToast('Cambios descartados', 'warn');
}

function cambiarPassword() {
  const actual = document.getElementById('pass-actual').value;
  const nueva = document.getElementById('pass-nueva').value;
  const repetir = document.getElementById('pass-repetir').value;
  const errEl = document.getElementById('pass-error');
  const okEl = document.getElementById('pass-ok');

  errEl.style.display = 'none';
  okEl.style.display = 'none';

  if (!actual || !nueva || !repetir) {
    errEl.textContent = 'Completa todos los campos.';
    errEl.style.display = 'block';
    return;
  }
  if (nueva.length < 6) {
    errEl.textContent = 'La contrasena debe tener al menos 6 caracteres.';
    errEl.style.display = 'block';
    return;
  }
  if (nueva !== repetir) {
    errEl.textContent = 'Las contrasenas no coinciden.';
    errEl.style.display = 'block';
    return;
  }

  okEl.style.display = 'block';
  document.getElementById('pass-actual').value = '';
  document.getElementById('pass-nueva').value = '';
  document.getElementById('pass-repetir').value = '';
  mostrarToast('Contrasena actualizada', 'ok');
}

async function cargarHistorial() {
  const container = document.getElementById('historial-perfil');
  const idUsuario = usuarioActual?.id || 1;

  try {
    const reservas = await StudyRoomAPI.getReservasUsuario(idUsuario);
    if (!reservas.length) {
      container.innerHTML = '<div class="historial-loading">No tenes reservas registradas todavia.</div>';
      return;
    }

    container.innerHTML = '';
    reservas.slice(0, 5).forEach((r) => {
      const fecha = new Date(r.fecha_hora_inicio).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const horaI = new Date(r.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const horaF = new Date(r.fecha_hora_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const badgeClass = {
        pendiente: 'badge-busy',
        'en curso': 'badge-celeste',
        finalizada: 'badge-ok',
        cancelada: 'badge-maint',
      }[r.estado] || 'badge-ok';

      const div = document.createElement('div');
      div.className = 'reserva-item';
      div.innerHTML = `
        <div>
          <div class="reserva-sala">${r.salon_nombre || `Sala #${r.id_salon}`}</div>
          <div class="reserva-fecha">${fecha} - ${horaI}-${horaF}</div>
        </div>
        <span class="badge ${badgeClass}">${r.estado}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<div class="historial-loading">No se pudieron cargar las reservas.</div>';
  }
}
