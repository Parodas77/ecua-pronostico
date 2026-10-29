import { NextRequest, NextResponse } from "next/server";
import { analyzeComprobanteWithGemini } from "@/lib/geminiAuditor";
import {
  saveReceiptAudit,
  generateActivationLink,
  sendWhatsAppMessage,
  ReceiptAuditRecord,
} from "@/lib/receiptsDb";

// 1. VERIFICACIÓN DEL WEBHOOK DE META (CHALLENGE)
export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("hub.mode");
    const token = request.nextUrl.searchParams.get("hub.verify_token");
    const challenge = request.nextUrl.searchParams.get("hub.challenge");

    const expectedToken =
      process.env.WHATSAPP_VERIFY_TOKEN || "ecuapronostico_verify_token_2026";

    if (mode === "subscribe" && token === expectedToken) {
      console.log("✅ Webhook de Meta WhatsApp verificado exitosamente.");
      return new Response(challenge || "OK", { status: 200 });
    }

    console.warn("⚠️ Intento de verificación de webhook no autorizado.");
    return new NextResponse("Token de verificación inválido", { status: 403 });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) throw err;
    console.error("Error en GET /api/whatsapp/webhook:", err);
    return new NextResponse("Error de verificación", { status: 500 });
  }
}

// 2. RECEPTOR DE MENSAJES Y COMPROBANTES DE WHATSAPP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Soporte para pruebas directas / simuladas desde el panel de admin o scripts
    if (body.test === true && body.imageBase64) {
      return await handleDirectTestAudit(body);
    }

    // Estructura oficial de Meta WhatsApp Cloud API
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Si no es un mensaje entrante (ej. confirmación de entrega), responder 200 OK a Meta
    if (!message) {
      return NextResponse.json({ status: "ignored_no_message" }, { status: 200 });
    }

    const fromPhone = message.from || "593979198755";
    const messageType = message.type;
    const messageId = message.id;

    // Solo procesamos mensajes de tipo imagen (comprobantes de transferencia)
    if (messageType !== "image") {
      // Si el cliente envía texto, le enviamos recordatorio
      if (messageType === "text") {
        await sendWhatsAppMessage(
          fromPhone,
          "Hola 👋 Para activar tu membresía VIP en Ecuapronóstico ($14.99/mes), por favor envía la foto o captura legible de tu comprobante de transferencia bancaria por este medio."
        );
      }
      return NextResponse.json({ status: "non_image_handled" }, { status: 200 });
    }

    const imageObj = message.image;
    const mediaId = imageObj?.id;
    const mimeType = imageObj?.mime_type || "image/jpeg";

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID no encontrado" }, { status: 400 });
    }

    // 1. DESCARGA DEL ARCHIVO MULTIMEDIA DE FORMA TEMPORAL Y SEGURA
    const imageBuffer = await downloadMetaMedia(mediaId);
    if (!imageBuffer) {
      await sendWhatsAppMessage(
        fromPhone,
        "Hola, tuvimos un problema al descargar tu comprobante de WhatsApp. Por favor intenta reenviarlo."
      );
      return NextResponse.json({ error: "Fallo al descargar media de Meta" }, { status: 500 });
    }

    // 2. MOTOR DE ANÁLISIS OCR CON GEMINI VISION
    const auditResult = await analyzeComprobanteWithGemini(imageBuffer, mimeType);

    const recordId = `REC-${Date.now().toString().slice(-6)}`;
    let clientMessage = "";
    let activationData = { link: "", token: "" };

    // 3. RESPUESTA Y ACCIÓN AUTOMÁTICA EN LA BASE DE DATOS
    if (auditResult.valido) {
      // GENERAR ENLACE ÚNICO DE REGISTRO PRELLENADO
      activationData = generateActivationLink(fromPhone, auditResult.referencia, auditResult.monto);

      clientMessage = `¡Pago verificado con éxito! 🟢 Tu comprobante por $${auditResult.monto.toFixed(
        2
      )} ha sido validado.\n\nIngresa al siguiente enlace para configurar tu usuario y contraseña VIP:\n🔗 ${
        activationData.link
      }\n\n¡Tus 30 días comenzarán en cuanto completes tu usuario!`;

      // Enviar respuesta automática por WhatsApp
      await sendWhatsAppMessage(fromPhone, clientMessage);
    } else {
      clientMessage =
        "Hola, no pudimos validar automáticamente tu comprobante (imagen ilegible o monto incorrecto). Un administrador revisará tu caso en breve para activarte manualmente.";

      await sendWhatsAppMessage(fromPhone, clientMessage);
    }

    // Registrar en la base de datos de auditorías
    const record: ReceiptAuditRecord = {
      id: recordId,
      timestamp: new Date().toISOString(),
      telefono: fromPhone.startsWith("+") ? fromPhone : `+${fromPhone}`,
      media_id: mediaId,
      monto: auditResult.monto,
      fecha_transaccion: auditResult.fecha,
      referencia: auditResult.referencia,
      banco: auditResult.banco,
      titular: auditResult.titular,
      valido: auditResult.valido,
      motivo: auditResult.motivo,
      auditadoPor: auditResult.auditadoPor,
      estado: auditResult.valido ? "aprobado_automatico" : "requiere_revision_manual",
      enlace_activacion: activationData.link,
      token_activacion: activationData.token,
      mensaje_cliente: clientMessage,
      notificado_whatsapp: true,
    };

    saveReceiptAudit(record);

    return NextResponse.json({
      success: true,
      status: "processed",
      valido: auditResult.valido,
      audit: auditResult,
      recordId: record.id,
    });
  } catch (err: any) {
    console.error("Error en POST /api/whatsapp/webhook:", err);
    return NextResponse.json(
      { success: false, error: "Error interno al procesar webhook de WhatsApp" },
      { status: 500 }
    );
  }
}

