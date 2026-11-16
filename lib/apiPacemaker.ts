import fs from "fs";
import path from "path";
import { getAllSystemSubscriptions } from "./subscriptions";

// ==============================================================================
// MOTOR CENTRALIZADO DE GESTIÓN DE APIS EXTERNAS Y MARCAPASOS DE CRÉDITOS
// 1. Bóveda segura de llaves (API-Football & The Odds API) editable desde /admin
// 2. API-Football (7,500 peticiones/día - Reinicio diario 00:00): Caché rápido (5 min)
// 3. The Odds API (Bolsa mensual sin rollover): Marcapasos Dinámico (Auto-Pacing)
//    que lee x-requests-remaining y x-requests-used y ajusta automáticamente el TTL
//    entre Modo Alta Frecuencia (10-15 min) y Modo Ajuste Automático (20-35 min)
//    para aprovechar el 95%-98% de los créditos y garantizar que duren los 30 días.
// 4. Protección Anti-Abuso en "Forzar Sincronización": usuarios normales/VIP
//    reciben el caché fresco si tiene <10 min; solo Admin puede forzar gasto real.
// ==============================================================================

export interface ApiPacemakerTelemetry {
  // The Odds API
  oddsRemaining: number | null;
  oddsUsed: number | null;
  oddsTotalMonthly: number;
  oddsDaysLeftInCycle: number;
  oddsDailyBudget: number;
  oddsCurrentTtlMinutes: number;
  oddsPacingMode: "ALTA_FRECUENCIA" | "AJUSTE_AUTOMATICO" | "PROTECCION_FIN_DE_CICLO";
  oddsPacingDescription: string;
  oddsLastCheckedAt: string | null;
  oddsAccountStatus: "ACTIVA" | "SIN_CREDITOS" | "ERROR";

  // API-Football
  footballDailyLimit: number;
  footballUsedToday: number;
  footballRemainingToday: number;
  footballTtlMinutes: number;
  footballAccountStatus: "ACTIVA" | "SUSPENDIDA" | "SIN_VERIFICAR";
  footballStatusMessage: string;
  footballAccountEmail: string | null;
  footballPlanName: string | null;
  footballLastCheckedAt: string | null;
}

export interface ApiKeysVault {
  apiFootballKey: string;
  apiFootballEmail: string;
  oddsApiKey: string;
  oddsApiEmail: string;
  updatedAt: string;
}

const VAULT_FILE = path.join(process.cwd(), "data", "api_keys_vault.json");
const TELEMETRY_FILE = path.join(process.cwd(), "data", "api_telemetry.json");

const DEFAULT_API_FOOTBALL_KEY = "2ceb3637610213b4d82a91d894642826";
const DEFAULT_ODDS_API_KEY = "e5d6dd7668f865a60b12ee09a670089a";

// Memoria en proceso para velocidad instantánea en Serverless / Node
let memoryVault: ApiKeysVault | null = null;
let memoryTelemetry: ApiPacemakerTelemetry = {
  oddsRemaining: 500,
  oddsUsed: 0,
  oddsTotalMonthly: 20000,
  oddsDaysLeftInCycle: 18,
  oddsDailyBudget: 666,
  oddsCurrentTtlMinutes: 12,
  oddsPacingMode: "ALTA_FRECUENCIA",
  oddsPacingDescription: "Modo Alta Frecuencia activo (actualización cada 12 min): aprovechando al máximo tu suscripción mensual.",
  oddsLastCheckedAt: null,
  oddsAccountStatus: "ACTIVA",

  footballDailyLimit: 7500,
  footballUsedToday: 0,
  footballRemainingToday: 7500,
  footballTtlMinutes: 5,
  footballAccountStatus: "SIN_VERIFICAR",
  footballStatusMessage: "Límite diario de 7,500 peticiones (se reinicia automáticamente todos los días a las 00:00).",
  footballAccountEmail: null,
  footballPlanName: "Pro (7,500 req/día)",
  footballLastCheckedAt: null,
};

// Caché en memoria por liga para The Odds API y API-Football
interface CachedLeagueOdds {
  data: any[];
  fetchedAtMs: number;
  sportKey: string;
}

interface CachedLeagueFootball {
  standings: any[];
  fixtures: any[];
  fetchedAtMs: number;
  leagueId: number;
}

const oddsLeagueCache: Record<string, CachedLeagueOdds> = {};
const footballLeagueCache: Record<string, CachedLeagueFootball> = {};

/**
 * Carga las llaves desde la bóveda persistente o variables de entorno
 */
