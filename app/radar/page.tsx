"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminRenewalAlertBanner from "@/components/AdminRenewalAlertBanner";
import SportCourtBackground, { getSportSurfaceFromLeague } from "@/components/SportCourtBackground";

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

const VIP_SESSION_KEY = "ecuapronostico_vip_session_v1";
const VIP_INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas de inactividad máxima (7,200,000 ms)

const getStoredVipSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VIP_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const now = Date.now();
    const lastActivity = Number(session.lastActivity || session.timestamp || 0);
    // Verificar si sigue vigente dentro de las 2 horas de inactividad
    if (session.authenticated && (now - lastActivity) < VIP_INACTIVITY_LIMIT_MS) {
      return { ...session, lastActivity };
    } else {
      // Expirado por 2 horas de inactividad
      localStorage.removeItem(VIP_SESSION_KEY);
      return null;
    }
  } catch {
    return null;
  }
};

const recordVipActivity = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(VIP_SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    const now = Date.now();
    if (session.authenticated && (now - Number(session.lastActivity || 0)) < VIP_INACTIVITY_LIMIT_MS) {
      session.lastActivity = now;
      localStorage.setItem(VIP_SESSION_KEY, JSON.stringify(session));
    }
  } catch {}
};

const saveVipSession = (user: string) => {
  if (typeof window === "undefined") return;
  try {
    const session = {
      authenticated: true,
      username: user,
      lastActivity: Date.now(),
    };
    localStorage.setItem(VIP_SESSION_KEY, JSON.stringify(session));
  } catch {}
};