// Helper para descargar la imagen desde Meta Graph API
async function downloadMetaMedia(mediaId: string): Promise<Buffer | null> {
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!token) {
    console.warn("WHATSAPP_API_TOKEN no configurado. Usando imagen sintética de prueba.");
    return Buffer.from("imagen_simulada_sin_token");
  }

  try {
    // Paso 1: Consultar la URL de descarga temporal
    const metaMediaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
    const resMedia = await fetch(metaMediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resMedia.ok) {
      console.error("Error al obtener URL del media:", await resMedia.text());
      return null;
    }

    const mediaInfo = await resMedia.json();
    const downloadUrl = mediaInfo.url;

    // Paso 2: Descargar el buffer binario
    const resDownload = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Ecuapronostico-Bot/1.0",
      },
    });

    if (!resDownload.ok) {
      console.error("Error al descargar archivo binario:", await resDownload.text());
      return null;
    }

    const arrayBuffer = await resDownload.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error("Excepción en downloadMetaMedia:", err);
    return null;
  }
}

// Manejador de auditoría directa para pruebas y simulaciones desde el panel
async function handleDirectTestAudit(body: any) {
  const phone = body.phone || "+593981122334";
  const mimeType = body.mimeType || "image/jpeg";
  const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  const auditResult = await analyzeComprobanteWithGemini(imageBuffer, mimeType);

  const recordId = `TEST-${Date.now().toString().slice(-6)}`;
  let clientMessage = "";
  let activationData = { link: "", token: "" };

  if (auditResult.valido) {
    activationData = generateActivationLink(phone, auditResult.referencia, auditResult.monto);
    clientMessage = `¡Pago verificado con éxito! 🟢 Tu comprobante por $${auditResult.monto.toFixed(
      2
    )} ha sido validado.\n\nIngresa al siguiente enlace para configurar tu usuario y contraseña VIP:\n🔗 ${
      activationData.link
    }`;
  } else {
    clientMessage =
      "Hola, no pudimos validar automáticamente tu comprobante (imagen ilegible o monto incorrecto). Un administrador revisará tu caso en breve para activarte manualmente.";
  }

  const record: ReceiptAuditRecord = {
    id: recordId,
    timestamp: new Date().toISOString(),
    telefono: phone,
    media_id: "direct_upload_test",
    monto: auditResult.monto,
    fecha_transaccion: auditResult.fecha,
    referencia: auditResult.referencia,
    banco: auditResult.banco,
    titular: auditResult.titular,
    valido: auditResult.valido,
    motivo: auditResult.motivo,
    auditadoPor: auditResult.auditadoPor,
    estado: auditResult.valido ? "aprobado_automatico" : "requiere_revision_manual",
    enlace_activacion: activationData.link,
    token_activacion: activationData.token,
    mensaje_cliente: clientMessage,
    notificado_whatsapp: true,
  };

  saveReceiptAudit(record);

  return NextResponse.json({
    success: true,
    valido: auditResult.valido,
    audit: auditResult,
    record,
    mensajeSimulado: clientMessage,
  });
}
