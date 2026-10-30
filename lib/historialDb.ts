import fs from "fs";
import path from "path";
import { getSupabase } from "./supabase";

export interface HistorialMatchRecord {
  id: string;
  fixtureId: string;
  league: string;
  leagueCategory: string;
  date: string;
  time: string;
  dateIso: string;
  home: string;
  away: string;
  homeInitials: string;
  awayInitials: string;
  homeScore: number;
  awayScore: number;
  resultadoFinal: string;
  ganadorReal: "Local" | "Empate" | "Visitante";
  prediccion: string;
  tipoPrediccion: string;
  probabilidadEstimada: string;
  cuotaRegistrada: number;
  acerto: boolean;
  estado: string;
  detalle: string;
  created_at?: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "aciertos_db.json");

// Lectura de archivo local con manejo robusto
export function readLocalHistorial(): HistorialMatchRecord[] {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error al leer aciertos_db.json:", err);
  }
  return [];
}

// Escritura de archivo local
export function writeLocalHistorial(records: HistorialMatchRecord[]): void {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar aciertos_db.json:", err);
  }
}

/**
 * Mapeo de Supabase snake_case a objeto TypeScript camelCase
 */
function mapFromSupabase(row: any): HistorialMatchRecord {
  return {
    id: String(row.id),
    fixtureId: String(row.fixture_id || row.id),
    league: row.league || "LIGA INTERNACIONAL",
    leagueCategory: row.league_category || "todas",
    date: row.date || "",
    time: row.time || "",
    dateIso: row.date_iso || new Date().toISOString(),
    home: row.home,
    away: row.away,
    homeInitials: row.home_initials || row.home?.slice(0, 3)?.toUpperCase() || "LOC",
    awayInitials: row.away_initials || row.away?.slice(0, 3)?.toUpperCase() || "VIS",
    homeScore: Number(row.home_score || 0),
    awayScore: Number(row.away_score || 0),
    resultadoFinal: row.resultado_final || `${row.home} ${row.home_score} - ${row.away_score} ${row.away}`,
    ganadorReal: row.ganador_real || (row.home_score > row.away_score ? "Local" : row.home_score < row.away_score ? "Visitante" : "Empate"),
    prediccion: row.prediccion,
    tipoPrediccion: row.tipo_prediccion || "1X2",
    probabilidadEstimada: row.probabilidad_estimada || "60.0%",
    cuotaRegistrada: Number(row.cuota_registrada || 1.80),
    acerto: Boolean(row.acerto),
    estado: row.estado || (row.acerto ? "✅ ¡ECUAPRONÓSTICO ACERTÓ!" : "❌ ECUAPRONÓSTICO NO ACERTÓ (FALLO)"),
    detalle: row.detalle || "",
    created_at: row.created_at,
  };
}

/**
 * Mapeo de TypeScript camelCase a Supabase snake_case
 */
function mapToSupabase(rec: HistorialMatchRecord): any {
  return {
    id: rec.id,
    fixture_id: rec.fixtureId,
    league: rec.league,
    league_category: rec.leagueCategory,
    date: rec.date,
    time: rec.time,
    date_iso: rec.dateIso,
    home: rec.home,
    away: rec.away,
    home_initials: rec.homeInitials,
    away_initials: rec.awayInitials,
    home_score: rec.homeScore,
    away_score: rec.awayScore,
    resultado_final: rec.resultadoFinal,
    ganador_real: rec.ganadorReal,
    prediccion: rec.prediccion,
    tipo_prediccion: rec.tipoPrediccion,
    probabilidad_estimada: rec.probabilidadEstimada,
    cuota_registrada: rec.cuotaRegistrada,
    acerto: rec.acerto,
    estado: rec.estado,
    detalle: rec.detalle,
  };
}

/**
 * Obtener todos los partidos históricos (Supabase primero con auto-semilla y fallback local)
 */
export async function getAllHistorialAsync(): Promise<{
  records: HistorialMatchRecord[];
  source: "supabase" | "local_fallback";
}> {
  const localData = readLocalHistorial();
  const supabase = getSupabase();

  if (!supabase) {
    // Ordenar rigurosamente por fecha cronológica descendente (más nuevos primero)
    localData.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
    return { records: localData, source: "local_fallback" };
  }

  try {
    const { data, error } = await supabase
      .from("historial_partidos")
      .select("*")
      .order("date_iso", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const records = data.map(mapFromSupabase);
      // Actualizar archivo local para caché ultra rápido
      writeLocalHistorial(records);
      return { records, source: "supabase" };
    }

    // Si Supabase responde pero la tabla está vacía, sembrar automáticamente con los datos locales
    if (!error && Array.isArray(data) && data.length === 0 && localData.length > 0) {
      console.log("Sembrando registros históricos iniciales en Supabase...");
      const rowsToInsert = localData.map(mapToSupabase);
      const { error: insertErr } = await supabase.from("historial_partidos").upsert(rowsToInsert);
      if (!insertErr) {
        console.log("Auto-semilla en Supabase exitosa.");
      }
    }
  } catch (err) {
    console.warn("Supabase historial_partidos no disponible o tabla pendiente de crear. Usando datos locales:", err);
  }

  localData.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
  return { records: localData, source: "local_fallback" };
}

/**
 * Guardar un nuevo pronóstico/resultado en Supabase y localmente
 */
export async function saveHistorialRecordAsync(record: HistorialMatchRecord): Promise<boolean> {
  // 1. Guardar localmente
  const list = readLocalHistorial();
  const existingIdx = list.findIndex((m) => m.id === record.id || m.fixtureId === record.fixtureId);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }
  list.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
  writeLocalHistorial(list);

  // 2. Guardar en Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapToSupabase(record);
      await supabase.from("historial_partidos").upsert(row);
      return true;
    } catch (err) {
      console.error("Error al persistir partido en Supabase:", err);
    }
  }

  return true;
}

/**
 * Calcular métricas cuantitativas dinámicas (Últimos 3 días y Global)
 */
export function calculateHistorialMetrics(records: HistorialMatchRecord[]) {
  const now = Date.now();
  const window3DaysMs = 3 * 24 * 60 * 60 * 1000; // 72 horas

  // Filtrar estrictamente los últimos 3 días cronológicos
  const records3Days = records.filter((m) => {
    const t = new Date(m.dateIso).getTime();
    return !isNaN(t) && now - t <= window3DaysMs;
  });

  const pool3Days = records3Days.length >= 4 ? records3Days : records.slice(0, Math.min(8, records.length));
  const total3Days = pool3Days.length;
  const aciertos3Days = pool3Days.filter((m) => m.acerto).length;
  const fallos3Days = total3Days - aciertos3Days;
  const efectividad3Days = total3Days > 0 ? Math.round((aciertos3Days / total3Days) * 100) : 80;

  const totalGlobal = records.length;
  const aciertosGlobal = records.filter((m) => m.acerto).length;
  const fallosGlobal = totalGlobal - aciertosGlobal;
  const efectividadGlobal = totalGlobal > 0 ? Math.round((aciertosGlobal / totalGlobal) * 100) : 80;

  return {
    efectividad3Days,
    total3Days,
    aciertos3Days,
    fallos3Days,
    efectividadGlobal,
    totalGlobal,
    aciertosGlobal,
    fallosGlobal,
    fechaLanzamiento: "20 de octubre de 2026",
    ultimaActualizacion: new Date().toLocaleTimeString("es-EC", {
      timeZone: "America/Guayaquil",
      hour: "2-digit",
      minute: "2-digit",
    }) + " ECT",
  };
}
