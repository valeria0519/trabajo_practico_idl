// ============================================================================
// backend/src/app.js — StudyRoom FIUBA (backend minimo)
// --------------------------------------------------------------------------
// Este archivo es a proposito muy chico: solo prueba que Docker, Express y
// PostgreSQL esten conectados entre si. NO hay login real, ni JWT, ni CRUD
// completo todavia: eso llega en una etapa posterior.
// ============================================================================

require('dotenv').config(); // Si existe un archivo .env local, carga sus variables

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8000;

// --- MIDDLEWARES ---
app.use(express.json()); // Permite leer JSON en el body de futuras peticiones POST/PUT

// Solo el frontend servido por Nginx (puerto 3000) puede llamar a esta API.
app.use(cors({ origin: 'http://localhost:3000' }));

// --- CONEXION A POSTGRESQL ---
// Pool = conjunto de conexiones reutilizables (mas eficiente que abrir/cerrar
// una conexion nueva por cada consulta). DATABASE_URL la define docker-compose.yml
// con el formato: postgresql://usuario:password@db:5432/nombre_base
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- RUTAS ---

// Confirma que el servidor Express esta vivo, sin tocar la base de datos.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend StudyRoom funcionando',
  });
});

// Confirma que, ademas, Express puede hablar con PostgreSQL.
app.get('/api/db-health', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Conexion con PostgreSQL exitosa',
      hora_servidor_db: resultado.rows[0].now,
    });
  } catch (error) {
    // Manejo basico de errores: si la base no responde, avisamos con 500
    // en vez de dejar la peticion colgada o tirar un stack trace crudo.
    console.error('Error al conectar con PostgreSQL:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'No se pudo conectar con PostgreSQL',
    });
  }
});

// 0.0.0.0 (no 'localhost') para que el servidor acepte conexiones desde
// fuera del propio contenedor Docker (por ejemplo, desde tu navegador).
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend StudyRoom escuchando en http://0.0.0.0:${PORT}`);
});
