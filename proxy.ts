import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir estáticos necesarios para renderizar el logo y estilos
  if (
    pathname.startsWith("/_next") ||
    pathname === "/logo.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Bloquear cualquier llamada a las APIs durante la pausa técnica
  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: "Servicio en pausa por mantenimiento técnico.",
        message:
          "Pedimos mil disculpas por esta interrupción técnica, que tardará solo un par de días en solucionarse. Volveremos con EcuaPronóstico recargados.",
      },
      { status: 503 }
    );
  }

  // Redirigir o reescribir cualquier otra ruta (ej. /radar, /aciertos, /admin, /terminal, etc.) a la pantalla única
  if (pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
