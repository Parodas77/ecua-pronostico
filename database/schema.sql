-- ==============================================================================
-- ECUAPRONÓSTICO - ESQUEMA DE BASE DE DATOS CRM Y RETENCIÓN DE USUARIOS
-- ==============================================================================

-- 1. TIPO ENUM PARA ESTADOS DE SUSCRIPCIÓN
CREATE TYPE estado_suscripcion_enum AS ENUM ('activo', 'inactivo', 'expirado');

-- 2. TABLA DE CLIENTES Y USUARIOS VIP (CRM)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono_whatsapp VARCHAR(30) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado_suscripcion estado_suscripcion_enum NOT NULL DEFAULT 'activo',
    fecha_inicio_suscripcion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion_suscripcion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    notas_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ÍNDICES DE RENDIMIENTO Y CONSULTA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado_suscripcion);
CREATE INDEX IF NOT EXISTS idx_usuarios_telefono ON usuarios(telefono_whatsapp);
CREATE INDEX IF NOT EXISTS idx_usuarios_expiracion ON usuarios(fecha_expiracion_suscripcion);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);

-- 4. VISTA PARA CAMPAÑAS DE RETENCIÓN POR WHATSAPP (USUARIOS INACTIVOS O EXPIRADOS)
CREATE OR REPLACE VIEW vista_campana_retencion_whatsapp AS
SELECT 
    id,
    nombre,
    apellido,
    telefono_whatsapp,
    ciudad,
    correo,
    estado_suscripcion,
    fecha_expiracion_suscripcion,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fecha_expiracion_suscripcion)) / 86400) AS dias_expirado
FROM usuarios
WHERE estado_suscripcion IN ('inactivo', 'expirado')
   OR fecha_expiracion_suscripcion < CURRENT_TIMESTAMP
ORDER BY fecha_expiracion_suscripcion DESC;
