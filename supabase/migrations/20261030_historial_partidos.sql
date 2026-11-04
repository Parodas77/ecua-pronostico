-- ==============================================================================
-- ECUAPRONÓSTICO - ESQUEMA DE HISTORIAL DE ACIERTOS Y AUDITORÍA PÚBLICA (SUPABASE)
-- ==============================================================================
-- Migración oficial para PostgreSQL con Row Level Security (RLS) habilitado.
-- Permite lectura pública 100% transparente a cualquier visitante de la web.
-- Permite escritura segura mediante la Service Role Key o API del servidor.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS historial_partidos (
  id TEXT PRIMARY KEY,
  fixture_id TEXT NOT NULL,
  league TEXT NOT NULL,
  league_category TEXT NOT NULL DEFAULT 'todas',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  date_iso TIMESTAMPTZ NOT NULL,
  home TEXT NOT NULL,
  away TEXT NOT NULL,
  home_initials TEXT,
  away_initials TEXT,
  home_score INTEGER,
  away_score INTEGER,
  resultado_final TEXT,
  ganador_real TEXT,
  prediccion TEXT NOT NULL,
  tipo_prediccion TEXT NOT NULL,
  probabilidad_estimada TEXT,
  cuota_registrada NUMERIC(6, 2) DEFAULT 1.80,
  acerto BOOLEAN,
  estado TEXT NOT NULL,
  detalle TEXT,
  external_url TEXT,
  verification_source TEXT DEFAULT 'ESPN Scoreboard API',
  status TEXT NOT NULL DEFAULT 'finalizado',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- ÍNDICES PARA CONSULTAS ULTRARRÁPIDAS Y ORDEN CRONOLÓGICO
CREATE INDEX IF NOT EXISTS idx_historial_date_iso ON historial_partidos(date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_historial_league_category ON historial_partidos(league_category);
CREATE INDEX IF NOT EXISTS idx_historial_acerto ON historial_partidos(acerto);
CREATE INDEX IF NOT EXISTS idx_historial_fixture_id ON historial_partidos(fixture_id);
CREATE INDEX IF NOT EXISTS idx_historial_status ON historial_partidos(status);

-- POLÍTICAS DE ACCESO SEGURO (ROW LEVEL SECURITY)
ALTER TABLE historial_partidos ENABLE ROW LEVEL SECURITY;

-- 1. LECTURA PÚBLICA TOTAL (ANON Y AUTHENTICATED)
-- Permite que cualquier usuario o visitante pueda consultar el historial completo
DROP POLICY IF EXISTS "Lectura pública de historial de partidos" ON historial_partidos;
CREATE POLICY "Lectura pública de historial de partidos"
  ON historial_partidos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. ESCRITURA EXCLUSIVA PARA EL SERVIDOR / SERVICE ROLE
DROP POLICY IF EXISTS "Escritura administrativa de historial de partidos" ON historial_partidos;
CREATE POLICY "Escritura administrativa de historial de partidos"
  ON historial_partidos
  FOR ALL
  TO service_role
  USING (true);
