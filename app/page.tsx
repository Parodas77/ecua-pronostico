"use client";
import { useState, useEffect } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [league, setLeague] = useState("ligapro");
  const [activeMarketTab, setActiveMarketTab] = useState("todos");
  const [displayMode, setDisplayMode] = useState<"full" | "simplified" | "top4">("full");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [top4Matches, setTop4Matches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [liveWindow, setLiveWindow] = useState<string>("Sincronizando corte diario de 8 días...");
  const [apiDiagnostics, setApiDiagnostics] = useState<string[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(10);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Calendario oficial de ESPN (8 días hacia adelante) sincronizado y cruzado con The Odds API y API-Football. Ligas 100% separadas y solo partidos por jugar. ¿Qué encuentro revisamos?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para desbloquear las 4 Fijas del Día. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchMatchesFromServer = async (targetLeague: string, force = false) => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch(`/api/partidos?league=${targetLeague}${force ? "&refresh=true" : ""}`);
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
        fetchAllLeaguesForTop4();
      } else {
        setMatches([]);
      }
    } catch (err: any) {
      console.error("Error al sincronizar:", err);
      setApiDiagnostics([`Error de red cliente: ${err?.message || "No se pudo contactar /api/partidos"}`]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchAllLeaguesForTop4 = async () => {
    try {
      const leagues = ["ligapro", "champions", "europa"];
      let allCombined: any[] = [];
      for (const l of leagues) {
        const r = await fetch(`/api/partidos?league=${l}`);
        const d = await r.json();
        if (Array.isArray(d.matches)) {
          allCombined = [...allCombined, ...d.matches];
        }
      }
      const nowMs = Date.now();
      
      // Ordenamiento estricto: Prioridad absoluta a partidos de hoy o más cercanos (dentro de las primeras 36 horas)
      allCombined.sort((a, b) => {
        const timeA = a.dateIso ? new Date(a.dateIso).getTime() : nowMs + 86400000 * 5;
        const timeB = b.dateIso ? new Date(b.dateIso).getTime() : nowMs + 86400000 * 5;
        
        const hoursA = (timeA - nowMs) / (1000 * 60 * 60);
        const hoursB = (timeB - nowMs) / (1000 * 60 * 60);

        // Si el partido ya pasó o es de hace unas horas, penalizamos. Si es futuro cercano (0 a 36 horas), damos máxima bonificación.
        const weightA = hoursA >= 0 && hoursA <= 36 ? 5000 : (hoursA > 36 && hoursA <= 72 ? 2000 : 100);
        const weightB = hoursB >= 0 && hoursB <= 36 ? 5000 : (hoursB > 36 && hoursB <= 72 ? 2000 : 100);

        const scoreA = weightA + (a.probReal || 50);
        const scoreB = weightB + (b.probReal || 50);

        return scoreB - scoreA;
      });

      setTop4Matches(allCombined.slice(0, 4));
    } catch {
      setTop4Matches(matches.slice(0, 4));
    }
  };

  useEffect(() => {
    fetchMatchesFromServer(league);
  }, [league]);

  const handleLogin = () => {
    const validUser = username.trim().toLowerCase();
    if ((validUser === "vip" || validUser === "admin" || validUser === "pedro") && password === "quant2026") {
      setIsAuthenticated(true);
      setView("premium");
      setShowLoginModal(false);
      setLoginError("");
    } else {
      setLoginError("Credenciales inválidas. Verifica tu suscripción o solicita acceso vía WhatsApp.");
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
    dataSource: "Extrayendo calendario oficial...",
    home: "Sincronizando...", homeInitials: "...", homeAlt: "...",
    away: "Sincronizando...", awayInitials: "...", awayAlt: "...",
    jornada: "EXTRAYENDO PARTIDOS POR JUGAR...", date: "...", time: "...",
    cuotaLocal: 2.00, cuotaEmpate: 3.20, cuotaVisita: 3.50,
    lineGoals: 2.5, cuotaOver: 2.00, cuotaUnder: 1.80,
    marginCasa: 5.0,
    cleanProb1: 47.0, cleanProbX: 29.0, cleanProb2: 24.0,
    xgHome: 1.45, xgAway: 1.10, expectedGoals: 2.55,
    probHomeSim: 48.0, probDrawSim: 27.0, probAwaySim: 25.0,
    probOverSim: 46.0, probUnderSim: 54.0,
    probBttsYesSim: 49.0, probBttsNoSim: 51.0,
    fairOddBttsYes: 2.04, fairOddBttsNo: 1.96,
    prob1X: 75.0, probX2: 52.0,
    topScores: [{ score: "1-0", prob: 15.2 }, { score: "1-1", prob: 12.4 }, { score: "2-1", prob: 9.8 }],
    bestMarketName: "Sincronizando...",
    bestMarketExplanation: "Extrayendo calendario...",
    bestOdd: 2.00, minFairOddForTopPick: 1.85, probImplicitaBest: 50.0,
    probReal: 54.0, ev: 0.0, hasRealEdge: false,
    reportePlantilla: "Consultando calendario oficial...",
    cuotaMejoradaCasa: "Evita combinadas de más de 3 eventos en el mismo partido.",
    analisisDinamico: "Conectando con el calendario oficial..."
  };

  const isFreePreview = currentMatch.isFreeSample === true;
  const isMatchUnlocked = view === "premium" || isFreePreview;

  const probImplicitaLocal = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
  const probImplicitaEmpate = ((1 / currentMatch.cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / currentMatch.cuotaVisita) * 100).toFixed(1);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const questionText = chatInput.trim();
    const newUserMsg = { role: "user", text: questionText };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput("");
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
          text: `Para ${currentMatch.home} vs ${currentMatch.away}, la opción más fuerte es '${currentMatch.bestMarketName}' con ${currentMatch.probReal}% de probabilidad real (Cuota mínima rentable: ${currentMatch.minFairOddForTopPick}).`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-50 p-3 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button onClick={() => { setShowLoginModal(false); setLoginError(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>
              <h3 className="text-xl font-bold text-white mb-1">Acceso VIP EcuaPronóstico</h3>
              <p className="text-xs text-slate-400 mb-4">Desbloquea Las 4 Fijas del Día y todas las predicciones VIP</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usuario</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: vip" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Clave</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
                </div>
                {loginError && <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg">{loginError}</p>}
                <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg">Desbloquear Todo el Radar</button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm">Solicitar Suscripción por WhatsApp ($17.99/mes)</a>
              </div>
            </div>
          </div>
        )}

        <header className="mb-6 border-b border-slate-800 pb-4">
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
              <button
                onClick={() => fetchMatchesFromServer(league, true)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-green-400 border border-green-500/40 px-3 py-2 rounded-lg font-bold"
              >
                🔄 Forzar Sincronización
              </button>
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-2 rounded-lg font-bold">
                {showGuide ? "Ocultar Guía" : "📖 Guía Fácil"}
              </button>
              <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button onClick={() => setView("basic")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "basic" ? "bg-slate-600 text-white" : "text-slate-400"}`}>Gratis</button>
                <button onClick={handlePremiumSwitch} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "premium" ? "bg-blue-600 text-white" : "text-slate-400"}`}>VIP ($17.99)</button>
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLeague("ligapro")}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "ligapro" ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                🇪🇨 LigaPro Ecuador
              </button>
              <button
                onClick={() => setLeague("champions")}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "champions" ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                🏆 UEFA Champions League
              </button>
              <button
                onClick={() => setLeague("europa")}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "europa" ? "bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                🌍 UEFA Europa League
              </button>
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
              <button
                onClick={() => { setDisplayMode("top4"); fetchAllLeaguesForTop4(); }}
                className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  displayMode === "top4"
                    ? "bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-[1.02]"
                    : "text-green-300 hover:bg-slate-800"
                }`}
              >
                🏆 LAS 4 FIJAS DEL DÍA
              </button>
              <button
                onClick={() => setDisplayMode("simplified")}
                className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  displayMode === "simplified"
                    ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-[1.02]"
                    : "text-amber-300 hover:bg-slate-800"
                }`}
              >
                🔥 Vista Simplificada
              </button>
              <button
                onClick={() => setDisplayMode("full")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                  displayMode === "full"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                📊 Vista Completa
              </button>
            </div>
          </div>
        </header>

        {displayMode === "top4" ? (
          <section className="space-y-6">
            <div className="bg-gradient-to-r from-[#064e3b] via-[#0f2557] to-[#064e3b] border-2 border-green-400/80 rounded-3xl p-6 text-center shadow-[0_0_35px_rgba(34,197,94,0.3)] relative overflow-hidden">
              <span className="inline-block bg-green-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-2 shadow">
                El Reporte Estelar para Grupos de WhatsApp y Telegram
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-green-400 drop-shadow">
                🏆 LAS 4 FIJAS DEL DÍA (MÁXIMA CERTEZA)
              </h2>
              <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-2xl mx-auto">
                Estas son las <strong className="text-amber-300">4 mejores predicciones</strong> seleccionadas de todo el radar multiligas (LigaPro, Champions y Europa League) con mayor porcentaje de acierto en las 10,000 simulaciones de Montecarlo.
              </p>
            </div>

            {isLoadingMatches ? (
              <div className="p-12 text-center bg-[#131d3b] border border-slate-700 rounded-3xl">
                <p className="text-lg font-black text-green-300 animate-pulse">Seleccionando Las 4 Fijas de hoy...</p>
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
                  const headToHeadWinProb = Number(((rawWinProb / Math.max(1, rawWinProb + (isHomeWinner ? awayProb : homeProb))) * 100).toFixed(1));
                  const safeDoubleProb = isHomeWinner ? m.prob1X : m.probX2;

                  return (
                    <div
                      key={m.id || idx}
                      className="relative rounded-3xl overflow-hidden border-2 border-green-500/70 bg-gradient-to-r from-[#064e3b]/40 via-[#16264c] to-[#064e3b]/40 shadow-2xl transition-all hover:scale-[1.01]"
                    >
                      <div className="bg-[#091024] px-5 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-green-300">
                            FIJA #{idx + 1} • {m.leagueTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm font-bold text-white">
                            📅 {m.date} • ⏰ <strong className="text-amber-300">{m.time}</strong>
                          </span>
                          <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2.5 py-0.5 rounded-full font-black">
                            🔥 TOP RECOMENDADA
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
                            <span className="inline-block mt-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                              🏆 FIJA A GANAR
                            </span>
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col justify-center bg-slate-900/95 border-2 border-green-400/60 rounded-2xl p-5 shadow-xl text-center">
                          <span className="text-xs font-black uppercase tracking-widest text-green-300 border-b border-slate-800 pb-2 mb-3">
                            CERTEZA MONTECARLO
                          </span>
                          <div className="text-4xl md:text-5xl font-black text-green-400 my-1 drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                            {headToHeadWinProb}%
                          </div>
                          <span className="text-xs text-slate-300 font-bold mt-1">
                            Seguridad con empate (1X/X2): <strong className="text-amber-300">{safeDoubleProb}%</strong>
                          </span>
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
                          </div>

                          <button
                            onClick={() => {
                              setLeague(m.leagueTitle.toLowerCase().includes("champions") ? "champions" : m.leagueTitle.toLowerCase().includes("europa") ? "europa" : "ligapro");
                              setSelectedMatchId(m.id);
                              setDisplayMode("full");
                            }}
                            className="w-full text-center text-xs bg-slate-800 hover:bg-green-600 text-green-300 hover:text-white py-2 px-3 rounded-xl font-bold transition-all border border-slate-700"
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
                              <span className="inline-block mt-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs md:text-sm px-3.5 py-1 rounded-lg uppercase tracking-wider shadow">
                                🏆 A GANAR
                              </span>
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
                                <span className="text-slate-400">Prob. de ganar en 90m:</span>
                                <strong className="text-red-400">{rawLoseProb}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Prob. de empate:</span>
                                <strong className="text-slate-200">{drawProb}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Goles esperados (Poisson):</span>
                                <strong className="text-amber-300">{m.expectedGoals} goles</strong>
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
              <div className="bg-[#1c2a52] px-4 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                  <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                    {isLoadingMatches
                      ? "Consultando calendario oficial de ESPN para los próximos 8 días..."
                      : `${currentMatch.leagueTitle} — ${matches.length} Partidos Por Jugar (Próximos 8 Días)`}
                  </h2>
                </div>
                <div className="hidden lg:flex gap-16 text-[11px] font-bold text-slate-300 pr-6">
                  <span>Ganador 1 X 2 (Cuotas)</span>
                  <span>Total Goles (Más / Menos)</span>
                  <span>Veredicto Honesto EV</span>
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

              <div className="divide-y divide-slate-800/80 max-h-[460px] overflow-y-auto">
                {matches.map((m) => {
                  const isSelected = m.id === currentMatch.id;
                  const unlocked = view === "premium" || m.isFreeSample;
                  const isProfitable = m.ev >= 1.0;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatchId(m.id)}
                      className={`p-3.5 md:px-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 cursor-pointer transition-all ${isSelected ? "bg-blue-950/80 border-l-4 border-amber-400" : "hover:bg-slate-800/50"}`}
                    >
                      <div className="flex items-center gap-3 w-full lg:w-1/3">
                        <div className="text-xs font-bold text-amber-400 w-20 shrink-0">
                          {m.date.split(",")[0].slice(0, 3).toUpperCase()} {m.date.match(/\d+/)?.[0]}<br />
                          <span className="text-white text-[11px]">{m.time.replace(" ECT", "")}</span>
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-700 text-[10px] font-black flex items-center justify-center border border-blue-400/40">{m.homeInitials}</span>
                            <span className="font-bold text-sm text-white">{m.home}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-700 text-[10px] font-black flex items-center justify-center border border-amber-400/40">{m.awayInitials}</span>
                            <span className="font-bold text-sm text-slate-200">{m.away}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${unlocked ? "bg-green-950 text-green-400 border border-green-500/40" : "bg-slate-800 text-amber-400 border border-amber-500/30"}`}>
                          {m.isFreeSample ? "🔓 ABIERTA" : unlocked ? "🔓 VIP" : "🔒 VIP"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full lg:w-1/3">
                        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="block text-[10px] text-slate-400 truncate">Gana {m.homeInitials}</span>
                          <strong className="text-sm text-white">{m.cuotaLocal.toFixed(2)}</strong>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="block text-[10px] text-slate-400">Empate</span>
                          <strong className="text-sm text-white">{m.cuotaEmpate.toFixed(2)}</strong>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="block text-[10px] text-slate-400 truncate">Gana {m.awayInitials}</span>
                          <strong className="text-sm text-white">{m.cuotaVisita.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full lg:w-1/3 items-center">
                        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="block text-[10px] text-slate-400">Más de {m.lineGoals}</span>
                          <strong className="text-sm text-amber-300">{m.cuotaOver.toFixed(2)}</strong>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="block text-[10px] text-slate-400">Menos de {m.lineGoals}</span>
                          <strong className="text-sm text-amber-300">{m.cuotaUnder.toFixed(2)}</strong>
                        </div>
                        <div className={`${!unlocked ? "bg-slate-800 border-slate-600" : isProfitable ? "bg-green-950/70 border-green-500/50" : "bg-blue-950/70 border-blue-500/50"} border rounded-lg px-2 py-1.5 text-center`}>
                          <span className="block text-[9px] text-slate-300 uppercase font-bold">
                            {!unlocked ? "Análisis IA" : isProfitable ? `+${m.ev}% EV` : "Montecarlo"}
                          </span>
                          <strong className={`text-xs md:text-sm font-black ${!unlocked ? "text-amber-300" : isProfitable ? "text-green-400" : "text-blue-300"}`}>
                            {unlocked ? `${m.probReal}% Real` : "🔒 VIP"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {!isMatchUnlocked ? (
              <div className="rounded-2xl p-8 text-center bg-slate-800/60 border border-blue-500/40 shadow-2xl">
                <h3 className="text-2xl font-black text-white mb-2">🔒 Auditoría en Vivo Bloqueada para {currentMatch.home} vs {currentMatch.away}</h3>
                <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
                  Desbloquea el veredicto real calculado con Distribución de Poisson y 10,000 Simulaciones de Montecarlo para saber en qué partidos sí hay ventaja y en cuáles no debes arriesgar tu dinero.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg">Iniciar Sesión VIP</button>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black py-3 px-6 rounded-xl text-sm shadow-lg">Suscribirme por WhatsApp - $17.99/mes</a>
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/90 border border-amber-400/50 rounded-xl p-3.5 text-center">
                      <p className="text-amber-300 text-[10px] uppercase font-black">1. Opción Analizada</p>
                      <p className="text-xs md:text-sm text-white font-black mt-1">{currentMatch.bestMarketName}</p>
                      <p className="text-[11px] text-amber-300 mt-0.5">Cuota Ref: <strong>{currentMatch.bestOdd}</strong></p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                      <p className="text-slate-300 text-[10px] uppercase font-bold">2. Lo que cree la Casa</p>
                      <p className="text-2xl text-slate-300 font-bold mt-1">{currentMatch.probImplicitaBest}%</p>
                      <p className="text-[10px] text-slate-400">Según cuota de {currentMatch.bestOdd}</p>
                    </div>
                    <div className="bg-slate-800/90 border-t-4 border-blue-500 rounded-xl p-3.5 text-center">
                      <p className="text-blue-300 text-[10px] uppercase font-black">3. Simulación Montecarlo</p>
                      <p className="text-2xl text-blue-400 font-black mt-1">{currentMatch.probReal}%</p>
                      <p className="text-[10px] text-slate-300">Certeza Real (10k Sim)</p>
                    </div>
                    <div className="bg-green-950/40 border border-green-500/60 rounded-xl p-3.5 text-center">
                      <p className="text-green-400 text-[10px] uppercase font-black">4. Cuota Mínima Rentable</p>
                      <p className="text-2xl font-black mt-1 text-green-400">{currentMatch.minFairOddForTopPick}</p>
                      <p className="text-[10px] text-slate-200 font-bold">
                        Apuesta si pagan más de {currentMatch.minFairOddForTopPick}
                      </p>
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
                            <h4 className="text-xs font-black uppercase text-amber-400">⭐ Probabilidad de Victoria 1X2 (10,000 Simulaciones Montecarlo)</h4>
                            <span className="text-[11px] text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                              Goles Esperados (Poisson): <strong className="text-blue-400">{currentMatch.homeInitials} {currentMatch.xgHome}</strong> vs <strong className="text-amber-400">{currentMatch.awayInitials} {currentMatch.xgAway}</strong> (Total: {currentMatch.expectedGoals} goles)
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

                  <div className="bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[380px] shadow-xl">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="text-white font-bold text-xs uppercase">Pregúntale al Auditor en Vivo</h3>
                      <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">CALENDARIO 8 DÍAS</span>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.text}</div>
                        </div>
                      ))}
                      {isTyping && <div className="text-xs text-blue-400 animate-pulse">Auditando partidos de los próximos 8 días...</div>}
                    </div>
                    <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ej: ¿Cuáles son los mejores partidos de la semana?" className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none" />
                      <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold">Preguntar</button>
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
