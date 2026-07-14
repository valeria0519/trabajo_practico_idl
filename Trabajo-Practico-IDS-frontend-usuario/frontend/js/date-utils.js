/**
 * Devuelve la fecha del dispositivo con el formato compartido por los paneles.
 * Ejemplo: "Hoy - Lunes, 13 de julio de 2026".
 */
export function formatearFechaActual(fecha = new Date()) {
  const fechaTexto = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fechaCapitalizada = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
  return `Hoy - ${fechaCapitalizada}`;
}
