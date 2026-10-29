import { NextResponse } from "next/server";
import { createUserAsync } from "@/lib/crm";
import { validateActivationToken, consumeActivationToken } from "@/lib/activationTokens";

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
    let {
      token,
      nombre,
      apellido,
      telefono_whatsapp,
      ciudad,
      correo,
      username,
      password,
      metodo_pago,
      referencia_pago,
    } = body;

    // 0. BLINDAJE POR TOKEN ÚNICO DE ACTIVACIÓN (UN SOLO USO)
    const cleanToken = (token || "").trim();
    if (!cleanToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Acceso restringido: Se requiere un token único de activación tras verificar tu pago por WhatsApp para crear tu cuenta VIP.",
        },
        { status: 403 }
      );
    }

    const tokenCheck = validateActivationToken(cleanToken);
    if (!tokenCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            tokenCheck.error ||
            "El token de activación no es válido o ya fue utilizado previamente.",
        },
        { status: 403 }
      );
    }

    // 1. Sanitización de texto
    nombre = sanitizeText(nombre);
    apellido = sanitizeText(apellido);
    ciudad = sanitizeText(ciudad);
    metodo_pago = sanitizeText(metodo_pago) || "Transferencia Bancaria";
    referencia_pago = sanitizeText(referencia_pago) || "Comprobante enviado por WhatsApp";
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

    // Crear usuario en base de datos CRM en estado ACTIVO POR 30 DÍAS (pago ya verificado por token)
    const tokenData = tokenCheck.tokenData;
    const finalPhone = tokenData?.phone || telefono_whatsapp;
    const finalAmount = tokenData?.amount || 14.99;
    const finalRef = tokenData?.reference || referencia_pago;
    const finalBank = tokenData?.bank || metodo_pago;

    const result = await createUserAsync({
      nombre,
      apellido,
      telefono_whatsapp: finalPhone,
      ciudad,
      correo,
      username,
      password,
      metodo_pago: finalBank,
      referencia_pago: finalRef,
      monto_pago: finalAmount,
      estado_suscripcion: "activo",
      dias_suscripcion: 30,
      notas_admin: `Activado con Token único [${cleanToken}] verificado tras pago por WhatsApp`,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "No se pudo registrar el usuario" },
        { status: 400 }
      );
    }

    // Invalidar inmediatamente el token para evitar reuso
    consumeActivationToken(cleanToken, username);

    const { password_hash, ...safeUser } = result.user;

    return NextResponse.json({
      success: true,
      active: true,
      message:
        "🎉 ¡Cuenta VIP activada con éxito! Tus 30 días de acceso total al Radar Cuantitativo comenzaron hoy.",
      user: safeUser,
      redirect: "/radar",
    });
  } catch (err: any) {
    console.error("Error en /api/auth/register:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor al procesar el registro." },
      { status: 500 }
    );
  }
}
