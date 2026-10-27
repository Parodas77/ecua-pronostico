import { NextRequest, NextResponse } from "next/server";
import {
  getAllSystemSubscriptions,
  getActiveAdminAlerts,
  updateSystemSubscription,
  extendSystemSubscription,
} from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  try {
    const onlyAlerts = request.nextUrl.searchParams.get("alerts") === "true";
    const subscriptions = getAllSystemSubscriptions();
    const alerts = getActiveAdminAlerts();

    return NextResponse.json({
      success: true,
      hasAlerts: alerts.length > 0,
      alertsCount: alerts.length,
      alerts: alerts,
      subscriptions: onlyAlerts ? alerts : subscriptions,
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) {
      throw err;
    }
    console.error("Error en GET /api/admin/subscriptions:", err);
    return NextResponse.json(
      { success: false, error: "Error al consultar las suscripciones del sistema." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, fecha_renovacion, costo, nombre_servicio, notas, daysToAdd } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { success: false, error: "Se requiere un ID numérico válido de servicio." },
        { status: 400 }
      );
    }

    if (action === "renew") {
      const updated = extendSystemSubscription(id, daysToAdd || 30);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "No se encontró el servicio solicitado." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Suscripción de ${updated.nombre_servicio} renovada exitosamente hasta el ${updated.fecha_renovacion}.`,
        subscription: updated,
      });
    }

    if (action === "update") {
      const updates: any = {};
      if (fecha_renovacion) updates.fecha_renovacion = fecha_renovacion;
      if (costo !== undefined) updates.costo = Number(costo);
      if (nombre_servicio) updates.nombre_servicio = nombre_servicio;
      if (notas !== undefined) updates.notas = notas;

      const updated = updateSystemSubscription(id, updates);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "No se encontró el servicio para actualizar." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Suscripción ${updated.nombre_servicio} actualizada correctamente.`,
        subscription: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Acción no reconocida. Use 'renew' o 'update'." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error en POST /api/admin/subscriptions:", err);
    return NextResponse.json(
      { success: false, error: "Error al procesar la actualización de la suscripción." },
      { status: 500 }
    );
  }
}
