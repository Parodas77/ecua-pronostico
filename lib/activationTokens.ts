import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ActivationTokenRecord {
  token: string;
  phone: string;
  amount: number;
  reference: string;
  bank: string;
  used: boolean;
  createdAt: string;
  usedAt?: string | null;
  usedByUsername?: string | null;
  expiresAt: string;
}

const TOKENS_FILE = path.join(process.cwd(), "data", "activation_tokens.json");

// Semilla inicial con tokens de prueba y tokens activos
const INITIAL_TOKENS: ActivationTokenRecord[] = [
  {
    token: "a9f82bc1",
    phone: "+593981122334",
    amount: 14.99,
    reference: "00948271",
    bank: "Banco Pichincha (Ahorros)",
    used: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    token: "demo_vip_2026",
    phone: "+593979198755",
    amount: 14.99,
    reference: "PAGO_DIRECTO_ADMIN",
    bank: "Banco del Guayaquil",
    used: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  },
];

function readTokensDb(): ActivationTokenRecord[] {
  try {
    const dir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(TOKENS_FILE)) {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(INITIAL_TOKENS, null, 2), "utf-8");
      return INITIAL_TOKENS;
    }
    const raw = fs.readFileSync(TOKENS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TOKENS;
  } catch (err) {
    console.error("Error al leer tokens de activación:", err);
    return INITIAL_TOKENS;
  }
}

function writeTokensDb(tokens: ActivationTokenRecord[]): void {
  try {
    const dir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar tokens de activación:", err);
  }
}

/**
 * Genera y almacena un token único de activación de un solo uso
 */
export function createActivationToken(data: {
  phone: string;
  amount?: number;
  reference?: string;
  bank?: string;
}): { token: string; link: string } {
  const token = crypto.randomBytes(12).toString("hex");
  const cleanPhone = (data.phone || "").replace(/[^\d+]/g, "");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 86400000).toISOString();

  const record: ActivationTokenRecord = {
    token,
    phone: cleanPhone,
    amount: data.amount || 14.99,
    reference: data.reference || "COMPROBANTE_WHATSAPP",
    bank: data.bank || "Banco Pichincha / Guayaquil",
    used: false,
    createdAt: now.toISOString(),
    expiresAt,
  };

  const tokens = readTokensDb();
  tokens.push(record);
  writeTokensDb(tokens);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://ecua-pronostico-git-main-parodas77-8597s-projects.vercel.app");

  const cleanBase = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const link = `${cleanBase}/activar?token=${token}&tel=${encodeURIComponent(
    cleanPhone
  )}&ref=${encodeURIComponent(record.reference)}&amt=${record.amount}`;

  return { token, link };
}

/**
 * Valida si un token existe, no ha sido usado y no ha expirado
 */
export function validateActivationToken(token: string): {
  valid: boolean;
  error?: string;
  tokenData?: ActivationTokenRecord;
} {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      valid: false,
      error: "No se proporcionó ningún token de activación. El acceso a este formulario es exclusivo mediante enlace de invitación tras verificar el pago.",
    };
  }

  const cleanToken = token.trim();
  const tokens = readTokensDb();
  const record = tokens.find((t) => t.token === cleanToken);

  if (!record) {
    return {
      valid: false,
      error: "El token de activación no existe o no es válido. Por favor verifica tu pago por WhatsApp para recibir un enlace oficial.",
    };
  }

  if (record.used) {
    return {
      valid: false,
      error: `Este enlace de activación ya fue utilizado el ${
        record.usedAt ? new Date(record.usedAt).toLocaleString("es-EC") : "recientemente"
      } por el usuario @${record.usedByUsername || "registrado"}. No puede ser reutilizado.`,
    };
  }

  // Comprobar expiración
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return {
      valid: false,
      error: "Este enlace de activación ha expirado. Por favor solicita uno nuevo a soporte.",
    };
  }

  return {
    valid: true,
    tokenData: record,
  };
}

/**
 * Invalida/consume el token tras un registro exitoso (un solo uso)
 */
export function consumeActivationToken(token: string, username: string): boolean {
  if (!token) return false;
  const cleanToken = token.trim();
  const tokens = readTokensDb();
  const index = tokens.findIndex((t) => t.token === cleanToken);

  if (index === -1) return false;

  tokens[index].used = true;
  tokens[index].usedAt = new Date().toISOString();
  tokens[index].usedByUsername = username.trim().toLowerCase();

  writeTokensDb(tokens);
  return true;
}
