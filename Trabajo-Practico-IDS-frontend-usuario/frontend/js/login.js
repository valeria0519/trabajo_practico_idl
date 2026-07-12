/*
  ==========================================================================
  Comportamiento de la pantalla de Login - StudyRoom FIUBA
  --------------------------------------------------------------------------
  IMPORTANTE: este es un ingreso SIMULADO.
  No se consulta ningun backend ni base de datos, no hay contraseñas
  guardadas en ningun lado y no existe una sesion real. Solo se valida
  que los campos tengan un formato razonable y despues se redirige segun
  el rol elegido, guardando un usuario de prueba en sessionStorage para
  que el panel correspondiente tenga algo que mostrar.
  ==========================================================================
*/

/*
  Este estado almacena el rol seleccionado por el usuario.
  Se inicializa en "student" porque Estudiante debe aparecer seleccionado
  por defecto cuando se abre la pantalla, tal como pide el diseno.
*/
let selectedRole = 'student';

/*
  Referencias a los elementos interactivos del Login.
  Guardarlas en constantes evita repetir busquedas en el DOM y deja claro
  que partes del HTML controla este script.
*/
const roleButtons = document.querySelectorAll('.role-option');
const submitButton = document.getElementById('login-submit');
const loginForm = document.getElementById('login-form');
const statusMessage = document.getElementById('login-status');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const passwordToggle = document.getElementById('password-toggle');

/*
  Configuracion de textos y clases por rol.
  Este objeto centraliza lo que cambia entre Estudiante y Administrador:
  texto del boton principal y clase visual que define su color.
*/
const ROLE_CONFIG = {
  student: {
    submitText: 'Ingresar al sistema →',
    submitClass: 'is-student',
  },
  admin: {
    submitText: 'Ingresar como administrador →',
    submitClass: 'is-admin',
  },
};

/*
  Actualiza toda la interfaz dependiente del rol seleccionado.
  Cuando el usuario hace clic en "Administrador", esta funcion hace que:
  - El boton Administrador pase a color naranja.
  - El boton Estudiante vuelva al estado gris deseleccionado.
  - El boton principal cambie su color y texto.
  Si vuelve a elegir "Estudiante", aplica exactamente el flujo inverso.
*/
function updateRoleInterface(nextRole) {
  selectedRole = nextRole;

  roleButtons.forEach((button) => {
    const buttonRole = button.dataset.role;
    const isCurrentRole = buttonRole === selectedRole;

    button.classList.toggle('is-active', isCurrentRole);
    button.setAttribute('aria-pressed', String(isCurrentRole));
  });

  const roleConfig = ROLE_CONFIG[selectedRole];
  submitButton.textContent = roleConfig.submitText;
  submitButton.classList.remove('is-student', 'is-admin');
  submitButton.classList.add(roleConfig.submitClass);

  statusMessage.textContent = '';
}

roleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    updateRoleInterface(button.dataset.role);
  });
});

/*
  Mostrar/ocultar contraseña.
  Alterna el type del input entre "password" y "text" y actualiza el
  texto/aria-pressed del boton para que quede claro el estado actual.
*/
passwordToggle.addEventListener('click', () => {
  const estaOculta = passwordInput.type === 'password';
  passwordInput.type = estaOculta ? 'text' : 'password';
  passwordToggle.textContent = estaOculta ? 'Ocultar' : 'Ver';
  passwordToggle.setAttribute('aria-pressed', String(estaOculta));
  passwordToggle.setAttribute('aria-label', estaOculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

/*
  Expresion regular simple para validar formato de email.
  No cubre todos los casos posibles (eso requeriria una libreria), pero
  alcanza para detectar errores tipicos de tipeo como "usuario@" o "usuario.com".
*/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
  Muestra un mensaje de error debajo de un campo y marca el input como
  invalido para tecnologias de asistencia (aria-invalid).
*/
function mostrarErrorCampo(input, errorEl, mensaje) {
  errorEl.textContent = mensaje;
  input.setAttribute('aria-invalid', 'true');
}

function limpiarErrorCampo(input, errorEl) {
  errorEl.textContent = '';
  input.removeAttribute('aria-invalid');
}

/*
  Valida email y contraseña antes de simular el ingreso.
  Devuelve true si todo esta correcto, false si encontro algun error
  (y en ese caso ya dejo los mensajes escritos en pantalla).
*/
function validarFormulario() {
  let esValido = true;

  const email = emailInput.value.trim();
  if (!email) {
    mostrarErrorCampo(emailInput, emailError, 'Ingresá tu email.');
    esValido = false;
  } else if (!EMAIL_REGEX.test(email)) {
    mostrarErrorCampo(emailInput, emailError, 'El formato del email no es válido.');
    esValido = false;
  } else {
    limpiarErrorCampo(emailInput, emailError);
  }

  const password = passwordInput.value;
  if (!password) {
    mostrarErrorCampo(passwordInput, passwordError, 'Ingresá tu contraseña.');
    esValido = false;
  } else {
    limpiarErrorCampo(passwordInput, passwordError);
  }

  return esValido;
}

/*
  Manejo del submit del formulario.
  1. Prevenimos el envio tradicional (no hay servidor que lo reciba).
  2. Validamos los campos en el navegador.
  3. Segun el rol elegido, guardamos un usuario simulado en sessionStorage
     y redirigimos a la pantalla correspondiente.
*/
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validarFormulario()) {
    statusMessage.textContent = 'Revisá los campos marcados en rojo.';
    return;
  }

  statusMessage.textContent = '';

  if (selectedRole === 'admin') {
    // Ingreso de administrador simulado: guardamos un usuario de prueba
    // con rol "administrador" para que admin.html deje entrar (su guard
    // de sesion revisa este mismo dato) y para poder mostrarlo en pantalla.
    const adminSimulado = {
      id: 1,
      nombre: 'Administrador',
      email: emailInput.value.trim(),
      rol: 'administrador',
      puntaje: 200,
    };
    sessionStorage.setItem('usuario', JSON.stringify(adminSimulado));
    window.location.href = 'admin.html';
    return;
  }

  // Ingreso de estudiante simulado: se guarda un usuario de prueba para
  // que usuario.html pueda mostrar nombre y puntaje sin backend real.
  const usuarioSimulado = {
    id: 1,
    nombre: 'Usuario Estudiante',
    email: emailInput.value.trim(),
    rol: 'usuario',
    puntaje: 100,
  };
  sessionStorage.setItem('usuario', JSON.stringify(usuarioSimulado));
  window.location.href = 'usuario.html';
});

/*
  Inicializacion defensiva.
  Aunque login.html ya marca Estudiante como activo, ejecutar esta funcion
  asegura que texto, clases y atributos queden sincronizados desde el inicio.
*/
updateRoleInterface(selectedRole);
