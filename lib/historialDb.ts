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
  externalUrl?: string;
  verificationSource?: string;
  status?: "pendiente" | "finalizado";
  created_at?: string;
  settledAt?: string;
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

// Escritura atómica de archivo local
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
 * Evaluación Matemática Ciega e Inmutable del Pronóstico vs Resultado Final Real
 * CERO intervención subjetiva o alteraciones retroactivas.
 */
export function evaluatePrediction(
  tipoPrediccion: string,
  prediccion: string,
  homeScore: number,
  awayScore: number
): {
  acerto: boolean;
  ganadorReal: "Local" | "Empate" | "Visitante";
  estado: string;
  detalle: string;
} {
  const ganadorReal: "Local" | "Empate" | "Visitante" =
    homeScore > awayScore
      ? "Local"
      : awayScore > homeScore
      ? "Visitante"
      : "Empate";

  const totalGoals = homeScore + awayScore;
  const tipo = (tipoPrediccion || "").toLowerCase().trim();
  const pred = (prediccion || "").toLowerCase().trim();

  let acerto = false;

  // 1. Ganador directo (1X2 / Moneyline)
  if (
    tipo === "1" ||
    tipo === "moneyline local" ||
    (pred.includes("gana ") && !pred.includes("visita") && !pred.includes("empate") && !pred.includes("o "))
  ) {
    acerto = homeScore > awayScore;
  } else if (
    tipo === "2" ||
    tipo === "moneyline visitante" ||
    pred.includes("gana visitante") ||
    pred.includes("visita")
  ) {
    acerto = awayScore > homeScore;
  } else if (tipo === "x" || (pred.includes("empate") && !pred.includes("o "))) {
    acerto = homeScore === awayScore;
  }
  // 2. Doble oportunidad (1X, X2, 12)
  else if (tipo === "1x" || pred.includes("1x") || pred.includes("local o empate")) {
    acerto = homeScore >= awayScore;
  } else if (tipo === "x2" || pred.includes("x2") || pred.includes("visita o empate") || pred.includes("visitante o empate")) {
    acerto = awayScore >= homeScore;
  } else if (tipo === "12" || pred.includes("12")) {
    acerto = homeScore !== awayScore;
  }
  // 3. Mercados de Totales (Over / Under)
  else if (tipo.includes("over") || pred.includes("más de") || pred.includes("over")) {
    const match = pred.match(/(?:más de|over)\s*(\d+(?:\.\d+)?)/i);
    const line = match ? parseFloat(match[1]) : 2.5;
    acerto = totalGoals > line;
  } else if (tipo.includes("under") || pred.includes("menos de") || pred.includes("under")) {
    const match = pred.match(/(?:menos de|under)\s*(\d+(?:\.\d+)?)/i);
    const line = match ? parseFloat(match[1]) : 2.5;
    acerto = totalGoals < line;
  }
  // 4. Ambos Anotan (BTTS)
  else if (tipo.includes("btts") || pred.includes("ambos anotan")) {
    acerto = homeScore > 0 && awayScore > 0;
  }
  // 5. Comparación fallback objetiva
  else {
    if (ganadorReal === "Local" && pred.includes("local")) acerto = true;
    else if (ganadorReal === "Visitante" && (pred.includes("visit") || pred.includes("away"))) acerto = true;
    else if (ganadorReal === "Empate" && pred.includes("empate")) acerto = true;
    else acerto = false;
  }

  const estado = acerto
    ? "✅ ¡ECUAPRONÓSTICO ACERTÓ!"
    : "❌ ECUAPRONÓSTICO NO ACERTÓ (FALLO)";

  const detalle = acerto
    ? `Marcador final auditado: ${homeScore}-${awayScore} (${ganadorReal}). Pronóstico cumplido según línea matemática.`
    : `Marcador final auditado: ${homeScore}-${awayScore} (${ganadorReal}). Pronóstico no cumplido. Fallo registrado con transparencia total.`;

  return { acerto, ganadorReal, estado, detalle };
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
    homeScore: Number(row.home_score ?? 0),
    awayScore: Number(row.away_score ?? 0),
    resultadoFinal:
      row.resultado_final || `${row.home} ${row.home_score} - ${row.away_score} ${row.away}`,
    ganadorReal:
      row.ganador_real ||
      (row.home_score > row.away_score
        ? "Local"
        : row.home_score < row.away_score
        ? "Visitante"
        : "Empate"),
    prediccion: row.prediccion,
    tipoPrediccion: row.tipo_prediccion || "1X2",
    probabilidadEstimada: row.probabilidad_estimada || "60.0%",
    cuotaRegistrada: Number(row.cuota_registrada || 1.80),
    acerto: Boolean(row.acerto),
    estado:
      row.estado ||
      (row.acerto
        ? "✅ ¡ECUAPRONÓSTICO ACERTÓ!"
        : "❌ ECUAPRONÓSTICO NO ACERTÓ (FALLO)"),
    detalle: row.detalle || "",
    externalUrl:
      row.external_url ||
      `https://www.google.com/search?q=${encodeURIComponent(
        `${row.home} vs ${row.away} resultado espn`
      )}`,
    verificationSource: row.verification_source || "ESPN Scoreboard API",
    status: row.status || "finalizado",
    created_at: row.created_at,
    settledAt: row.settled_at,
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
    external_url: rec.externalUrl,
    verification_source: rec.verificationSource || "ESPN Scoreboard API",
    status: rec.status || "finalizado",
    settled_at: rec.settledAt || new Date().toISOString(),
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
    localData.sort(
      (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
    );
    return { records: localData, source: "local_fallback" };
  }

  try {
    const { data, error } = await supabase
      .from("historial_partidos")
      .select("*")
      .order("date_iso", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const records = data.map(mapFromSupabase);
      writeLocalHistorial(records);
      return { records, source: "supabase" };
    }

    // Auto-semilla en Supabase si la tabla está vacía pero hay datos locales
    if (!error && Array.isArray(data) && data.length === 0 && localData.length > 0) {
      console.log("Sembrando registros históricos verificados en Supabase...");
      const rowsToInsert = localData.map(mapToSupabase);
      await supabase.from("historial_partidos").upsert(rowsToInsert);
    }
  } catch (err) {
    console.warn("Supabase no disponible. Usando respaldo local:", err);
  }

  localData.sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );
  return { records: localData, source: "local_fallback" };
}

