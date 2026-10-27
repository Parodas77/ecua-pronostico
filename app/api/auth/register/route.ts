import { NextResponse } from "next/server";
import { createUser } from "@/lib/crm";

// Rate limiting para prevenir spam de creación masiva de cuentas
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_REGISTRATIONS_PER_IP = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

function sanitizeText(val: string): string {
  return (val || "").replace(/[<>"'`;]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown-ip";

    // Chequeo de rate limiting
    const now = Date.now();
    const current = registerAttempts.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
    if (now > current.resetAt) {
      current.count = 0;
      current.resetAt = now + RATE_WINDOW_MS;
    }
    if (current.count >= MAX_REGISTRATIONS_PER_IP) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiadas solicitudes de registro desde esta conexión. Por favor espera unos minutos.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { nombre, apellido, telefono_whatsapp, ciudad, correo, username, password } = body;

    // 1. Sanitización de texto
    nombre = sanitizeText(nombre);
    apellido = sanitizeText(apellido);
    ciudad = sanitizeText(ciudad);
    correo = (correo || "").trim().toLowerCase();
    username = (username || "").trim().toLowerCase();
    telefono_whatsapp = (telefono_whatsapp || "").replace(/[^\d+]/g, "").trim();
    password = (password || "").trim();

    // 2. Validación de campos obligatorios
    if (!nombre || !apellido || !telefono_whatsapp || !ciudad || !correo || !username || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios para completar tu registro VIP." },
        { status: 400 }
      );
    }

    // 3. Validación estricta de Username (alfanumérico, guiones, 3-25 caracteres)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,25}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre de usuario debe contener únicamente letras, números o guiones (entre 3 y 25 caracteres).",
        },
        { status: 400 }
      );
    }

    // Prohibir que un usuario elija "admin"
    if (username === "admin") {
      return NextResponse.json(
        { success: false, error: "El nombre de usuario 'admin' está reservado por el sistema." },
        { status: 400 }
      );
    }

    // 4. Validación de Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { success: false, error: "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    // 5. Validación de Teléfono (mínimo 7 dígitos numéricos)
    const digitsOnly = telefono_whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return NextResponse.json(
        { success: false, error: "Por favor ingresa un número de teléfono / WhatsApp válido." },
        { status: 400 }
      );
    }

    // 6. Validación de Contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres por seguridad." },
        { status: 400 }
      );
    }

    // Incrementar contador de registros
    current.count += 1;
    registerAttempts.set(ip, current);

    // Crear usuario en base de datos CRM
    const result = createUser({
      nombre,
      apellido,
      telefono_whatsapp,
      ciudad,
      correo,
      username,
      password,
      estado_suscripcion: "activo",
      dias_suscripcion: 30, // 30 días de suscripción inicial
      notas_admin: "Alta directa vía formulario post-pago WhatsApp",
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "No se pudo registrar el usuario" },
        { status: 400 }
      );
    }

    const { password_hash, ...safeUser } = result.user;

    return NextResponse.json({
      success: true,
      message: "¡Registro VIP completado exitosamente! Tu cuenta ha sido activada.",
      user: safeUser,
    });
  } catch (err: any) {
    console.error("Error en /api/auth/register:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor al procesar el registro." },
      { status: 500 }
    );
  }
}
