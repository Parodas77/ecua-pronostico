import { NextResponse } from "next/server";
import { createUser } from "@/lib/crm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, telefono_whatsapp, ciudad, correo, username, password } = body;

    // Validación de campos obligatorios
    if (!nombre || !apellido || !telefono_whatsapp || !ciudad || !correo || !username || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios para completar tu registro VIP." },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 5 caracteres." },
        { status: 400 }
      );
    }

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
      dias_suscripcion: 30, // 30 días de suscripción mensual inicial
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
