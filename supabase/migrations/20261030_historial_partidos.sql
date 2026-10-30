-- TABLA DE HISTORIAL DE ACIERTOS Y RESULTADOS (AUDITORÍA CUANTITATIVA)
-- Compatible con Supabase PostgreSQL y RLS público de lectura

CREATE TABLE IF NOT EXISTS historial_partidos (
  id TEXT PRIMARY KEY,
  fixture_id TEXT,
  league TEXT NOT NULL,
  league_category TEXT NOT NULL DEFAULT 'todas',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  date_iso TIMESTAMPTZ NOT NULL,
  home TEXT NOT NULL,
  away TEXT NOT NULL,
  home_initials TEXT,
  away_initials TEXT,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  resultado_final TEXT NOT NULL,
  ganador_real TEXT NOT NULL,
  prediccion TEXT NOT NULL,
  tipo_prediccion TEXT,
  probabilidad_estimada TEXT,
  cuota_registrada NUMERIC(6, 2) DEFAULT 1.80,
  acerto BOOLEAN NOT NULL DEFAULT TRUE,
  estado TEXT NOT NULL,
  detalle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES PARA BÚSQUEDA Y CRONOLOGÍA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_historial_date_iso ON historial_partidos(date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_historial_league ON historial_partidos(league_category);
CREATE INDEX IF NOT EXISTS idx_historial_acerto ON historial_partidos(acerto);

-- POLÍTICAS DE LECTURA PÚBLICA (RLS)
ALTER TABLE historial_partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de historial de partidos"
  ON historial_partidos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Escritura administrativa de historial de partidos"
  ON historial_partidos
  FOR ALL
  TO service_role
  USING (true);
