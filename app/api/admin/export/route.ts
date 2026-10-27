import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getRetargetingUsers, generateRetargetingCsv } from "@/lib/crm";

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get("scope") || "retargeting"; // "retargeting" o "all"

    const users = scope === "all" ? getAllUsers() : getRetargetingUsers();
    const csvContent = generateRetargetingCsv(users);

    const filename = `ecuapronostico_clientes_${scope}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) {
      throw err;
    }
    console.error("Error en GET /api/admin/export:", err);
    return NextResponse.json({ success: false, error: "Error al exportar archivo CSV." }, { status: 500 });
  }
}
