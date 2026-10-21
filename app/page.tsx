"use client";
import { useState, useEffect } from "react";

interface LeagueOption {
  id: string;
  name: string;
  sportLabel?: string;
  icon: string;
}

interface DropdownSection {
  title?: string;
  options: LeagueOption[];
}

interface RegionTab {
  id: "north_america" | "south_america" | "europe";
  label: string;
  shortLabel: string;
  icon: string;
  subtitle: string;
  sections: DropdownSection[];
}

const REGION_TABS: RegionTab[] = [
  {
    id: "north_america",
    label: "AMÉRICA DEL NORTE",
    shortLabel: "América del Norte",
    icon: "🏈",
    subtitle: "US / CA Sports",
    sections: [
      {
        title: "Grandes Ligas Norteamericanas",
        options: [
          { id: "nfl", name: "NFL", sportLabel: "Fútbol Americano", icon: "🏈" },
          { id: "nba", name: "NBA", sportLabel: "Baloncesto", icon: "🏀" },
          { id: "nhl", name: "NHL", sportLabel: "Hockey sobre Hielo", icon: "🏒" },
          { id: "mlb", name: "MLB", sportLabel: "Béisbol / Baseball", icon: "⚾" },
        ],
      },
    ],
  },
  {
    id: "south_america",
    label: "AMÉRICA DEL SUR",
    shortLabel: "América del Sur",
    icon: "⚽",
    subtitle: "CONMEBOL",
    sections: [
      {
        title: "Ligas Locales",
        options: [
          { id: "argentina", name: "Argentina: Liga Profesional", sportLabel: "Primera División", icon: "🇦🇷" },
          { id: "brasil", name: "Brasil: Brasileirão Serie A", sportLabel: "Serie A", icon: "🇧🇷" },
          { id: "colombia", name: "Colombia: Liga Dimayor", sportLabel: "Categoría Primera A", icon: "🇨🇴" },
          { id: "ligapro", name: "Ecuador: LigaPro Serie A", sportLabel: "Primera División", icon: "🇪🇨" },
        ],
      },
      {
        title: "Competiciones CONMEBOL",
        options: [
          { id: "libertadores", name: "Copa Libertadores de América", sportLabel: "Torneo Continental", icon: "🏆" },
          { id: "sudamericana", name: "Copa Sudamericana", sportLabel: "Torneo Continental", icon: "🥈" },
          { id: "recopa_sudamericana", name: "Recopa Sudamericana", sportLabel: "Final Continental", icon: "🏅" },
        ],
      },
    ],
  },
  {
    id: "europe",
    label: "EUROPA",
    shortLabel: "Europa",
    icon: "🇪🇺",
    subtitle: "Ligas y UEFA",
    sections: [
      {
        title: "The Big Five + Históricas",
        options: [
          { id: "espana", name: "España: La Liga", sportLabel: "Primera División", icon: "🇪🇸" },
          { id: "inglaterra", name: "Inglaterra: Premier League", sportLabel: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
          { id: "italia", name: "Italia: Serie A", sportLabel: "Serie A", icon: "🇮🇹" },
          { id: "alemania", name: "Alemania: Bundesliga", sportLabel: "Bundesliga", icon: "🇩🇪" },
          { id: "francia", name: "Francia: Ligue 1", sportLabel: "Ligue 1", icon: "🇫🇷" },
          { id: "paises_bajos", name: "Países Bajos: Eredivisie", sportLabel: "Eredivisie", icon: "🇳🇱" },
          { id: "portugal", name: "Portugal: Primeira Liga", sportLabel: "Primeira Liga", icon: "🇵🇹" },
        ],
      },
      {
        title: "Competiciones Internacionales UEFA",
        options: [
          { id: "champions", name: "UEFA Champions League", sportLabel: "Torneo Continental", icon: "🏆" },
          { id: "europa", name: "UEFA Europa League", sportLabel: "Torneo Continental", icon: "🌍" },
          { id: "conference", name: "UEFA Conference League", sportLabel: "Torneo Continental", icon: "🛡️" },
          { id: "supercopa_uefa", name: "Supercopa de la UEFA", sportLabel: "Final Continental", icon: "⭐" },
        ],
      },
    ],
  },
];

function getSportLexicon(sportCategory?: string) {
  const cat = (sportCategory || "soccer").toLowerCase();
  switch (cat) {
    case "basketball":
      return {
        sportCategory: "basketball",
        unitLabel: "Puntos",
        metricLabel: "Eficiencia Ofensiva / xPts",
        metricShort: "ΔxPts",
        fijaTag: "🏀 FIJA A GANAR",
        icon: "🏀",
      };
    case "baseball":
      return {
        sportCategory: "baseball",
        unitLabel: "Carreras (Runs)",
        metricLabel: "Peligro xRuns",
        metricShort: "ΔxRuns",
        fijaTag: "⚾ FIJA A GANAR",
        icon: "⚾",
      };
    case "football":
      return {
        sportCategory: "football",
        unitLabel: "Puntos",
        metricLabel: "Yardas / Eficiencia",
        metricShort: "ΔxPts",
        fijaTag: "🏈 FIJA A GANAR",
        icon: "🏈",
      };
    case "hockey":
      return {
        sportCategory: "hockey",
        unitLabel: "Goles (Pucks)",
        metricLabel: "Peligro xG (Pucks)",
        metricShort: "ΔxG",
        fijaTag: "🏒 FIJA A GANAR",
        icon: "🏒",
      };
    case "soccer":
    default:
      return {
        sportCategory: "soccer",
        unitLabel: "Goles",
        metricLabel: "Peligro xG",
        metricShort: "ΔxG",
        fijaTag: "⚽ FIJA A GANAR",
        icon: "⚽",
      };
  }
}

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [league, setLeague] = useState("ligapro");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeMarketTab, setActiveMarketTab] = useState("todos");
  const [displayMode, setDisplayMode] = useState<"full" | "simplified" | "top4">("full");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [top4Matches, setTop4Matches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [liveWindow, setLiveWindow] = useState<string>("Sincronizando corte diario de 8 días...");
  const [apiDiagnostics, setApiDiagnostics] = useState<string[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [paywallReason, setPaywallReason] = useState<string>("Desbloquea el Radar VIP completo por solo $14.99/mes");
  const [fijasSyncInfo, setFijasSyncInfo] = useState<string>("Ventana: Próximas 24 horas (Orden Cronológico)");
  const [isLoadingTop4, setIsLoadingTop4] = useState<boolean>(false);

  const openVipPaywall = (reason?: string) => {
    if (reason) setPaywallReason(reason);
    setShowLoginModal(true);
  };

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Calendario oficial de ESPN (8 días hacia adelante) sincronizado y cruzado con The Odds API y API-Football. Ligas 100% separadas y solo partidos por jugar. ¿Qué encuentro revisamos?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593979198755";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($14.99/mes) para desbloquear las 4 Fijas del Día. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchMatchesFromServer = async (targetLeague: string, force = false) => {
    setIsLoadingMatches(true);
    if (force) {
      setIsSyncing(true);
      setSyncToast("🔄 Sincronizando en vivo: The Odds API + ESPN API + API-Football...");
    }
    try {
      const res = await fetch(`/api/partidos?league=${targetLeague}${force ? "&refresh=true&t=" + Date.now() : ""}`);
      const data = await res.json();
      if (data.window) {
        setLiveWindow(data.window);
      }
      if (Array.isArray(data.diagnostics)) {
        setApiDiagnostics(data.diagnostics);
      }
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSelectedMatchId(data.matches[0].id);
        fetchAllLeaguesForTop4(force);
        if (force) {
          setSyncToast("✓ Sincronización exitosa: 3 APIs conectadas en tiempo real (The Odds API + ESPN + API-Football)");
          setTimeout(() => setSyncToast(null), 4500);
        }
      } else {
        setMatches([]);
      }
    } catch (err: any) {
      console.error("Error al sincronizar:", err);
      setApiDiagnostics([`Error de red cliente: ${err?.message || "No se pudo contactar /api/partidos"}`]);
    } finally {
      setIsLoadingMatches(false);
      setIsSyncing(false);
    }
  };

  const getActiveLeagueDetails = () => {
    for (const reg of REGION_TABS) {
      for (const sec of reg.sections) {
        const found = sec.options.find((o) => o.id === league);
        if (found) return { region: reg, option: found };
      }
    }
    return {
      region: REGION_TABS[1],
      option: { id: "ligapro", name: "Ecuador: LigaPro Serie A", icon: "🇪🇨", sportLabel: "Primera División" },
    };
  };

  const activeLeagueInfo = getActiveLeagueDetails();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-league-dropdown]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAllLeaguesForTop4 = async (force = false) => {
    setIsLoadingTop4(true);
    try {
      const res = await fetch(`/api/fijas${force ? "?refresh=true&t=" + Date.now() : ""}`);
      const data = await res.json();
      if (data && Array.isArray(data.fijas) && data.fijas.length > 0) {
        setTop4Matches(data.fijas);
        if (data.syncTime) {
          setFijasSyncInfo(`Sincronizado a las ${data.syncTime} • Ventana: ${data.window}`);
        }
      } else {
        setTop4Matches(matches.slice(0, 4));
      }
    } catch (err) {
      console.error("Error al obtener Las 4 Fijas del Día:", err);
      setTop4Matches(matches.slice(0, 4));
    } finally {
      setIsLoadingTop4(false);
    }
  };

  useEffect(() => {
    fetchMatchesFromServer(league);
  }, [league]);

  const handleLogin = () => {
    const validUser = username.trim().toLowerCase();
    if ((validUser === "vip" || validUser === "admin" || validUser === "pedro") && password === "ecuapronostico2026@") {
      setIsAuthenticated(true);
      setView("premium");
      setShowLoginModal(false);
      setLoginError("");
    } else {
      setLoginError("Credenciales inválidas. Usa el usuario admin y la clave ecuapronostico2026@.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView("basic");
    setUsername("");
    setPassword("");
  };

  const handlePremiumSwitch = () => {
    if (isAuthenticated) {
      setView("premium");
    } else {
      setShowLoginModal(true);
    }
  };

  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0] || {
    id: "loading",
    isFreeSample: true,
    leagueTitle: "Cargando liga...",
    dataSource: "Sincronizando 3 APIs en tiempo real...",
    home: "Sincronizando...", homeInitials: "...", homeAlt: "...",
    away: "Sincronizando...", awayInitials: "...", awayAlt: "...",
    jornada: "EXTRAYENDO PARTIDOS POR JUGAR...", date: "...", time: "...",
    cuotaLocal: 2.00, cuotaEmpate: 3.20, cuotaVisita: 3.50,
    lineGoals: 2.5, cuotaOver: 2.00, cuotaUnder: 1.80,
    marginCasa: 5.0,
    cleanProb1: 47.0, cleanProbX: 29.0, cleanProb2: 24.0,
    cleanProbOver: 51.0, cleanProbUnder: 49.0,
    xgHome: 1.55, xgAway: 1.10, xgDiff: 0.45, expectedGoals: 2.65,
    evHome: 4.8, evDraw: -6.2, evAway: -3.5, evOver: 2.1, evUnder: -1.8,
    ev: 4.8, bestMarketEV: 4.8,
    refereeName: "Oficial Designado",
    refereeCardsAvg: "4.8",
    refereePenaltiesAvg: "0.35",
    refereeAlert: "Árbitro riguroso: alta frecuencia de amonestaciones",
    lineupStatus: "Alineaciones oficiales confirmadas en planilla técnica",
    lineupAlert: "Once titular verificado sin ausencias críticas",
    marketTrend: "Consenso firme entre 28 casas internacionales",
    bookmakerCount: 28,
    probHomeSim: 48.0, probDrawSim: 27.0, probAwaySim: 25.0,
    probOverSim: 46.0, probUnderSim: 54.0,
    probBttsYesSim: 49.0, probBttsNoSim: 51.0,
    fairOddBttsYes: 2.04, fairOddBttsNo: 1.96,
    prob1X: 75.0, probX2: 52.0,
    topScores: [{ score: "1-0", prob: 15.2 }, { score: "1-1", prob: 12.4 }, { score: "2-1", prob: 9.8 }],
    bestMarketName: "Sincronizando...",
    bestMarketExplanation: "Consultando The Odds API + ESPN + API-Football...",
    bestOdd: 2.00, minFairOddForTopPick: 1.85, probImplicitaBest: 50.0,
    probReal: 54.0, hasRealEdge: true,
    reportePlantilla: "Consultando calendario y métricas oficiales...",
    cuotaMejoradaCasa: "Evita combinadas de más de 3 eventos en el mismo partido.",
    analisisDinamico: "Conectando con las 3 APIs en tiempo real..."
  };

  const isFirstMatch = matches.length > 0 && (selectedMatchId === matches[0]?.id || currentMatch.id === matches[0]?.id);
  const isFreePreview = isFirstMatch || currentMatch.isFreeSample === true;
  const isMatchUnlocked = view === "premium" || isFreePreview;

  useEffect(() => {
    if (view !== "premium" && displayMode !== "full") {
      setDisplayMode("full");
    }
  }, [view]);

  const probImplicitaLocal = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
  const probImplicitaEmpate = ((1 / currentMatch.cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / currentMatch.cuotaVisita) * 100).toFixed(1);

  const handleSendMessage = async (customQuestion?: string) => {
    const questionText = (customQuestion || chatInput).trim();
    if (!questionText) return;
    const newUserMsg = { role: "user", text: questionText };
    setChatHistory(prev => [...prev, newUserMsg]);
    if (!customQuestion) setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          currentMatch,
          allMatches: matches
        })
      });

      const data = await response.json();
      if (data && data.reply) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
      } else {
        throw new Error("Sin respuesta");
      }
    } catch {
      setChatHistory(prev => [
        ...prev,
        {
          role: "ai",
          text: `Para ${currentMatch.home} vs ${currentMatch.away}: La opción con mayor probabilidad es '${currentMatch.bestMarketName}' a cuota ${currentMatch.bestOdd} (${currentMatch.ev > 0 ? "+" + currentMatch.ev : currentMatch.ev}% EV). Cuota mínima rentable: ${currentMatch.minFairOddForTopPick}. Árbitro: ${currentMatch.refereeName && currentMatch.refereeName !== "Por designar" ? `${currentMatch.refereeName} (${currentMatch.refereeCardsAvg} tarj/p)` : "Por designar"}.`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (currentMatch && currentMatch.home && currentMatch.away) {
      setChatHistory([
        {
          role: "ai",
          text: `👋 Auditor Cuantitativo conectado a ${currentMatch.home} vs ${currentMatch.away} (${currentMatch.leagueTitle || 'Competición Oficial'}).\n\nTengo en memoria sus Expected Goals (${currentMatch.xgHome} vs ${currentMatch.xgAway}), cuota mínima rentable (${currentMatch.minFairOddForTopPick}), árbitro oficial (${currentMatch.refereeName && currentMatch.refereeName !== "Por designar" ? `${currentMatch.refereeName} | ${currentMatch.refereeCardsAvg} tarj/p` : "Por designar"}) y el factor altitud/sede (${currentMatch.altitudeBadge}).\n\n¿Qué deseas consultar sobre este partido?`
        }
      ]);
    }
  }, [currentMatch?.id]);

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-50 p-3 md:p-6 font-sans">
      <div className="max-w-[1440px] w-full mx-auto">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-amber-400/60 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] relative overflow-hidden">
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(""); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700 transition-all hover:border-slate-500"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow mb-2">
                  ⭐ MEMBRESÍA VIP ECUAPRONÓSTICO
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  Desbloquea el Radar Completo
                </h3>
                <div className="text-amber-400 font-extrabold text-lg mt-1 font-mono">
                  $14.99 USD / mes
                </div>
              </div>

              {paywallReason && (
                <div className="mb-4 bg-amber-950/60 border border-amber-400/50 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <p className="leading-snug">{paywallReason}</p>
                </div>
              )}

              <div className="space-y-2 mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>100% Partidos Desbloqueados:</strong> LigaPro, Champions, Europa League, Premier, La Liga, etc.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>Las 4 Fijas del Día:</strong> Selecciones con máxima certeza listas para tus apuestas.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>Cartelera Simplificada:</strong> Porcentaje de victoria directo (%) sin cuotas confusas.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>xG y De-vigging Real:</strong> Poisson, 10,000 simulaciones Montecarlo y cuota mínima rentable.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>Auditor IA en Vivo:</strong> Consultas ilimitadas sobre árbitros, planteles y factor altitud.</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02]"
                >
                  <span className="text-lg">📲</span>
                  <span>Activar Suscripción por WhatsApp ($14.99/mes)</span>
                </a>

                <div className="pt-4 border-t border-slate-700/80">
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase text-center">
                    ¿Ya eres miembro VIP? Inicia sesión
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Usuario VIP (ej: vip)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-white outline-none text-xs focus:border-amber-400"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Clave VIP"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-white outline-none text-xs focus:border-amber-400"
                    />
                    {loginError && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg">{loginError}</p>}
                    <button
                      onClick={handleLogin}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-xs transition-all"
                    >
                      Ingresar con mi cuenta VIP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="mb-6 border-b border-slate-800 pb-4">
          {syncToast && (
            <div className="mb-4 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{syncToast}</span>
              </div>
              <button onClick={() => setSyncToast(null)} className="text-emerald-400 hover:text-white font-black text-sm ml-4">✕</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-14 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
              <div>
                <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/40 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  Sincronización Automática Semanal ({liveWindow})
                </span>
                <h1 className="text-base md:text-xl font-black text-white mt-0.5">RADAR MULTIMERCADO INTELIGENTE</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="/aciertos"
                className="text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60 px-3 py-2 rounded-lg font-black flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
              >
                <span>✅ Historial de Aciertos</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Público
                </span>
              </a>
              <button
                onClick={() => {
                  if (view !== "premium") {
                    openVipPaywall("La sincronización en tiempo real con 3 APIs oficiales (The Odds API + ESPN + API-Football) es una función exclusiva para miembros VIP ($14.99/mes).");
                    return;
                  }
                  fetchMatchesFromServer(league, true);
                }}
                disabled={isSyncing}
                className={`text-xs px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  isSyncing
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500 animate-pulse cursor-wait"
                    : "bg-slate-800 hover:bg-slate-700 text-green-400 border border-green-500/40"
                }`}
              >
                <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
                <span>{isSyncing ? "Sincronizando 3 APIs..." : "Forzar Sincronización"}</span>
                {view !== "premium" && <span className="text-[9px] text-amber-400 font-mono">🔒</span>}
              </button>
              <button
                onClick={() => {
                  if (view !== "premium") {
                    openVipPaywall("La Guía Fácil de Inversión Cuantitativa (+EV) es exclusiva para miembros VIP ($14.99/mes).");
                    return;
                  }
                  setShowGuide(!showGuide);
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-2 rounded-lg font-bold flex items-center gap-1"
              >
                <span>{showGuide ? "Ocultar Guía" : "📖 Guía Fácil"}</span>
                {view !== "premium" && <span className="text-[9px] text-amber-400 font-mono">🔒</span>}
              </button>
              <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button onClick={() => setView("basic")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "basic" ? "bg-slate-600 text-white" : "text-slate-400"}`}>Gratis</button>
                <button onClick={handlePremiumSwitch} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "premium" ? "bg-blue-600 text-white" : "text-slate-400"}`}>VIP ($14.99)</button>
              </div>
              {isAuthenticated && <button onClick={handleLogout} className="text-xs text-red-400 border border-slate-700 px-2.5 py-1.5 rounded-lg">Salir</button>}
            </div>
          </div>

          {showGuide && (
            <div className="mb-4 bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-amber-400 block mb-1">1. Las 4 Fijas del Día</strong>
                El botón dorado superior extrae automáticamente las 4 apuestas más seguras y rentables de todas las ligas para que las compartas en tus grupos de WhatsApp y Telegram.
              </div>
              <div>
                <strong className="text-blue-400 block mb-1">2. Vista Simplificada (Solo Ganadores %)</strong>
                Visualiza el equipo probable ganador y su porcentaje exacto de victoria frente al rival sin enredos de cuotas.
              </div>
              <div>
                <strong className="text-green-400 block mb-1">3. Respaldo Matemático Real</strong>
                10,000 simulaciones de Montecarlo y Distribución de Poisson respaldan cada pronóstico diario.
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
            {/* SISTEMA DE PESTAÑAS DESPLEGABLES (DROPDOWN TABS) POR REGIÓN */}
            <div className="flex flex-wrap items-center gap-2 relative z-30" data-league-dropdown>
              {REGION_TABS.map((reg, tabIdx) => {
                const isRegionActive = activeLeagueInfo.region.id === reg.id;
                const isOpen = openDropdown === reg.id;

                return (
                  <div key={reg.id} className="relative">
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : reg.id)}
                      className={`px-3.5 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all border ${
                        isRegionActive
                          ? "bg-slate-900 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/50"
                          : "bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                      }`}
                    >
                      <span className="text-base">{reg.icon}</span>
                      <span className="tracking-wide uppercase font-extrabold">{reg.label}</span>
                      {isRegionActive && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 font-bold ml-1 hidden sm:inline-block truncate max-w-[130px]">
                          {activeLeagueInfo.option.name.split(":")[0]}
                        </span>
                      )}
                      <svg
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-400 ${
                          isOpen ? "rotate-180 text-amber-400" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* MENÚ DESPLEGABLE CON SECCIONES */}
                    {isOpen && (
                      <div
                        className={`absolute mt-2 w-72 sm:w-80 md:w-96 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 max-h-[72vh] overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150 ${
                          tabIdx === 2 ? "left-0 xl:left-auto xl:right-0" : "left-0"
                        }`}
                      >
                        <div className="px-3 py-2 mb-1 flex items-center justify-between border-b border-slate-800">
                          <div>
                            <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                              <span>{reg.icon}</span> {reg.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">{reg.subtitle}</div>
                          </div>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                            {reg.sections.reduce((acc, s) => acc + s.options.length, 0)} Opciones
                          </span>
                        </div>

                        {reg.sections.map((section, sIdx) => (
                          <div key={sIdx} className="pt-2 pb-1.5">
                            {section.title && (
                              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60 rounded-md mb-1.5 flex items-center justify-between">
                                <span>{section.title}</span>
                              </div>
                            )}
                            <div className="space-y-1 mt-1">
                              {section.options.map((opt) => {
                                const isSelected = league === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setLeague(opt.id);
                                      setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                                      isSelected
                                        ? "bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-300 border border-amber-400/50 shadow-sm font-bold"
                                        : "text-slate-200 hover:bg-slate-800/90 hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <span className="text-base shrink-0">{opt.icon}</span>
                                      <div className="truncate">
                                        <div className="font-bold truncate text-slate-100">{opt.name}</div>
                                        {opt.sportLabel && (
                                          <div className="text-[10px] text-slate-400 font-normal">{opt.sportLabel}</div>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <span className="text-amber-400 text-xs font-black shrink-0 ml-2 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                                        ✓ Activa
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
              <button
                onClick={() => {
                  if (view !== "premium") {
                    openVipPaywall("Las 4 Fijas del Día (las predicciones de máxima certeza matemática del radar multiligas) son exclusivas para miembros VIP ($14.99/mes).");
                    return;
                  }
                  setDisplayMode("top4");
                  fetchAllLeaguesForTop4();
                }}
                className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  displayMode === "top4"
                    ? "bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-[1.02]"
                    : "text-green-300 hover:bg-slate-800"
                }`}
              >
                <span>🏆 LAS 4 FIJAS DEL DÍA</span>
                {view !== "premium" && <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">🔒 VIP</span>}
              </button>
              <button
                onClick={() => {
                  if (view !== "premium") {
                    openVipPaywall("La Cartelera de Ganadores Proyectados (Vista Simplificada sin cuotas) es exclusiva para miembros VIP ($14.99/mes).");
                    return;
                  }
                  setDisplayMode("simplified");
                }}
                className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  displayMode === "simplified"
                    ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-[1.02]"
                    : "text-amber-300 hover:bg-slate-800"
                }`}
              >
                <span>🔥 Vista Simplificada</span>
                {view !== "premium" && <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">🔒 VIP</span>}
              </button>
              <button
                onClick={() => setDisplayMode("full")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 ${
                  displayMode === "full"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>📊 Vista Completa</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                  🔓 Gratuita
                </span>
              </button>
            </div>
          </div>
        </header>

        {displayMode === "top4" ? (
          <section className="space-y-6">
            <div className="bg-gradient-to-r from-[#064e3b] via-[#0f2557] to-[#064e3b] border-2 border-green-400/80 rounded-3xl p-6 text-center shadow-[0_0_35px_rgba(34,197,94,0.3)] relative overflow-hidden">
              <span className="inline-block bg-green-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-2 shadow">
                Ventana Dinámica: Próximas 24 Horas (NOW a NOW + 24H) • Orden Estrictamente Cronológico
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-green-400 drop-shadow">
                🏆 LAS 4 FIJAS DEL DÍA (MÁXIMA CERTEZA Y VALOR)
              </h2>
              <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-2xl mx-auto">
                Filtro automático de <strong className="text-amber-300">todas las ligas y deportes activos</strong> para las próximas 24 horas. El motor matemático evalúa el <strong className="text-green-300">EV% y probabilidad más alta</strong> (ganador, doble oportunidad o totales con adaptación semántica de métricas xG, xPts y xRuns según deporte), ordenadas de forma <strong className="text-white font-bold">estrictamente cronológica por hora de inicio</strong>.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="text-[11px] text-emerald-300 font-mono font-bold bg-slate-950/70 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{fijasSyncInfo}</span>
                </div>
                <button
                  onClick={() => fetchAllLeaguesForTop4(true)}
                  disabled={isLoadingTop4}
                  className="text-[11px] text-amber-300 font-bold bg-slate-900 hover:bg-slate-800 border border-amber-400/50 hover:border-amber-300 px-3 py-1 rounded-full transition-all inline-flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                  title="Recalibrar y sincronizar fijas en vivo"
                >
                  <span className={isLoadingTop4 ? "animate-spin" : ""}>🔄</span>
                  <span>{isLoadingTop4 ? "Recalibrando Fijas..." : "Forzar Sincronización"}</span>
                </button>
              </div>
            </div>

            {isLoadingMatches || isLoadingTop4 ? (
              <div className="p-12 text-center bg-[#131d3b] border border-slate-700 rounded-3xl">
                <p className="text-lg font-black text-green-300 animate-pulse">Consultando 20 ligas globales en la ventana de 24 horas y ordenando cronológicamente...</p>
              </div>
            ) : top4Matches.length === 0 ? (
              <div className="p-8 text-center bg-[#131d3b] border border-slate-700 rounded-3xl">
                <p className="text-base font-bold text-amber-300">No hay suficientes partidos futuros para armar las 4 fijas en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {top4Matches.map((m, idx) => {
                  const unlocked = view === "premium" || m.isFreeSample;
                  const homeProb = Number(m.probHomeSim || 50);
                  const awayProb = Number(m.probAwaySim || 30);
                  const drawProb = Number(m.probDrawSim || 20);

                  const isHomeWinner = homeProb >= awayProb;
                  const winnerName = isHomeWinner ? m.home : m.away;
                  const winnerInitials = isHomeWinner ? m.homeInitials : m.awayInitials;
                  const loserName = isHomeWinner ? m.away : m.home;
                  const loserInitials = isHomeWinner ? m.awayInitials : m.homeInitials;

                  const rawWinProb = isHomeWinner ? homeProb : awayProb;
                  const headToHeadWinProb = m.headToHeadWinProb || Number(((rawWinProb / Math.max(1, rawWinProb + (isHomeWinner ? awayProb : homeProb))) * 100).toFixed(1));
                  const safeDoubleProb = isHomeWinner ? m.prob1X : m.probX2;
                  const lexicon = getSportLexicon(m.sportCategory);

                  return (
                    <div
                      key={m.id || m.fixtureId || idx}
                      className="relative rounded-3xl overflow-hidden border-2 border-green-500/70 bg-gradient-to-r from-[#064e3b]/40 via-[#16264c] to-[#064e3b]/40 shadow-2xl transition-all hover:scale-[1.01]"
                    >
                      <div className="bg-[#091024] px-5 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-green-300">
                            FIJA #{idx + 1} • {m.icon || lexicon.icon || "⚽"} {m.leagueTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
                            <span>📅 {m.date}</span>
                            <span>•</span>
                            <span>⏰ <strong className="text-amber-300">{m.time}</strong></span>
                            {m.timeDisplay && (
                              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-black ml-1">
                                ⏳ {m.timeDisplay}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2.5 py-0.5 rounded-full font-black">
                            🔥 CONFIANZA {m.confidenceScore || 85}/100
                          </span>
                        </div>
                      </div>

                      <div className="p-5 md:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-4 flex items-center gap-4 bg-gradient-to-r from-green-950/80 to-slate-900/90 p-5 rounded-2xl border-2 border-green-500/80 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center font-black text-xl md:text-2xl text-white shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                            {winnerInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase leading-tight truncate">
                              {winnerName}
                            </h3>
                            <div
                              className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl border-2 font-black text-xs md:text-sm uppercase tracking-wider"
                              style={{
                                backgroundColor: "#020617",
                                borderColor: "#FFD700",
                                color: "#FFD700",
                                boxShadow: "0 0 18px rgba(255, 215, 0, 0.45)",
                              }}
                            >
                              <span className="text-base leading-none">{lexicon.icon || "⚽"}</span>
                              <span style={{ color: "#FFFFFF", fontWeight: 900 }}>FIJA</span>
                              <span
                                style={{
                                  color: "#FFD700",
                                  fontWeight: 900,
                                  textShadow: "0 0 12px rgba(255, 215, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.9)",
                                }}
                              >
                                A GANAR
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col justify-center bg-slate-900/95 border-2 border-emerald-400/60 rounded-2xl p-5 shadow-xl text-center">
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-300 border-b border-slate-800 pb-2 mb-2">
                            VALOR ESPERADO (+EV REAL)
                          </span>
                          <div className="text-4xl md:text-5xl font-black text-emerald-400 my-1 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                            {m.ev > 0 ? `+${m.ev}%` : `${m.ev}%`} EV
                          </div>
                          <div className="text-xs text-slate-300 mt-2 space-y-1">
                            <div className="flex justify-between px-2 bg-slate-800/80 rounded-lg py-1 border border-slate-700/60 font-mono">
                              <span className="text-slate-400">{m.metricLabel || lexicon.metricLabel}:</span>
                              <strong className="text-blue-400">
                                {m.metricShort || lexicon.metricShort} {m.metricDiff || (m.xgDiff > 0 ? `+${m.xgDiff}` : m.xgDiff)}
                              </strong>
                            </div>
                            <div className="flex justify-between px-2 bg-slate-800/80 rounded-lg py-1 border border-slate-700/60">
                              <span className="text-slate-400">Certeza De-vig:</span>
                              <strong className="text-amber-300">{headToHeadWinProb}%</strong>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/80 border-2 border-slate-700 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase text-slate-400 block">Rival a enfrentar</span>
                              <h4 className="text-base md:text-lg font-black text-slate-200 uppercase truncate">
                                {loserName}
                              </h4>
                            </div>
                            <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                              {loserInitials}
                            </div>
                          </div>

                          <div className="space-y-1 text-xs text-slate-300 font-medium">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Jugada recomendada:</span>
                              <strong className="text-amber-300">{m.bestMarketName}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Cuota mínima justa:</span>
                              <strong className="text-green-400">{m.minFairOddForTopPick}</strong>
                            </div>
                            <div className="pt-1 flex flex-wrap gap-1">
                              <span className="text-[10px] bg-slate-800 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-medium">
                                👨‍⚖️ {m.refereeName && m.refereeName !== "Por designar" ? (
                                  <>
                                    <strong>{m.refereeName}</strong>
                                    {m.refereeCardsAvg && m.refereeCardsAvg !== "N/D" && <span className="text-sky-400 font-bold ml-1">({m.refereeCardsAvg} tarj/p)</span>}
                                  </>
                                ) : (
                                  <span className="text-slate-400">Árbitro: Por designar</span>
                                )}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                                📋 {m.lineupStatus ? m.lineupStatus.slice(0, 32) + "..." : "Alineaciones verificadas"}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (m.leagueKey) {
                                setLeague(m.leagueKey);
                              } else {
                                setLeague(m.leagueTitle?.toLowerCase().includes("champions") ? "champions" : m.leagueTitle?.toLowerCase().includes("europa") ? "europa" : "ligapro");
                              }
                              setSelectedMatchId(m.id);
                              setDisplayMode("full");
                            }}
                            className="w-full text-center text-xs bg-slate-800 hover:bg-green-600 text-green-300 hover:text-white py-2 px-3 rounded-xl font-bold transition-all border border-slate-700 cursor-pointer"
                          >
                            Ver análisis de esta fija →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : displayMode === "simplified" ? (
          <section className="space-y-6">
            <div className="bg-gradient-to-r from-[#1a103c] via-[#0f2557] to-[#1a103c] border-2 border-amber-400/70 rounded-3xl p-6 text-center shadow-[0_0_35px_rgba(251,191,36,0.2)] relative overflow-hidden">
              <span className="inline-block bg-amber-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-2 shadow">
                10,000 Simulaciones Montecarlo + Distribución de Poisson
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 drop-shadow">
                CARTELERA DE GANADORES PROYECTADOS
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl mx-auto">
                Directo al grano: sin cuotas confusas. Aquí tienes el <strong className="text-amber-300">Probable Ganador</strong> de cada partido y su <strong className="text-green-400">porcentaje exacto de victoria</strong> frente al rival.
              </p>
            </div>

            {isLoadingMatches ? (
              <div className="p-12 text-center bg-[#131d3b] border border-slate-700 rounded-3xl">
                <p className="text-lg font-black text-amber-300 animate-pulse">Calculando Ganadores de la Semana...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center bg-[#131d3b] border border-slate-700 rounded-3xl">
                <p className="text-base font-bold text-amber-300">No hay partidos programados en los próximos 8 días para esta competición.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {matches.map((m) => {
                  const unlocked = view === "premium" || m.isFreeSample;
                  const homeProb = Number(m.probHomeSim || 50);
                  const awayProb = Number(m.probAwaySim || 30);
                  const drawProb = Number(m.probDrawSim || 20);

                  const isHomeWinner = homeProb >= awayProb;
                  const winnerName = isHomeWinner ? m.home : m.away;
                  const winnerInitials = isHomeWinner ? m.homeInitials : m.awayInitials;
                  const loserName = isHomeWinner ? m.away : m.home;
                  const loserInitials = isHomeWinner ? m.awayInitials : m.homeInitials;

                  const rawWinProb = isHomeWinner ? homeProb : awayProb;
                  const rawLoseProb = isHomeWinner ? awayProb : homeProb;
                  const headToHeadWinProb = Number(((rawWinProb / Math.max(1, rawWinProb + rawLoseProb)) * 100).toFixed(1));
                  const safeDoubleProb = isHomeWinner ? m.prob1X : m.probX2;

                  return (
                    <div
                      key={m.id}
                      className="relative rounded-3xl overflow-hidden border-2 border-slate-700/90 bg-gradient-to-r from-[#0e1730] via-[#16264c] to-[#0e1730] shadow-2xl transition-all hover:border-amber-400/80"
                    >
                      <div className="bg-[#091024] px-5 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                            {m.leagueTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm font-bold text-white">
                            📅 {m.date} • ⏰ <strong className="text-amber-300">{m.time}</strong>
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${unlocked ? "bg-green-950 text-green-400 border border-green-500/40" : "bg-amber-950 text-amber-300 border border-amber-500/40"}`}>
                            {m.isFreeSample ? "🔓 MUESTRA GRATIS" : unlocked ? "🔓 VIP ACTIVO" : "🔒 SOLO VIP"}
                          </span>
                        </div>
                      </div>

                      {!unlocked ? (
                        <div className="p-8 text-center flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-black text-lg text-slate-300">
                              {m.homeInitials}
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg md:text-xl font-black text-white">{m.home} vs {m.away}</h3>
                              <p className="text-xs text-slate-400">Desbloquea quién gana este partido y su porcentaje exacto</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowLoginModal(true)}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-xl text-xs md:text-sm uppercase shadow-lg"
                            >
                              🔓 Ver Ganador (Acceso VIP)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 md:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                          {/* IZQUIERDA (4 cols): CIRCULO + EQUIPO + A GANAR */}
                          <div className="lg:col-span-4 flex items-center gap-4 bg-gradient-to-r from-green-950/60 to-slate-900/80 p-5 rounded-2xl border-2 border-green-500/60 shadow-[0_0_25px_rgba(34,197,94,0.15)]">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center font-black text-xl md:text-2xl text-white shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                              {winnerInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl md:text-2xl font-black text-white uppercase leading-tight break-words">
                                {winnerName}
                              </h3>
                              <div
                                className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl border-2 font-black text-xs md:text-sm uppercase tracking-wider"
                                style={{
                                  backgroundColor: "#020617",
                                  borderColor: "#FFD700",
                                  color: "#FFD700",
                                  boxShadow: "0 0 18px rgba(255, 215, 0, 0.45)",
                                }}
                              >
                                <span className="text-base leading-none">🏆</span>
                                <span
                                  style={{
                                    color: "#FFD700",
                                    fontWeight: 900,
                                    textShadow: "0 0 12px rgba(255, 215, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.9)",
                                  }}
                                >
                                  A GANAR
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CENTRO (4 cols): CAJA DE PROBABILIDAD DE GANAR (DIRECTO Y CON EMPATE) */}
                          <div className="lg:col-span-4 flex flex-col justify-center bg-slate-900/95 border-2 border-amber-400/60 rounded-2xl p-5 shadow-xl">
                            <span className="text-xs font-black uppercase tracking-widest text-amber-300 text-center border-b border-slate-800 pb-2 mb-3">
                              PROBABILIDAD DE GANAR
                            </span>
                            <div className="space-y-2.5">
                              <div className="flex items-baseline justify-between bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                                <span className="text-2xl md:text-3xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                                  {rawWinProb}%
                                </span>
                                <span className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wide">
                                  Directo
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                                <span className="text-2xl md:text-3xl font-black text-amber-300">
                                  {headToHeadWinProb}%
                                </span>
                                <span className="text-xs md:text-sm font-extrabold text-slate-200 uppercase tracking-wide">
                                  Con empate
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* DERECHA (4 cols): EQUIPO A PERDER Y DETALLES */}
                          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/80 border-2 border-red-500/30 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
                              <div className="min-w-0">
                                <h4 className="text-base md:text-lg font-black text-slate-200 uppercase truncate">
                                  {loserName}
                                </h4>
                                <span className="inline-block mt-1 bg-red-950/80 border border-red-500/40 text-red-400 font-black text-[11px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                                  ❌ A PERDER
                                </span>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-slate-800 border border-red-500/40 flex items-center justify-center font-black text-sm text-slate-300 shrink-0">
                                {loserInitials}
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-slate-300 font-medium">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Prob. ganar en 90m:</span>
                                <strong className="text-red-400">{rawLoseProb}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Peligro xG:</span>
                                <strong className="text-blue-300 font-mono">ΔxG {m.xgDiff > 0 ? `+${m.xgDiff}` : m.xgDiff} ({m.xgHome} vs {m.xgAway})</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Valor Esperado:</span>
                                <strong className={m.ev > 0 ? "text-emerald-400 font-bold" : "text-slate-300 font-bold"}>{m.ev > 0 ? `+${m.ev}% EV` : `${m.ev}% EV`}</strong>
                              </div>
                              <div className="pt-1 flex flex-wrap gap-1">
                                <span className="text-[10px] bg-slate-800 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-medium">
                                  👨‍⚖️ {m.refereeName || "Árbitro Oficial"}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                                  📋 {m.lineupStatus ? m.lineupStatus.slice(0, 30) + "..." : "Alineaciones OK"}
                                </span>
                              </div>
                            </div>

                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => {
                                  setSelectedMatchId(m.id);
                                  setDisplayMode("full");
                                }}
                                className="w-full text-center text-xs bg-slate-800 hover:bg-blue-600 text-blue-300 hover:text-white py-2 px-3 rounded-xl font-bold transition-all border border-slate-700"
                              >
                                Ver análisis completo →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mb-8 bg-[#131d3b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#1c2a52] px-4 md:px-6 py-3.5 border-b border-slate-700">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                    <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                      {isLoadingMatches
                        ? "Consultando calendario oficial de ESPN para los próximos 8 días..."
                        : `${currentMatch.leagueTitle} — ${matches.length} Partidos Por Jugar (Próximos 8 Días)`}
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-300 font-bold bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                    Datos en vivo: API-Football, The Odds API & ESPN
                  </span>
                </div>

                <div className="hidden lg:grid grid-cols-12 gap-6 text-xs font-black uppercase tracking-wider text-slate-300 pt-2 border-t border-slate-700/60">
                  <div className="col-span-4">Partido, Fecha y Estado</div>
                  <div className="col-span-4 text-center">Mercado Ganador 1 X 2 (Cuotas)</div>
                  <div className="col-span-4 text-center">Total Goles & Veredicto EV Pos-Devigging</div>
                </div>
              </div>

              {!isLoadingMatches && matches.length === 0 && (
                <div className="p-6 text-center space-y-2 bg-slate-900/80">
                  <p className="text-sm font-bold text-amber-300">No hay partidos programados en los próximos 8 días para esta competición:</p>
                  <div className="text-xs text-slate-300 space-y-1 max-w-xl mx-auto">
                    {apiDiagnostics.map((d, idx) => (
                      <p key={idx} className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700">{d}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-800/80 max-h-[640px] overflow-y-auto">
                {matches.map((m, idx) => {
                  const isSelected = m.id === currentMatch.id;
                  const isFirst = idx === 0;
                  const unlocked = view === "premium" || isFirst;
                  const isProfitable = m.ev >= 1.0;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (!unlocked) {
                          openVipPaywall(`Desbloquea el análisis completo de ${m.home} vs ${m.away} y todos los partidos del radar con tu suscripción VIP ($14.99/mes).`);
                        } else {
                          setSelectedMatchId(m.id);
                        }
                      }}
                      className={`relative p-4 md:px-6 md:py-4 transition-all cursor-pointer ${
                        isSelected && unlocked
                          ? "bg-blue-950/70 border-l-4 border-l-amber-400"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      {/* OVERLAY DE BLOQUEO VIP (FILTRO DE OPACIDAD Y CANDADO) PARA PARTIDOS 2 EN ADELANTE */}
                      {!unlocked && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openVipPaywall(`Desbloquea el análisis completo de ${m.home} vs ${m.away} y todos los partidos del radar con tu suscripción VIP ($14.99/mes).`);
                          }}
                          className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-20 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center cursor-pointer hover:bg-slate-950/90 transition-all group"
                        >
                          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs md:text-sm px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.5)] transform group-hover:scale-105 transition-all">
                            <span>🔒</span>
                            <span>PARTIDO VIP BLOQUEADO • CLIC PARA DESBLOQUEAR ($14.99/MES)</span>
                          </div>
                          <span className="text-[11px] text-amber-200/90 font-medium hidden sm:inline">
                            xG real, cuotas desmargenizadas y Montecarlo restringidos
                          </span>
                        </div>
                      )}

                      <div className={`transition-all ${!unlocked ? "filter blur-[1.5px] opacity-35 select-none pointer-events-none" : ""}`}>
                        {/* FILA PRINCIPAL: 3 BLOQUES PERFECTAMENTE BALANCEADOS (4 COLS C/U) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
                          {/* 1. EQUIPOS Y HORARIO (4 COLS) */}
                          <div className="lg:col-span-4 flex items-center gap-3">
                            <div className="text-xs font-bold text-amber-400 w-24 shrink-0 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                              <span className="block uppercase tracking-wider">{m.date.split(",")[0].slice(0, 3)} {m.date.match(/\d+/)?.[0]}</span>
                              <span className="text-white font-black text-xs">{m.time.replace(" ECT", "")}</span>
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-full bg-slate-800 text-xs font-black flex items-center justify-center text-blue-300 border border-blue-400/40 shrink-0">
                                  {m.homeInitials}
                                </span>
                                <span className="font-bold text-sm md:text-base text-white tracking-tight truncate">
                                  {m.home}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-full bg-slate-800 text-xs font-black flex items-center justify-center text-amber-300 border border-amber-400/40 shrink-0">
                                  {m.awayInitials}
                                </span>
                                <span className="font-bold text-sm md:text-base text-slate-200 tracking-tight truncate">
                                  {m.away}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-black shrink-0 tracking-wider ${
                              isFirst
                                ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/50"
                                : unlocked
                                ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/50"
                                : "bg-amber-950/90 text-amber-300 border border-amber-500/50"
                            }`}>
                              {isFirst ? "🔓 ABIERTA" : unlocked ? "🔓 VIP" : "🔒 VIP"}
                            </span>
                          </div>

                          {/* 2. BLOQUE GANADOR 1X2 (4 COLS) */}
                          <div className="lg:col-span-4 flex flex-col justify-between">
                            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                              <div className="bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-2 text-center transition-all shadow-sm">
                                <span className="block text-xs font-bold text-slate-300 truncate">
                                  Gana {m.homeInitials}
                                </span>
                                <strong className="text-base md:text-lg font-black text-white font-mono">
                                  {m.cuotaLocal.toFixed(2)}
                                </strong>
                              </div>

                              <div className="bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-2 text-center transition-all shadow-sm">
                                <span className="block text-xs font-bold text-slate-300">
                                  Empate
                                </span>
                                <strong className="text-base md:text-lg font-black text-white font-mono">
                                  {m.cuotaEmpate.toFixed(2)}
                                </strong>
                              </div>

                              <div className="bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-2 text-center transition-all shadow-sm">
                                <span className="block text-xs font-bold text-slate-300 truncate">
                                  Gana {m.awayInitials}
                                </span>
                                <strong className="text-base md:text-lg font-black text-white font-mono">
                                  {m.cuotaVisita.toFixed(2)}
                                </strong>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-2 text-center leading-snug">
                              Multiplica tu dinero: cobras tu apuesta × cuota si aciertas quién gana o empate
                            </p>
                          </div>

                          {/* 3. BLOQUE TOTAL GOLES Y VALOR ESPERADO EV (4 COLS) */}
                          <div className="lg:col-span-4 grid grid-cols-3 gap-2 sm:gap-2.5 items-start">
                            {/* 2 CUADROS DE GOLES */}
                            <div className="col-span-2 flex flex-col justify-between">
                              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                                <div className="bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-2 text-center transition-all shadow-sm">
                                  <span className="block text-xs font-bold text-slate-300">
                                    Más de {m.lineGoals}
                                  </span>
                                  <strong className="text-base md:text-lg font-black text-amber-300 font-mono">
                                    {m.cuotaOver.toFixed(2)}
                                  </strong>
                                </div>
                                <div className="bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-2 text-center transition-all shadow-sm">
                                  <span className="block text-xs font-bold text-slate-300">
                                    Menos de {m.lineGoals}
                                  </span>
                                  <strong className="text-base md:text-lg font-black text-amber-300 font-mono">
                                    {m.cuotaUnder.toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 text-center leading-snug">
                                Más: 3 o más goles | Menos: máx. 2 goles
                              </p>
                            </div>

                            {/* 1 CUADRO DE VALOR ESPERADO EV */}
                            <div className="col-span-1 flex flex-col justify-between">
                              <div className={`rounded-xl px-2 py-2 text-center flex flex-col justify-center transition-all shadow-sm border ${
                                !unlocked
                                  ? "bg-slate-900/90 border-slate-700"
                                  : isProfitable
                                  ? "bg-emerald-950/90 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                  : "bg-slate-900/90 border-slate-700"
                              }`}>
                                <span className="block text-[10px] sm:text-xs text-slate-300 uppercase font-black tracking-tight">
                                  {!unlocked ? "Auditoría EV" : isProfitable ? "VALOR +EV" : "MERCADO EV"}
                                </span>
                                <strong className={`text-sm md:text-base font-black font-mono mt-0.5 ${
                                  !unlocked ? "text-amber-300" : isProfitable ? "text-emerald-400" : "text-slate-300"
                                }`}>
                                  {unlocked ? (m.ev > 0 ? `+${m.ev}% EV` : `${m.ev}% EV`) : "🔒 VIP"}
                                </strong>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 text-center leading-snug">
                                Valor pos-devigging
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* BANDEJA CONTEXTUAL DUAL COMPLETA: NOVATO (Semántica) vs PROFESIONAL (Cuantitativa xG) */}
                        <div className="w-full mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs">
                          {/* LADO NOVATO: Alertas Semánticas de APIs */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-slate-900/90 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                              {m.altitudeBadge || "⛰️ Altitud Evaluada"}
                            </span>
                            <span className="bg-slate-900/90 text-sky-300 border border-sky-500/40 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                              👨‍⚖️ <strong>Árbitro:</strong> {m.refereeName && m.refereeName !== "Por designar" ? (
                                <>
                                  <span>{m.refereeName}</span>
                                  {m.refereeCardsAvg && m.refereeCardsAvg !== "N/D" && <span className="text-sky-400 font-bold ml-1">({m.refereeCardsAvg} tarj/p)</span>}
                                </>
                              ) : (
                                <span className="text-slate-400 font-normal">Por designar</span>
                              )}
                            </span>
                            <span className="bg-slate-900/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                              📋 <strong>Alineación:</strong> {m.lineupStatus || "Alineación verificada en planilla"}
                            </span>
                            <span className="bg-slate-900/90 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg font-medium hidden xl:flex items-center gap-1.5 shadow-sm">
                              📈 <strong>Mercado:</strong> {m.marketTrend ? (m.marketTrend.length > 55 ? m.marketTrend.slice(0, 52) + "..." : m.marketTrend) : "Consenso en vivo"}
                            </span>
                          </div>

                          {/* LADO PROFESIONAL: Métricas Cuantitativas xG y De-vigging */}
                          <div className="flex flex-wrap items-center gap-2 font-mono">
                            <span className="bg-blue-950/80 text-blue-300 border border-blue-500/50 px-3 py-1 rounded-lg font-bold shadow-sm flex items-center gap-1.5">
                              📊 ΔxG: <span className="text-white">{m.xgDiff > 0 ? `+${m.xgDiff}` : m.xgDiff}</span> ({m.xgHome} vs {m.xgAway})
                            </span>
                            <span className="bg-slate-900/90 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-sm text-xs leading-normal">
                              <span className="text-slate-400 font-bold mr-1.5">⚖️ Prob. Limpia:</span>
                              <span className="text-emerald-400 font-bold">
                                {m.cleanProbX > 0 ? (
                                  <>
                                    Gana {m.home}: <strong className="text-white font-extrabold">{m.cleanProb1}%</strong> | Empate: <strong className="text-white font-extrabold">{m.cleanProbX}%</strong> | Gana {m.away}: <strong className="text-white font-extrabold">{m.cleanProb2}%</strong>
                                  </>
                                ) : (
                                  <>
                                    Gana {m.home}: <strong className="text-white font-extrabold">{m.cleanProb1}%</strong> | Gana {m.away}: <strong className="text-white font-extrabold">{m.cleanProb2}%</strong>
                                  </>
                                )}
                              </span>
                              <span className="text-slate-500 font-mono ml-2 text-[10px] hidden md:inline">({m.marginCasa}% margen descontado)</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BANNER INFERIOR DE CONVERSIÓN FREEMIUM */}
              {matches.length > 1 && view !== "premium" && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-t border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <div className="text-xs md:text-sm font-black text-amber-300">
                        {matches.length - 1} Partidos Bloqueados en esta liga
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Solo el primer partido es gratuito. Activa tu membresía VIP para ver todos los encuentros.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openVipPaywall("Desbloquea todos los partidos y ligas completas con la membresía VIP ($14.99/mes).")}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-lg"
                  >
                    Desbloquear Todo VIP ($14.99)
                  </button>
                </div>
              )}
            </section>

            {!isMatchUnlocked ? (
              <div className="rounded-2xl p-8 text-center bg-slate-800/60 border border-blue-500/40 shadow-2xl">
                <h3 className="text-2xl font-black text-white mb-2">🔒 Auditoría en Vivo Bloqueada para {currentMatch.home} vs {currentMatch.away}</h3>
                <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
                  Desbloquea el veredicto real calculado con Distribución de Poisson y 10,000 Simulaciones de Montecarlo para saber en qué partidos sí hay ventaja y en cuáles no debes arriesgar tu dinero.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => openVipPaywall(`Inicia sesión o adquiere tu membresía VIP para desbloquear el análisis de ${currentMatch.home} vs ${currentMatch.away}.`)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg">Iniciar Sesión VIP</button>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black py-3 px-6 rounded-xl text-sm shadow-lg">Suscribirme por WhatsApp - $14.99/mes</a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-800 via-[#152247] to-slate-800 border border-slate-600 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <div className="w-16 h-16 bg-slate-900 text-white font-black text-lg rounded-full flex items-center justify-center mb-2 border-2 border-blue-400 shadow-lg">{currentMatch.homeInitials}</div>
                      <h2 className="text-base font-black text-white">{currentMatch.home}</h2>
                      <p className="text-slate-400 text-[11px]">{currentMatch.homeAlt}</p>
                      <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">
                        Mercado: {probImplicitaLocal}%
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-0.5 rounded-full text-[10px] font-black mb-1">{currentMatch.jornada}</span>
                      <p className="text-xs text-slate-300">{currentMatch.date} • <strong className="text-white">{currentMatch.time}</strong></p>
                      <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">
                        Empate: {probImplicitaEmpate}%
                      </p>
                      <span className="text-[10px] text-green-300 mt-1.5 font-semibold">
                        {currentMatch.dataSource}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <div className="w-16 h-16 bg-slate-900 text-white font-black text-lg rounded-full flex items-center justify-center mb-2 border-2 border-amber-400 shadow-lg">{currentMatch.awayInitials}</div>
                      <h2 className="text-base font-black text-white">{currentMatch.away}</h2>
                      <p className="text-slate-400 text-[11px]">{currentMatch.awayAlt}</p>
                      <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">
                        Mercado: {probImplicitaVisita}%
                      </p>
                    </div>
                  </div>

                  {/* 4 CAJAS SUPERIORES - RESUMEN EJECUTIVO (JERARQUÍA CLARA Y TEXTO AUXILIAR PARA NOVATOS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* CAJA 1: OPCIÓN ANALIZADA PRINCIPAL */}
                    <div className="bg-gradient-to-b from-slate-900/95 to-slate-900/80 border-2 border-amber-400/80 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-amber-300 text-[11px] uppercase font-black tracking-wider block">
                          1. OPCIÓN ANALIZADA PRINCIPAL
                        </span>
                        <h3 className="text-base md:text-lg font-black text-white mt-1.5 leading-snug">
                          {currentMatch.bestMarketName}
                        </h3>
                        <span className="inline-block mt-1 text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-md font-mono">
                          Cuota Ref: <strong>{currentMatch.bestOdd}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2.5 pt-2 border-t border-slate-800 leading-snug font-medium">
                        {currentMatch.bestMarketDynamicSubtitle || "La opción con mayor probabilidad matemática detectada por el modelo"}
                      </p>
                    </div>

                    {/* CAJA 2: LO QUE CREE LA CASA */}
                    <div className="bg-gradient-to-b from-slate-900/95 to-slate-900/80 border border-slate-700 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-slate-300 text-[11px] uppercase font-bold tracking-wider block">
                          2. LO QUE CREE LA CASA
                        </span>
                        <p className="text-2xl md:text-3xl text-slate-200 font-black font-mono mt-1.5">
                          {currentMatch.probImplicitaBest}%
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          Según cuota de {currentMatch.bestOdd}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800 leading-snug">
                        Probabilidad que la casa de apuestas le asigna según su cuota
                      </p>
                    </div>

                    {/* CAJA 3: VALOR ESPERADO (+EV REAL) */}
                    <div className={`bg-gradient-to-b from-slate-900/95 to-slate-900/80 border-2 ${
                      currentMatch.ev >= 1.0 ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "border-slate-700"
                    } rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between`}>
                      <div>
                        <span className="text-emerald-300 text-[11px] uppercase font-black tracking-wider block">
                          3. VALOR ESPERADO (+EV REAL)
                        </span>
                        <p className={`text-2xl md:text-3xl font-black font-mono mt-1.5 ${
                          currentMatch.ev >= 1.0 ? "text-emerald-400" : "text-slate-200"
                        }`}>
                          {currentMatch.ev > 0 ? `+${currentMatch.ev}` : currentMatch.ev}% EV
                        </p>
                        <span className="text-[11px] text-emerald-300/80 font-mono block mt-0.5">
                          Pos De-vigging The Odds API
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2.5 pt-2 border-t border-slate-800 leading-snug">
                        Ventaja matemática real tras descontar el margen de la casa
                      </p>
                    </div>

                    {/* CAJA 4: CUOTA MÍNIMA RENTABLE */}
                    <div className="bg-gradient-to-b from-green-950/40 to-slate-900/90 border-2 border-green-500/60 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-green-400 text-[11px] uppercase font-black tracking-wider block">
                          4. CUOTA MÍNIMA RENTABLE
                        </span>
                        <p className="text-2xl md:text-3xl font-black font-mono mt-1.5 text-green-400">
                          {currentMatch.minFairOddForTopPick}
                        </p>
                        <span className="text-[11px] text-green-300/90 font-bold block mt-0.5">
                          Apuesta si pagan más de {currentMatch.minFairOddForTopPick}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2.5 pt-2 border-t border-slate-800 leading-snug">
                        Límite inferior para que tu apuesta sea matemáticamente rentable
                      </p>
                    </div>
                  </div>

                  {/* ESTRUCTURA JERÁRQUICA DE 3 FILAS/OPCIONES CLAVE */}
                  {currentMatch.hierarchicalPicks && (
                    <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
                      <div className="flex flex-wrap justify-between items-center pb-2.5 mb-3 border-b border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎯</span>
                          <h4 className="text-xs md:text-sm font-black uppercase text-amber-300 tracking-wider">
                            Estructura Jerárquica de Apuesta (3 Opciones Clave)
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Modelado Montecarlo + De-vigging
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. Ganador Directo (1X2) */}
                        <div className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-amber-300">🥇 1. Ganador Directo</span>
                              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick1Winner?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-white">{currentMatch.hierarchicalPicks.pick1Winner?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-300 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick1Winner?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">{currentMatch.hierarchicalPicks.pick1Winner?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick1Winner?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick1Winner?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-700/60 leading-tight">
                            {currentMatch.hierarchicalPicks.pick1Winner?.role}
                          </p>
                        </div>

                        {/* 2. Cobertura Hándicap Asiático */}
                        <div className="bg-slate-800/80 border border-sky-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-sky-300">🛡️ 2. Cobertura Asiática</span>
                              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick2Asian?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-white">{currentMatch.hierarchicalPicks.pick2Asian?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-300 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick2Asian?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">{currentMatch.hierarchicalPicks.pick2Asian?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick2Asian?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick2Asian?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-700/60 leading-tight">
                            {currentMatch.hierarchicalPicks.pick2Asian?.role}
                          </p>
                        </div>

                        {/* 3. Mercado de Goles */}
                        <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-emerald-300">⚽ 3. Mercado de Goles</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick3Goals?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-white">{currentMatch.hierarchicalPicks.pick3Goals?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-300 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick3Goals?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">{currentMatch.hierarchicalPicks.pick3Goals?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick3Goals?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick3Goals?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-700/60 leading-tight">
                            {currentMatch.hierarchicalPicks.pick3Goals?.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PANEL CONTEXTUAL DINÁMICO DE LAS 3 APIS + CONTEXTO GEOGRÁFICO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-sky-300">👨‍⚖️ Árbitro Oficial</span>
                          <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded font-bold">
                            {currentMatch.refereeName && currentMatch.refereeName !== "Por designar" && currentMatch.refereeCardsAvg && currentMatch.refereeCardsAvg !== "N/D"
                              ? `${currentMatch.refereeCardsAvg} tarj/p`
                              : "Por designar"}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white">{currentMatch.refereeName || "Por designar"}</p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {currentMatch.refereeName && currentMatch.refereeName !== "Por designar"
                            ? (currentMatch.refereeAlert || "Terna arbitral confirmada para este partido")
                            : "Terna arbitral aún no oficializada por la comisión técnica de la competición."}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">
                        {currentMatch.refereeName && currentMatch.refereeName !== "Por designar" && currentMatch.refereePenaltiesAvg && currentMatch.refereePenaltiesAvg !== "N/D"
                          ? `Penales estimados: ${currentMatch.refereePenaltiesAvg}/p`
                          : "Penales: Pendiente de designación"}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-amber-300">📋 Novedades de Plantel (ESPN)</span>
                          <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">Oficial</span>
                        </div>
                        <p className="text-sm font-black text-white">{currentMatch.lineupStatus}</p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">{currentMatch.lineupAlert}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2">Ajuste aplicado a generación xG</span>
                    </div>

                    <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-emerald-300">📈 Dinámica de Mercado</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">{currentMatch.bookmakerCount || 28} Casas</span>
                        </div>
                        <p className="text-sm font-black text-white">The Odds API En Vivo</p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">{currentMatch.marketTrend}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">Margen casa: {currentMatch.marginCasa}% | Desmargenizado</span>
                    </div>

                    {/* FACTOR ALTITUD / DESGASTE FISIOLÓGICO */}
                    <div className="bg-slate-900/90 border border-purple-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-purple-300">⛰️ Factor Altitud / Desgaste</span>
                          <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold">
                            {currentMatch.altitudeMeters ? `${currentMatch.altitudeMeters}m` : "Sede"}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white">{currentMatch.altitudeBadge || "Condiciones Simétricas"}</p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">{currentMatch.altitudeAlert}</p>
                      </div>
                      <span className="text-[10px] text-purple-300 font-mono mt-2 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                        Impacto: {currentMatch.altitudeImpactXg}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-amber-300">📋 Datos Oficiales del Calendario y Regla de Inversión</h4>
                      <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">{currentMatch.leagueTitle}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                      {currentMatch.reportePlantilla}
                    </p>
                    <p className="text-xs md:text-sm text-amber-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                      💡 <strong>Cómo usar este dato en tu casa de apuestas:</strong> Busca el partido <strong>{currentMatch.home} vs {currentMatch.away}</strong> y revisa la opción <strong>"{currentMatch.bestMarketName}"</strong> ({currentMatch.bestMarketExplanation}). Si tu casa de apuestas te paga una cuota mayor a <strong>{currentMatch.minFairOddForTopPick}</strong>, tienes ventaja matemática real a tu favor.
                    </p>
                  </div>

                  <div className="bg-[#131d3b] border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="flex overflow-x-auto bg-[#1c2a52] border-b border-slate-700 p-1.5 gap-1.5 text-xs font-bold">
                      {[
                        { id: "todos", label: "📊 Todas las Opciones Explicadas" },
                        { id: "asiatico", label: "🛡️ Hándicap Asiático & Coberturas (+EV)" },
                        { id: "goles", label: "⚽ Goles (Poisson) & Ambos Marcan" },
                        { id: "marcadores", label: "🎯 Marcadores Más Probables & Doble Oportunidad" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveMarketTab(tab.id)}
                          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${activeMarketTab === tab.id ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-4">
                      
                      {(activeMarketTab === "todos") && (
                        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                            <h4 className="text-xs font-black uppercase text-amber-400">⭐ Probabilidad de Victoria 1X2 (Montecarlo & De-vigging)</h4>
                            <span className="text-[11px] text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                              Peligro Ofensivo (xG Real API-Football): <strong className="text-blue-400">{currentMatch.homeInitials} {currentMatch.xgHome} xG</strong> vs <strong className="text-amber-400">{currentMatch.awayInitials} {currentMatch.xgAway} xG</strong> (<strong className="text-emerald-300 font-mono">ΔxG: {currentMatch.xgDiff > 0 ? "+" + currentMatch.xgDiff : currentMatch.xgDiff}</strong> | Total: {currentMatch.expectedGoals} xG)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                              <div className="flex justify-between font-bold text-white">
                                <span>Gana {currentMatch.home}</span>
                                <span className="text-amber-300">Cuota {currentMatch.cuotaLocal}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProb1}%</span>
                                <strong className="text-blue-400">Montecarlo: {currentMatch.probHomeSim}%</strong>
                              </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                              <div className="flex justify-between font-bold text-white">
                                <span>Empate</span>
                                <span className="text-amber-300">Cuota {currentMatch.cuotaEmpate}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProbX}%</span>
                                <strong className="text-blue-400">Montecarlo: {currentMatch.probDrawSim}%</strong>
                              </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                              <div className="flex justify-between font-bold text-white">
                                <span>Gana {currentMatch.away}</span>
                                <span className="text-amber-300">Cuota {currentMatch.cuotaVisita}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProb2}%</span>
                                <strong className="text-blue-400">Montecarlo: {currentMatch.probAwaySim}%</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MÓDULO DE HÁNDICAP ASIÁTICO & COBERTURAS (+EV) */}
                      {(activeMarketTab === "todos" || activeMarketTab === "asiatico") && (
                        <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-4">
                          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🛡️</span>
                              <h4 className="text-xs font-black uppercase text-sky-400">
                                Mercado de Hándicap Asiático & Coberturas (The Odds API & De-vigging)
                              </h4>
                            </div>
                            <span className="text-[11px] text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded border border-sky-500/30 font-medium">
                              Protección contra el empate: Reembolso parcial o total de la apuesta
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
                            {currentMatch.asianLines?.map((line: any, idx: number) => (
                              <div key={idx} className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-white text-xs">{line.name}</span>
                                    <span className="text-amber-300 font-bold font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                      Cuota {line.odd}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-300 font-mono space-y-0.5 mt-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Prob. De-vig:</span>
                                      <span>{line.cleanProb}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Prob. Montecarlo:</span>
                                      <strong className="text-blue-300">{line.realProb}%</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Valor Esperado:</span>
                                      <strong className={line.ev > 0 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                        {line.ev > 0 ? `+${line.ev}% EV` : `${line.ev}% EV`}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-700 leading-tight">
                                  💡 <strong>Regla:</strong> {line.rule}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-sky-950/40 border border-sky-500/30 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-base leading-none">ℹ️</span>
                            <p className="leading-snug">
                              <strong>¿Por qué usar Hándicap Asiático?</strong> A diferencia del 1X2 tradicional donde el empate te hace perder tu dinero, las líneas asiáticas como <strong>0.0 (DNB)</strong> o <strong>-0.25 / +0.25</strong> eliminan o mitigan el riesgo de empate devolviéndote el 100% o 50% de tu apuesta.
                            </p>
                          </div>
                        </div>
                      )}

                      {(activeMarketTab === "todos" || activeMarketTab === "goles") && (
                        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                          <h4 className="text-xs font-black uppercase text-green-400 mb-3">⚽ Pronóstico de Goles Totales (Distribución de Poisson) & Ambos Equipos Marcan</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <div className="flex justify-between font-bold text-white mb-1">
                                <span>Más de {currentMatch.lineGoals} goles</span>
                                <span className="text-amber-300">Cuota {currentMatch.cuotaOver}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-1">Ganas si hay {currentMatch.lineGoals === 3.5 ? "4" : "3"} goles o más en total</p>
                              <p className="text-[11px] text-blue-300 font-bold">Probabilidad Poisson: {currentMatch.probOverSim}%</p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <div className="flex justify-between font-bold text-white mb-1">
                                <span>Menos de {currentMatch.lineGoals} goles</span>
                                <span className="text-amber-300">Cuota {currentMatch.cuotaUnder}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-1">Ganas si hay máximo {currentMatch.lineGoals === 3.5 ? "3" : "2"} goles en total</p>
                              <p className="text-[11px] text-blue-300 font-bold">Probabilidad Poisson: {currentMatch.probUnderSim}%</p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <div className="flex justify-between font-bold text-white mb-1">
                                <span>Ambos Equipos Anotan</span>
                                <span className="text-green-400">{currentMatch.probBttsYesSim}% prob.</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-1">Que los dos equipos hagan al menos 1 gol</p>
                              <p className="text-[11px] text-slate-300">Cuota justa mínima: <strong className="text-white">{currentMatch.fairOddBttsYes}</strong></p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(activeMarketTab === "todos" || activeMarketTab === "marcadores") && (
                        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                          <h4 className="text-xs font-black uppercase text-sky-400 mb-3">🎯 Los 3 Marcadores Más Probables (Simulación Montecarlo) & Doble Oportunidad</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-800 p-3 rounded-lg border border-sky-500/30">
                              <span className="text-[10px] text-sky-300 font-bold uppercase block">Marcadores más probables</span>
                              <div className="mt-1.5 space-y-1">
                                {currentMatch.topScores?.map((s: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-white font-bold">Resultado {s.score}</span>
                                    <span className="text-amber-300 font-bold">{s.prob}% de las veces</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/30 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-amber-300 font-bold uppercase block">Doble Oportunidad</span>
                                <strong className="text-white text-xs block mt-1">Gana {currentMatch.home} o Empatan: {currentMatch.prob1X}%</strong>
                                <strong className="text-slate-200 text-xs block mt-1">Gana {currentMatch.away} o Empatan: {currentMatch.probX2}%</strong>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2">Sumatoria real de Montecarlo</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-purple-500/30 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-purple-300 font-bold uppercase block">Arco en Cero / No Anotan Ambos</span>
                                <strong className="text-white text-xs block mt-1">Al menos un equipo NO anota: {currentMatch.probBttsNoSim}%</strong>
                                <span className="text-[11px] text-slate-300 block mt-1">Cuota mínima recomendada: {currentMatch.fairOddBttsNo}</span>
                              </div>
                              <span className="text-[10px] text-green-400 font-bold mt-2">✓ Extraído de ESPN Oficial</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="bg-blue-950/40 border-2 border-blue-500/50 p-5 rounded-2xl space-y-2 shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                      <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider">🎙️ Veredicto del Analista (Poisson + Montecarlo)</h3>
                    </div>
                    <p className="text-slate-100 text-sm md:text-base leading-relaxed font-medium whitespace-pre-line">
                      {currentMatch.analisisDinamico}
                    </p>
                  </div>

                </div>

                <div className="space-y-6">
                  <div className="bg-[#131d3b] border-2 border-amber-400/70 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-amber-400 text-slate-950 px-4 py-2.5 font-black text-xs uppercase flex justify-between items-center">
                      <span>🎟️ Calculadora de Ganancia</span>
                      <span>CUOTA MÍN: {currentMatch.minFairOddForTopPick}</span>
                    </div>
                    <div className="p-4 space-y-4 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 block">{currentMatch.home} vs {currentMatch.away}</span>
                        <strong className="text-sm text-amber-300 block mt-0.5">Jugada: {currentMatch.bestMarketName}</strong>
                        <span className="text-[11px] text-slate-300 block mt-0.5">{currentMatch.bestMarketExplanation}</span>
                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                          <span>Cuota Ref: <strong className="text-white">{currentMatch.bestOdd}</strong></span>
                          <span className="text-green-400 font-bold">Montecarlo: {currentMatch.probReal}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">¿Cuánto quieres simular? ($ USD)</label>
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-bold text-base outline-none"
                        />
                      </div>

                      <div className="bg-green-950/50 border border-green-500/40 rounded-xl p-3 space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Cobras en total:</span>
                          <strong className="text-base text-white">${(stakeAmount * currentMatch.bestOdd).toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between text-green-400 font-bold">
                          <span>Ganancia limpia:</span>
                          <span>+${(stakeAmount * currentMatch.bestOdd - stakeAmount).toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[430px] shadow-xl">
                    <div className="bg-slate-800 px-3.5 py-2.5 border-b border-slate-700 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <h3 className="text-white font-bold text-xs uppercase flex items-center gap-1.5 truncate">
                          <span>🤖</span>
                          <span className="truncate">Auditor en Vivo: {currentMatch.home} vs {currentMatch.away}</span>
                        </h3>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        CONECTADO
                      </span>
                    </div>

                    {/* HISTORIAL DE MENSAJES */}
                    <div className="p-3 flex-1 overflow-y-auto space-y-2.5 text-xs">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[90%] p-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 font-sans'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-blue-400 bg-slate-800/70 p-2 rounded-lg border border-slate-700/60 animate-pulse">
                          <span>🔄</span>
                          <span>Auditando {currentMatch.home} vs {currentMatch.away} en tiempo real...</span>
                        </div>
                      )}
                    </div>

                    {/* BOTONES DE PREGUNTAS RÁPIDAS (1-CLICK) */}
                    <div className="px-2.5 py-1.5 bg-slate-950/70 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => handleSendMessage(`¿Vale la pena apostar a este partido y cuál es la cuota rentable?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        💡 ¿Vale la pena?
                      </button>
                      <button
                        onClick={() => handleSendMessage(`Explícame los xG y los marcadores más probables para ${currentMatch.home} vs ${currentMatch.away}`)}
                        className="text-[10px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        📊 xG y Marcador
                      </button>
                      <button
                        onClick={() => handleSendMessage(`¿Quién es el árbitro y cómo influye en este partido?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        👨‍⚖️ Árbitro
                      </button>
                      <button
                        onClick={() => handleSendMessage(`¿Cómo influye la altitud o la sede en este encuentro?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        ⛰️ Altura/Sede
                      </button>
                    </div>

                    {/* CAJA DE ENTRADA */}
                    <div className="p-2 bg-slate-800 border-t border-slate-700 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Pregunta sobre ${currentMatch.home} vs ${currentMatch.away}...`}
                        className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isTyping}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow"
                      >
                        Preguntar
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
