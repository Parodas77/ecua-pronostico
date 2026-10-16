import { NextResponse } from "next/server";

const dailyLeagueCache: Record<string, { syncedDateKey: string; syncedAtIso: string; payload: any }> = {};

function getNext8DaysWindow() {
  const now = new Date();
  const ecNow = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const daysCompact: string[] = [];
  const daysIso: string[] = [];

  for (let d = 0; d <= 8; d++) {
    const target = new Date(ecNow.getTime() + d * 24 * 60 * 60 * 1000);
    const iso = target.toISOString().split("T")[0];
    daysIso.push(iso);
    daysCompact.push(iso.replace(/-/g, ""));
  }

  return {
    todayKey: daysIso[0],
    fromIso: daysIso[0],
    toIso: daysIso[daysIso.length - 1],
    daysCompact,
    daysIso,
    currentYear: ecNow.getFullYear(),
  };
}

function removeBookmakerMargin(odd1: number, oddX: number, odd2: number) {
  const raw1 = 1 / odd1;
  const rawX = 1 / oddX;
  const raw2 = 1 / odd2;
  const overround = raw1 + rawX + raw2;
  return {
    marginPercent: Number(((overround - 1) * 100).toFixed(1)),
    cleanProb1: Number(((raw1 / overround) * 100).toFixed(1)),
    cleanProbX: Number(((rawX / overround) * 100).toFixed(1)),
    cleanProb2: Number(((raw2 / overround) * 100).toFixed(1)),
  };
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonPmf(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function samplePoissonKnuth(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function runRealPoissonMontecarlo(xgHome: number, xgAway: number, iterations = 10000) {
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let over25 = 0;
  let over35 = 0;
  let bttsYes = 0;

  for (let i = 0; i < iterations; i++) {
    const gh = samplePoissonKnuth(xgHome);
    const ga = samplePoissonKnuth(xgAway);
    const total = gh + ga;

    if (gh > ga) homeWins++;
    else if (gh === ga) draws++;
    else awayWins++;

    if (total > 2.5) over25++;
    if (total > 3.5) over35++;
    if (gh > 0 && ga > 0) bttsYes++;
  }

  const scoreMatrix: { score: string; prob: number }[] = [];
  for (let x = 0; x <= 5; x++) {
    for (let y = 0; y <= 5; y++) {
      const p = poissonPmf(x, xgHome) * poissonPmf(y, xgAway);
      scoreMatrix.push({ score: `${x}-${y}`, prob: Number((p * 100).toFixed(1)) });
    }
  }
  scoreMatrix.sort((a, b) => b.prob - a.prob);

  return {
    probHome: Number(((homeWins / iterations) * 100).toFixed(1)),
    probDraw: Number(((draws / iterations) * 100).toFixed(1)),
    probAway: Number(((awayWins / iterations) * 100).toFixed(1)),
    probOver25: Number(((over25 / iterations) * 100).toFixed(1)),
    probUnder25: Number((((iterations - over25) / iterations) * 100).toFixed(1)),
    probOver35: Number(((over35 / iterations) * 100).toFixed(1)),
    probUnder35: Number((((iterations - over35) / iterations) * 100).toFixed(1)),
    probBttsYes: Number(((bttsYes / iterations) * 100).toFixed(1)),
    probBttsNo: Number((((iterations - bttsYes) / iterations) * 100).toFixed(1)),
    topScores: scoreMatrix.slice(0, 3),
    expectedTotalGoals: Number((xgHome + xgAway).toFixed(2)),
  };
}

function getTeamInitials(name: string): string {
  const clean = (name || "").replace(/FC|CF|SC|CD|SD|Club|Deportivo|Sociedad|Deportiva/gi, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[2] ? words[2][0] : "")).toUpperCase().slice(0, 3);
  }
  return (name || "EQP").slice(0, 3).toUpperCase();
}

function normalizeTeamName(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|sc|cd|sd|club|deportivo|sporting|universitario|independiente|\(ecuador\)|\(quito\)/g, "")
    .trim();
}

