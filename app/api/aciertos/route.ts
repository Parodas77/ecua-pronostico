import { NextResponse } from "next/server";
import {
  getAllHistorialAsync,
  saveHistorialRecordAsync,
  calculateHistorialMetrics,
  evaluatePrediction,
  HistorialMatchRecord,
} from "@/lib/historialDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterLeague = searchParams.get("league") || "todas";

    // 1. Obtener datos históricos de Supabase (con fallback local)
    const { records, source } = await getAllHistorialAsync();
    let list: HistorialMatchRecord[] = [...records];

    // 2. Auditoría Ciega: Si existen partidos con estado 'pendiente', buscar sus resultados oficiales en ESPN
    // REGLA DE ORO DE INTEGRIDAD: NUNCA se inventan pronósticos de partidos que ya finalizaron.
    // Solo se auditan partidos que YA fueron registrados con un pronóstico antes del pitazo inicial.
    const pendingMatches = list.filter((m) => m.status === "pendiente");

    if (pendingMatches.length > 0) {
      const browserHeaders = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
        Accept: "application/json",
      };

      const scanEndpoints = [
        { path: "soccer/ecu.1", category: "ligapro" },
        { path: "soccer/esp.1", category: "espana" },
        { path: "soccer/eng.1", category: "inglaterra" },
        { path: "soccer/uefa.champions", category: "champions" },
        { path: "basketball/nba", category: "nba" },
      ];

      for (const pending of pendingMatches) {
        try {
          const matchDateIso = pending.dateIso ? pending.dateIso.slice(0, 10).replace(/-/g, "") : "";
          const ep = scanEndpoints.find((s) => s.category === pending.leagueCategory) || scanEndpoints[0];

          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/${ep.path}/scoreboard?dates=${matchDateIso}`,
            { headers: browserHeaders, cache: "no-store" }
          );

          if (res.ok) {
            const data = await res.json();
            const events = Array.isArray(data?.events) ? data.events : [];
            const ev = events.find((e: any) => String(e.id) === String(pending.fixtureId));

            if (ev) {
              const comp = ev.competitions?.[0];
              const state = ev.status?.type?.state;
              const completed = ev.status?.type?.completed;

              if (state === "post" || completed === true) {
                const h = comp?.competitors?.find((c: any) => c.homeAway === "home") || comp?.competitors?.[0];
                const a = comp?.competitors?.find((c: any) => c.homeAway === "away") || comp?.competitors?.[1];

                const hScore = Number(h?.score || 0);
                const aScore = Number(a?.score || 0);

                // Liquidación matemática estricta e imparcial
                const evalResult = evaluatePrediction(
                  pending.tipoPrediccion,
                  pending.prediccion,
                  hScore,
                  aScore
                );

                const updatedRecord: HistorialMatchRecord = {
                  ...pending,
                  homeScore: hScore,
                  awayScore: aScore,
                  resultadoFinal: `${pending.home} ${hScore} - ${aScore} ${pending.away}`,
                  ganadorReal: evalResult.ganadorReal,
                  acerto: evalResult.acerto,
                  estado: evalResult.estado,
                  detalle: evalResult.detalle,
                  status: "finalizado",
                  settledAt: new Date().toISOString(),
                  externalUrl: `https://www.espn.com/soccer/match/_/gameId/${pending.fixtureId}`,
                };

                await saveHistorialRecordAsync(updatedRecord);

                const idx = list.findIndex((x) => x.id === pending.id);
                if (idx >= 0) list[idx] = updatedRecord;
              }
            }
          }
        } catch (e) {
          console.error("Error al auditar partido pendiente:", pending.fixtureId, e);
        }
      }
    }

    // Ordenar rigurosamente cronológico descendente (más nuevos primero)
    list.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());

    // 3. Cálculo de métricas dinámicas
    const metrics = calculateHistorialMetrics(list);

    // 4. Filtrar por liga si aplica
    const filteredList =
      filterLeague === "todas"
        ? list
        : list.filter(
            (m) =>
              (m.leagueCategory || "").toLowerCase() === filterLeague.toLowerCase() ||
              (m.league || "").toLowerCase().includes(filterLeague.toLowerCase())
          );

    return NextResponse.json({
      success: true,
      source,
      metrics,
      aciertos: filteredList,
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_PRERENDER")) throw err;
    console.error("Error en GET /api/aciertos:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Error al obtener historial" },
      { status: 500 }
    );
  }
}
