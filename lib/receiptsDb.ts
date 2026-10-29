import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ComprobanteAuditResult } from "./geminiAuditor";
import { createActivationToken } from "./activationTokens";

export interface ReceiptAuditRecord {
  id: string;
  timestamp: string;
  telefono: string;
  media_id?: string;
  image_preview?: string;
  monto: number;
  fecha_transaccion: string;
  referencia: string;
  banco: string;
  titular?: string;
  valido: boolean;
  motivo: string;
  auditadoPor: string;
  estado: "aprobado_automatico" | "requiere_revision_manual" | "autorizado_manual" | "rechazado";
  enlace_activacion: string;
  token_activacion: string;
  mensaje_cliente: string;
  notificado_whatsapp: boolean;
  notas_admin?: string;
}

const DB_FILE = path.join(process.cwd(), "data", "comprobantes_auditados.json");

// Helper para generar enlace único de activación prellenado
export function generateActivationLink(
  telefono: string,
  referencia: string,
  monto: number
): { link: string; token: string } {
  const tokenData = createActivationToken({
    phone: telefono,
    reference: referencia,
    amount: monto,
  });
  return { link: tokenData.link, token: tokenData.token };
}

// Datos semilla de demostración para el panel de administración
const INITIAL_RECEIPTS: ReceiptAuditRecord[] = [
  {
    id: "REC-948201",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    telefono: "+593981122334",
    media_id: "media_sample_01",
    monto: 14.99,
    fecha_transaccion: new Date().toISOString().slice(0, 10),
    referencia: "00948271",
    banco: "Banco Pichincha (Deuna)",
    titular: "Wilson Salazar",
    valido: true,
    motivo: "Comprobante verificado con éxito por $14.99 USD a favor de Ecuapronóstico.",
    auditadoPor: "gemini-1.5-flash",
    estado: "aprobado_automatico",
    token_activacion: "a9f82bc1",
    enlace_activacion:
      "https://ecua-pronostico-git-main-parodas77-8597s-projects.vercel.app/activar?token=a9f82bc1&tel=%2B593981122334&ref=00948271&amt=14.99",
    mensaje_cliente:
      "¡Pago verificado con éxito! 🟢 Tu comprobante por $14.99 ha sido validado. Ingresa al siguiente enlace para configurar tu usuario y contraseña VIP: https://ecua-pronostico-git-main-parodas77-8597s-projects.vercel.app/activar?token=a9f82bc1&tel=%2B593981122334&ref=00948271&amt=14.99",
    notificado_whatsapp: true,
  },
  {
    id: "REC-948202",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    telefono: "+593994455667",
    media_id: "media_sample_02",
    monto: 10.0,
    fecha_transaccion: new Date().toISOString().slice(0, 10),
    referencia: "TRX-10293",
    banco: "Banco Guayaquil",
    titular: "Roberto Falconí",
    valido: false,
    motivo: "Monto insuficiente ($10.00 USD). La membresía mensual VIP requiere $14.99 USD.",
    auditadoPor: "gemini-1.5-flash",
    estado: "requiere_revision_manual",
    token_activacion: "c3d11ef4",
    enlace_activacion: "",
    mensaje_cliente:
      "Hola, no pudimos validar automáticamente tu comprobante (imagen ilegible o monto incorrecto). Un administrador revisará tu caso en breve para activarte manualmente.",
    notificado_whatsapp: true,
  },
];

function readDb(): ReceiptAuditRecord[] {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_RECEIPTS, null, 2), "utf-8");
      return INITIAL_RECEIPTS;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RECEIPTS;
  } catch (err) {
    console.error("Error al leer comprobantes_auditados.json:", err);
    return INITIAL_RECEIPTS;
  }
}

function writeDb(records: ReceiptAuditRecord[]): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar comprobantes_auditados.json:", err);
  }
}

export function getAllReceiptAudits(): ReceiptAuditRecord[] {
  return readDb().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function saveReceiptAudit(record: ReceiptAuditRecord): ReceiptAuditRecord {
  const records = readDb();
  records.unshift(record);
  writeDb(records);
  return record;
}

export function updateReceiptStatus(
  id: string,
  newStatus: ReceiptAuditRecord["estado"],
  adminNotes?: string
): ReceiptAuditRecord | null {
  const records = readDb();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  records[index].estado = newStatus;
  if (adminNotes) {
    records[index].notas_admin = adminNotes;
  }

  writeDb(records);
  return records[index];
}

// Envío de mensaje vía WhatsApp Meta Cloud API
export async function sendWhatsAppMessage(
  toPhone: string,
  messageText: string
): Promise<{ success: boolean; response?: any; error?: string }> {
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID;

  const cleanPhone = toPhone.replace(/[^\d]/g, "");

  if (!apiToken || !phoneNumberId) {
    console.log(
      `[SIMULACIÓN WHATSAPP BOT] Enviando mensaje a ${cleanPhone}:\n"${messageText}"`
    );
    return {
      success: true,
      response: { simulated: true, to: cleanPhone, message: messageText },
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: true, body: messageText },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error Meta WhatsApp API:", data);
      return { success: false, error: data?.error?.message || "Error al enviar mensaje" };
    }

    return { success: true, response: data };
  } catch (err: any) {
    console.error("Error de conexión con Meta WhatsApp API:", err);
    return { success: false, error: err?.message || "Error de red" };
  }
}
