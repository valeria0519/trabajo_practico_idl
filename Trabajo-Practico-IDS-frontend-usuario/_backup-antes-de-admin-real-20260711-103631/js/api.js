// ============================================================
// api.js — StudyRoom FIUBA
// Módulo centralizado de llamadas fetch al backend.
// Todos los demás JS lo usan: const API = window.StudyRoomAPI
// ============================================================

const API_URL = 'http://localhost:3000/api';

/*
  Wrapper alrededor de fetch().
  Cuando el backend (Node/Express) todavia no esta corriendo, fetch() no
  devuelve una respuesta HTTP: lanza directamente un TypeError de red
  ("Failed to fetch"), que para alguien sin experiencia no dice nada util.
  Esta funcion detecta ese caso puntual y lo reemplaza por un mensaje en
  español que explica que hacer. Los demas errores (404, 500, etc.) se
  siguen manejando en cada metodo con el "if (!res.ok)".
*/
async function fetchAPI(url, options) {
  try {
    return await fetch(url, options);
  } catch (errorDeRed) {
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). ` +
      'Verificá que el backend (Node/Express) esté corriendo.'
    );
  }
}

const StudyRoomAPI = {

  // ── SALONES ────────────────────────────────────────────────

  async getSalones() {
    const res = await fetchAPI(`${API_URL}/salones`);
    if (!res.ok) throw new Error('Error al obtener salones');
    return res.json();
  },

  async getSalon(id) {
    const res = await fetchAPI(`${API_URL}/salones/${id}`);
    if (!res.ok) throw new Error('Salón no encontrado');
    return res.json();
  },

  async cambiarEstadoSalon(id, estado) {
    const res = await fetchAPI(`${API_URL}/salones/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al cambiar estado');
    return json;
  },

  async crearSalon(data) {
    const res = await fetchAPI(`${API_URL}/salones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async editarSalon(id, data) {
    const res = await fetchAPI(`${API_URL}/salones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async eliminarSalon(id) {
    const res = await fetchAPI(`${API_URL}/salones/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ── RESERVAS ───────────────────────────────────────────────

  async getReservas() {
    const res = await fetchAPI(`${API_URL}/reservas`);
    if (!res.ok) throw new Error('Error al obtener reservas');
    return res.json();
  },

  async getReservasUsuario(idUsuario) {
    const res = await fetchAPI(`${API_URL}/reservas/usuario/${idUsuario}`);
    if (!res.ok) throw new Error('Error al obtener reservas del usuario');
    return res.json();
  },

  async crearReserva(data) {
    const res = await fetchAPI(`${API_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al crear reserva');
    return json;
  },

  async cambiarEstadoReserva(id, estado) {
    const res = await fetchAPI(`${API_URL}/reservas/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    return res.json();
  },

  async editarReserva(id, data) {
    const res = await fetchAPI(`${API_URL}/reservas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al editar reserva');
    return json;
  },

  // ── USUARIOS ───────────────────────────────────────────────

  async getUsuarios() {
    const res = await fetchAPI(`${API_URL}/usuarios`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },

  async ajustarPuntaje(idUsuario, delta) {
    const res = await fetchAPI(`${API_URL}/usuarios/${idUsuario}/puntaje`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    return res.json();
  },

  async eliminarUsuario(idUsuario) {
    const res = await fetchAPI(`${API_URL}/usuarios/${idUsuario}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al eliminar usuario');
    return json;
  },

  // ── EQUIPAMIENTO ───────────────────────────────────────────

  async reportarRoto(idEquipo) {
    const res = await fetchAPI(`${API_URL}/equipamiento/${idEquipo}/roto`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al reportar');
    return json;
  },

  async crearObjeto(data) {
    const res = await fetchAPI(`${API_URL}/equipamiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al crear objeto');
    return json;
  },

  async editarObjeto(idEquipo, data) {
    const res = await fetchAPI(`${API_URL}/equipamiento/${idEquipo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al editar objeto');
    return json;
  },

  async eliminarObjeto(idEquipo) {
    const res = await fetchAPI(`${API_URL}/equipamiento/${idEquipo}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al eliminar objeto');
    return json;
  },

  // ── RANKING ────────────────────────────────────────────────

  async getRankingSalones() {
    const res = await fetchAPI(`${API_URL}/ranking/salones`);
    if (!res.ok) throw new Error('Error al obtener ranking de salones');
    return res.json();
  },

  async getRankingUsuarios() {
    const res = await fetchAPI(`${API_URL}/ranking/usuarios`);
    if (!res.ok) throw new Error('Error al obtener ranking de usuarios');
    return res.json();
  },

  async calificarSalon(data) {
    const res = await fetchAPI(`${API_URL}/ranking/calificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al calificar');
    return json;
  },

  // ── HELPERS ────────────────────────────────────────────────

  // Devuelve el nivel de acceso según puntaje
  nivelAcceso(puntaje) {
    if (puntaje >= 150) return { label: 'PREMIUM', color: 'var(--celeste-l)' };
    if (puntaje >= 80)  return { label: 'NORMAL',  color: 'var(--naranja-l)' };
    return                     { label: 'RESTRINGIDO', color: 'var(--error-l)' };
  },

  // Obtiene usuario logueado del sessionStorage
  usuarioActual() {
    const raw = sessionStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  }
};

window.StudyRoomAPI = StudyRoomAPI;

// Métodos adicionales para perfil
StudyRoomAPI.getUsuario = async function(id) {
  const res = await fetchAPI(`${API_URL}/usuarios/${id}`);
  if (!res.ok) throw new Error('Error al obtener usuario');
  return res.json();
};

StudyRoomAPI.actualizarUsuario = async function(id, data) {
  const res = await fetchAPI(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al actualizar');
  return json;
};

// Alias publicos en espanol para que las vistas nuevas y futuras tengan una API
// unica y descriptiva. Este archivo es el unico punto de conexion fetch al backend.
StudyRoomAPI.obtenerSalones = StudyRoomAPI.getSalones.bind(StudyRoomAPI);
StudyRoomAPI.obtenerSalon = StudyRoomAPI.getSalon.bind(StudyRoomAPI);
StudyRoomAPI.obtenerReservas = StudyRoomAPI.getReservas.bind(StudyRoomAPI);
StudyRoomAPI.obtenerReservasUsuario = StudyRoomAPI.getReservasUsuario.bind(StudyRoomAPI);
StudyRoomAPI.obtenerUsuarioActual = StudyRoomAPI.usuarioActual.bind(StudyRoomAPI);
StudyRoomAPI.obtenerUsuarios = StudyRoomAPI.getUsuarios.bind(StudyRoomAPI);
StudyRoomAPI.actualizarSalon = StudyRoomAPI.editarSalon.bind(StudyRoomAPI);
StudyRoomAPI.cancelarReserva = (id) => StudyRoomAPI.cambiarEstadoReserva(id, 'cancelada');

StudyRoomAPI.login = async function(email, password, rol = 'usuario') {
  const usuarios = await StudyRoomAPI.getUsuarios();
  const usuario = usuarios.find((u) => u.email === email && (!rol || u.rol === rol));
  if (!usuario || !password) throw new Error('Credenciales invalidas');
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
  return usuario;
};
