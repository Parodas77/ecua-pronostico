import { NextRequest, NextResponse } from "next/server";
import { authenticateAndReactivateUserAsync } from "@/lib/crm";
import { validateActivationToken, consumeActivationToken } from "@/lib/activationTokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, identifier, password } = body;

    const cleanToken = (token || "").trim();
    if (!cleanToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Acceso denegado: Se requiere un token único de activación tras verificar el pago en WhatsApp.",
        },
        { status: 403 }
      );
    }

    // 1. Validar token único de activación
    const tokenCheck = validateActivationToken(cleanToken);
    if (!tokenCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            tokenCheck.error ||
            "El token de activación no es válido, ha expirado o ya fue utilizado.",
        },
        { status: 403 }
      );
    }

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor ingresa tu usuario o correo electrónico y tu contraseña actual.",
        },
        { status: 400 }
      );
    }

    // 2. Autenticar credenciales y reactivar suscripción (+30 días)
    const reactivateRes = await authenticateAndReactivateUserAsync(
      identifier,
      password,
      {
        token: cleanToken,
        reference: tokenCheck.tokenData?.reference,
        amount: tokenCheck.tokenData?.amount,
        bank: tokenCheck.tokenData?.bank,
      },
      30
    );

    if (!reactivateRes.success || !reactivateRes.user) {
      return NextResponse.json(
        {
          success: false,
          error: reactivateRes.error || "No se pudo reactivar la cuenta.",
        },
        { status: 400 }
      );
    }

    // 3. Invalidar inmediatamente el token de un solo uso
    consumeActivationToken(cleanToken, reactivateRes.user.username);

    const { password_hash, ...safeUser } = reactivateRes.user;

    return NextResponse.json({
      success: true,
      active: true,
      message:
        "🎉 ¡Membresía VIP reactivada con éxito! Se han añadido +30 días a tu cuenta existente.",
      user: safeUser,
      redirect: "/radar",
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) throw err;
    console.error("Error en POST /api/auth/reactivate:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al reactivar la suscripción.",
      },
      { status: 500 }
    );
  }
}
