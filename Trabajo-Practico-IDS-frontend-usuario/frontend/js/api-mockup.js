// ============================================================================
// js/api.js — Motor de API Mockup Persistente
// Simula latencia de red y operaciones CRUD utilizando localStorage del navegador.
// Ideal para desarrollo frontend independiente (Single Page Applications).
// ============================================================================

// --- DATOS SEMILLA (SEED DATA) ---
// Estructuras iniciales para poblar la base de datos simulada en la primera ejecución.

// Datos semilla para los salones/aulas de estudio disponibles
const SEED_SALONES = [
  { id: 1, salon_nombre: "Laboratorio de Sistemas", tipo: "laboratorio", piso: 2, capacidad: 35, estado: "disponible", equipamiento: [{ id: 101, objeto: "Proyector EPSON", funciona: true }] },
  { id: 2, salon_nombre: "Aula Magna", tipo: "aula", piso: 0, capacidad: 150, estado: "ocupado", equipamiento: [] },
  { id: 3, salon_nombre: "Sala de Lectura", tipo: "estudio", piso: 1, capacidad: 20, estado: "mantenimiento", equipamiento: [{ id: 102, objeto: "Pizarra Digital", funciona: false }] }
];

// Datos semilla para los usuarios registrados en el sistema
const SEED_USUARIOS = [
  { id: 1, nombre: "Juan Perez", legajo: "123456", email: "jperez@fi.uba.ar", rol: "administrador", puntaje: 200 },
  { id: 2, nombre: "Martín Gómez", legajo: "98541", email: "mgomez@fi.uba.ar", rol: "usuario", puntaje: 70 }
];

// Datos semilla para el historial de reservas de salones
const SEED_RESERVAS = [
  { id: 501, id_usuario: 2, id_salon: 1, fecha_hora_inicio: "2026-07-01T10:00", fecha_hora_fin: "2026-07-01T12:00", estado: "aprobada" }
];

/**
 * Inicializa el almacenamiento local (localStorage).
 * Si no existen las claves, guarda los arrays de datos semilla convertidos a JSON.
 */
function initStorage() {
  // Si no existen salones en localStorage, guarda el array SEED_SALONES serializado
  if (!localStorage.getItem('sr_salones')) localStorage.setItem('sr_salones', JSON.stringify(SEED_SALONES));
  // Si no existen usuarios en localStorage, guarda el array SEED_USUARIOS serializado
  if (!localStorage.getItem('sr_usuarios')) localStorage.setItem('sr_usuarios', JSON.stringify(SEED_USUARIOS));
  // Si no existen reservas en localStorage, guarda el array SEED_RESERVAS serializado
  if (!localStorage.getItem('sr_reservas')) localStorage.setItem('sr_reservas', JSON.stringify(SEED_RESERVAS));
}
// Ejecuta de manera inmediata la inicialización del storage al cargar el script
initStorage();

/**
 * Función auxiliar para simular el delay o latencia de una red real (asincronía).
 * Devuelve una Promesa que se resuelve tras el tiempo especificado (por defecto 250ms).
 */
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

