import fs from "fs";
import path from "path";

export interface SystemSubscription {
  id: number;
  nombre_servicio: string;
  fecha_renovacion: string; // "YYYY-MM-DD"
  costo: number;
  moneda: string;
  url_portal?: string;
  notas?: string;
  updated_at: string;
}

export interface SubscriptionAlertInfo extends SystemSubscription {
  dias_restantes: number;
  requiere_alerta: boolean; // dias_restantes <= 5
  estado_alerta: "vencida" | "urgente" | "al_dia";
  mensaje_alerta: string;
}

const DB_FILE = path.join(process.cwd(), "data", "system_subscriptions.json");

// Helper para calcular la diferencia exacta en días naturales
export function calculateDaysRemaining(fechaRenovacionStr: string): number {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(`${todayStr}T00:00:00Z`);
    const renewal = new Date(`${fechaRenovacionStr}T00:00:00Z`);
    const diffTime = renewal.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

// Helper para generar el mensaje institucional de alerta requerido
export function formatAlertMessage(nombreServicio: string, fechaRenovacion: string, diasRestantes: number): string {
  if (diasRestantes <= 0) {
    if (diasRestantes === 0) {
      return `⚠️ Alerta Admin: Faltan 0 días (¡Vence hoy!) para renovar ${nombreServicio} (Fecha: ${fechaRenovacion}).`;
    }
    const diasVencida = Math.abs(diasRestantes);
    return `⚠️ Alerta Admin: ¡Suscripción vencida hace ${diasVencida} día(s)! Renovar ${nombreServicio} (Fecha: ${fechaRenovacion}).`;
  }
  if (diasRestantes === 1) {
    return `⚠️ Alerta Admin: Falta 1 día para renovar ${nombreServicio} (Fecha: ${fechaRenovacion}).`;
  }
  return `⚠️ Alerta Admin: Faltan ${diasRestantes} días para renovar ${nombreServicio} (Fecha: ${fechaRenovacion}).`;
}

// Datos iniciales de demostración con API-Football en ventana <= 5 días para activación inmediata
function getInitialSeed(): SystemSubscription[] {
  const now = new Date();
  
  // Servicio 1: API-Football Pro (vence en 4 días para disparar la alerta de inmediato)
  const fechaApiFootball = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  
  // Servicio 2: The Odds API (vence en 18 días, al día)
  const fechaOddsApi = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return [
    {
      id: 1,
      nombre_servicio: "API-Football Pro",
      fecha_renovacion: fechaApiFootball,
      costo: 39.00,
      moneda: "USD",
      url_portal: "https://dashboard.api-football.com",
      notas: "Plan Pro mensual. Fixtures, cuotas en vivo, árbitros y alineaciones oficiales.",
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      nombre_servicio: "The Odds API",
      fecha_renovacion: fechaOddsApi,
      costo: 30.00,
      moneda: "USD",
      url_portal: "https://the-odds-api.com",
      notas: "Plan v4 cuotas de casas de apuestas (1X2, Totales Over/Under y Spreads).",
      updated_at: new Date().toISOString(),
    },
  ];
}

function loadSubscriptions(): SystemSubscription[] {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeed();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  } catch (err) {
    console.error("Error al leer system_subscriptions.json:", err);
    return getInitialSeed();
  }
}

function saveSubscriptions(items: SystemSubscription[]): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar system_subscriptions.json:", err);
  }
}

// Obtener todas las suscripciones con cálculo dinámico de días y alertas
export function getAllSystemSubscriptions(): SubscriptionAlertInfo[] {
  const items = loadSubscriptions();
  return items.map((sub) => {
    const dias_restantes = calculateDaysRemaining(sub.fecha_renovacion);
    const requiere_alerta = dias_restantes <= 5;
    let estado_alerta: "vencida" | "urgente" | "al_dia" = "al_dia";
    if (dias_restantes < 0) {
      estado_alerta = "vencida";
    } else if (dias_restantes <= 5) {
      estado_alerta = "urgente";
    }

    const mensaje_alerta = formatAlertMessage(sub.nombre_servicio, sub.fecha_renovacion, dias_restantes);

    return {
      ...sub,
      dias_restantes,
      requiere_alerta,
      estado_alerta,
      mensaje_alerta,
    };
  });
}

// Obtener únicamente las alertas activas (servicios con dias_restantes <= 5)
export function getActiveAdminAlerts(): SubscriptionAlertInfo[] {
  const all = getAllSystemSubscriptions();
  return all.filter((s) => s.requiere_alerta);
}

// Actualizar una suscripción por ID
export function updateSystemSubscription(
  id: number,
  data: Partial<Omit<SystemSubscription, "id">>
): SubscriptionAlertInfo | null {
  const items = loadSubscriptions();
  const index = items.findIndex((s) => s.id === id);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  saveSubscriptions(items);
  const updatedAll = getAllSystemSubscriptions();
  return updatedAll.find((s) => s.id === id) || null;
}

// Renovar servicio (+30 días o fecha indicada)
export function extendSystemSubscription(id: number, daysToAdd = 30): SubscriptionAlertInfo | null {
  const items = loadSubscriptions();
  const index = items.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const currentRenewal = new Date(`${items[index].fecha_renovacion}T00:00:00Z`);
  const today = new Date();
  // Si ya estaba vencida, renueva a partir de hoy; si no, agrega días a la fecha existente
  const baseDate = currentRenewal.getTime() < today.getTime() ? today : currentRenewal;
  const newDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  
  items[index].fecha_renovacion = newDate.toISOString().slice(0, 10);
  items[index].updated_at = new Date().toISOString();

  saveSubscriptions(items);
  const updatedAll = getAllSystemSubscriptions();
  return updatedAll.find((s) => s.id === id) || null;
}