export function getApiKeysVault(): ApiKeysVault {
  if (memoryVault) return memoryVault;

  try {
    if (fs.existsSync(VAULT_FILE)) {
      const raw = fs.readFileSync(VAULT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiFootballKey && parsed.oddsApiKey) {
        memoryVault = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("No se pudo leer api_keys_vault.json:", err);
  }

  const initial: ApiKeysVault = {
    apiFootballKey:
      process.env.API_FOOTBALL_KEY ||
      process.env.NEXT_PUBLIC_API_FOOTBALL_KEY ||
      DEFAULT_API_FOOTBALL_KEY,
    apiFootballEmail: "Cuenta Oficial EcuaPronóstico (dashboard.api-football.com)",
    oddsApiKey:
      process.env.ODDS_API_KEY ||
      process.env.NEXT_PUBLIC_ODDS_API_KEY ||
      DEFAULT_ODDS_API_KEY,
    oddsApiEmail: "Cuenta Oficial EcuaPronóstico (the-odds-api.com)",
    updatedAt: new Date().toISOString(),
  };

  memoryVault = initial;
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VAULT_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch {}

  return initial;
}

/**
 * Actualiza y blinda las llaves API desde el panel /admin
 */
export function saveApiKeysVault(updates: Partial<ApiKeysVault>): ApiKeysVault {
  const current = getApiKeysVault();
  const nextVault: ApiKeysVault = {
    apiFootballKey: (updates.apiFootballKey ?? current.apiFootballKey).trim(),
    apiFootballEmail: (updates.apiFootballEmail ?? current.apiFootballEmail).trim(),
    oddsApiKey: (updates.oddsApiKey ?? current.oddsApiKey).trim(),
    oddsApiEmail: (updates.oddsApiEmail ?? current.oddsApiEmail).trim(),
    updatedAt: new Date().toISOString(),
  };

  memoryVault = nextVault;
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VAULT_FILE, JSON.stringify(nextVault, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar api_keys_vault.json:", err);
  }

  return nextVault;
}

/**
 * Calcula los días restantes en el ciclo mensual de The Odds API según /admin
 */
function getOddsCycleDaysRemaining(): number {
  try {
    const subs = getAllSystemSubscriptions();
    const oddsSub = subs.find((s) => s.nombre_servicio.toLowerCase().includes("odds"));
    if (oddsSub && oddsSub.dias_restantes > 0 && oddsSub.dias_restantes <= 31) {
      return oddsSub.dias_restantes;
    }
  } catch {}
  return 15; // promedio seguro de medio ciclo
}

/**
 * MARCAPASOS DINÁMICO DE CRÉDITOS (AUTO-PACING) PARA THE ODDS API
 * Calcula el TTL óptimo en minutos leyendo x-requests-remaining y x-requests-used
 * para que los créditos se aprovechen al 95%-98% y duren exactamente los 30 días.
 */
export function recalculateOddsPacemaker(remaining: number, used: number): void {
  const totalPool = remaining + used > 0 ? remaining + used : 20000;
  const daysLeft = Math.max(1, getOddsCycleDaysRemaining());
  const dailyBudget = Math.floor(remaining / daysLeft);

  // Cada actualización de una liga con 3 mercados (h2h, totals, spreads) consume 3 créditos.
  // Si el presupuesto diario es alto (>= 500 créditos/día, o >= 15 créditos/día en plan starter),
  // activamos MODO ALTA FRECUENCIA (12 minutos).
  // Si el tráfico sube en fin de semana y el presupuesto diario baja, pasamos a MODO AJUSTE AUTOMÁTICO (20 a 30 min).
  const expectedDailyShare = totalPool / 30;
  const budgetRatio = dailyBudget / Math.max(1, expectedDailyShare);

  let ttlMinutes = 12;
  let mode: ApiPacemakerTelemetry["oddsPacingMode"] = "ALTA_FRECUENCIA";
  let description = "";

  if (remaining <= 15) {
    ttlMinutes = 60;
    mode = "PROTECCION_FIN_DE_CICLO";
    description = `Protección Fin de Ciclo activa (${remaining} créditos restantes para ${daysLeft} días): caché a 60 min para no agotar antes de la renovación.`;
  } else if (budgetRatio >= 0.85) {
    // Créditos holgados o en línea con el ritmo mensual -> Modo Alta Frecuencia (10-12 min)
    ttlMinutes = budgetRatio >= 1.15 ? 10 : 12;
    mode = "ALTA_FRECUENCIA";
    description = `Modo Alta Frecuencia (${ttlMinutes} min): aprovechando al máximo tus créditos (${remaining.toLocaleString()} restantes / ${daysLeft} días = ${dailyBudget}/día).`;
  } else if (budgetRatio >= 0.5) {
    // Tráfico alto de fin de semana -> Modo Ajuste Automático (20 min)
    ttlMinutes = 20;
    mode = "AJUSTE_AUTOMATICO";
    description = `Modo Ajuste Automático (20 min): regulando consumo por alto tráfico para garantizar cobertura total los ${daysLeft} días restantes.`;
  } else {
    // Ritmo intensivo -> Modo Ajuste Automático (30 min)
    ttlMinutes = 30;
    mode = "AJUSTE_AUTOMATICO";
    description = `Modo Ajuste Automático (30 min): dosificando ${remaining.toLocaleString()} créditos en los ${daysLeft} días restantes del ciclo.`;
  }

  memoryTelemetry = {
    ...memoryTelemetry,
    oddsRemaining: remaining,
    oddsUsed: used,
    oddsTotalMonthly: totalPool,
    oddsDaysLeftInCycle: daysLeft,
    oddsDailyBudget: dailyBudget,
    oddsCurrentTtlMinutes: ttlMinutes,
    oddsPacingMode: mode,
    oddsPacingDescription: description,
    oddsLastCheckedAt: new Date().toISOString(),
    oddsAccountStatus: remaining > 0 ? "ACTIVA" : "SIN_CREDITOS",
  };

  try {
    const dir = path.dirname(TELEMETRY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(memoryTelemetry, null, 2), "utf-8");
  } catch {}
}

/**
 * Obtiene las cuotas de The Odds API gobernadas por el Marcapasos Automático
 * y con Protección Anti-Abuso en "Forzar Sincronización"
 */
export async function fetchOddsWithPacemaker(
  oddsApiSportKey: string,
  options: { forceRefresh?: boolean; isAdminForce?: boolean; browserHeaders?: Record<string, string> } = {}
): Promise<{ events: any[]; fromCache: boolean; cacheAgeMinutes: number; ttlMinutes: number }> {
  if (!oddsApiSportKey) {
    return { events: [], fromCache: false, cacheAgeMinutes: 0, ttlMinutes: memoryTelemetry.oddsCurrentTtlMinutes };
  }

  const nowMs = Date.now();
  const cached = oddsLeagueCache[oddsApiSportKey];
  const currentTtlMin = memoryTelemetry.oddsCurrentTtlMinutes || 12;
  const currentTtlMs = currentTtlMin * 60 * 1000;

  if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
    const ageMs = nowMs - cached.fetchedAtMs;
    const ageMinutes = Number((ageMs / 60000).toFixed(1));

    // PROTECCIÓN ANTI-ABUSO DEL BOTÓN "FORZAR SINCRONIZACIÓN":
    // - Si NO es Admin, cualquier "Forzar Sincronización" con menos de 10 minutos de antigüedad
    //   sirve el caché fresco del servidor sin quemar créditos de tu cuenta.
    // - En navegación normal, respeta el TTL dinámico del Marcapasos (10-12 min en Alta Frecuencia, 20-30 min en Ajuste).
    const minForceCooldownMs = 10 * 60 * 1000; // 10 minutos
    const canUseCache = options.isAdminForce
      ? false
      : options.forceRefresh
      ? ageMs < minForceCooldownMs
      : ageMs < currentTtlMs;

    if (canUseCache) {
      return {
        events: cached.data,
        fromCache: true,
        cacheAgeMinutes: ageMinutes,
        ttlMinutes: currentTtlMin,
      };
    }
  }

  const vault = getApiKeysVault();
  const headers = options.browserHeaders || {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
    Accept: "application/json",
  };

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${oddsApiSportKey}/odds/?apiKey=${vault.oddsApiKey}&regions=eu,us,uk&markets=h2h,totals,spreads&oddsFormat=decimal`;
    const res = await fetch(url, {
      headers,
      next: { revalidate: currentTtlMin * 60 },
    });

    // Leer encabezados exactos de créditos de The Odds API
    const remHeader = res.headers.get("x-requests-remaining");
    const usedHeader = res.headers.get("x-requests-used");
    if (remHeader !== null && usedHeader !== null) {
      const remNum = parseInt(remHeader, 10);
      const usedNum = parseInt(usedHeader, 10);
      if (!isNaN(remNum) && !isNaN(usedNum)) {
        recalculateOddsPacemaker(remNum, usedNum);
      }
    }

    if (res.ok) {
      const data = await res.json();
      const events = Array.isArray(data) ? data : [];
      oddsLeagueCache[oddsApiSportKey] = {
        data: events,
        fetchedAtMs: nowMs,
        sportKey: oddsApiSportKey,
      };
      return {
        events,
        fromCache: false,
        cacheAgeMinutes: 0,
        ttlMinutes: memoryTelemetry.oddsCurrentTtlMinutes,
      };
    }
  } catch (err) {
    console.warn("Error al consultar The Odds API:", err);
  }

  // Si falla la red, devolver el último caché válido si existe
  if (cached && Array.isArray(cached.data)) {
    return {
      events: cached.data,
      fromCache: true,
      cacheAgeMinutes: Number(((nowMs - cached.fetchedAtMs) / 60000).toFixed(1)),
      ttlMinutes: currentTtlMin,
    };
  }

  return { events: [], fromCache: false, cacheAgeMinutes: 0, ttlMinutes: currentTtlMin };
}

/**
 * Obtiene Standings y Fixtures de API-Football v3 (7,500 peticiones CADA DÍA, reinicio diario 00:00)
 * Usa caché de alta frecuencia de 5 minutos para aprovechar la holgura diaria sin desperdiciar llamadas repetidas en el mismo minuto.
 */
export async function fetchApiFootballWithDailyQuota(
  apiFootballLeagueId: number,
  currentYear: number,
  fromIso: string,
  toIso: string,
  options: { forceRefresh?: boolean; isAdminForce?: boolean; browserHeaders?: Record<string, string> } = {}
): Promise<{ standings: any[]; fixtures: any[]; fromCache: boolean }> {
  if (!apiFootballLeagueId || apiFootballLeagueId <= 0) {
    return { standings: [], fixtures: [], fromCache: false };
  }

  const cacheKey = `${apiFootballLeagueId}_${fromIso}_${toIso}`;
  const nowMs = Date.now();
  const cached = footballLeagueCache[cacheKey];
  const ttlMs = 5 * 60 * 1000; // 5 minutos (alta frecuencia gracias a las 7,500 req/día que se reinician a medianoche)

  if (cached && !options.isAdminForce && nowMs - cached.fetchedAtMs < ttlMs) {
    return {
      standings: cached.standings,
      fixtures: cached.fixtures,
      fromCache: true,
    };
  }

  const vault = getApiKeysVault();
  const headers = {
    ...(options.browserHeaders || {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
      Accept: "application/json",
    }),
    "x-apisports-key": vault.apiFootballKey,
  };

  let standings: any[] = [];
  let fixtures: any[] = [];

  try {
    const [stdRes, fixRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/standings?league=${apiFootballLeagueId}&season=${currentYear}`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures?league=${apiFootballLeagueId}&season=${currentYear}&from=${fromIso}&to=${toIso}`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    // Leer encabezados de cuota diaria de API-Football si vienen presentes
    const limitHeader = stdRes.headers.get("x-ratelimit-requests-limit");
    const remHeader = stdRes.headers.get("x-ratelimit-requests-remaining");
    if (limitHeader && remHeader) {
      const lim = parseInt(limitHeader, 10);
      const rem = parseInt(remHeader, 10);
      if (!isNaN(lim) && !isNaN(rem)) {
        memoryTelemetry.footballDailyLimit = lim;
        memoryTelemetry.footballRemainingToday = rem;
        memoryTelemetry.footballUsedToday = Math.max(0, lim - rem);
      }
    }

    if (stdRes.ok) {
      let stdData = await stdRes.json();
      if (stdData?.errors?.access) {
        memoryTelemetry.footballAccountStatus = "SUSPENDIDA";
        memoryTelemetry.footballStatusMessage = String(stdData.errors.access);
      } else if (stdData?.response) {
        memoryTelemetry.footballAccountStatus = "ACTIVA";
        memoryTelemetry.footballStatusMessage = "Cuenta Pro activa (reinicio automático diario a las 00:00).";
      }

      if (!stdData?.response?.[0]?.league?.standings && currentYear > 2024 && !stdData?.errors?.access) {
        const fallbackStd = await fetch(
          `https://v3.football.api-sports.io/standings?league=${apiFootballLeagueId}&season=2024`,
          { headers, next: { revalidate: 300 } }
        );
        if (fallbackStd.ok) stdData = await fallbackStd.json();
      }
      standings = stdData?.response?.[0]?.league?.standings || [];
    }

    if (fixRes.ok) {
      const fixData = await fixRes.json();
      fixtures = Array.isArray(fixData?.response) ? fixData.response : [];
    }

    memoryTelemetry.footballLastCheckedAt = new Date().toISOString();
    footballLeagueCache[cacheKey] = {
      standings,
      fixtures,
      fetchedAtMs: nowMs,
      leagueId: apiFootballLeagueId,
    };
  } catch (err) {
    console.warn("Error al consultar API-Football:", err);
  }

  return { standings, fixtures, fromCache: false };
}