// --- OBJETO PRINCIPAL DE LA API ---
const StudyRoomAPI = {
  
  // ── AULAS / SALONES ─────────────────────────────────────────
  
  /**
   * Obtiene todos los salones de la base de datos simulada.
   */
  async getSalones() {
    await delay(); // Simula el tiempo de respuesta del servidor externo
    // Obtiene el string JSON de localStorage y lo deserializa de vuelta a un objeto nativo de JS
    return JSON.parse(localStorage.getItem('sr_salones'));
  },
  
  /**
   * Registra un nuevo salón en el sistema.
   * @param {Object} data - Datos del nuevo salón (nombre, capacidad, tipo, etc.)
   */
  async crearSalon(data) {
    await delay(); // Simula la latencia de red
    // Recupera la lista actual de salones desde localStorage
    const salones = JSON.parse(localStorage.getItem('sr_salones'));
    // Crea el nuevo objeto combinando los datos recibidos, un ID único basado en timestamp y un array vacío de inventario
    const nuevo = { ...data, id: Date.now(), equipamiento: [] };
    // Agrega el nuevo salón al final de la lista
    salones.push(nuevo);
    // Guarda la lista actualizada de salones de nuevo en el almacenamiento del navegador en formato JSON
    localStorage.setItem('sr_salones', JSON.stringify(salones));
    return nuevo; // Retorna el objeto recién creado (útil para actualizar la UI)
  },

  /**
   * Modifica las propiedades de un salón existente.
   * @param {number|string} id - ID único del salón a editar
   * @param {Object} data - Atributos parciales o totales a actualizar
   */
  async editarSalon(id, data) {
    await delay(); // Simula latencia
    const salones = JSON.parse(localStorage.getItem('sr_salones'));
    // Busca el índice del salón que coincida con el ID numérico provisto
    const idx = salones.findIndex(s => s.id === parseInt(id));
    // Si el salón existe en la lista, combina sus propiedades viejas con las nuevas usando el operador spread
    if (idx !== -1) {
      salones[idx] = { ...salones[idx], ...data };
      // Sobrescribe el almacenamiento con la lista ya modificada
      localStorage.setItem('sr_salones', JSON.stringify(salones));
    }
  },

  /**
   * Elimina un salón del sistema por su identificador.
   * @param {number|string} id - ID del salón a remover
   */
  async eliminarSalon(id) {
    await delay(); // Simula latencia
    let salones = JSON.parse(localStorage.getItem('sr_salones'));
    // Filtra el array manteniendo únicamente los salones cuyo ID sea diferente al buscado
    salones = salones.filter(s => s.id !== parseInt(id));
    // Guarda la nueva lista sin el salón eliminado en el localStorage
    localStorage.setItem('sr_salones', JSON.stringify(salones));
  },

  // ── USUARIOS ────────────────────────────────────────────────
  
  /**
   * Obtiene la lista completa de usuarios registrados.
   */
  async getUsuarios() {
    await delay(); // Simula latencia
    return JSON.parse(localStorage.getItem('sr_usuarios'));
  },

  /**
   * Modifica la información de un usuario (ej: rol, email o puntaje).
   * @param {number|string} id - ID del usuario
   * @param {Object} data - Objeto con los nuevos campos a actualizar
   */
  async actualizarUsuario(id, data) {
    await delay(); // Simula latencia
    const usuarios = JSON.parse(localStorage.getItem('sr_usuarios'));
    // Busca la posición del usuario en el array
    const idx = usuarios.findIndex(u => u.id === parseInt(id));
    // Si lo encuentra, fusiona los datos anteriores con las actualizaciones provistas
    if (idx !== -1) {
      usuarios[idx] = { ...usuarios[idx], ...data };
      localStorage.setItem('sr_usuarios', JSON.stringify(usuarios));
    }
  },

  /**
   * Baja lógica o física de un usuario del sistema.
   * @param {number|string} id - ID del usuario a eliminar
   */
  async eliminarUsuario(id) {
    await delay(); // Simula latencia
    let usuarios = JSON.parse(localStorage.getItem('sr_usuarios'));
    // Reasigna la variable excluyendo al usuario que coincida con el ID enviado
    usuarios = usuarios.filter(u => u.id !== parseInt(id));
    localStorage.setItem('sr_usuarios', JSON.stringify(usuarios));
  },

  // ── RESERVAS ────────────────────────────────────────────────
  
  /**
   * Recupera el listado de reservas del sistema.
   */
  async getReservas() {
    await delay(); // Simula latencia
    return JSON.parse(localStorage.getItem('sr_reservas'));
  },

  /**
   * Registra una nueva solicitud de reserva en la base de datos simulada.
   * @param {Object} data - Datos de la reserva (usuario, salón, horarios, etc.)
   */
  async crearReserva(data) {
    await delay(); // Simula latencia
    const reservas = JSON.parse(localStorage.getItem('sr_reservas'));
    // Añade la reserva asignándole un identificador único en base a la fecha/hora actual
    const nueva = { ...data, id: Date.now() };
    reservas.push(nueva);
    localStorage.setItem('sr_reservas', JSON.stringify(reservas));
  },

  /**
   * Modifica propiedades específicas de una reserva (como las fechas o el estado).
   */
  async editarReserva(id, data) {
    await delay(); // Simula latencia
    const reservas = JSON.parse(localStorage.getItem('sr_reservas'));
    // Localiza el índice de la reserva a través de su ID
    const idx = reservas.findIndex(r => r.id === parseInt(id));
    // Si se encuentra la reserva, se fusionan los cambios
    if (idx !== -1) {
      reservas[idx] = { ...reservas[idx], ...data };
      localStorage.setItem('sr_reservas', JSON.stringify(reservas));
    }
  },

  /**
   * Atajo (Wrapper) semántico para cambiar con rapidez el estado de una reserva (ej: "aprobada", "rechazada").
   */
  async cambiarEstadoReserva(id, estado) {
    // Reutiliza el método genérico 'editarReserva' enviando únicamente la propiedad modificada
    return this.editarReserva(id, { estado });
  },

  // ── OBJETOS / INVENTARIO ────────────────────────────────────
  
  /**
   * Agrega un nuevo elemento de equipamiento al inventario interno de un salón específico.
   * @param {Object} data - Contiene id_salon, nombre del objeto y si funciona o no
   */
  async crearObjeto(data) {
    await delay(); // Simula latencia
    const salones = JSON.parse(localStorage.getItem('sr_salones'));
    // Busca el salón destino al cual se le va a asignar este equipamiento
    const sala = salones.find(s => s.id === parseInt(data.id_salon));
    if (sala) {
      // Cláusula de salvaguarda: si por algún motivo la propiedad equipamiento no existe, la inicializa como array
      if (!sala.equipamiento) sala.equipamiento = [];
      // Inserta el nuevo ítem con un ID único dentro de la lista de equipamiento de esa sala específica
      sala.equipamiento.push({ id: Date.now(), objeto: data.objeto, funciona: data.funciona });
      // Guarda los cambios estructurales reflejados en el array de salones
      localStorage.setItem('sr_salones', JSON.stringify(salones));
    }
  },

  /**
   * Edita las propiedades de un objeto y además permite transferirlo de un salón a otro.
   * @param {number|string} idObjeto - ID único del objeto de inventario
   * @param {Object} data - Nuevas propiedades del objeto junto con el id_salon_destino
   */
  async editarObjeto(idObjeto, data) {
    await delay(); // Simula latencia
    const salones = JSON.parse(localStorage.getItem('sr_salones'));
    let objetoEncontrado = null;

    // Primer paso: Buscar y remover (extraer) el objeto de su ubicación o salón original
    salones.forEach(sala => {
      // Busca la posición del ítem dentro del equipamiento de la sala iterada actualmente
      const idx = (sala.equipamiento || []).findIndex(e => e.id === parseInt(idObjeto));
      // Si lo encuentra, extrae el objeto del array nativo usando .splice() y lo almacena en la variable externa
      if (idx !== -1) objetoEncontrado = sala.equipamiento.splice(idx, 1)[0];
    });

    // Segundo paso: Si se encontró exitosamente el objeto, actualiza sus datos y lo reubica
    if (objetoEncontrado) {
      // Si la llamada provee un nombre o estado nuevo lo asigna, si no, preserva los existentes (operador ternario)
      objetoEncontrado.objeto = data.objeto !== undefined ? data.objeto : objetoEncontrado.objeto;
      objetoEncontrado.funciona = data.funciona !== undefined ? data.funciona : objetoEncontrado.funciona;
      
      // Busca el salón de destino basándose en el parámetro id_salon_destino recibido en 'data'
      const destino = salones.find(s => s.id === parseInt(data.id_salon_destino));
      if (destino) {
        // Asegura la existencia del array de equipamiento en el salón de destino
        if (!destino.equipamiento) destino.equipamiento = [];
        // Inyecta el objeto modificado en la lista del nuevo salón asignado
        destino.equipamiento.push(objetoEncontrado);
      }
      // Actualiza localStorage guardando la reorganización de objetos entre salones
      localStorage.setItem('sr_salones', JSON.stringify(salones));
    }
  },

  /**
   * Remueve definitivamente un ítem de equipamiento de cualquier salón en el que se encuentre.
   * @param {number|string} idObjeto - ID del objeto a purgar
   */
  async eliminarObjeto(idObjeto) {
    await delay(); // Simula latencia
    const salones = JSON.parse(localStorage.getItem('sr_salones'));
    // Itera por cada uno de los salones del sistema
    salones.forEach(sala => {
      if (sala.equipamiento) {
        // Filtra el array de equipamiento quitando exclusivamente el objeto que coincide con el ID
        sala.equipamiento = sala.equipamiento.filter(e => e.id !== parseInt(idObjeto));
      }
    });
    // Guarda el estado de los salones modificado sin el objeto eliminado
    localStorage.setItem('sr_salones', JSON.stringify(salones));
  },

  // ── HELPERS GLOBALES ────────────────────────────────────────
  
  /**
   * Determina la categoría de acceso y color UI correspondiente según el puntaje de un usuario.
   * @param {number} puntaje - Puntos acumulados por comportamiento o prioridad
   * @returns {Object} Con la etiqueta del rango y una variable CSS de color asociada
   */
  nivelAcceso(puntaje) {
    if (puntaje >= 150) return { label: 'PREMIUM', color: 'var(--color-accent-green)' };
    if (puntaje >= 80)  return { label: 'NORMAL',  color: 'var(--color-primary)' };
    return                     { label: 'RESTRINGIDO', color: 'var(--color-accent-red)' };
  },

  /**
   * Simula la obtención de la sesión del usuario logueado en la aplicación.
   * Retorna el primer administrador disponible o, en su defecto, el usuario por defecto de las semillas.
   */
  usuarioActual() {
    const usuarios = JSON.parse(localStorage.getItem('sr_usuarios')) || [];
    // Intenta buscar en el storage un usuario que ostente el rol de administrador
    return usuarios.find(u => u.rol === 'administrador') || SEED_USUARIOS[0];
  }
};

// Exportación global: Adjunta el objeto de la API directamente al objeto global window del navegador
// Esto permite consumirla globalmente desde cualquier otro script frontend adjunto al HTML (ej: controllers.js o app.js)
window.StudyRoomAPI = StudyRoomAPI;

export { StudyRoomAPI };