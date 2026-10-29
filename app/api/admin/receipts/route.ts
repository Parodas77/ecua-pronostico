import { NextRequest, NextResponse } from "next/server";
import {
  getAllReceiptAudits,
  updateReceiptStatus,
  saveReceiptAudit,
  generateActivationLink,
  ReceiptAuditRecord,
} from "@/lib/receiptsDb";
import { analyzeComprobanteWithGemini } from "@/lib/geminiAuditor";

export async function GET(request: NextRequest) {
  try {
    const filter = request.nextUrl.searchParams.get("filter") || "todos";
    let receipts = getAllReceiptAudits();

    if (filter === "aprobados") {
      receipts = receipts.filter((r) => r.estado === "aprobado_automatico");
    } else if (filter === "revision") {
      receipts = receipts.filter((r) => r.estado === "requiere_revision_manual");
    }

    const all = getAllReceiptAudits();
    const stats = {
      total: all.length,
      aprobadosAutomaticos: all.filter((r) => r.estado === "aprobado_automatico").length,
      requiereRevision: all.filter((r) => r.estado === "requiere_revision_manual").length,
      autorizadosManual: all.filter((r) => r.estado === "autorizado_manual").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      receipts,
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) throw err;
    console.error("Error en GET /api/admin/receipts:", err);
    return NextResponse.json(
      { success: false, error: "Error al consultar auditorías de comprobantes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, imageBase64, mimeType, phone, newStatus, adminNotes } = body;

    // Acción 1: Modificar estado de comprobante existente (Autorizar manual o rechazar)
    if (action === "update_status" && id) {
      const updated = updateReceiptStatus(id, newStatus, adminNotes);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Comprobante no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ success: true, record: updated });
    }

    // Acción 2: Subir imagen directa desde el panel admin y auditar en vivo con Gemini Vision
    if (action === "audit_image" && imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const clientPhone = phone || "+593981122334";

      const audit = await analyzeComprobanteWithGemini(buffer, mimeType || "image/jpeg");
      const recordId = `IA-${Date.now().toString().slice(-6)}`;

      let clientMessage = "";
      let activationData = { link: "", token: "" };

      if (audit.valido) {
        activationData = generateActivationLink(clientPhone, audit.referencia, audit.monto);
        clientMessage = `¡Pago verificado con éxito! 🟢 Tu comprobante por $${audit.monto.toFixed(
          2
        )} ha sido validado. Ingresa al enlace para configurar tu usuario y contraseña VIP: ${
          activationData.link
        }`;
      } else {
        clientMessage =
          "Hola, no pudimos validar automáticamente tu comprobante (imagen ilegible o monto incorrecto). Un administrador revisará tu caso en breve para activarte manualmente.";
      }

      const record: ReceiptAuditRecord = {
        id: recordId,
        timestamp: new Date().toISOString(),
        telefono: clientPhone,
        media_id: "admin_manual_upload",
        image_preview: imageBase64.slice(0, 150) + "...", // Thumbnail
        monto: audit.monto,
        fecha_transaccion: audit.fecha,
        referencia: audit.referencia,
        banco: audit.banco,
        titular: audit.titular,
        valido: audit.valido,
        motivo: audit.motivo,
        auditadoPor: audit.auditadoPor,
        estado: audit.valido ? "aprobado_automatico" : "requiere_revision_manual",
        enlace_activacion: activationData.link,
        token_activacion: activationData.token,
        mensaje_cliente: clientMessage,
        notificado_whatsapp: false,
      };

      saveReceiptAudit(record);

      return NextResponse.json({
        success: true,
        audit,
        record,
      });
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida." }, { status: 400 });
  } catch (err: any) {
    console.error("Error en POST /api/admin/receipts:", err);
    return NextResponse.json(
      { success: false, error: "Error al procesar la auditoría del comprobante." },
      { status: 500 }
    );
  }
}
