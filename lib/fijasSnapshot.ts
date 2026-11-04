import fs from "fs";
import path from "path";
import { getSupabase } from "./supabase";

export interface FijasSnapshotPayload {
  success: boolean;
  dayKey: string; // e.g. "2026-11-04"
  snapshotDate: string; // e.g. "Miércoles, 4 de noviembre de 2026"
  lockedAt: string; // e.g. "00:00 ECT"
  expiresAt: string; // e.g. "23:59 ECT"
  isLocked: boolean;
  count: number;
  window: string;
  auditSealGlobal: string;
  parleyMetrics: {
    multiplier: number;
    returnOn10: number;
    objective: string;
  };
  fijas: any[];
  estrategiaApostador: {
    titulo: string;
    apuestasSimples: {
      titulo: string;
      badge: string;
      stakeRecomendado: string;
      porcentajeExitoEstimado: string;
      explicacion: string;
      beneficios: string[];
    };
    parleyCombinada: {
      titulo: string;
      badge: string;
      stakeRecomendado: string;
      multiplicadorTotal: number;
      retornoPorCada10: number;
      explicacion: string;
      beneficios: string[];
      advertenciaRiesgo: string;
    };
    sistemaRoundRobin: {
      titulo: string;
      badge: string;
      explicacion: string;
    };
    veredictoFinal: string;
  };
}

const SNAPSHOT_DB_PATH = path.join(process.cwd(), "data", "fijas_snapshots.json");

/**
 * Retorna la clave del día en formato YYYY-MM-DD según la zona horaria oficial de Ecuador (ECT = UTC-5)
 */
export function getEcuadorDayKey(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    const ecMs = date.getTime() - 5 * 60 * 60 * 1000;
    return new Date(ecMs).toISOString().slice(0, 10);
  }
}

/**
 * Retorna la fecha completa en español para la cabecera del snapshot
 */
export function getEcuadorFormattedDate(date = new Date()): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  // Convertir a hora de Ecuador (UTC-5)
  const ecDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  const dayName = days[ecDate.getUTCDay()];
  const dayNum = ecDate.getUTCDate();
  const monthName = months[ecDate.getUTCMonth()];
  const year = ecDate.getUTCFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
}

// Lectura de snapshots locales
function readLocalSnapshots(): Record<string, FijasSnapshotPayload> {
  try {
    if (fs.existsSync(SNAPSHOT_DB_PATH)) {
      const raw = fs.readFileSync(SNAPSHOT_DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error al leer fijas_snapshots.json:", err);
  }
  return {};
}

// Escritura atómica de snapshots locales
function writeLocalSnapshots(data: Record<string, FijasSnapshotPayload>): void {
  try {
    const dir = path.dirname(SNAPSHOT_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SNAPSHOT_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar fijas_snapshots.json:", err);
  }
}

/**
 * Obtener el snapshot inmutable del día
 */
export async function getDailySnapshotAsync(
  dayKey: string
): Promise<FijasSnapshotPayload | null> {
  // 1. Verificar archivo local (solo si tiene los 4 partidos completos)
  const localMap = readLocalSnapshots();
  if (
    localMap[dayKey] &&
    Array.isArray(localMap[dayKey].fijas) &&
    localMap[dayKey].fijas.length === 4
  ) {
    return localMap[dayKey];
  }

  // 2. Verificar Supabase si está disponible
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("fijas_diarias_snapshots")
        .select("payload")
        .eq("day_key", dayKey)
        .single();

      if (!error && data?.payload && Array.isArray(data.payload.fijas) && data.payload.fijas.length === 4) {
        localMap[dayKey] = data.payload;
        writeLocalSnapshots(localMap);
        return data.payload as FijasSnapshotPayload;
      }
    } catch {}
  }

  return null;
}

/**
 * Guardar y congelar el snapshot inmutable del día (SOLO si contiene 4 partidos)
 */
export async function saveDailySnapshotAsync(
  dayKey: string,
  payload: FijasSnapshotPayload
): Promise<void> {
  // REGLA CRÍTICA: NUNCA guardar un snapshot vacío o incompleto
  if (!payload || !Array.isArray(payload.fijas) || payload.fijas.length !== 4) {
    console.warn("Intento de guardar snapshot incompleto abortado. Fijas count:", payload?.fijas?.length);
    return;
  }

  // 1. Guardar localmente
  const localMap = readLocalSnapshots();
  localMap[dayKey] = payload;
  writeLocalSnapshots(localMap);

  // 2. Guardar en Supabase si está disponible
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("fijas_diarias_snapshots").upsert({
        day_key: dayKey,
        snapshot_date: payload.snapshotDate,
        locked_at: new Date().toISOString(),
        payload: payload,
      });
    } catch (err) {
      console.warn("Supabase fijas_diarias_snapshots no disponible:", err);
    }
  }
}