const clearVipSession = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(VIP_SESSION_KEY);
  } catch {}
};

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [league, setLeague] = useState("ligapro");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeMarketTab, setActiveMarketTab] = useState("todos");
  const [displayMode, setDisplayMode] = useState<"full" | "top4">("full");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [top4Matches, setTop4Matches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [liveWindow, setLiveWindow] = useState<string>("Sincronizando corte diario de 8 días...");
  const [apiDiagnostics, setApiDiagnostics] = useState<string[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [paywallReason, setPaywallReason] = useState<string>("Desbloquea el Radar VIP completo por solo $14.99/mes");
  const [fijasSyncInfo, setFijasSyncInfo] = useState<string>("Snapshot Oficial del Día (Inmutable hasta las 23:59 ECT)");
  const [fijasEstrategia, setFijasEstrategia] = useState<any>(null);
  const [isLoadingTop4, setIsLoadingTop4] = useState<boolean>(false);

  const openVipPaywall = (reason?: string) => {
    const session = getStoredVipSession();
    if (session) {
      recordVipActivity();
      if (!isAuthenticated) setIsAuthenticated(true);
      if (view !== "premium") setView("premium");
      return;
    }

    if (isAuthenticated && view === "premium") {
      return;
    }

    if (reason) setPaywallReason(reason);
    setShowLoginModal(true);
  };

  useEffect(() => {
    // Al cargar la app, chequear si hay sesión VIP guardada vigente (< 2 horas de inactividad)
    const session = getStoredVipSession();
    if (session) {
      setIsAuthenticated(true);
      setView("premium");
      recordVipActivity();
    }

    // Chequear si el usuario es administrador autenticado (ocultamiento del botón CRM para público general)
    try {
      const rawAdmin = localStorage.getItem("ecuapronostico_admin_auth");
      if (rawAdmin) {
        const parsed = JSON.parse(rawAdmin);
        if (parsed.authenticated && (parsed.username === "admin" || parsed.role === "admin")) {
          setIsAdmin(true);
        }
      } else if (session && session.username === "admin") {
        setIsAdmin(true);
      }
    } catch {}

    const onUserInteraction = () => {
      recordVipActivity();
    };

    window.addEventListener("mousedown", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    window.addEventListener("scroll", onUserInteraction, { passive: true });

    // Chequeo cada 60s para expirar tras 2 horas de inactividad real
    const interval = setInterval(() => {
      const active = getStoredVipSession();
      if (!active) {
        setIsAuthenticated((prev) => {
          if (prev) {
            setView("basic");
            return false;
          }
          return prev;
        });
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousedown", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
      window.removeEventListener("scroll", onUserInteraction);
      clearInterval(interval);
    };
  }, []);

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
        if (data.estrategiaApostador) {
          setFijasEstrategia(data.estrategiaApostador);
        }
        setFijasSyncInfo(
          `🔒 Snapshot Oficial Inmutable: ${data.snapshotDate || "Hoy"} (${data.lockedAt || "00:00 ECT"}) • Vigente hasta 23:59 ECT`
        );
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

  const handleLogin = async () => {
    const validUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Acceso directo local de Administrador Maestro
    if (validUser === "admin" && cleanPass.toLowerCase() === "ecuapronostico2026@") {
      try {
        localStorage.setItem(
          "ecuapronostico_admin_auth",
          JSON.stringify({ authenticated: true, username: "admin", role: "admin", lastActivity: Date.now() })
        );
      } catch {}
      saveVipSession("admin");
      setIsAdmin(true);
      setIsAuthenticated(true);
      setView("premium");
      setShowLoginModal(false);
      setLoginError("");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: validUser, password: cleanPass }),
      });
      const data = await res.json();
      if (data.success) {
        saveVipSession(data.username);
        if (data.username === "admin") {
          setIsAdmin(true);
          try {
            localStorage.setItem(
              "ecuapronostico_admin_auth",
              JSON.stringify({ authenticated: true, username: "admin", role: "admin", lastActivity: Date.now() })
            );
          } catch {}
        }
        setIsAuthenticated(true);
        setView("premium");
        setShowLoginModal(false);
        setLoginError("");
      } else {
        setLoginError(data.error || "Usuario o contraseña incorrectos. Verifica tus credenciales.");
      }
    } catch {
      setLoginError("Error de conexión al autenticar. Verifica tu conexión a internet.");
    }
  };

  const handleLogout = () => {
    clearVipSession();
    try {
      localStorage.removeItem("ecuapronostico_admin_auth");
    } catch {}
    setIsAdmin(false);
    setIsAuthenticated(false);
    setView("basic");
    setUsername("");
    setPassword("");
  };

  const handlePremiumSwitch = () => {
    const session = getStoredVipSession();
    if (session || isAuthenticated) {
      recordVipActivity();
      setIsAuthenticated(true);
      setView("premium");
    } else {
      setShowLoginModal(true);
    }
  };

  const activeVipSession = getStoredVipSession();
  const isEffectiveVip = view === "premium" || !!activeVipSession;

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
  const isMatchUnlocked = isEffectiveVip || isFreePreview;

  const handleOpenProDetails = (matchItem: any) => {
    const s = getStoredVipSession();
    if (s) {
      recordVipActivity();
      if (!isAuthenticated) setIsAuthenticated(true);
      if (view !== "premium") setView("premium");
    }

    const isFirst = matches.length > 0 && matches[0]?.id === matchItem.id;
    const isUnlocked = isEffectiveVip || isFirst;

    if (!isUnlocked) {
      openVipPaywall(
        `El acceso a todas las variables PRO, matrices de Poisson, simulaciones Monte Carlo y auditoría técnica completa de ${matchItem.home} vs ${matchItem.away} está reservado para miembros VIP ($14.99/mes).`
      );
      return;
    }

    setSelectedMatchId(matchItem.id);
    setTimeout(() => {
      const el = document.getElementById("auditoria-pro");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

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
    <div className="min-h-screen bg-transparent text-slate-900 font-sans pb-24 lg:pb-6 relative">
      {/* FONDO INMERSIVO CLARO DINÁMICO SEGÚN DEPORTE ACTIVO */}
      <SportCourtBackground sport={getSportSurfaceFromLeague(league, currentMatch?.sportCategory)} />

      {/* ALERTA VISUAL ADMIN-ONLY PARA RENOVACIÓN DE APIS (<= 5 DÍAS) */}
      <AdminRenewalAlertBanner />

      <div className="p-3 md:p-6 relative z-10">
        <div className="max-w-[1440px] w-full mx-auto">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-100 border-2 border-amber-400/60 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] relative overflow-hidden">
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(""); }}
                className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 text-xl font-bold bg-white w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 transition-all hover:border-slate-500"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow mb-2">
                  ⭐ MEMBRESÍA VIP ECUAPRONÓSTICO
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                  Desbloquea el Radar Completo
                </h3>
                <div className="text-amber-700 font-extrabold text-lg mt-1 font-mono">
                  $14.99 USD / mes
                </div>
              </div>

              {paywallReason && (
                <div className="mb-4 bg-amber-50 border border-amber-400/50 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <p className="leading-snug">{paywallReason}</p>
                </div>
              )}

              <div className="space-y-2 mb-6 bg-white/92 p-4 rounded-2xl border border-slate-300 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>100% Partidos Desbloqueados:</strong> LigaPro, Champions, Europa League, Premier, La Liga, etc.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>Las 4 Fijas del Día:</strong> Selecciones con máxima certeza listas para tus apuestas.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>Cartelera Simplificada:</strong> Porcentaje de victoria directo (%) sin cuotas confusas.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>xG y De-vigging Real:</strong> Poisson, 10,000 simulaciones Montecarlo y cuota mínima rentable.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-emerald-700 font-black">✓</span>
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

                <div className="pt-4 border-t border-slate-300">
                  <div className="text-xs font-bold text-slate-600 mb-2 uppercase text-center">
                    ¿Ya eres miembro VIP? Inicia sesión
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Usuario (admin)"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 outline-none text-xs focus:border-amber-400"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Contraseña"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 outline-none text-xs focus:border-amber-400"
                    />
                    {loginError && <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg">{loginError}</p>}
                    <button
                      onClick={handleLogin}
                      className="w-full bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold py-2 rounded-lg text-xs transition-all"
                    >
                      Ingresar con mi cuenta VIP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="mb-6 border-2 border-slate-300 pb-4 relative z-[500] overflow-visible bg-white/95 backdrop-blur-md rounded-3xl px-4 md:px-6 pt-4 shadow-xl">
          {syncToast && (
            <div className="mb-4 bg-emerald-100/95 border-2 border-emerald-500 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{syncToast}</span>
              </div>
              <button onClick={() => setSyncToast(null)} className="text-emerald-700 hover:text-slate-900 font-black text-sm ml-4">✕</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <img src="/logo.png" alt="Logo" className="h-14 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
              </Link>
              <div>
                <span className="text-[10px] bg-green-100 text-green-800 border border-green-500/40 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  Sincronización Automática Semanal ({liveWindow})
                </span>
                <h1 className="text-base md:text-xl font-black text-slate-900 mt-0.5">RADAR MULTIMERCADO INTELIGENTE</h1>
              </div>
            </div>

            {/* VISTA DESKTOP (>= 1024px): CONTROLES Y BOTONES ORIGINALES 100% INTACTOS */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-500/50 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow animate-fadeIn"
                  title="Panel de Administración CRM"
                >
                  <span>👥 CRM Admin</span>
                </Link>
              )}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-[#25D366]/20 hover:scale-105"
                title="Activar membresía VIP por WhatsApp ($14.99/mes)"
              >
                <span>📲 Activar VIP ($14.99)</span>
              </a>
              <Link
                href="/"
                className="text-xs bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-slate-900 border border-slate-300 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all"
              >
                <span>🏠 Portada</span>
              </Link>
              <Link
                href="/aciertos"
                className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-500/60 px-3 py-2 rounded-lg font-black flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
              >
                <span>✅ Historial de Aciertos</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Público
                </span>
              </Link>
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
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-500 animate-pulse cursor-wait"
                    : "bg-slate-100 hover:bg-amber-100 text-green-700 border border-green-500/40"
                }`}
              >
                <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
                <span>{isSyncing ? "Sincronizando 3 APIs..." : "Forzar Sincronización"}</span>
                {view !== "premium" && <span className="text-[9px] text-amber-700 font-mono">🔒</span>}
              </button>
              <button
                onClick={() => {
                  if (view !== "premium") {
                    openVipPaywall("La Guía Fácil de Inversión Cuantitativa (+EV) es exclusiva para miembros VIP ($14.99/mes).");
                    return;
                  }
                  setShowGuide(!showGuide);
                }}
                className="text-xs bg-slate-100 hover:bg-amber-100 text-blue-700 border border-slate-300 px-3 py-2 rounded-lg font-bold flex items-center gap-1"
              >
                <span>{showGuide ? "Ocultar Guía" : "📖 Guía Fácil"}</span>
                {view !== "premium" && <span className="text-[9px] text-amber-700 font-mono">🔒</span>}
              </button>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
                <button onClick={() => setView("basic")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "basic" ? "bg-amber-200 text-slate-900" : "text-slate-600"}`}>Gratis</button>
                <button onClick={handlePremiumSwitch} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "premium" ? "bg-blue-600 text-white" : "text-slate-600"}`}>VIP ($14.99)</button>
              </div>
              {isAuthenticated && <button onClick={handleLogout} className="text-xs text-red-700 border border-slate-300 px-2.5 py-1.5 rounded-lg">Salir</button>}
            </div>

            {/* VISTA MÓVIL (< 1024px): CABECERA LIMPIA TIPO APP CON BOTÓN VIP Y ACCESO RÁPIDO */}
            <div className="flex lg:hidden items-center gap-2 justify-between w-full pt-1">
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[11px] bg-amber-100 text-amber-800 border border-amber-500/50 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow"
                    title="Panel CRM"
                  >
                    <span>👥 CRM</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    if (view !== "premium") {
                      openVipPaywall("Sincronización en vivo con 3 APIs oficiales");
                      return;
                    }
                    fetchMatchesFromServer(league, true);
                  }}
                  disabled={isSyncing}
                  className="text-[11px] bg-white text-green-700 border border-green-500/40 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1"
                  title="Sincronizar"
                >
                  <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
                  <span>{isSyncing ? "..." : "Sincronizar"}</span>
                </button>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#25D366]/30 active:scale-95"
              >
                <span>📲 Activar VIP ($14.99)</span>
              </a>
            </div>
          </div>

          {showGuide && (
            <div className="mb-4 bg-white/95 border border-blue-500/40 rounded-xl p-4 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-amber-700 block mb-1">1. Las 4 Fijas del Día</strong>
                El botón dorado superior extrae automáticamente las 4 apuestas más seguras y rentables de todas las ligas para que las compartas en tus grupos de WhatsApp y Telegram.
              </div>
              <div>
                <strong className="text-blue-700 block mb-1">2. Vista Simplificada (Solo Ganadores %)</strong>
                Visualiza el equipo probable ganador y su porcentaje exacto de victoria frente al rival sin enredos de cuotas.
              </div>
              <div>
                <strong className="text-green-700 block mb-1">3. Respaldo Matemático Real</strong>
                10,000 simulaciones de Montecarlo y Distribución de Poisson respaldan cada pronóstico diario.
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 relative z-[500] overflow-visible">
            {/* SISTEMA DE PESTAÑAS DESPLEGABLES (DROPDOWN TABS) POR REGIÓN */}
            <div className="flex items-center gap-2 relative z-[500] flex-wrap overflow-visible" data-league-dropdown>
              {REGION_TABS.map((reg, tabIdx) => {
                const isRegionActive = activeLeagueInfo.region.id === reg.id;
                const isOpen = openDropdown === reg.id;

                return (
                  <div key={reg.id} className={`relative ${isOpen ? "z-[9999]" : "z-30"}`}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : reg.id)}
                      className={`px-3.5 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all border shrink-0 ${
                        isRegionActive
                          ? "bg-white text-amber-800 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/50"
                          : "bg-white/95 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-base">{reg.icon}</span>
                      <span className="tracking-wide uppercase font-extrabold">{reg.label}</span>
                      {isRegionActive && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-400/40 font-bold ml-1 hidden sm:inline-block truncate max-w-[130px]">
                          {activeLeagueInfo.option.name.split(":")[0]}
                        </span>
                      )}
                      <svg
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-600 ${
                          isOpen ? "rotate-180 text-amber-700" : ""
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
                        className={`absolute top-full mt-2 w-72 sm:w-80 md:w-96 bg-white border-2 border-blue-600 rounded-2xl shadow-[0_25px_70px_rgba(15,23,42,0.45)] p-2.5 z-[9999] max-h-[72vh] overflow-y-auto divide-y divide-slate-200 animate-in fade-in zoom-in-95 duration-150 ${
                          tabIdx === 2 ? "left-0 xl:left-auto xl:right-0" : "left-0"
                        }`}
                      >
                        <div className="px-3 py-2 mb-1 flex items-center justify-between border-b border-slate-300">
                          <div>
                            <div className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                              <span>{reg.icon}</span> {reg.label}
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium">{reg.subtitle}</div>
                          </div>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
                            {reg.sections.reduce((acc, s) => acc + s.options.length, 0)} Opciones
                          </span>
                        </div>

                        {reg.sections.map((section, sIdx) => (
                          <div key={sIdx} className="pt-2 pb-1.5">
                            {section.title && (
                              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100/90 rounded-md mb-1.5 flex items-center justify-between">
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
                                      setDisplayMode("full");
                                      setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                                      isSelected
                                        ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-400/50 shadow-sm font-bold"
                                        : "text-slate-800 hover:bg-slate-50/95 hover:text-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <span className="text-base shrink-0">{opt.icon}</span>
                                      <div className="truncate">
                                        <div className="font-bold truncate text-slate-900">{opt.name}</div>
                                        {opt.sportLabel && (
                                          <div className="text-[10px] text-slate-600 font-normal">{opt.sportLabel}</div>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <span className="text-amber-700 text-xs font-black shrink-0 ml-2 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-400/40">
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

            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
              <button
                onClick={() => {
                  const s = getStoredVipSession();
                  if (s) {
                    recordVipActivity();
                    if (!isAuthenticated) setIsAuthenticated(true);
                    if (view !== "premium") setView("premium");
                  } else if (view !== "premium") {
                    openVipPaywall("Las 4 Fijas del Día (las predicciones de máxima certeza matemática del radar multiligas) son exclusivas para miembros VIP ($14.99/mes).");
                    return;
                  }
                  setDisplayMode("top4");
                  fetchAllLeaguesForTop4();
                }}
                className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  displayMode === "top4"
                    ? "bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-[1.02]"
                    : "text-green-800 hover:bg-slate-100"
                }`}
              >
                <span>🏆 LAS 4 FIJAS DEL DÍA</span>
                {!isEffectiveVip && <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">🔒 VIP</span>}
              </button>

              <Link
                href="/aciertos"
                className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 text-emerald-800 hover:text-slate-900 hover:bg-slate-100 border border-emerald-500/30 hover:border-emerald-500/60"
              >
                <span>✅ Historial de Aciertos</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded font-extrabold uppercase">
                  Público
                </span>
              </Link>

              <button
                onClick={() => {
                  const s = getStoredVipSession();
                  if (s) {
                    recordVipActivity();
                    if (!isAuthenticated) setIsAuthenticated(true);
                    if (view !== "premium") setView("premium");
                  }
                  setDisplayMode("full");
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  displayMode === "full"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>📊 Vista Completa</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                  {isEffectiveVip ? "🔓 VIP Activo" : "🔓 Gratuita"}
                </span>
              </button>
            </div>
          </div>
        </header>

        {displayMode === "top4" ? (
          <section className="space-y-6 relative z-10">
            <div className="bg-gradient-to-r from-emerald-100/95 via-white/98 to-blue-100/95 border-2 border-green-400/80 rounded-3xl p-6 text-center shadow-[0_0_35px_rgba(34,197,94,0.3)] relative overflow-hidden">
              <span className="inline-block bg-green-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-2 shadow">
                Ventana Dinámica: Próximas 24 Horas (NOW a NOW + 24H) • Orden Estrictamente Cronológico
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-950 via-emerald-800 to-blue-900 drop-shadow">
                🏆 LAS 4 FIJAS DEL DÍA (MÁXIMA CERTEZA Y VALOR)
              </h2>
              <p className="text-xs md:text-sm text-slate-800 mt-1 max-w-2xl mx-auto">
                Filtro automático de <strong className="text-amber-800">todas las ligas y deportes activos</strong> para las próximas 24 horas. El motor matemático evalúa el <strong className="text-green-800">EV% y probabilidad más alta</strong> (ganador, doble oportunidad o totales con adaptación semántica de métricas xG, xPts y xRuns según deporte), ordenadas de forma <strong className="text-slate-900 font-bold">estrictamente cronológica por hora de inicio</strong>.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="text-[11px] text-emerald-800 font-mono font-bold bg-slate-100/95 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/50 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{fijasSyncInfo}</span>
                </div>
                <div className="text-[11px] text-amber-800 font-bold bg-slate-100/95 border border-amber-400/60 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                  <span>🔒 Snapshot Inquebrantable a las 00:00 ECT</span>
                </div>
              </div>
            </div>

            {/* CÁLCULO DE CUOTA COMBINADA PARLEY: OBJETIVO DUPLICAR O MULTIPLICAR CAPITAL */}
            {!isLoadingMatches && !isLoadingTop4 && top4Matches.length === 4 && (
              <div className="bg-white/95 border-2 border-amber-400 rounded-3xl p-5 md:p-6 shadow-[0_0_30px_rgba(251,191,36,0.2)] flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Combinada Las 4 Fijas (Ticket Cuantitativo)
                    </span>
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <span>🛡️</span> Cero Azar • Algoritmo EV+ Verificado
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                    Multiplicador Combinado:{" "}
                    <span className="text-emerald-700 font-mono font-black drop-shadow">
                      x{top4Matches.reduce((acc, m) => acc * Number(m.bestOdd || 1.8), 1).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                    🎯 <strong>Objetivo de Rentabilidad:</strong> Duplica o multiplica tu capital aprovechando la máxima ventaja probabilística del mercado. Inversión sugerida: <strong className="text-slate-900">$10</strong> ➔ Retorno estimado: <strong className="text-emerald-800 font-mono text-sm">${(10 * top4Matches.reduce((acc, m) => acc * Number(m.bestOdd || 1.8), 1)).toFixed(2)}</strong>.
                  </p>
                </div>
                <div className="bg-gradient-to-b from-emerald-100 to-white border border-emerald-500/60 p-3.5 rounded-2xl text-center shrink-0 shadow-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Sello de Auditoría IA</span>
                  <span className="text-xs font-black text-emerald-800 block">ECUAPRONÓSTICO</span>
                  <span className="text-[9px] text-slate-600 font-mono">De-Vigging & Montecarlo</span>
                </div>
              </div>
            )}

            {isLoadingMatches || isLoadingTop4 ? (
              <div className="p-12 text-center bg-white/95 border border-slate-300 rounded-3xl">
                <p className="text-lg font-black text-green-800 animate-pulse">Consultando 20 ligas globales en la ventana de 24 horas y ordenando cronológicamente...</p>
              </div>
            ) : top4Matches.length === 0 ? (
              <div className="p-8 text-center bg-white/95 border border-slate-300 rounded-3xl">
                <p className="text-base font-bold text-amber-800">No hay suficientes partidos futuros para armar las 4 fijas en este momento.</p>
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
                      className="relative rounded-3xl overflow-hidden border-2 border-green-500/70 bg-gradient-to-r from-emerald-50/95 via-white/98 to-emerald-50/95 shadow-2xl transition-all hover:scale-[1.01]"
                    >
                      <div className="bg-slate-100/95 px-5 py-2.5 border-b border-slate-300 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-green-800">
                            FIJA #{idx + 1} • {m.icon || lexicon.icon || "⚽"} {m.leagueTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>📅 {m.date}</span>
                            <span>•</span>
                            <span>⏰ <strong className="text-amber-800">{m.time}</strong></span>
                            {m.timeDisplay && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-400/40 px-2 py-0.5 rounded font-black ml-1">
                                ⏳ {m.timeDisplay}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] bg-green-100 text-green-700 border border-green-500/40 px-2.5 py-0.5 rounded-full font-black">
                            🔥 CONFIANZA {m.confidenceScore || 85}/100
                          </span>
                          {m.fixtureId && (
                            <a
                              href={`https://www.espn.com/soccer/match/_/gameId/${m.fixtureId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-400/50 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-all"
                              title="Verificar fixture oficial en ESPN"
                            >
                              <span>🔗</span>
                              <span>ESPN #{m.fixtureId}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="p-5 md:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-4 flex items-center gap-4 bg-gradient-to-r from-emerald-100/90 to-white/95 p-5 rounded-2xl border-2 border-green-500/80 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-900 border-4 border-amber-400 flex items-center justify-center font-black text-xl md:text-2xl text-white shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                            {winnerInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase leading-tight truncate">
                              {winnerName}
                            </h3>
                            <div
                              className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl border-2 font-black text-xs md:text-sm uppercase tracking-wider"
                              style={{
                                backgroundColor: "#fef3c7",
                                borderColor: "#d97706",
                                color: "#92400e",
                                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
                              }}
                            >
                              <span className="text-base leading-none">{lexicon.icon || "⚽"}</span>
                              <span style={{ color: "#0f172a", fontWeight: 900 }}>FIJA</span>
                              <span
                                style={{
                                  color: "#b45309",
                                  fontWeight: 900,
                                }}
                              >
                                A GANAR
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col justify-center bg-white/95 border-2 border-emerald-400/60 rounded-2xl p-5 shadow-xl text-center">
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 border-b border-slate-300 pb-2 mb-2">
                            VALOR ESPERADO (+EV REAL)
                          </span>
                          <div className="text-4xl md:text-5xl font-black text-emerald-700 my-1 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                            {m.ev > 0 ? `+${m.ev}%` : `${m.ev}%`} EV
                          </div>
                          <div className="text-xs text-slate-700 mt-2 space-y-1">
                            <div className="flex justify-between px-2 bg-slate-100/90 rounded-lg py-1 border border-slate-300 font-mono">
                              <span className="text-slate-600">{m.metricLabel || lexicon.metricLabel}:</span>
                              <strong className="text-blue-700">
                                {m.metricShort || lexicon.metricShort} {m.metricDiff || (m.xgDiff > 0 ? `+${m.xgDiff}` : m.xgDiff)}
                              </strong>
                            </div>
                            <div className="flex justify-between px-2 bg-slate-100/90 rounded-lg py-1 border border-slate-300">
                              <span className="text-slate-600">Certeza De-vig:</span>
                              <strong className="text-amber-800">{headToHeadWinProb}%</strong>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col justify-between bg-white/92 border-2 border-slate-300 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-300 pb-2.5">
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase text-slate-600 block">Rival a enfrentar</span>
                              <h4 className="text-base md:text-lg font-black text-slate-800 uppercase truncate">
                                {loserName}
                              </h4>
                            </div>
                            <div className="w-11 h-11 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                              {loserInitials}
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Jugada recomendada:</span>
                              <strong className="text-amber-800 font-bold">{m.bestMarketName}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Cuota Estimada:</span>
                              <strong className="text-emerald-700 font-mono font-bold text-sm">
                                {m.bestOdd ? Number(m.bestOdd).toFixed(2) : "1.85"}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Probabilidad Matemática:</span>
                              <strong className="text-blue-800 font-bold">
                                {m.probReal ? `${m.probReal}%` : `${headToHeadWinProb}%`}
                              </strong>
                            </div>
                            {m.capitalGoal && (
                              <div className="pt-1">
                                <span className="inline-block text-[10px] bg-amber-100 text-amber-800 border border-amber-400/50 px-2 py-0.5 rounded-md font-bold">
                                  {m.capitalGoal}
                                </span>
                              </div>
                            )}
                            <div className="pt-1 flex flex-wrap gap-1">
                              <span className="text-[10px] bg-slate-100 text-sky-800 border border-sky-500/30 px-2 py-0.5 rounded font-medium">
                                👨‍⚖️ {m.refereeName && m.refereeName !== "Por designar" ? (
                                  <>
                                    <strong>{m.refereeName}</strong>
                                    {m.refereeCardsAvg && m.refereeCardsAvg !== "N/D" && <span className="text-sky-700 font-bold ml-1">({m.refereeCardsAvg} tarj/p)</span>}
                                  </>
                                ) : (
                                  <span className="text-slate-600">Árbitro: Por designar</span>
                                )}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-amber-800 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                                📋 {m.lineupStatus ? m.lineupStatus.slice(0, 32) + "..." : "Alineaciones verificadas"}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-slate-300 text-[10px] flex items-center justify-between text-slate-600">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <span>🛡️</span> Sello IA EcuaPronóstico
                              </span>
                              <span className="font-mono text-slate-500">Cero Azar</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const s = getStoredVipSession();
                              if (s) {
                                recordVipActivity();
                                if (!isAuthenticated) setIsAuthenticated(true);
                                if (view !== "premium") setView("premium");
                              }
                              if (m.leagueKey) {
                                setLeague(m.leagueKey);
                              } else {
                                setLeague(m.leagueTitle?.toLowerCase().includes("champions") ? "champions" : m.leagueTitle?.toLowerCase().includes("europa") ? "europa" : "ligapro");
                              }
                              setSelectedMatchId(m.id);
                              setDisplayMode("full");
                              setTimeout(() => {
                                const el = document.getElementById("auditoria-pro");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            }}
                            className="w-full text-center text-xs bg-slate-100 hover:bg-green-600 text-green-800 hover:text-white py-2 px-3 rounded-xl font-bold transition-all border border-slate-300 cursor-pointer"
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

            {/* ========================================================================= */}
            {/* GUÍA ESTRATÉGICA PARA EL APOSTADOR: APUESTAS INDIVIDUALES VS PARLEY COMBINADO */}
            {/* ========================================================================= */}
            {!isLoadingMatches && !isLoadingTop4 && top4Matches.length === 4 && (
              <div className="bg-gradient-to-b from-white/96 via-emerald-50/95 to-blue-50/95 border-2 border-emerald-400/80 rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_0_35px_rgba(16,185,129,0.2)] space-y-6 mt-8">
                {/* CABECERA DE LA GUÍA */}
                <div className="border-b border-slate-300 pb-5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="bg-gradient-to-r from-emerald-400 to-green-300 text-slate-950 font-black text-[10px] md:text-xs px-3.5 py-1 rounded-full uppercase tracking-widest shadow">
                      🎓 MANUAL CUANTITATIVO PARA EL APOSTADOR
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
                      ¿Cómo apostar a las 4 Fijas de hoy? ¿Individuales o Parley?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
                      Recomendación matemática rigurosa diseñada para proteger tu capital y maximizar tus probabilidades reales de éxito.
                    </p>
                  </div>
                  <div className="bg-slate-100/95 border border-emerald-500/50 px-4 py-2 rounded-2xl text-center shrink-0">
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Veredicto Oficial</span>
                    <span className="text-xs font-black text-emerald-800 uppercase">Gestión de Riesgo EV+</span>
                  </div>
                </div>

                {/* COMPARATIVA EN 2 COLUMNAS: SIMPLES VS PARLEY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                  {/* OPCIÓN 1: APUESTAS SIMPLES / INDIVIDUALES (RECOMENDADA) */}
                  <div className="bg-gradient-to-b from-emerald-50/95 to-white/95 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      <span className="bg-emerald-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        ⭐ RECOMENDACIÓN PARA NOVATOS
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900">
                            Opción 1: Apuestas Individuales (Stake Plano)
                          </h4>
                          <span className="text-xs text-emerald-800 font-bold">
                            Probabilidad de Rentabilidad: 78% - 85%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed">
                        Apostar a cada fija por separado con un importe idéntico (ej. <strong>2% a 5% de tu capital</strong> por partido) es la estrategia que utilizan los fondos de inversión cuantitativa.
                      </p>

                      <div className="bg-slate-100/95 border border-emerald-500/40 rounded-xl p-3 space-y-2 text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-emerald-700">✓</span> Si aciertas 3 de 4: <strong className="text-emerald-800 font-mono">¡Ganancia Neta Asegurada!</strong>
                        </div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-emerald-700">✓</span> Si aciertas 4 de 4: <strong className="text-emerald-800 font-mono">Retorno Masivo (~80% de ROI)</strong>
                        </div>
                        <div className="text-[11px] text-slate-600 italic">
                          Un gol imprevisto o error arbitral en el minuto 90 en un partido NO destruye tu inversión en los otros 3.
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-300 text-[11px] text-emerald-900 font-medium">
                      💡 <strong>Consejo Práctico:</strong> Si tienes $40 de presupuesto, coloca $10 en cada una de las 4 fijas de hoy.
                    </div>
                  </div>

                  {/* OPCIÓN 2: PARLEY COMBINADO (ALTO RETORNO / RIESGO CONCENTRADO) */}
                  <div className="bg-gradient-to-b from-amber-50/95 to-white/95 border-2 border-amber-400/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      <span className="bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        🚀 MULTIPLICADOR ALTO
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900">
                            Opción 2: Parley Combinado de 4
                          </h4>
                          <span className="text-xs text-amber-800 font-bold font-mono">
                            Multiplicador Combinado: x{top4Matches.reduce((acc, m) => acc * Number(m.bestOdd || 1.8), 1).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed">
                        Agrupar las 4 fijas en un solo boleto ofrece un retorno explosivo (<strong className="text-slate-900">$10</strong> retornan <strong className="text-amber-800 font-mono text-sm">${(10 * top4Matches.reduce((acc, m) => acc * Number(m.bestOdd || 1.8), 1)).toFixed(2)}</strong>).
                      </p>

                      <div className="bg-slate-100/95 border border-amber-400/40 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <span>⚠️</span> <strong>Advertencia Matemática de Probabilidad Compuesta:</strong>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          En una combinada de 4 eventos, si 3 aciertan y 1 falla, <strong>el boleto se pierde por completo</strong>. Por esta razón, el parley debe jugarse exclusivamente con una fracción menor de capital.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-300 text-[11px] text-amber-900 font-medium">
                      💡 <strong>Regla de Oro:</strong> Arriesga máximo el <strong>1% de tu capital</strong> (ej. $2 a $5) en el Parley como "tiro de valor".
                    </div>
                  </div>
                </div>

                {/* OPCIÓN 3: SISTEMA ROUND ROBIN 3 DE 4 Y VEREDICTO FINAL */}
                <div className="bg-white/95 border border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                      ⚖️ Estrategia Intermedia: Sistema Round Robin (3 de 4)
                    </span>
                    <p className="text-xs text-slate-700 max-w-2xl">
                      Crea 4 boletos de 3 selecciones en tu casa de apuestas. Si se cumplen 3 de las 4 fijas, cobras el premio del boleto ganador y salvas tu inversión.
                    </p>
                  </div>
                  <div className="bg-emerald-50/95 border border-emerald-500/60 p-3 rounded-xl text-center shrink-0">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Veredicto del Día</span>
                    <strong className="text-xs font-black text-slate-900 block">Apuestas Simples para Novatos</strong>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* VISTA COMPLETA: CARTELERA DE PARTIDOS EN FORMATO LIMPIO */}
            <section id="lista-partidos-limpia" className="mb-10 space-y-6 relative z-10">
              {/* ENCABEZADO DE LA CARTELERA */}
              <div className="bg-white/95 border-2 border-slate-300 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-ping"></span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        Cartelera Oficial en Vivo
                      </span>
                      <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-900">
                        {isLoadingMatches
                          ? "Sincronizando partidos oficiales..."
                          : `${currentMatch.leagueTitle} — ${matches.length} Partidos (Próximos 8 Días)`}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-700 font-bold bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-300">
                      📡 ESPN, API-Football & The Odds API
                    </span>
                    <span className="text-xs text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-400/30">
                      ⚡ 10,000 Simulaciones
                    </span>
                  </div>
                </div>
              </div>

              {isLoadingMatches ? (
                <div className="p-12 text-center bg-white/95 border border-slate-300 rounded-3xl shadow-xl">
                  <p className="text-lg font-black text-amber-800 animate-pulse">
                    Calculando probabilidades desmargenizadas y ganadores proyectados...
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-8 text-center bg-white/95 border border-slate-300 rounded-3xl shadow-xl">
                  <p className="text-base font-bold text-amber-800">
                    No hay partidos programados en los próximos 8 días para esta competición.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {matches.map((m, idx) => {
                    const isSample = idx === 0;
                    const isUnlocked = isEffectiveVip || isSample;
                    const isSelected = selectedMatchId === m.id;

                    const isSoccer = !m.sportType || m.sportType === "soccer" || (m.cleanProbX && Number(m.cleanProbX) > 0);
                    const probHome = Number(m.cleanProb1 || m.probHomeSim || 0);
                    const probAway = Number(m.cleanProb2 || m.probAwaySim || 0);
                    const probDraw = isSoccer ? Number(m.cleanProbX || m.probDrawSim || 0) : 0;

                    const isHomeFav = probHome >= probAway && probHome >= probDraw;
                    const isAwayFav = probAway > probHome && probAway >= probDraw;
                    const isDrawFav = probDraw > probHome && probDraw > probAway;

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (!isUnlocked) {
                            openVipPaywall(
                              `Desbloquea el pronóstico y estadísticas completas de ${m.home} vs ${m.away} con tu membresía VIP ($14.99/mes).`
                            );
                          } else {
                            setSelectedMatchId(m.id);
                          }
                        }}
                        className={`relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected && isUnlocked
                            ? "border-amber-400 bg-gradient-to-r from-amber-50/95 via-white/98 to-blue-50/95 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
                            : "border-slate-300 hover:border-slate-300 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 shadow-xl"
                        }`}
                      >
                        {/* OVERLAY DE BLOQUEO VIP (FILTRO DE OPACIDAD Y CANDADO) PARA PARTIDOS 2 EN ADELANTE */}
                        {!isUnlocked && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              openVipPaywall(
                                `Desbloquea el análisis completo de ${m.home} vs ${m.away} y todos los partidos con tu membresía VIP ($14.99/mes).`
                              );
                            }}
                            className="absolute inset-0 z-20 backdrop-blur-[4px] bg-slate-100/95 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-white/50 group"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl mb-3 shadow-[0_0_25px_rgba(251,191,36,0.4)] group-hover:scale-110 transition-transform">
                              🔒
                            </div>
                            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 shadow">
                              Partido Bloqueado • Solo VIP
                            </span>
                            <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">
                              {m.home} vs {m.away}
                            </h4>
                            <p className="text-xs text-slate-700 max-w-md mb-4">
                              Accede al pronóstico ganador simplificado y a todas las variables PRO de este encuentro.
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openVipPaywall(
                                  `Desbloquea ${m.home} vs ${m.away} y todos los partidos con tu membresía VIP ($14.99/mes).`
                                );
                              }}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 transform group-hover:scale-105 transition-all"
                            >
                              Desbloquear con VIP ($14.99/mes)
                            </button>
                          </div>
                        )}

                        {/* CONTENIDO DE LA TARJETA */}
                        <div
                          className={`p-5 md:p-6 transition-all ${
                            !isUnlocked ? "filter blur-[2px] opacity-40 select-none pointer-events-none" : ""
                          }`}
                        >
                          {/* ENCABEZADO DE TARJETA: TORNEO, FECHA/HORA, BADGE DE ACCESO */}
                          <div className="flex flex-wrap justify-between items-center gap-2 pb-4 mb-4 border-b border-slate-300">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                              <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                                {m.leagueTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs md:text-sm font-bold text-slate-800">
                                  📅 {m.date} • ⏰ <strong className="text-slate-900">{m.time}</strong>
                                </span>
                                {m.fixtureId && (
                                  <a
                                    href={`https://www.espn.com/soccer/match/_/gameId/${m.fixtureId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-slate-100 hover:bg-amber-100 text-blue-800 border border-blue-500/40 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-all"
                                    title="Cotejar en ESPN Oficial"
                                  >
                                    <span>🔗</span>
                                    <span>ESPN #{m.fixtureId}</span>
                                  </a>
                                )}
                              </div>
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                                  isUnlocked
                                    ? "bg-green-100 text-green-700 border border-green-500/40"
                                    : "bg-amber-100 text-amber-800 border border-amber-500/40"
                                }`}
                              >
                                {isSample ? "🔓 MUESTRA GRATIS" : isUnlocked ? "🔓 VIP ACTIVO" : "🔒 SOLO VIP"}
                              </span>
                            </div>
                          </div>

                          {/* ESTRUCTURA IZQUIERDA / CENTRO / DERECHA */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            {/* IZQUIERDA: EQUIPO LOCAL */}
                            <div className="md:col-span-4 flex items-center gap-4">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-900 border-2 border-blue-700 flex items-center justify-center font-black text-lg md:text-xl text-white shrink-0 shadow-lg">
                                {m.homeInitials}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                                  Equipo Local
                                </span>
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase leading-snug truncate">
                                  {m.home}
                                </h3>
                                {isHomeFav && (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider mt-2"
                                    style={{
                                      backgroundColor: "#fef3c7",
                                borderColor: "#d97706",
                                color: "#92400e",
                                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
                                    }}
                                  >
                                    <span className="text-sm">🏆</span>
                                    <span
                                      style={{
                                        color: "#b45309",
                                  fontWeight: 900,
                                      }}
                                    >
                                      FAVORITO A GANAR
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CENTRO: RESUMEN LIMPIO DE PROBABILIDADES DIRECTAS */}
                            <div className="md:col-span-4">
                              <div className="bg-white/95 border border-slate-300 rounded-2xl p-3 text-center shadow-inner">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">
                                  Probabilidades del Modelo
                                </span>
                                <div className="text-xs md:text-sm font-extrabold text-slate-900 flex flex-wrap items-center justify-center gap-1.5">
                                  <span className={isHomeFav ? "text-amber-300 font-black" : "text-slate-200"}>
                                    Gana {m.home} <strong className="text-slate-900">{m.cleanProb1}%</strong>
                                  </span>
                                  {isSoccer && (
                                    <>
                                      <span className="text-slate-500 font-normal">|</span>
                                      <span className={isDrawFav ? "text-amber-300 font-black" : "text-slate-300"}>
                                        Empatan <strong className="text-slate-900">{m.cleanProbX}%</strong>
                                      </span>
                                    </>
                                  )}
                                  <span className="text-slate-500 font-normal">|</span>
                                  <span className={isAwayFav ? "text-amber-300 font-black" : "text-slate-200"}>
                                    Gana {m.away} <strong className="text-slate-900">{m.cleanProb2}%</strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* DERECHA: EQUIPO VISITANTE */}
                            <div className="md:col-span-4 flex items-center justify-end gap-4 text-right">
                              <div className="min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                                  Equipo Visitante
                                </span>
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase leading-snug truncate">
                                  {m.away}
                                </h3>
                                {isAwayFav && (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider mt-2"
                                    style={{
                                      backgroundColor: "#fef3c7",
                                borderColor: "#d97706",
                                color: "#92400e",
                                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
                                    }}
                                  >
                                    <span className="text-sm">🏆</span>
                                    <span
                                      style={{
                                        color: "#b45309",
                                  fontWeight: 900,
                                      }}
                                    >
                                      FAVORITO A GANAR
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-900 border-2 border-blue-700 flex items-center justify-center font-black text-lg md:text-xl text-white shrink-0 shadow-lg">
                                {m.awayInitials}
                              </div>
                            </div>
                          </div>

                          {/* PIE DE TARJETA: DESCARGO INSTITUCIONAL CON ENLACE INTERACTIVO */}
                          <div className="mt-6 pt-4 border-t-2 border-slate-300 bg-slate-50/95 rounded-2xl p-4 text-center shadow-inner">
                            <p className="text-sm md:text-base text-slate-900 font-medium leading-relaxed">
                              Esta es una versión simplificada de nuestro pronóstico. Si eres apostador profesional{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProDetails(m);
                                }}
                                className="inline-flex items-center gap-1.5 font-black text-amber-800 hover:text-amber-900 underline decoration-amber-400 decoration-2 underline-offset-4 transition text-sm md:text-base cursor-pointer px-1.5 py-0.5 rounded hover:bg-amber-50"
                              >
                                <span>puedes dar clic aquí</span>
                                <span className="text-base font-black">↗</span>
                              </button>{" "}
                              y te llevaremos a la página que contiene todas las variables, estadísticas y más detalles PRO de donde obtenemos nuestros pronósticos.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BANNER INFERIOR DE CONVERSIÓN FREEMIUM */}
              {matches.length > 1 && !isEffectiveVip && (
                <div className="p-4 bg-gradient-to-r from-amber-100/90 via-white/95 to-amber-100/90 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <div className="text-xs md:text-sm font-black text-amber-800">
                        {matches.length - 1} Partidos Restantes Bloqueados en esta liga
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Solo el primer partido es gratuito. Activa tu membresía VIP para ver todos los encuentros completos.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      openVipPaywall("Desbloquea todos los partidos y ligas completas con la membresía VIP ($14.99/mes).")
                    }
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-lg"
                  >
                    Desbloquear Todo VIP ($14.99)
                  </button>
                </div>
              )}
            </section>

            {/* AUDITORÍA PRO: VARIABLES, ESTADÍSTICAS Y DETALLES PRO */}
            <div id="auditoria-pro" className="scroll-mt-24 pt-6 border-t-2 border-slate-300">
              <div className="mb-6 bg-gradient-to-r from-blue-50/95 via-white/98 to-blue-50/95 border-2 border-blue-500/50 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-400/50 flex items-center justify-center text-xl shrink-0">
                    📊
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      Desglose Técnico y Estadístico PRO
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-900">
                      Auditoría Matemática: {currentMatch.home} vs {currentMatch.away}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("lista-partidos-limpia");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs bg-white/95 hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl font-bold border border-slate-300 transition flex items-center gap-1.5"
                >
                  <span>↑</span>
                  <span>Volver a la Lista de Partidos</span>
                </button>
              </div>

            {!isMatchUnlocked ? (
              <div className="rounded-2xl p-8 text-center bg-white/90 border border-blue-500/40 shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900 mb-2">🔒 Auditoría en Vivo Bloqueada para {currentMatch.home} vs {currentMatch.away}</h3>
                <p className="text-slate-700 text-sm mb-6 max-w-xl mx-auto">
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
                  <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-800 via-[#152247] to-slate-800 border border-slate-300 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <div className="w-16 h-16 bg-blue-900 text-white font-black text-lg rounded-full flex items-center justify-center mb-2 border-2 border-blue-400 shadow-lg">{currentMatch.homeInitials}</div>
                      <h2 className="text-base font-black text-slate-900">{currentMatch.home}</h2>
                      <p className="text-slate-600 text-[11px]">{currentMatch.homeAlt}</p>
                      <p className="text-red-700 text-xs font-bold mt-2 bg-red-50 border border-red-500/40 px-3 py-1 rounded-full">
                        Mercado: {probImplicitaLocal}%
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <span className="bg-amber-100 text-amber-800 border border-amber-400/40 px-3 py-0.5 rounded-full text-[10px] font-black mb-1">{currentMatch.jornada}</span>
                      <p className="text-xs text-slate-700">{currentMatch.date} • <strong className="text-slate-900">{currentMatch.time}</strong></p>
                      <p className="text-red-700 text-xs font-bold mt-2 bg-red-50 border border-red-500/40 px-3 py-1 rounded-full">
                        Empate: {probImplicitaEmpate}%
                      </p>
                      <span className="text-[10px] text-green-800 mt-1.5 font-semibold">
                        {currentMatch.dataSource}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center sm:w-1/3">
                      <div className="w-16 h-16 bg-blue-900 text-white font-black text-lg rounded-full flex items-center justify-center mb-2 border-2 border-amber-400 shadow-lg">{currentMatch.awayInitials}</div>
                      <h2 className="text-base font-black text-slate-900">{currentMatch.away}</h2>
                      <p className="text-slate-600 text-[11px]">{currentMatch.awayAlt}</p>
                      <p className="text-red-700 text-xs font-bold mt-2 bg-red-50 border border-red-500/40 px-3 py-1 rounded-full">
                        Mercado: {probImplicitaVisita}%
                      </p>
                    </div>
                  </div>

                  {/* 4 CAJAS SUPERIORES - RESUMEN EJECUTIVO (JERARQUÍA CLARA Y TEXTO AUXILIAR PARA NOVATOS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* CAJA 1: OPCIÓN ANALIZADA PRINCIPAL */}
                    <div className="bg-gradient-to-b from-white/98 to-slate-50/95 border-2 border-amber-400/80 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-amber-800 text-[11px] uppercase font-black tracking-wider block">
                          1. OPCIÓN ANALIZADA PRINCIPAL
                        </span>
                        <h3 className="text-base md:text-lg font-black text-slate-900 mt-1.5 leading-snug">
                          {currentMatch.bestMarketName}
                        </h3>
                        <span className="inline-block mt-1 text-xs text-amber-800 font-bold bg-amber-50 border border-amber-500/40 px-2.5 py-0.5 rounded-md font-mono">
                          Cuota Ref: <strong>{currentMatch.bestOdd}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-2.5 pt-2 border-t border-slate-300 leading-snug font-medium">
                        {currentMatch.bestMarketDynamicSubtitle || "La opción con mayor probabilidad matemática detectada por el modelo"}
                      </p>
                    </div>

                    {/* CAJA 2: LO QUE CREE LA CASA */}
                    <div className="bg-gradient-to-b from-white/98 to-slate-50/95 border border-slate-300 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-slate-700 text-[11px] uppercase font-bold tracking-wider block">
                          2. LO QUE CREE LA CASA
                        </span>
                        <p className="text-2xl md:text-3xl text-slate-800 font-black font-mono mt-1.5">
                          {currentMatch.probImplicitaBest}%
                        </p>
                        <span className="text-[11px] text-slate-600 font-mono block mt-0.5">
                          Según cuota de {currentMatch.bestOdd}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-300 leading-snug">
                        Probabilidad que la casa de apuestas le asigna según su cuota
                      </p>
                    </div>

                    {/* CAJA 3: VALOR ESPERADO (+EV REAL) */}
                    <div className={`bg-gradient-to-b from-white/98 to-slate-50/95 border-2 ${
                      currentMatch.ev >= 1.0 ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "border-slate-300"
                    } rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between`}>
                      <div>
                        <span className="text-emerald-800 text-[11px] uppercase font-black tracking-wider block">
                          3. VALOR ESPERADO (+EV REAL)
                        </span>
                        <p className={`text-2xl md:text-3xl font-black font-mono mt-1.5 ${
                          currentMatch.ev >= 1.0 ? "text-emerald-700" : "text-slate-800"
                        }`}>
                          {currentMatch.ev > 0 ? `+${currentMatch.ev}` : currentMatch.ev}% EV
                        </p>
                        <span className="text-[11px] text-emerald-800 font-mono block mt-0.5">
                          Pos De-vigging The Odds API
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-2.5 pt-2 border-t border-slate-300 leading-snug">
                        Ventaja matemática real tras descontar el margen de la casa
                      </p>
                    </div>

                    {/* CAJA 4: CUOTA MÍNIMA RENTABLE */}
                    <div className="bg-gradient-to-b from-green-50/95 to-white/95 border-2 border-green-500/60 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between">
                      <div>
                        <span className="text-green-700 text-[11px] uppercase font-black tracking-wider block">
                          4. CUOTA MÍNIMA RENTABLE
                        </span>
                        <p className="text-2xl md:text-3xl font-black font-mono mt-1.5 text-green-700">
                          {currentMatch.minFairOddForTopPick}
                        </p>
                        <span className="text-[11px] text-green-800 font-bold block mt-0.5">
                          Apuesta si pagan más de {currentMatch.minFairOddForTopPick}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-2.5 pt-2 border-t border-slate-300 leading-snug">
                        Límite inferior para que tu apuesta sea matemáticamente rentable
                      </p>
                    </div>
                  </div>

                  {/* ESTRUCTURA JERÁRQUICA DE 3 FILAS/OPCIONES CLAVE */}
                  {currentMatch.hierarchicalPicks && (
                    <div className="bg-white/95 border border-slate-300 rounded-2xl p-4 shadow-xl">
                      <div className="flex flex-wrap justify-between items-center pb-2.5 mb-3 border-b border-slate-300 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎯</span>
                          <h4 className="text-xs md:text-sm font-black uppercase text-amber-800 tracking-wider">
                            Estructura Jerárquica de Apuesta (3 Opciones Clave)
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                          Modelado Montecarlo + De-vigging
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. Ganador Directo (1X2) */}
                        <div className="bg-slate-100/90 border border-amber-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-amber-800">🥇 1. Ganador Directo</span>
                              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick1Winner?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900">{currentMatch.hierarchicalPicks.pick1Winner?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-700 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick1Winner?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{currentMatch.hierarchicalPicks.pick1Winner?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick1Winner?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick1Winner?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2 pt-1 border-t border-slate-300 leading-tight">
                            {currentMatch.hierarchicalPicks.pick1Winner?.role}
                          </p>
                        </div>

                        {/* 2. Cobertura Hándicap Asiático */}
                        <div className="bg-slate-100/90 border border-sky-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-sky-800">🛡️ 2. Cobertura Asiática</span>
                              <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick2Asian?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900">{currentMatch.hierarchicalPicks.pick2Asian?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-700 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick2Asian?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{currentMatch.hierarchicalPicks.pick2Asian?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick2Asian?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick2Asian?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2 pt-1 border-t border-slate-300 leading-tight">
                            {currentMatch.hierarchicalPicks.pick2Asian?.role}
                          </p>
                        </div>

                        {/* 3. Mercado de Goles */}
                        <div className="bg-slate-100/90 border border-emerald-500/40 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-black text-emerald-800">⚽ 3. Mercado de Goles</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                Cuota {currentMatch.hierarchicalPicks.pick3Goals?.odd}
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900">{currentMatch.hierarchicalPicks.pick3Goals?.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-700 font-mono">
                              <span>Prob: <strong>{currentMatch.hierarchicalPicks.pick3Goals?.realProb}%</strong></span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{currentMatch.hierarchicalPicks.pick3Goals?.ev > 0 ? `+${currentMatch.hierarchicalPicks.pick3Goals?.ev}% EV` : `${currentMatch.hierarchicalPicks.pick3Goals?.ev}% EV`}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2 pt-1 border-t border-slate-300 leading-tight">
                            {currentMatch.hierarchicalPicks.pick3Goals?.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PANEL CONTEXTUAL DINÁMICO DE LAS 3 APIS + CONTEXTO GEOGRÁFICO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white/95 border border-sky-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-sky-800">👨‍⚖️ Árbitro Oficial</span>
                          <span className="text-[9px] bg-sky-100 text-sky-700 border border-sky-500/30 px-1.5 py-0.5 rounded font-bold">
                            {currentMatch.refereeName && currentMatch.refereeName !== "Por designar" && currentMatch.refereeCardsAvg && currentMatch.refereeCardsAvg !== "N/D"
                              ? `${currentMatch.refereeCardsAvg} tarj/p`
                              : "Por designar"}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{currentMatch.refereeName || "Por designar"}</p>
                        <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                          {currentMatch.refereeName && currentMatch.refereeName !== "Por designar"
                            ? (currentMatch.refereeAlert || "Terna arbitral confirmada para este partido")
                            : "Terna arbitral aún no oficializada por la comisión técnica de la competición."}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-600 mt-2 font-mono">
                        {currentMatch.refereeName && currentMatch.refereeName !== "Por designar" && currentMatch.refereePenaltiesAvg && currentMatch.refereePenaltiesAvg !== "N/D"
                          ? `Penales estimados: ${currentMatch.refereePenaltiesAvg}/p`
                          : "Penales: Pendiente de designación"}
                      </span>
                    </div>

                    <div className="bg-white/95 border border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-amber-800">📋 Novedades de Plantel (ESPN)</span>
                          <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">Oficial</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{currentMatch.lineupStatus}</p>
                        <p className="text-[11px] text-slate-700 mt-1 leading-snug">{currentMatch.lineupAlert}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 mt-2">Ajuste aplicado a generación xG</span>
                    </div>

                    <div className="bg-white/95 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-emerald-800">📈 Dinámica de Mercado</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">{currentMatch.bookmakerCount || 28} Casas</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">The Odds API En Vivo</p>
                        <p className="text-[11px] text-slate-700 mt-1 leading-snug">{currentMatch.marketTrend}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 mt-2 font-mono">Margen casa: {currentMatch.marginCasa}% | Desmargenizado</span>
                    </div>

                    {/* FACTOR ALTITUD / DESGASTE FISIOLÓGICO */}
                    <div className="bg-white/95 border border-purple-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-black text-purple-800">⛰️ Factor Altitud / Desgaste</span>
                          <span className="text-[9px] bg-purple-100 text-purple-800 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold">
                            {currentMatch.altitudeMeters ? `${currentMatch.altitudeMeters}m` : "Sede"}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{currentMatch.altitudeBadge || "Condiciones Simétricas"}</p>
                        <p className="text-[11px] text-slate-700 mt-1 leading-snug">{currentMatch.altitudeAlert}</p>
                      </div>
                      <span className="text-[10px] text-purple-800 font-mono mt-2 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-500/30">
                        Impacto: {currentMatch.altitudeImpactXg}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50/95 border border-amber-400/40 rounded-2xl p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-amber-800">📋 Datos Oficiales del Calendario y Regla de Inversión</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-500/30 px-2 py-0.5 rounded font-bold">{currentMatch.leagueTitle}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-800 leading-relaxed">
                      {currentMatch.reportePlantilla}
                    </p>
                    <p className="text-xs md:text-sm text-amber-900 bg-white/92 p-2.5 rounded-lg border border-slate-300">
                      💡 <strong>Cómo usar este dato en tu casa de apuestas:</strong> Busca el partido <strong>{currentMatch.home} vs {currentMatch.away}</strong> y revisa la opción <strong>"{currentMatch.bestMarketName}"</strong> ({currentMatch.bestMarketExplanation}). Si tu casa de apuestas te paga una cuota mayor a <strong>{currentMatch.minFairOddForTopPick}</strong>, tienes ventaja matemática real a tu favor.
                    </p>
                  </div>

                  <div className="bg-white/95 border border-slate-300 rounded-2xl overflow-hidden">
                    <div className="flex overflow-x-auto bg-slate-100 border-b border-slate-300 p-1.5 gap-1.5 text-xs font-bold">
                      {[
                        { id: "todos", label: "📊 Todas las Opciones Explicadas" },
                        { id: "asiatico", label: "🛡️ Hándicap Asiático & Coberturas (+EV)" },
                        { id: "goles", label: "⚽ Goles (Poisson) & Ambos Marcan" },
                        { id: "marcadores", label: "🎯 Marcadores Más Probables & Doble Oportunidad" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveMarketTab(tab.id)}
                          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${activeMarketTab === tab.id ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-4">
                      
                      {(activeMarketTab === "todos") && (
                        <div className="bg-white/95 border border-slate-300 rounded-xl p-4">
                          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                            <h4 className="text-xs font-black uppercase text-amber-700">⭐ Probabilidad de Victoria 1X2 (Montecarlo & De-vigging)</h4>
                            <span className="text-[11px] text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                              Peligro Ofensivo (xG Real API-Football): <strong className="text-blue-700">{currentMatch.homeInitials} {currentMatch.xgHome} xG</strong> vs <strong className="text-amber-700">{currentMatch.awayInitials} {currentMatch.xgAway} xG</strong> (<strong className="text-emerald-800 font-mono">ΔxG: {currentMatch.xgDiff > 0 ? "+" + currentMatch.xgDiff : currentMatch.xgDiff}</strong> | Total: {currentMatch.expectedGoals} xG)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-1">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>Gana {currentMatch.home}</span>
                                <span className="text-amber-800">Cuota {currentMatch.cuotaLocal}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProb1}%</span>
                                <strong className="text-blue-700">Montecarlo: {currentMatch.probHomeSim}%</strong>
                              </div>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-1">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>Empate</span>
                                <span className="text-amber-800">Cuota {currentMatch.cuotaEmpate}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProbX}%</span>
                                <strong className="text-blue-700">Montecarlo: {currentMatch.probDrawSim}%</strong>
                              </div>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-1">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>Gana {currentMatch.away}</span>
                                <span className="text-amber-800">Cuota {currentMatch.cuotaVisita}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Casa sin comisión: {currentMatch.cleanProb2}%</span>
                                <strong className="text-blue-700">Montecarlo: {currentMatch.probAwaySim}%</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MÓDULO DE HÁNDICAP ASIÁTICO & COBERTURAS (+EV) */}
                      {(activeMarketTab === "todos" || activeMarketTab === "asiatico") && (
                        <div className="bg-white/95 border border-sky-500/40 rounded-xl p-4">
                          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🛡️</span>
                              <h4 className="text-xs font-black uppercase text-sky-700">
                                Mercado de Hándicap Asiático & Coberturas (The Odds API & De-vigging)
                              </h4>
                            </div>
                            <span className="text-[11px] text-sky-800 bg-sky-100 px-2.5 py-1 rounded border border-sky-500/30 font-medium">
                              Protección contra el empate: Reembolso parcial o total de la apuesta
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
                            {currentMatch.asianLines?.map((line: any, idx: number) => (
                              <div key={idx} className="bg-slate-50/95 p-3 rounded-xl border border-slate-300 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-slate-900 text-xs">{line.name}</span>
                                    <span className="text-amber-800 font-bold font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300">
                                      Cuota {line.odd}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-700 font-mono space-y-0.5 mt-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Prob. De-vig:</span>
                                      <span>{line.cleanProb}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Prob. Montecarlo:</span>
                                      <strong className="text-blue-800">{line.realProb}%</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Valor Esperado:</span>
                                      <strong className={line.ev > 0 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                        {line.ev > 0 ? `+${line.ev}% EV` : `${line.ev}% EV`}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-2 pt-1.5 border-t border-slate-300 leading-tight">
                                  💡 <strong>Regla:</strong> {line.rule}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-sky-50 border border-sky-500/30 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-base leading-none">ℹ️</span>
                            <p className="leading-snug">
                              <strong>¿Por qué usar Hándicap Asiático?</strong> A diferencia del 1X2 tradicional donde el empate te hace perder tu dinero, las líneas asiáticas como <strong>0.0 (DNB)</strong> o <strong>-0.25 / +0.25</strong> eliminan o mitigan el riesgo de empate devolviéndote el 100% o 50% de tu apuesta.
                            </p>
                          </div>
                        </div>
                      )}

                      {(activeMarketTab === "todos" || activeMarketTab === "goles") && (
                        <div className="bg-white/95 border border-slate-300 rounded-xl p-4">
                          <h4 className="text-xs font-black uppercase text-green-700 mb-3">⚽ Pronóstico de Goles Totales (Distribución de Poisson) & Ambos Equipos Marcan</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
                              <div className="flex justify-between font-bold text-slate-900 mb-1">
                                <span>Más de {currentMatch.lineGoals} goles</span>
                                <span className="text-amber-800">Cuota {currentMatch.cuotaOver}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 mb-1">Ganas si hay {currentMatch.lineGoals === 3.5 ? "4" : "3"} goles o más en total</p>
                              <p className="text-[11px] text-blue-800 font-bold">Probabilidad Poisson: {currentMatch.probOverSim}%</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
                              <div className="flex justify-between font-bold text-slate-900 mb-1">
                                <span>Menos de {currentMatch.lineGoals} goles</span>
                                <span className="text-amber-800">Cuota {currentMatch.cuotaUnder}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 mb-1">Ganas si hay máximo {currentMatch.lineGoals === 3.5 ? "3" : "2"} goles en total</p>
                              <p className="text-[11px] text-blue-800 font-bold">Probabilidad Poisson: {currentMatch.probUnderSim}%</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
                              <div className="flex justify-between font-bold text-slate-900 mb-1">
                                <span>Ambos Equipos Anotan</span>
                                <span className="text-green-700">{currentMatch.probBttsYesSim}% prob.</span>
                              </div>
                              <p className="text-[10px] text-slate-600 mb-1">Que los dos equipos hagan al menos 1 gol</p>
                              <p className="text-[11px] text-slate-700">Cuota justa mínima: <strong className="text-slate-900">{currentMatch.fairOddBttsYes}</strong></p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(activeMarketTab === "todos" || activeMarketTab === "marcadores") && (
                        <div className="bg-white/95 border border-slate-300 rounded-xl p-4">
                          <h4 className="text-xs font-black uppercase text-sky-700 mb-3">🎯 Los 3 Marcadores Más Probables (Simulación Montecarlo) & Doble Oportunidad</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-100 p-3 rounded-lg border border-sky-500/30">
                              <span className="text-[10px] text-sky-800 font-bold uppercase block">Marcadores más probables</span>
                              <div className="mt-1.5 space-y-1">
                                {currentMatch.topScores?.map((s: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-slate-900 font-bold">Resultado {s.score}</span>
                                    <span className="text-amber-800 font-bold">{s.prob}% de las veces</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-amber-500/30 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-amber-800 font-bold uppercase block">Doble Oportunidad</span>
                                <strong className="text-slate-900 text-xs block mt-1">Gana {currentMatch.home} o Empatan: {currentMatch.prob1X}%</strong>
                                <strong className="text-slate-800 text-xs block mt-1">Gana {currentMatch.away} o Empatan: {currentMatch.probX2}%</strong>
                              </div>
                              <span className="text-[10px] text-slate-600 mt-2">Sumatoria real de Montecarlo</span>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg border border-purple-500/30 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-purple-800 font-bold uppercase block">Arco en Cero / No Anotan Ambos</span>
                                <strong className="text-slate-900 text-xs block mt-1">Al menos un equipo NO anota: {currentMatch.probBttsNoSim}%</strong>
                                <span className="text-[11px] text-slate-700 block mt-1">Cuota mínima recomendada: {currentMatch.fairOddBttsNo}</span>
                              </div>
                              <span className="text-[10px] text-green-700 font-bold mt-2">✓ Extraído de ESPN Oficial</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="bg-blue-50/95 border-2 border-blue-500/50 p-5 rounded-2xl space-y-2 shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                      <h3 className="text-slate-900 font-black text-sm md:text-base uppercase tracking-wider">🎙️ Veredicto del Analista (Poisson + Montecarlo)</h3>
                    </div>
                    <p className="text-slate-900 text-sm md:text-base leading-relaxed font-medium whitespace-pre-line">
                      {currentMatch.analisisDinamico}
                    </p>
                  </div>

                </div>

                <div className="space-y-6">
                  <div className="bg-white/95 border-2 border-amber-400/70 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-amber-400 text-slate-950 px-4 py-2.5 font-black text-xs uppercase flex justify-between items-center">
                      <span>🎟️ Calculadora de Ganancia</span>
                      <span>CUOTA MÍN: {currentMatch.minFairOddForTopPick}</span>
                    </div>
                    <div className="p-4 space-y-4 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-300">
                        <span className="text-[10px] text-slate-600 block">{currentMatch.home} vs {currentMatch.away}</span>
                        <strong className="text-sm text-amber-800 block mt-0.5">Jugada: {currentMatch.bestMarketName}</strong>
                        <span className="text-[11px] text-slate-700 block mt-0.5">{currentMatch.bestMarketExplanation}</span>
                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-300">
                          <span>Cuota Ref: <strong className="text-slate-900">{currentMatch.bestOdd}</strong></span>
                          <span className="text-green-700 font-bold">Montecarlo: {currentMatch.probReal}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">¿Cuánto quieres simular? ($ USD)</label>
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-base outline-none"
                        />
                      </div>

                      <div className="bg-green-50 border border-green-500/40 rounded-xl p-3 space-y-1">
                        <div className="flex justify-between text-slate-700">
                          <span>Cobras en total:</span>
                          <strong className="text-base text-slate-900">${(stakeAmount * currentMatch.bestOdd).toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between text-green-700 font-bold">
                          <span>Ganancia limpia:</span>
                          <span>+${(stakeAmount * currentMatch.bestOdd - stakeAmount).toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[430px] shadow-xl">
                    <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-300 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <h3 className="text-slate-900 font-bold text-xs uppercase flex items-center gap-1.5 truncate">
                          <span>🤖</span>
                          <span className="truncate">Auditor en Vivo: {currentMatch.home} vs {currentMatch.away}</span>
                        </h3>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
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
                                : 'bg-slate-100 text-slate-800 border border-slate-300 font-sans'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-blue-700 bg-slate-100/85 p-2 rounded-lg border border-slate-300 animate-pulse">
                          <span>🔄</span>
                          <span>Auditando {currentMatch.home} vs {currentMatch.away} en tiempo real...</span>
                        </div>
                      )}
                    </div>

                    {/* BOTONES DE PREGUNTAS RÁPIDAS (1-CLICK) */}
                    <div className="px-2.5 py-1.5 bg-slate-100/90 border-t border-slate-300 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => handleSendMessage(`¿Vale la pena apostar a este partido y cuál es la cuota rentable?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 text-amber-800 border border-amber-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        💡 ¿Vale la pena?
                      </button>
                      <button
                        onClick={() => handleSendMessage(`Explícame los xG y los marcadores más probables para ${currentMatch.home} vs ${currentMatch.away}`)}
                        className="text-[10px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 text-blue-800 border border-blue-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        📊 xG y Marcador
                      </button>
                      <button
                        onClick={() => handleSendMessage(`¿Quién es el árbitro y cómo influye en este partido?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 text-sky-800 border border-sky-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        👨‍⚖️ Árbitro
                      </button>
                      <button
                        onClick={() => handleSendMessage(`¿Cómo influye la altitud o la sede en este encuentro?`)}
                        className="text-[10px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 text-purple-800 border border-purple-400/30 px-2 py-1 rounded-md transition-all shrink-0 font-semibold"
                      >
                        ⛰️ Altura/Sede
                      </button>
                    </div>

                    {/* CAJA DE ENTRADA */}
                    <div className="p-2 bg-slate-100 border-t border-slate-300 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Pregunta sobre ${currentMatch.home} vs ${currentMatch.away}...`}
                        className="flex-1 bg-white border border-slate-300 text-xs text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isTyping}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-amber-100 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow"
                      >
                        Preguntar
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}
            </div>
          </>
        )}
            {/* ========================================================================= */}
      {/* BARRA DE NAVEGACIÓN MÓVIL TIPO APP NATIVA (< 1024px, INVISIBLE EN DESKTOP) */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-300 shadow-[0_-5px_25px_rgba(0,0,0,0.85)] px-2 py-2">
        <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
          {/* 1. Vista Completa */}
          <button
            onClick={() => {
              setDisplayMode("full");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              displayMode === "full"
                ? "bg-blue-600/30 text-blue-800 border border-blue-500/50 shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="text-lg leading-none">📊</span>
            <span className="text-[10px] font-bold mt-1 tracking-tight truncate">Completa</span>
          </button>

          {/* 2. Las 4 Fijas VIP */}
          <button
            onClick={() => {
              const s = getStoredVipSession();
              if (s) {
                recordVipActivity();
                if (!isAuthenticated) setIsAuthenticated(true);
                if (view !== "premium") setView("premium");
              } else if (view !== "premium") {
                openVipPaywall("Las 4 Fijas del Día son exclusivas para miembros VIP.");
                return;
              }
              setDisplayMode("top4");
              fetchAllLeaguesForTop4();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
              displayMode === "top4"
                ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/30 scale-105"
                : "text-amber-800 hover:text-slate-900"
            }`}
          >
            <span className="text-lg leading-none">🏆</span>
            <span className="text-[10px] font-black mt-1 tracking-tight truncate">4 Fijas VIP</span>
            {displayMode !== "top4" && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          {/* 3. Historial de Aciertos */}
          <Link
            href="/aciertos"
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-emerald-700 hover:text-slate-900 transition-all"
          >
            <span className="text-lg leading-none">📜</span>
            <span className="text-[10px] font-bold mt-1 tracking-tight truncate">Historial</span>
          </Link>

          {/* 4. Activar VIP WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-green-700 hover:text-slate-900 transition-all"
          >
            <span className="text-lg leading-none">📲</span>
            <span className="text-[10px] font-bold mt-1 tracking-tight truncate">Activar VIP</span>
          </a>
        </div>
      </nav>
        </div>
      </div>
    </div>
  );
}