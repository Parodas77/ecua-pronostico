import { NextResponse } from "next/server";
import { getUserByUsername, verifyPassword } from "@/lib/crm";

// ==============================================================================
// BLINDAJE DE SEGURIDAD: RATE LIMITING CONTRA ATAQUES DE FUERZA BRUTA
// ==============================================================================
interface AttemptRecord {
  count: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutos de bloqueo tras 5 fallos

function getClientKey(request: Request, user: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown-ip";
  return `${ip}::${user.toLowerCase()}`;
}

function checkRateLimit(key: string): { blocked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { blocked: false };

  if (record.blockedUntil > now) {
    const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    return { blocked: true, remainingMinutes };
  }

  if (record.blockedUntil <= now && record.count >= MAX_ATTEMPTS) {
    loginAttempts.delete(key);
  }

  return { blocked: false };
}

function recordFailure(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + LOCKOUT_TIME_MS;
  }
  loginAttempts.set(key, record);
}

function clearFailures(key: string) {
  loginAttempts.delete(key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Por favor ingresa tu usuario y contraseña." },
        { status: 400 }
      );
    }

    const clientKey = getClientKey(request, username);
    const rateStatus = checkRateLimit(clientKey);

    if (rateStatus.blocked) {
      return NextResponse.json(
        {
          success: false,
          error: `⚠️ Acceso bloqueado temporalmente por seguridad tras múltiples intentos fallidos. Por favor espera ${rateStatus.remainingMinutes} minuto(s) antes de reintentar.`,
        },
        { status: 429 }
      );
    }

    // 1. Acceso de Superadministrador (admin / ecuapronostico2026@)
    if (username === "admin" && password.toLowerCase() === "ecuapronostico2026@") {
      clearFailures(clientKey);
      return NextResponse.json({
        success: true,
        role: "admin",
        username: "admin",
        nombre: "Administrador Maestro",
        estado_suscripcion: "activo",
        fecha_expiracion: new Date(Date.now() + 365 * 86400000).toISOString(),
      });
    }

    // 2. Consulta en la base de datos CRM
    const user = getUserByUsername(username);
    if (!user) {
      recordFailure(clientKey);
      return NextResponse.json(
        { success: false, error: "Usuario o contraseña incorrectos. Verifica tus credenciales." },
        { status: 401 }
      );
    }

    // Verificar hash criptográfico
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      recordFailure(clientKey);
      return NextResponse.json(
        { success: false, error: "Usuario o contraseña incorrectos. Verifica tus credenciales." },
        { status: 401 }
      );
    }

    // Autenticación exitosa: limpiar intentos fallidos
    clearFailures(clientKey);

    // Verificar estado de suscripción
    const now = Date.now();
    const isExpired = new Date(user.fecha_expiracion_suscripcion).getTime() < now;

    if (user.estado_suscripcion === "inactivo") {
      return NextResponse.json(
        {
          success: false,
          inactive: true,
          error: "Tu cuenta VIP se encuentra inactiva. Comunícate con nuestro equipo por WhatsApp para reactivar tu acceso.",
        },
        { status: 403 }
      );
    }

    if (user.estado_suscripcion === "expirado" || isExpired) {
      const expDate = user.fecha_expiracion_suscripcion.slice(0, 10);
      return NextResponse.json(
        {
          success: false,
          expired: true,
          error: `Tu membresía VIP expiró el ${expDate}. Renueva hoy por WhatsApp para continuar disfrutando de Las 4 Fijas y el Radar Completo.`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      role: "vip",
      username: user.username,
      nombre: `${user.nombre} ${user.apellido}`.trim(),
      telefono_whatsapp: user.telefono_whatsapp,
      ciudad: user.ciudad,
      correo: user.correo,
      estado_suscripcion: user.estado_suscripcion,
      fecha_expiracion: user.fecha_expiracion_suscripcion,
    });
  } catch (err: any) {
    console.error("Error en /api/auth/login:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
