import { NextRequest, NextResponse } from "next/server";
import { validateActivationToken } from "@/lib/activationTokens";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const result = validateActivationToken(token);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error || "Token de activación inválido o expirado.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      tokenData: {
        phone: result.tokenData?.phone,
        amount: result.tokenData?.amount,
        reference: result.tokenData?.reference,
        bank: result.tokenData?.bank,
      },
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) throw err;
    console.error("Error en GET /api/auth/validate-token:", err);
    return NextResponse.json(
      { success: false, valid: false, error: "Error interno al validar el token de activación." },
      { status: 500 }
    );
  }
}