/**
 * Consulta en vivo el estado real de ambas cuentas para el panel /admin
 */
export async function probeLiveApisStatus(): Promise<{
  telemetry: ApiPacemakerTelemetry;
  vaultMasked: {
    apiFootballKeyMasked: string;
    apiFootballKeyFull: string;
    apiFootballEmail: string;
    oddsApiKeyMasked: string;
    oddsApiKeyFull: string;
    oddsApiEmail: string;
    updatedAt: string;
  };
}> {
  const vault = getApiKeysVault();

  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      const saved = JSON.parse(fs.readFileSync(TELEMETRY_FILE, "utf-8"));
      memoryTelemetry = { ...memoryTelemetry, ...saved };
    }
  } catch {}

  // 1. Probe API-Football /status (no consume cuota de datos)
  try {
    const afRes = await fetch("https://v3.football.api-sports.io/status", {
      headers: { "x-apisports-key": vault.apiFootballKey },
      cache: "no-store",
    });
    if (afRes.ok) {
      const afData = await afRes.json();
      if (afData?.errors?.access) {
        memoryTelemetry.footballAccountStatus = "SUSPENDIDA";
        memoryTelemetry.footballStatusMessage = String(afData.errors.access);
      } else if (afData?.response?.account) {
        const acc = afData.response.account;
        const reqs = afData.response.requests;
        const sub = afData.response.subscription;
        memoryTelemetry.footballAccountStatus = sub?.active ? "ACTIVA" : "SUSPENDIDA";
        memoryTelemetry.footballAccountEmail = acc?.email || null;
        memoryTelemetry.footballPlanName = sub?.plan ? `${sub.plan} (${reqs?.limit_day || 7500}/día)` : "Pro (7,500/día)";
        memoryTelemetry.footballDailyLimit = reqs?.limit_day || 7500;
        memoryTelemetry.footballUsedToday = reqs?.current || 0;
        memoryTelemetry.footballRemainingToday = Math.max(0, (reqs?.limit_day || 7500) - (reqs?.current || 0));
        memoryTelemetry.footballStatusMessage = sub?.active
          ? `Cuenta activa (${acc?.email || "verificada"}). Límite diario de ${memoryTelemetry.footballDailyLimit.toLocaleString()} peticiones que se reinicia cada medianoche.`
          : "Suscripción inactiva en dashboard.api-football.com.";
      }
      memoryTelemetry.footballLastCheckedAt = new Date().toISOString();
    }
  } catch {}

  // 2. Probe The Odds API /v4/sports (endpoint gratuito que devuelve headers de créditos sin gastar 1 solo crédito)
  try {
    const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${vault.oddsApiKey}`, {
      cache: "no-store",
    });
    const remHeader = oddsRes.headers.get("x-requests-remaining");
    const usedHeader = oddsRes.headers.get("x-requests-used");
    if (remHeader !== null && usedHeader !== null) {
      const remNum = parseInt(remHeader, 10);
      const usedNum = parseInt(usedHeader, 10);
      if (!isNaN(remNum) && !isNaN(usedNum)) {
        recalculateOddsPacemaker(remNum, usedNum);
      }
    } else if (!oddsRes.ok) {
      memoryTelemetry.oddsAccountStatus = "ERROR";
    }
  } catch {}

  const maskKey = (k: string) =>
    k && k.length > 10 ? `${k.slice(0, 6)}••••••••••••••••••••${k.slice(-4)}` : "••••••••";

  return {
    telemetry: memoryTelemetry,
    vaultMasked: {
      apiFootballKeyMasked: maskKey(vault.apiFootballKey),
      apiFootballKeyFull: vault.apiFootballKey,
      apiFootballEmail: vault.apiFootballEmail,
      oddsApiKeyMasked: maskKey(vault.oddsApiKey),
      oddsApiKeyFull: vault.oddsApiKey,
      oddsApiEmail: vault.oddsApiEmail,
      updatedAt: vault.updatedAt,
    },
  };
}
