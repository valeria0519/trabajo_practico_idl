// ============================================================================
// js/views/perfil.js — Panel de Perfil de Administrador
// Módulo de interfaz encargado de renderizar los datos del usuario autenticado.
// ============================================================================

/**
 * Función principal exportada que gestiona la carga de datos del usuario y dibuja la interfaz de perfil.
 * @param {HTMLElement} container - Nodo del DOM donde se inyectará la estructura HTML de la vista.
 */
export async function renderPerfilAdmin(container) {
  // Consume el método síncrono de la API global para recuperar el objeto del administrador activo
  const admin = window.StudyRoomAPI.usuarioActual() || {
    nombre: 'Administrador',
    rol: 'administrador',
    usuario: 'admin',
    email: 'admin@fi.uba.ar',
    puntaje: 200
  };

  // Inyección de la estructura del formulario de solo lectura utilizando Template Literals de JavaScript
  container.innerHTML = `
    <div class="data-section" style="max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
       
        <div style="width: 80px; height: 80px; background: var(--color-accent-yellow); color: #fff; font-size: 24pt; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin: 0 auto 12px auto;">
          ${admin.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
       
        <h2 style="margin: 0; font-size: 16pt;">${admin.nombre}</h2>
       
        <p style="color: var(--text-muted); margin: 4px 0 0 0;">Rol de Cuenta: <strong>${admin.rol.toUpperCase()}</strong></p>
      </div>

     
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 20px;">

      <div class="form-group">
        <label>Legajo de Personal:</label>
       
        <input type="text" value="${admin.legajo || admin.usuario || admin.id || 'admin'}" disabled class="form-control" style="background: #f3f4f6; color: #6b7280;">
      </div>

      <div class="form-group">
        <label>Correo Electrónico de Control:</label>
       
        <input type="email" value="${admin.email}" disabled class="form-control" style="background: #f3f4f6; color: #6b7280;">
      </div>

      <div class="form-group">
        <label>Nivel de Reputación Base:</label>
       
        <input type="text" value="${admin.puntaje} pts (Exento de restricciones operativas)" disabled class="form-control" style="background: #f3f4f6; color: #6b7280; font-weight:600;">
      </div>

     
      <div style="background: #eff6ff; border-left: 4px solid var(--color-primary); padding: 12px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; font-size: 9.5pt; color: #1e40af; line-height: 1.5;">
          💡 <strong>Nota del Sistema:</strong> Los datos de perfil de nivel administrativo son de carácter estrictamente institucional. Para solicitar cualquier modificación en sus campos o reasignación de legajo unificado, por favor comuníquese con el departamento de soporte de infraestructura.
        </p>
      </div>
    </div>
  `;
}
