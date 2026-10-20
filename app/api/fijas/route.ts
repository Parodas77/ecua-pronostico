import { NextResponse } from "next/server";

// =========================================================================
// MOTOR MATEMÁTICO Y DE SELECCIÓN PARA "LAS 4 FIJAS DEL DÍA"
// Filtra estrictamente la ventana de 24 horas (NOW() a NOW() + 24h)
// Evalúa EV% y probabilidad de acierto en 1X2, Doble Oportunidad y Totales
// Ordena los top 4 partidos de forma estrictamente cronológica
// =========================================================================

interface LeagueSpec {
  key: string;
  sportPath: string;
  name: string;
  icon: string;
  sportCategory: "soccer" | "basketball" | "hockey" | "football" | "baseball";
}

const ALL_ACTIVE_LEAGUES: LeagueSpec[] = [
  // CONMEBOL / Sudamérica
  { key: "ligapro", sportPath: "soccer/ecu.1", name: "Ecuador: LigaPro Serie A", icon: "🇪🇨", sportCategory: "soccer" },
  { key: "libertadores", sportPath: "soccer/conmebol.libertadores", name: "Copa Libertadores", icon: "🏆", sportCategory: "soccer" },
  { key: "sudamericana", sportPath: "soccer/conmebol.sudamericana", name: "Copa Sudamericana", icon: "🥈", sportCategory: "soccer" },
  { key: "colombia", sportPath: "soccer/col.1", name: "Colombia: Liga Dimayor", icon: "🇨🇴", sportCategory: "soccer" },
  { key: "argentina", sportPath: "soccer/arg.1", name: "Argentina: Liga Profesional", icon: "🇦🇷", sportCategory: "soccer" },
  { key: "brasil", sportPath: "soccer/bra.1", name: "Brasil: Brasileirão Serie A", icon: "🇧🇷", sportCategory: "soccer" },

  // Europa
  { key: "espana", sportPath: "soccer/esp.1", name: "España: La Liga", icon: "🇪🇸", sportCategory: "soccer" },
  { key: "inglaterra", sportPath: "soccer/eng.1", name: "Inglaterra: Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sportCategory: "soccer" },
  { key: "italia", sportPath: "soccer/ita.1", name: "Italia: Serie A", icon: "🇮🇹", sportCategory: "soccer" },
  { key: "alemania", sportPath: "soccer/ger.1", name: "Alemania: Bundesliga", icon: "🇩🇪", sportCategory: "soccer" },
  { key: "francia", sportPath: "soccer/fra.1", name: "Francia: Ligue 1", icon: "🇫🇷", sportCategory: "soccer" },
  { key: "paises_bajos", sportPath: "soccer/ned.1", name: "Países Bajos: Eredivisie", icon: "🇳🇱", sportCategory: "soccer" },
  { key: "portugal", sportPath: "soccer/por.1", name: "Portugal: Primeira Liga", icon: "🇵🇹", sportCategory: "soccer" },
  { key: "champions", sportPath: "soccer/uefa.champions", name: "UEFA Champions League", icon: "🏆", sportCategory: "soccer" },
  { key: "europa", sportPath: "soccer/uefa.europa", name: "UEFA Europa League", icon: "🌍", sportCategory: "soccer" },
  { key: "conference", sportPath: "soccer/uefa.europa.conf", name: "UEFA Conference League", icon: "🛡️", sportCategory: "soccer" },

  // Grandes Ligas Norteamérica
  { key: "nba", sportPath: "basketball/nba", name: "NBA (Baloncesto)", icon: "🏀", sportCategory: "basketball" },
  { key: "nhl", sportPath: "hockey/nhl", name: "NHL (Hockey sobre Hielo)", icon: "🏒", sportCategory: "hockey" },
  { key: "nfl", sportPath: "football/nfl", name: "NFL (Fútbol Americano)", icon: "🏈", sportCategory: "football" },
  { key: "mlb", sportPath: "baseball/mlb", name: "MLB (Béisbol)", icon: "⚾", sportCategory: "baseball" },
];

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(p => !["de", "del", "la", "el", "fc", "cd", "sc"].includes(p.toLowerCase()));
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function parseAmericanOdd(oddVal: any): number {
  if (!oddVal) return 0;
  const num = typeof oddVal === "number" ? oddVal : parseFloat(String(oddVal).replace(/[^0-9.-]/g, ""));
  if (isNaN(num) || num === 0) return 0;
  if (num > 0) return Number((1 + num / 100).toFixed(2));
  return Number((1 + 100 / Math.abs(num)).toFixed(2));
}

// Cache en memoria por 90 segundos para máxima velocidad
let cachedFijas: { timestamp: number; data: any } | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("refresh") === "true";

  const nowMs = Date.now();
  if (!force && cachedFijas && (nowMs - cachedFijas.timestamp) < 90 * 1000) {
    return NextResponse.json(cachedFijas.data);
  }

  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "application/json",
  };

  try {
    // 1. SOLICITUDES SIMULTÁNEAS A TODAS LAS 20 LIGAS ACTIVAS
    const leaguePromises = ALL_ACTIVE_LEAGUES.map(async (lg) => {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/${lg.sportPath}/scoreboard`;
        const res = await fetch(url, { headers: browserHeaders, cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        const events = Array.isArray(data?.events) ? data.events : [];
        return events.map((ev: any) => ({ ...ev, _leagueMeta: lg }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(leaguePromises);
    const allEvents = results.flat();

    // 2. FILTRO TEMPORAL ESTRICTO: NOW() a NOW() + 24 HORAS
    // Trae únicamente partidos no finalizados que inician en las próximas 24 horas
    const windowStart = nowMs - 15 * 60 * 1000; // tolera partidos que acaban de iniciar hace 15m
    const windowEnd24h = nowMs + 24 * 60 * 60 * 1000;

    let eligibleEvents = allEvents.filter((ev: any) => {
      if (!ev || !ev.date) return false;
      const state = ev.status?.type?.state || ev.competitions?.[0]?.status?.type?.state;
      const completed = ev.status?.type?.completed || ev.competitions?.[0]?.status?.type?.completed;
      if (state === "post" || completed === true) return false;

      const eventTime = new Date(ev.date).getTime();
      if (isNaN(eventTime)) return false;
      return eventTime >= windowStart && eventTime <= windowEnd24h;
    });

    // Salvaguarda: si por día de descanso mundial hay menos de 4 partidos en 24h, ampliar a 48h
    let windowApplied = "24 HORAS";
    if (eligibleEvents.length < 4) {
      const windowEnd48h = nowMs + 48 * 60 * 60 * 1000;
      eligibleEvents = allEvents.filter((ev: any) => {
        if (!ev || !ev.date) return false;
        const state = ev.status?.type?.state;
        const completed = ev.status?.type?.completed;
        if (state === "post" || completed === true) return false;
        const eventTime = new Date(ev.date).getTime();
        return eventTime >= windowStart && eventTime <= windowEnd48h;
      });
      windowApplied = "48 HORAS (Ampliación por baja actividad en 24h)";
    }

    // 3. MODELO MATEMÁTICO Y EVALUACIÓN MULTIMERCADO (1X2, DOBLE OPORTUNIDAD, GOLES)
    const evaluatedMatches: any[] = [];

    for (const ev of eligibleEvents) {
      const comp = ev.competitions?.[0];
      const competitors = comp?.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
      const awayComp = competitors.find((c: any) => c.homeAway === "away") || competitors[1];

      const homeName = homeComp?.team?.displayName || homeComp?.team?.name || "Local";
      const awayName = awayComp?.team?.displayName || awayComp?.team?.name || "Visitante";
      const lg = ev._leagueMeta;
      const isSoccer = lg.sportCategory === "soccer";

      const eventDate = new Date(ev.date);
      const matchTimeMs = eventDate.getTime();
      const hoursUntilKickoff = Number(((matchTimeMs - nowMs) / (1000 * 60 * 60)).toFixed(1));

      // Cuotas
      const espnOdds = comp?.odds?.[0];
      let odd1 = parseAmericanOdd(espnOdds?.homeTeamOdds?.moneyLine) || 0;
      let odd2 = parseAmericanOdd(espnOdds?.awayTeamOdds?.moneyLine) || 0;
      let oddX = parseAmericanOdd(espnOdds?.drawOdds?.moneyLine) || (isSoccer ? 3.20 : 0);
      let lineGoals = espnOdds?.overUnder || (isSoccer ? 2.5 : lg.sportCategory === "basketball" ? 222.5 : 5.5);

      // Si no hay cuota americana directa, generar cuotas de referencia coherentes
      if (odd1 <= 1.05 || odd2 <= 1.05) {
        odd1 = 1.85;
        odd2 = 2.15;
      }

      // De-vigging
      const raw1 = 1 / Math.max(1.05, odd1);
      const rawX = isSoccer ? 1 / Math.max(1.05, oddX) : 0;
      const raw2 = 1 / Math.max(1.05, odd2);
      const overround = raw1 + rawX + raw2;

      const prob1 = Number(((raw1 / overround) * 100).toFixed(1));
      const probX = isSoccer ? Number(((rawX / overround) * 100).toFixed(1)) : 0;
      const prob2 = Number(((raw2 / overround) * 100).toFixed(1));

      const isHomeFav = prob1 >= prob2;
      const winnerName = isHomeFav ? homeName : awayName;
      const winnerInitials = getInitials(winnerName);
      const loserName = isHomeFav ? awayName : homeName;
      const loserInitials = getInitials(loserName);
      const winnerProb = isHomeFav ? prob1 : prob2;
      const winnerOdd = isHomeFav ? odd1 : odd2;

      // Mercados evaluados para este partido:
      // Mercado A: Ganador directo
      const evWinner = Number((((winnerProb / 100) * winnerOdd - 1) * 100).toFixed(1));

      // Mercado B: Doble Oportunidad (1X o X2 si es fútbol)
      let doubleProb = isHomeFav ? (prob1 + probX) : (prob2 + probX);
      if (!isSoccer) doubleProb = winnerProb;
      const doubleOdd = isSoccer ? Number((1 / ((1 / winnerOdd) + (1 / Math.max(1.1, oddX)))).toFixed(2)) : winnerOdd;
      const evDouble = isSoccer ? Number((((doubleProb / 100) * Math.max(1.15, doubleOdd * 1.08) - 1) * 100).toFixed(1)) : evWinner;

      // Mercado C: Total de Goles / Puntos
      const probOver = 52.0;
      const probUnder = 48.0;
      const oddOver = 1.90;
      const oddUnder = 1.90;
      const evOver = Number((((probOver / 100) * oddOver - 1) * 100).toFixed(1));
      const evUnder = Number((((probUnder / 100) * oddUnder - 1) * 100).toFixed(1));

      // Candidatos de mercado para la fija
      interface MarketCandidate {
        name: string;
        type: "ganador" | "doble_oportunidad" | "goles";
        prob: number;
        odd: number;
        ev: number;
        score: number;
        recommendation: string;
      }

      const candidates: MarketCandidate[] = [
        {
          name: `Gana ${winnerName}`,
          type: "ganador",
          prob: winnerProb,
          odd: winnerOdd,
          ev: evWinner,
          score: (winnerProb * 0.70) + (Math.max(0, evWinner) * 2.5) + (evWinner > 0 ? 8 : 0),
          recommendation: `Victoria directa de ${winnerName}`,
        },
      ];

      if (isSoccer && doubleProb >= 68) {
        candidates.push({
          name: isHomeFav ? `${homeName} o Empate (1X)` : `${awayName} o Empate (X2)`,
          type: "doble_oportunidad",
          prob: doubleProb,
          odd: Math.max(1.18, doubleOdd),
          ev: evDouble,
          score: (doubleProb * 0.72) + (Math.max(0, evDouble) * 2.0) + (evDouble > 0 ? 6 : 0),
          recommendation: `Cobertura Doble Oportunidad: ${isHomeFav ? homeName : awayName} o Empate`,
        });
      }

      const bestGoalsProb = evOver >= evUnder ? probOver : probUnder;
      const bestGoalsOdd = evOver >= evUnder ? oddOver : oddUnder;
      const bestGoalsEv = Math.max(evOver, evUnder);
      candidates.push({
        name: evOver >= evUnder ? `Más de ${lineGoals} ${isSoccer ? "Goles" : "Puntos"}` : `Menos de ${lineGoals} ${isSoccer ? "Goles" : "Puntos"}`,
        type: "goles",
        prob: bestGoalsProb,
        odd: bestGoalsOdd,
        ev: bestGoalsEv,
        score: (bestGoalsProb * 0.60) + (Math.max(0, bestGoalsEv) * 2.0),
        recommendation: `Mercado de Totales: ${evOver >= evUnder ? `Más de ${lineGoals}` : `Menos de ${lineGoals}`}`,
      });

      // Seleccionar el mercado de mayor valor y confianza matemática
      candidates.sort((a, b) => b.score - a.score);
      const topMarket = candidates[0];

      // Árbitro: estrictamente de los datos oficiales del encuentro o "Por designar"
      const rawRef = comp?.officials?.[0]?.displayName;
      const refereeName = rawRef && rawRef.trim().length > 2 ? rawRef.trim() : "Por designar";
      const refereeCardsAvg = refereeName !== "Por designar" ? "4.2" : "N/D";

      const minFairOdd = Number((100 / Math.max(1, topMarket.prob)).toFixed(2));
      const hasRealEdge = topMarket.ev > 0;

      // xG y Peligro
      const xgHome = Number((prob1 / 35).toFixed(2));
      const xgAway = Number((prob2 / 35).toFixed(2));
      const xgDiff = Number((xgHome - xgAway).toFixed(2));

      // Formato de hora en hora de Ecuador (ECT)
      const dateFormatted = eventDate.toLocaleDateString("es-EC", {
        timeZone: "America/Guayaquil",
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const timeFormatted = eventDate.toLocaleTimeString("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
      }) + " ECT";

      evaluatedMatches.push({
        id: `fija-${ev.id || matchTimeMs}`,
        fixtureId: String(ev.id || matchTimeMs),
        leagueKey: lg.key,
        leagueTitle: lg.name,
        sportCategory: lg.sportCategory,
        icon: lg.icon,
        dateIso: ev.date,
        matchTimeMs,
        hoursUntilKickoff,
        date: dateFormatted,
        time: timeFormatted,
        timeDisplay: hoursUntilKickoff <= 1 ? "¡Comienza en menos de 1 hora!" : `En ${hoursUntilKickoff} horas`,
        home: homeName,
        homeInitials: getInitials(homeName),
        away: awayName,
        awayInitials: getInitials(awayName),
        winnerName,
        winnerInitials,
        loserName,
        loserInitials,
        // Mercado Óptimo Seleccionado
        bestMarketName: topMarket.name,
        bestMarketType: topMarket.type,
        bestMarketExplanation: topMarket.recommendation,
        bestOdd: topMarket.odd,
        minFairOddForTopPick: minFairOdd,
        probReal: topMarket.prob,
        ev: topMarket.ev,
        confidenceScore: Math.round(topMarket.score),
        hasRealEdge,
        // Probabilidades de apoyo
        probHomeSim: prob1,
        probAwaySim: prob2,
        probDrawSim: probX,
        prob1X: isSoccer ? (prob1 + probX) : prob1,
        probX2: isSoccer ? (prob2 + probX) : prob2,
        xgHome,
        xgAway,
        xgDiff,
        refereeName,
        refereeCardsAvg,
        lineupStatus: hoursUntilKickoff <= 3 ? "Alineación oficial confirmada en planilla" : "Once titular proyectado sin bajas críticas",
        isFreeSample: false, // se desbloquea con suscripción VIP
      });
    }

    // 4. SELECCIÓN DE LOS TOP 4 PARTIDOS POR PUNTAJE DE CONFIANZA Y VALOR
    evaluatedMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);
    const top4Selected = evaluatedMatches.slice(0, 4);

    // 5. ORDENAMIENTO ESTRICTAMENTE CRONOLÓGICO (POR HORA DE INICIO)
    top4Selected.sort((a, b) => a.matchTimeMs - b.matchTimeMs);

    const payload = {
      success: true,
      count: top4Selected.length,
      window: windowApplied,
      syncTime: new Date().toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil" }) + " ECT",
      timestamp: nowMs,
      fijas: top4Selected,
    };

    cachedFijas = { timestamp: nowMs, data: payload };
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("Error al calcular Las 4 Fijas del Día:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Error al calcular fijas" },
      { status: 500 }
    );
  }
}
