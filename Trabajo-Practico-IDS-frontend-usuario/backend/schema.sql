-- ============================================================================
-- schema.sql — StudyRoom FIUBA
-- --------------------------------------------------------------------------
-- Este script solo se ejecuta AUTOMATICAMENTE la primera vez que se crea el
-- volumen "postgres_data" (asi funciona /docker-entrypoint-initdb.d/ en la
-- imagen oficial de Postgres). Si ya existe el volumen, correr de nuevo
-- "docker compose up" NO vuelve a ejecutar este archivo: hay que borrar el
-- volumen primero (ver instrucciones en la respuesta del chat).
--
-- "IF NOT EXISTS" se agrega igual como red de seguridad, por si alguien
-- corre este script a mano mas de una vez contra la misma base.
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL
        CHECK (rol IN ('usuario', 'administrador')),
    puntaje INT DEFAULT 100,
    email VARCHAR(150) UNIQUE NOT NULL,
    num_telefono VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS salones (
    id SERIAL PRIMARY KEY,
    salon_nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    piso INT NOT NULL,
    media_puntuacion DECIMAL DEFAULT 0.00,
    capacidad INT NOT NULL,
    estado VARCHAR(20) NOT NULL
        CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento'))
);

CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id),
    id_salon INT NOT NULL REFERENCES salones(id),
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL
        CHECK (estado IN ('pendiente', 'en curso', 'finalizada', 'cancelada')),
    -- Evita guardar una reserva que termine antes (o al mismo tiempo) que empieza.
    CHECK (fecha_hora_fin > fecha_hora_inicio)
);

CREATE TABLE IF NOT EXISTS calificaciones_salones (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id),
    id_salon INT NOT NULL REFERENCES salones(id),
    puntuacion INT NOT NULL
        CHECK (puntuacion BETWEEN 1 AND 5),
    resena TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipamiento (
    id SERIAL PRIMARY KEY,
    id_salon INT REFERENCES salones(id),
    objeto VARCHAR(100) NOT NULL,
    funciona BOOLEAN DEFAULT TRUE
);

-- ── INDICES ──────────────────────────────────────────────────────────────
-- Aceleran las consultas mas frecuentes del frontend (buscar reservas de un
-- usuario o de un salon, y equipamiento de un salon).
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reservas_salon ON reservas(id_salon);
CREATE INDEX IF NOT EXISTS idx_equipamiento_salon ON equipamiento(id_salon);

-- ── DATOS MINIMOS DE PRUEBA ──────────────────────────────────────────────
-- Solo para poder ver algo cuando se conecte el frontend real a esta base.
-- No son contraseñas ni datos sensibles: es un proyecto educativo.
-- ON CONFLICT DO NOTHING evita duplicar filas si el script se corre dos veces.
INSERT INTO usuarios (usuario, nombre, rol, puntaje, email, num_telefono) VALUES
    ('admin_fiuba', 'Administrador', 'administrador', 200, 'admin@fi.uba.ar', NULL),
    ('jperez', 'Juan Perez', 'usuario', 100, 'jperez@fi.uba.ar', '11-4000-0001')
ON CONFLICT (email) DO NOTHING;

INSERT INTO salones (salon_nombre, tipo, piso, capacidad, estado) VALUES
    ('Laboratorio de Sistemas', 'laboratorio', 2, 35, 'disponible'),
    ('Aula Magna', 'aula', 0, 150, 'ocupado'),
    ('Sala de Lectura', 'estudio', 1, 20, 'mantenimiento')
ON CONFLICT (salon_nombre) DO NOTHING;
