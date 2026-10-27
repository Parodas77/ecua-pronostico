-- ==============================================================================
-- ECUAPRONÓSTICO - ESQUEMA DE BASE DE DATOS CRM Y RETENCIÓN DE USUARIOS
-- ==============================================================================

-- 1. TIPO ENUM PARA ESTADOS DE SUSCRIPCIÓN
CREATE TYPE estado_suscripcion_enum AS ENUM ('pendiente', 'activo', 'inactivo', 'expirado');

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
    estado_suscripcion estado_suscripcion_enum NOT NULL DEFAULT 'pendiente',
    metodo_pago VARCHAR(50) DEFAULT 'Transferencia Bancaria',
    referencia_pago VARCHAR(150),
    monto_pago DECIMAL(10, 2) DEFAULT 14.99,
    fecha_inicio_suscripcion TIMESTAMP WITH TIME ZONE,
    fecha_expiracion_suscripcion TIMESTAMP WITH TIME ZONE,
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
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

-- ==============================================================================
-- 5. TABLA DE CONTROL DE RENOVACIÓN DE APIS Y SERVICIOS EXTERNOS (ADMIN ONLY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS system_subscriptions (
    id SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL UNIQUE,
    fecha_renovacion DATE NOT NULL,
    costo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
    url_portal VARCHAR(255),
    notas TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vista de alertas de renovación administrativa (5 días o menos para vencer)
CREATE OR REPLACE VIEW vista_alertas_renovacion_apis AS
SELECT 
    id,
    nombre_servicio,
    fecha_renovacion,
    costo,
    moneda,
    (fecha_renovacion - CURRENT_DATE) AS dias_restantes,
    CASE 
        WHEN (fecha_renovacion - CURRENT_DATE) < 0 THEN 'vencida'
        WHEN (fecha_renovacion - CURRENT_DATE) <= 5 THEN 'urgente'
        ELSE 'al_dia'
    END AS estado_alerta
FROM system_subscriptions
ORDER BY fecha_renovacion ASC;

