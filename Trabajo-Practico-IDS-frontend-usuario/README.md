# Trabajo-Practico-IDS
Repositorio para el trabajo práctico de introducción al desarrollo de software

---------------< COMPRENSIÓN DE LA NECESIDAD >---------------

Sistema inteligente de reservas para salas de estudio universitarias

Es una plataforma web pensada para organizar el uso de salas de estudio dentro de la universidad. El sistema permite que los estudiantes consulten la disponibilidad de salas, reserven espacios según fecha, horario y capacidad, y que los administradores gestionen el estado de cada sala, mantenimientos y reservas activas.

El problema que buscamos resolver es la falta de organización en el uso de espacios comunes: superposición de turnos, salas ocupadas sin registro, dificultad para saber qué espacios están disponibles y poca trazabilidad sobre el uso real de las salas.

El sistema contará con dos tipos de usuarios: estudiantes y administradores. Los estudiantes podrán ver salas disponibles, crear reservas, modificarlas o cancelarlas. Los administradores podrán crear y editar salas, bloquear horarios por mantenimiento, revisar reservas y cambiar estados.


---------------< ORGANIZACIÓN DEL DESARROLLO >---------------

---------------< DISEÑO DE SOFTWARE >---------------

---------------< IMPLEMENTACIÓN >---------------

---------------< PRUEBAS Y VALIDACIÓN >---------------

---------------< DESPLIEGUE >---------------

---------------< MANTENIMIENTO >---------------

---------------< IDEA PRINCIPAL >--------------


---------------< Feedback Profesor >--------------

Grupo Equipo McCabe
La de gestion de salas de estudio me parece mejor
agreguenle que puedas equipar las salas con cosas, tipo proyector, pizarron, capacidad, si puede ser ocmpartida o no, etc
cosa de que cuando quieras reservar tengas mas opciones
tambien podria haber una especie de ranking de aulas, y ranking de personas y las de cierto status puede acceder a las mejores aulas, cosa de que si rompes algo, caes en el ranking

---------------< CÓMO LEVANTAR EL PROYECTO CON DOCKER >--------------

1. Copiar `.env.example` como `.env` y completar los valores (no subir `.env` al repo).
2. Ejecutar `docker compose up --build` en la raíz del proyecto.
3. Abrir `http://localhost:3000` (frontend) y `http://localhost:8000/api/health` (backend).
4. Para detener: `docker compose down`.

Ver la explicación completa (arquitectura, healthchecks, cómo reiniciar la base de datos, qué usa datos simulados vs. PostgreSQL) en la conversación de integración del proyecto.