/**
 * Guardar o actualizar un pronóstico/resultado en Supabase y localmente
 */
export async function saveHistorialRecordAsync(
  record: HistorialMatchRecord
): Promise<boolean> {
  // 1. Guardar localmente
  const list = readLocalHistorial();
  const existingIdx = list.findIndex(
    (m) => m.id === record.id || m.fixtureId === record.fixtureId
  );
  if (existingIdx >= 0) {
    if (list[existingIdx].status === "finalizado" && record.status === "pendiente") {
      return true;
    }
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }
  list.sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );
  writeLocalHistorial(list);

  // 2. Guardar en Supabase si está disponible
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

  const pool3Days =
    records3Days.length >= 3 ? records3Days : records.slice(0, Math.min(6, records.length));
  const total3Days = pool3Days.length;
  const aciertos3Days = pool3Days.filter((m) => m.acerto).length;
  const fallos3Days = total3Days - aciertos3Days;
  const efectividad3Days =
    total3Days > 0 ? Math.round((aciertos3Days / total3Days) * 100) : 0;

  const totalGlobal = records.length;
  const aciertosGlobal = records.filter((m) => m.acerto).length;
  const fallosGlobal = totalGlobal - aciertosGlobal;
  const efectividadGlobal =
    totalGlobal > 0 ? Math.round((aciertosGlobal / totalGlobal) * 100) : 0;

  return {
    efectividad3Days,
    total3Days,
    aciertos3Days,
    fallos3Days,
    efectividadGlobal,
    totalGlobal,
    aciertosGlobal,
    fallosGlobal,
    fechaLanzamiento: "Noviembre 2026",
    ultimaActualizacion:
      new Date().toLocaleTimeString("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
      }) + " ECT",
  };
}
