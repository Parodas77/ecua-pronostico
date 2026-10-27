import { NextResponse } from "next/server";
import { getUserByUsername, verifyPassword } from "@/lib/crm";

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

    // 1. Acceso de Superadministrador (admin / ecuapronostico2026@)
    if (username === "admin" && password.toLowerCase() === "ecuapronostico2026@") {
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
      return NextResponse.json(
        { success: false, error: "Usuario o contraseña incorrectos. Verifica tus credenciales." },
        { status: 401 }
      );
    }

    // Verificar hash criptográfico
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Usuario o contraseña incorrectos. Verifica tus credenciales." },
        { status: 401 }
      );
    }

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
