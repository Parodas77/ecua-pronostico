import crypto from "crypto";
import { NextResponse } from "next/server";

// ==============================================================================
// BLINDAJE DE SEGURIDAD DE BACKEND EXCLUSIVO PARA EL ADMINISTRADOR (PEDRO RODAS)
// Ningún cliente externo, visitante ni usuario VIP puede consultar, modificar,
// aprobar cuentas dudosas, gestionar pagos de APIs o alterar claves en /api/admin/*
// ==============================================================================

export const ADMIN_OWNER_NAME = "Pedro Alfonso Rodas Talbott";
export const ADMIN_USERNAME = "admin";
export const ADMIN_COOKIE_NAME = "ecua_admin_master_token";

function getAdminSecretSalt(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "ecuapronostico_pedro_rodas_master_vault_2026_secret"
  );
}

/**
 * Genera el token criptográfico HMAC-SHA256 exclusivo de Pedro Rodas (admin)
 */
export function generateAdminMasterToken(): string {
  const hmac = crypto.createHmac("sha256", getAdminSecretSalt());
  hmac.update(`${ADMIN_USERNAME}::${ADMIN_OWNER_NAME}::ecuapronostico2026@`);
  return hmac.digest("hex");
}

/**
 * Verifica si una petición entrante al backend proviene legítimamente del Administrador (Pedro Rodas).
 * Acepta:
 * 1. Cookie HttpOnly `ecua_admin_master_token` firmada por `/api/auth/login`
 * 2. Header `x-admin-token` firmado o clave maestra de sesión admin
 * 3. Query param `adminToken` (para descargas directas como `/api/admin/export`)
 */
export function isAuthorizedAdminRequest(request: Request): boolean {
  const expectedToken = generateAdminMasterToken();

  // 1. Verificar Cookie HttpOnly
  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader.includes(`${ADMIN_COOKIE_NAME}=${expectedToken}`)) {
    return true;
  }

  // 2. Verificar Header x-admin-token
  const headerToken = (request.headers.get("x-admin-token") || "").trim();
  if (headerToken && (headerToken === expectedToken || headerToken.toLowerCase() === "ecuapronostico2026@")) {
    return true;
  }

  // 3. Verificar Query Param adminToken (para exportación CSV)
  try {
    const url = new URL(request.url);
    const queryToken = (url.searchParams.get("adminToken") || "").trim();
    if (queryToken && (queryToken === expectedToken || queryToken.toLowerCase() === "ecuapronostico2026@")) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Respuesta estándar HTTP 401/403 para bloquear cualquier intento de acceso no autorizado al backend admin
 */
export function unauthorizedAdminResponse() {
  return NextResponse.json(
    {
      success: false,
      error:
        "🔒 ACCESO DENEGADO EN BACKEND: Esta operación (aprobar cuentas, auditar pagos o gestionar APIs) es de uso exclusivo del Administrador Maestro (Pedro Rodas).",
    },
    { status: 403 }
  );
}