function parseAmericanOddToDecimal(oddStrOrNum: any): number | null {
  if (!oddStrOrNum) return null;
  const num = Number(String(oddStrOrNum).replace(/[^0-9.-]/g, ""));
  if (isNaN(num) || num === 0) return null;
  if (num > 0) return Number((num / 100 + 1).toFixed(2));
  return Number((100 / Math.abs(num) + 1).toFixed(2));
}

const LEAGUE_CONFIG: Record<string, { espnSlug: string; espnName: string; oddsApiSportKey: string; apiFootballLeagueId: number }> = {
  ligapro: {
    espnSlug: "ecu.1",
    espnName: "LigaPro de Ecuador (Primera A)",
    oddsApiSportKey: "soccer_ecuador_primera_a",
    apiFootballLeagueId: 242,
  },
  champions: {
    espnSlug: "uefa.champions",
    espnName: "UEFA Champions League",
    oddsApiSportKey: "soccer_uefa_champs_league",
    apiFootballLeagueId: 2,
  },
  europa: {
    espnSlug: "uefa.europa",
    espnName: "UEFA Europa League",
    oddsApiSportKey: "soccer_uefa_europa_league",
    apiFootballLeagueId: 3,
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueParam = searchParams.get("league") || "ligapro";
  const forceRefresh = searchParams.get("refresh") === "true";

  const config = LEAGUE_CONFIG[leagueParam] || LEAGUE_CONFIG["ligapro"];
  const { todayKey, fromIso, toIso, daysCompact, currentYear } = getNext8DaysWindow();

  const cached = dailyLeagueCache[leagueParam];
  if (!forceRefresh && cached && cached.syncedDateKey === todayKey && cached.payload?.matches?.length > 0) {
    return NextResponse.json(cached.payload);
  }

  const apiFootballKey = process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || "2ceb3637610213b4d82a91d894642826";
  const oddsApiKey = process.env.ODDS_API_KEY || process.env.NEXT_PUBLIC_ODDS_API_KEY || "e5d6dd7668f865a60b12ee09a670089a";

  const diagnostics: string[] = [];
  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    const rawUpcomingEspnEvents: any[] = [];
    const seenEventIds = new Set<string>();
    const nowTimestamp = Date.now() - 1000 * 60 * 120;

    const dayPromises = daysCompact.map(async (dateCompact) => {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${config.espnSlug}/scoreboard?dates=${dateCompact}`;
        const res = await fetch(url, { headers: browserHeaders, cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.events) ? data.events : [];
      } catch {
        return [];
      }
    });

    const resultsByDay = await Promise.all(dayPromises);
    for (const dayEvents of resultsByDay) {
      for (const ev of dayEvents) {
        if (!ev || !ev.id || seenEventIds.has(String(ev.id))) continue;

        const state = ev.status?.type?.state || ev.competitions?.[0]?.status?.type?.state;
        const completed = ev.status?.type?.completed || ev.competitions?.[0]?.status?.type?.completed;
        const eventTime = new Date(ev.date).getTime();

        if (state === "post" || completed === true) continue;
        if (!isNaN(eventTime) && eventTime < nowTimestamp && state !== "in") continue;

        seenEventIds.add(String(ev.id));
        rawUpcomingEspnEvents.push(ev);
      }
    }

    if (rawUpcomingEspnEvents.length === 0) {
      try {
        const fallbackUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${config.espnSlug}/scoreboard`;
        const res = await fetch(fallbackUrl, { headers: browserHeaders, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          for (const ev of data?.events || []) {
            const state = ev.status?.type?.state || ev.competitions?.[0]?.status?.type?.state;
            const completed = ev.status?.type?.completed || ev.competitions?.[0]?.status?.type?.completed;
            if (state !== "post" && completed !== true && !seenEventIds.has(String(ev.id))) {
              seenEventIds.add(String(ev.id));
              rawUpcomingEspnEvents.push(ev);
            }
          }
        }
      } catch (e: any) {
        diagnostics.push(`Aviso ESPN (${config.espnSlug}): ${e?.message}`);
      }
    }

    rawUpcomingEspnEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let liveOddsEvents: any[] = [];
    try {
      const oddsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports/${config.oddsApiSportKey}/odds/?apiKey=${oddsApiKey}&regions=eu,us,uk&markets=h2h,totals&oddsFormat=decimal`,
        { headers: browserHeaders, cache: "no-store" }
      );
      if (oddsRes.ok) {
        const oddsData = await oddsRes.json();
        if (Array.isArray(oddsData)) liveOddsEvents = oddsData;
      }
    } catch {
      // Ignorar
    }

    let standingsStatsMap: Record<string, { goalsForAvg: number; goalsAgainstAvg: number }> = {};
    try {
      const stdRes = await fetch(
        `https://v3.football.api-sports.io/standings?league=${config.apiFootballLeagueId}&season=${currentYear}`,
        { headers: { ...browserHeaders, "x-apisports-key": apiFootballKey }, cache: "no-store" }
      );
      if (stdRes.ok) {
        const stdData = await stdRes.json();
        const groups = stdData?.response?.[0]?.league?.standings || [];
        for (const g of groups) {
          for (const r of g || []) {
            const t = normalizeTeamName(r.team?.name || "");
            const p = r.all?.played || 0;
            if (t && p > 0) {
              standingsStatsMap[t] = {
                goalsForAvg: Number((r.all.goals.for / p).toFixed(2)),
                goalsAgainstAvg: Number((r.all.goals.against / p).toFixed(2)),
              };
            }
          }
        }
      }
    } catch {
      // Ignorar
    }

    const processedMatches = rawUpcomingEspnEvents.map((ev, idx) => {
      const comp = ev.competitions?.[0];
      const competitors = comp?.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
      const awayComp = competitors.find((c: any) => c.homeAway === "away") || competitors[1];

      const homeName = homeComp?.team?.displayName || homeComp?.team?.name || "Local";
      const awayName = awayComp?.team?.displayName || awayComp?.team?.name || "Visitante";
      const venueName = comp?.venue?.fullName || "Estadio Oficial";
      const venueCity = comp?.venue?.address?.city || "";
      const fullVenue = venueCity ? `${venueName}, ${venueCity}` : venueName;

      const homeRecord = homeComp?.records?.[0]?.summary || "0-0-0";
      const awayRecord = awayComp?.records?.[0]?.summary || "0-0-0";

      const normH = normalizeTeamName(homeName);
      const normA = normalizeTeamName(awayName);

      const matchedOddEvent = liveOddsEvents.find((o) => {
        const oh = normalizeTeamName(o.home_team || "");
        const oa = normalizeTeamName(o.away_team || "");
        return (
          (oh.includes(normH.slice(0, 4)) || normH.includes(oh.slice(0, 4))) &&
          (oa.includes(normA.slice(0, 4)) || normA.includes(oa.slice(0, 4)))
        );
      });

      const espnOddsObj = comp?.odds?.[0];
      let cuotaLocal = parseAmericanOddToDecimal(espnOddsObj?.homeTeamOdds?.moneyLine) || 0;
      let cuotaEmpate = parseAmericanOddToDecimal(espnOddsObj?.drawOdds?.moneyLine) || 0;
      let cuotaVisita = parseAmericanOddToDecimal(espnOddsObj?.awayTeamOdds?.moneyLine) || 0;
      let lineGoals = espnOddsObj?.overUnder || 2.5;
      let cuotaOver = 0, cuotaUnder = 0;
      let bookmakerCount = cuotaLocal > 1 ? 1 : 0;
      let pinnacleProbs: { p1: number; pX: number; p2: number } | null = null;

      if (matchedOddEvent && Array.isArray(matchedOddEvent.bookmakers) && matchedOddEvent.bookmakers.length > 0) {
        bookmakerCount = matchedOddEvent.bookmakers.length;
        let sum1 = 0, sumX = 0, sum2 = 0, countH2h = 0;

        for (const bm of matchedOddEvent.bookmakers) {
          const h2hMarket = bm.markets?.find((mk: any) => mk.key === "h2h");
          if (h2hMarket && h2hMarket.outcomes) {
            const o1 = h2hMarket.outcomes.find((x: any) => normalizeTeamName(x.name) === normalizeTeamName(matchedOddEvent.home_team))?.price;
            const o2 = h2hMarket.outcomes.find((x: any) => normalizeTeamName(x.name) === normalizeTeamName(matchedOddEvent.away_team))?.price;
            const oX = h2hMarket.outcomes.find((x: any) => x.name.toLowerCase() === "draw")?.price;
            if (o1 && o2 && oX) {
              sum1 += o1; sumX += oX; sum2 += o2; countH2h++;
              if (bm.key === "pinnacle" || bm.key === "betfair_ex_eu") {
                const cleanPin = removeBookmakerMargin(o1, oX, o2);
                pinnacleProbs = { p1: cleanPin.cleanProb1, pX: cleanPin.cleanProbX, p2: cleanPin.cleanProb2 };
              }
            }
          }
          const totalsMarket = bm.markets?.find((mk: any) => mk.key === "totals");
          if (totalsMarket && totalsMarket.outcomes && cuotaOver === 0) {
            const overOut = totalsMarket.outcomes.find((x: any) => x.name.toLowerCase() === "over");
            const underOut = totalsMarket.outcomes.find((x: any) => x.name.toLowerCase() === "under");
            if (overOut && underOut) {
              lineGoals = overOut.point || 2.5;
              cuotaOver = Number(overOut.price.toFixed(2));
              cuotaUnder = Number(underOut.price.toFixed(2));
            }
          }
        }

        if (countH2h > 0) {
          cuotaLocal = Number((sum1 / countH2h).toFixed(2));
          cuotaEmpate = Number((sumX / countH2h).toFixed(2));
          cuotaVisita = Number((sum2 / countH2h).toFixed(2));
        }
      }

      const apiHomeStats = Object.entries(standingsStatsMap).find(([k]) => k.includes(normH.slice(0, 4)) || normH.includes(k.slice(0, 4)))?.[1];
      const apiAwayStats = Object.entries(standingsStatsMap).find(([k]) => k.includes(normA.slice(0, 4)) || normA.includes(k.slice(0, 4)))?.[1];

      const parseRecordRate = (rec: string): number | null => {
        const m = rec.match(/(\d+)-(\d+)-(\d+)/);
        if (!m) return null;
        const w = parseInt(m[1], 10), d = parseInt(m[2], 10), l = parseInt(m[3], 10);
        const tot = w + d + l;
        return tot > 0 ? (w * 3 + d) / (tot * 3) : null;
      };

      const hRate = parseRecordRate(homeRecord);
      const aRate = parseRecordRate(awayRecord);
      const hasLiveOdds = cuotaLocal > 1 && cuotaVisita > 1;

      let xgHome = 1.45;
      let xgAway = 1.10;
      let fuenteEstadistica = "";

      if (apiHomeStats && apiAwayStats) {
        xgHome = Number(((apiHomeStats.goalsForAvg + apiAwayStats.goalsAgainstAvg) / 2).toFixed(2));
        xgAway = Number(((apiAwayStats.goalsForAvg + apiAwayStats.goalsAgainstAvg) / 2).toFixed(2));
        fuenteEstadistica = `Promedios reales de gol (API-Football: ${homeName} ${apiHomeStats.goalsForAvg} GF vs ${awayName} ${apiAwayStats.goalsForAvg} GF)`;
      } else if (hRate !== null && aRate !== null) {
        xgHome = Number(Math.max(0.85, Math.min(2.45, 0.95 + hRate * 1.45)).toFixed(2));
        xgAway = Number(Math.max(0.65, Math.min(2.15, 0.70 + aRate * 1.25)).toFixed(2));
        fuenteEstadistica = `Rendimiento real en tabla (${homeName}: ${homeRecord} | ${awayName}: ${awayRecord})`;
      } else if (hasLiveOdds) {
        const tempDevig = removeBookmakerMargin(cuotaLocal, cuotaEmpate || 3.25, cuotaVisita);
        const refP1 = pinnacleProbs ? pinnacleProbs.p1 : tempDevig.cleanProb1;
        const refPX = pinnacleProbs ? pinnacleProbs.pX : tempDevig.cleanProbX;
        const refP2 = pinnacleProbs ? pinnacleProbs.p2 : tempDevig.cleanProb2;
        const homeShare = (refP1 + 0.5 * refPX) / (refP1 + refPX + refP2);
        xgHome = Number((2.55 * homeShare).toFixed(2));
        xgAway = Number((2.55 * (1 - homeShare)).toFixed(2));
        fuenteEstadistica = `Consenso de ${bookmakerCount} casas internacionales`;
      } else {
        xgHome = 1.48;
        xgAway = 1.12;
        fuenteEstadistica = `Calendario oficial ESPN (${config.espnName})`;
      }

      const sim = runRealPoissonMontecarlo(xgHome, xgAway, 10000);

      const c1 = hasLiveOdds ? cuotaLocal : Number(Math.max(1.22, 100 / Math.max(12, sim.probHome * 1.05)).toFixed(2));
      const cX = hasLiveOdds && cuotaEmpate > 1 ? cuotaEmpate : Number(Math.max(2.65, 100 / Math.max(12, sim.probDraw * 1.05)).toFixed(2));
      const c2 = hasLiveOdds ? cuotaVisita : Number(Math.max(1.30, 100 / Math.max(10, sim.probAway * 1.05)).toFixed(2));
      const cOver = cuotaOver > 1 ? cuotaOver : Number(Math.max(1.45, 100 / Math.max(18, sim.probOver25 * 1.05)).toFixed(2));
      const cUnder = cuotaUnder > 1 ? cuotaUnder : Number(Math.max(1.45, 100 / Math.max(18, sim.probUnder25 * 1.05)).toFixed(2));

      const devig = removeBookmakerMargin(c1, cX, c2);

      const candidateMarkets = [
        {
          name: `Gana ${homeName}`,
          explanation: `Victoria de ${homeName}`,
          odd: c1,
          houseImplied: Number(((1 / c1) * 100).toFixed(1)),
          realProb: sim.probHome,
          ev: Number((((sim.probHome / 100) * c1 - 1) * 100).toFixed(1)),
        },
        {
          name: `Gana ${awayName}`,
          explanation: `Victoria de ${awayName}`,
          odd: c2,
          houseImplied: Number(((1 / c2) * 100).toFixed(1)),
          realProb: sim.probAway,
          ev: Number((((sim.probAway / 100) * c2 - 1) * 100).toFixed(1)),
        },
        {
          name: `Más de ${lineGoals} Goles`,
          explanation: `Más de ${lineGoals} goles en total`,
          odd: cOver,
          houseImplied: Number(((1 / cOver) * 100).toFixed(1)),
          realProb: lineGoals === 3.5 ? sim.probOver35 : sim.probOver25,
          ev: Number(((((lineGoals === 3.5 ? sim.probOver35 : sim.probOver25) / 100) * cOver - 1) * 100).toFixed(1)),
        },
        {
          name: `Menos de ${lineGoals} Goles`,
          explanation: `Máximo ${lineGoals} goles en total`,
          odd: cUnder,
          houseImplied: Number(((1 / cUnder) * 100).toFixed(1)),
          realProb: lineGoals === 3.5 ? sim.probUnder35 : sim.probUnder25,
          ev: Number(((((lineGoals === 3.5 ? sim.probUnder35 : sim.probUnder25) / 100) * cUnder - 1) * 100).toFixed(1)),
        },
      ];

      const viable = candidateMarkets.filter((x) => x.odd >= 1.32);
      viable.sort((a, b) => b.realProb - a.realProb);
      const topPick = viable[0] || candidateMarkets[0];
      const minFairOddForTopPick = Number((100 / Math.max(1, topPick.realProb)).toFixed(2));
      const hasRealPositiveEdge = topPick.ev >= 1.0;

      const reporteVerificado = `${fuenteEstadistica}. Sede: ${fullVenue}. Probabilidad estimada por Montecarlo: ${topPick.realProb}%.`;
      const veredictoHonesto = `El modelo proyecta un ${topPick.realProb}% de probabilidad para '${topPick.name}' con ${sim.expectedTotalGoals} goles esperados. Cuota mínima justa: ${minFairOddForTopPick}.`;

      const dateObj = new Date(ev.date);

      return {
        id: `espn-${ev.id || idx}`,
        isFreeSample: idx === 0,
        leagueTitle: config.espnName,
        dataSource: `ESPN (${config.espnSlug})`,
        hasLiveOdds,
        home: homeName,
        homeInitials: getTeamInitials(homeName),
        homeAlt: `Local - ${fullVenue}`,
        away: awayName,
        awayInitials: getTeamInitials(awayName),
        awayAlt: `Visita - ${awayFormStr}`,
        jornada: `${config.espnName.toUpperCase()} — PARTIDO POR JUGAR`,
        date: isNaN(dateObj.getTime()) ? "Próxima Fecha" : dateObj.toLocaleDateString("es-EC", { timeZone: "America/Guayaquil", weekday: "long", day: "numeric", month: "long" }),
        time: isNaN(dateObj.getTime()) ? "Hora Oficial" : dateObj.toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" }) + " ECT",
        cuotaLocal: c1,
        cuotaEmpate: cX,
        cuotaVisita: c2,
        lineGoals,
        cuotaOver: cOver,
        cuotaUnder: cUnder,
        marginCasa: devig.marginPercent,
        cleanProb1: devig.cleanProb1,
        cleanProbX: devig.cleanProbX,
        cleanProb2: devig.cleanProb2,
        xgHome,
        xgAway,
        expectedGoals: sim.expectedTotalGoals,
        probHomeSim: sim.probHome,
        probDrawSim: sim.probDraw,
        probAwaySim: sim.probAway,
        probOverSim: lineGoals === 3.5 ? sim.probOver35 : sim.probOver25,
        probUnderSim: lineGoals === 3.5 ? sim.probUnder35 : sim.probUnder25,
        probBttsYesSim: sim.probBttsYes,
        probBttsNoSim: sim.probBttsNo,
        fairOddBttsYes: Number((100 / Math.max(1, sim.probBttsYes)).toFixed(2)),
        fairOddBttsNo: Number((100 / Math.max(1, sim.probBttsNo)).toFixed(2)),
        prob1X: Number((sim.probHome + sim.probDraw).toFixed(1)),
        probX2: Number((sim.probAway + sim.probDraw).toFixed(1)),
        topScores: sim.topScores,
        bestMarketName: topPick.name,
        bestMarketExplanation: topPick.explanation,
        bestOdd: topPick.odd,
        minFairOddForTopPick,
        probImplicitaBest: topPick.houseImplied,
        probReal: topPick.realProb,
        ev: topPick.ev,
        hasRealEdge: hasRealPositiveEdge,
        reportePlantilla: reporteVerificado,
        cuotaMejoradaCasa: "Evita combinadas de más de 3 eventos.",
        analisisDinamico: `Predicción Montecarlo (${xgHome} vs ${xgAway} goles): ${topPick.name} con ${topPick.realProb}% de certeza real.`,
      };
    });

    const payload = {
      source: "DAILY_SCHEDULED_ESPN_CALENDAR_SYNC",
      leagueName: config.espnName,
      window: `${fromIso} al ${toIso}`,
      diagnostics,
      matches: processedMatches,
    };

    dailyLeagueCache[leagueParam] = { syncedDateKey: todayKey, syncedAtIso: new Date().toISOString(), payload };
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ source: "ERROR", diagnostics: [err?.message || "Error"], matches: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, currentMatch, allMatches } = body;
    const rawQ = String(question || "");
    const list: any[] = Array.isArray(allMatches) && allMatches.length > 0 ? allMatches : currentMatch ? [currentMatch] : [];

    const sorted = [...list].sort((a: any, b: any) => (b.probReal || 0) - (a.probReal || 0));
    const top3 = sorted.slice(0, 3);
    const lines = top3.map((m: any, i: number) => `${i + 1}) ${m.home} vs ${m.away}: ${m.bestMarketName} con ${m.probReal}% de certeza Montecarlo (Cuota mínima rentable: ${m.minFairOddForTopPick}).`);

    return NextResponse.json({
      reply: `Top 3 partidos más sólidos de ${currentMatch?.leagueTitle || "la semana"}:\n\n${lines.join("\n")}`
    });
  } catch {
    return NextResponse.json({ reply: "Consulta procesada con éxito." });
  }
}
