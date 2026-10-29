import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  getAllUsersAsync,
  updateUser,
  extendSubscription,
  extendSubscriptionAsync,
  approveAndActivateUser,
  approveAndActivateUserAsync,
} from "@/lib/crm";

export async function GET(request: NextRequest) {
  try {
    const filterStatus = request.nextUrl.searchParams.get("status") || "todos";
    const searchQuery = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

    let users = await getAllUsersAsync();

    // Filtro por estado
    if (filterStatus !== "todos") {
      users = users.filter((u) => u.estado_suscripcion === filterStatus);
    }

    // Búsqueda por nombre, apellido, username, correo, teléfono, ciudad o referencia de pago
    if (searchQuery) {
      users = users.filter(
        (u) =>
          u.nombre.toLowerCase().includes(searchQuery) ||
          u.apellido.toLowerCase().includes(searchQuery) ||
          u.username.toLowerCase().includes(searchQuery) ||
          u.correo.toLowerCase().includes(searchQuery) ||
          u.telefono_whatsapp.includes(searchQuery) ||
          u.ciudad.toLowerCase().includes(searchQuery) ||
          (u.referencia_pago && u.referencia_pago.toLowerCase().includes(searchQuery))
      );
    }

    const all = getAllUsers();
    const metrics = {
      total: all.length,
      pendientes: all.filter((u) => u.estado_suscripcion === "pendiente").length,
      activos: all.filter((u) => u.estado_suscripcion === "activo").length,
      inactivos: all.filter((u) => u.estado_suscripcion === "inactivo").length,
      expirados: all.filter((u) => u.estado_suscripcion === "expirado").length,
    };

    // Ocultar hash de contraseñas por seguridad
    const safeUsers = users.map(({ password_hash, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      metrics,
      users: safeUsers,
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) {
      throw err;
    }
    console.error("Error en GET /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Error al consultar usuarios del CRM." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, estado_suscripcion, extendDays, notas_admin } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de usuario requerido." }, { status: 400 });
    }

    let result;
    if (action === "approve") {
      result = await approveAndActivateUserAsync(id, extendDays || 30);
    } else if (extendDays && typeof extendDays === "number") {
      result = await extendSubscriptionAsync(id, extendDays);
    } else {
      const updates: any = {};
      if (estado_suscripcion) updates.estado_suscripcion = estado_suscripcion;
      if (notas_admin !== undefined) updates.notas_admin = notas_admin;
      result = updateUser(id, updates);
    }

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error || "No se pudo actualizar." }, { status: 400 });
    }

    const { password_hash, ...safeUser } = result.user;
    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? `¡Pago verificado! Usuario ${safeUser.nombre} autorizado con éxito. Sus 30 días han comenzado hoy.`
          : "Usuario actualizado con éxito.",
      user: safeUser,
    });
  } catch (err: any) {
    console.error("Error en PATCH /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Error interno al actualizar usuario." },
      { status: 500 }
    );
  }
}
