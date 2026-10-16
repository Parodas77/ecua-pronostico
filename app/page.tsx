"use client";
import { useState, useEffect } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [league, setLeague] = useState("ligapro");
  const [activeMarketTab, setActiveMarketTab] = useState("todos");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [liveWindow, setLiveWindow] = useState<string>("Sincronizando calendario oficial...");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(10);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Sistema conectado en tiempo real a los calendarios oficiales de la semana (API-Football, ESPN Official Scoreboard y The Odds API). Cero partidos quemados en código: la cartelera se renueva automáticamente cada semana. ¿Qué partido auditamos?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para desbloquear todas las jugadas en tiempo real. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchMatchesFromServer = async (targetLeague: string, force = false) => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch(`/api/partidos?league=${targetLeague}${force ? "&refresh=true" : ""}`);
      const data = await res.json();
      if (data.window) {
        setLiveWindow(data.window);
      }
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSelectedMatchId(data.matches[0].id);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
    } finally {
      setIsLoadingMatches(false);
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
    dataSource: "Extrayendo en vivo...",
    home: "Sincronizando...", homeInitials: "...", homeAlt: "...",
    away: "Sincronizando...", awayInitials: "...", awayAlt: "...",
    jornada: "EXTRAYENDO CALENDARIO SEMANAL EN VIVO...", date: "...", time: "...",
    cuotaLocal: 2.00, cuotaEmpate: 3.20, cuotaVisita: 3.50,
    lineGoals: 2.5, cuotaOver: 2.00, cuotaUnder: 1.80,
    marginCasa: 5.5,
    cleanProb1: 47.0, cleanProbX: 29.0, cleanProb2: 24.0,
    xgHome: 1.35, xgAway: 1.05, expectedGoals: 2.40,
    probHomeSim: 48.0, probDrawSim: 27.0, probAwaySim: 25.0,
    probOverSim: 45.0, probUnderSim: 55.0,
    probBttsYesSim: 48.0, probBttsNoSim: 52.0,
    fairOddBttsYes: 2.08, fairOddBttsNo: 1.92,
    prob1X: 75.0, probX2: 52.0,
    topScores: [{ score: "1-0", prob: 15.2 }, { score: "1-1", prob: 12.4 }, { score: "2-1", prob: 9.8 }],
    bestMarketName: "Sincronizando...",
    bestMarketExplanation: "Extrayendo cuotas oficiales de la semana...",
    bestOdd: 2.00, probImplicitaBest: 50.0,
    probReal: 50.0, ev: 0.0, hasRealEdge: false,
    reportePlantilla: "Consultando fuentes oficiales...",
    cuotaMejoradaCasa: "Evita combinadas de más de 3 eventos en el mismo partido.",
    analisisDinamico: "Conectando en vivo con las fuentes oficiales de la semana..."
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
          text: `Evaluación directa para ${currentMatch.home} vs ${currentMatch.away}: el EV real calculado es ${currentMatch.ev}%. ${currentMatch.ev >= 1.0 ? "Sí hay ventaja matemática en " + currentMatch.bestMarketName : "No recomendamos apostar en este partido porque el margen de la casa absorbe la ganancia."}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-50 p-3 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* MODAL VIP */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button onClick={() => { setShowLoginModal(false); setLoginError(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>
              <h3 className="text-xl font-bold text-white mb-1">Acceso VIP EcuaPronóstico</h3>
              <p className="text-xs text-slate-400 mb-4">Auditoría en tiempo real con renovación automática semanal</p>

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

        {/* HEADER PRINCIPAL */}
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
                🔄 Actualizar En Vivo
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
                <strong className="text-amber-400 block mb-1">1. Renovación Automática Semanal</strong>
                El servidor calcula dinámicamente la fecha actual más los próximos 10 días y extrae los partidos programados directamente de API-Football, ESPN Official Scoreboard y The Odds API. Nunca tienes que cambiar partidos a mano.
              </div>
              <div>
                <strong className="text-blue-400 block mb-1">2. Honestidad Total: Verde vs Ámbar</strong>
                No inventamos ventajas falsas. Si un partido da Valor Esperado positivo (+EV), se marca en VERDE (Sí Apostar). Si la comisión de la casa absorbe el margen y da EV negativo o bajo, se marca en ÁMBAR y te dice claramente NO APOSTAR.
              </div>
              <div>
                <strong className="text-green-400 block mb-1">3. Distribución de Poisson + 10k Montecarlo</strong>
                Calculamos cuántos goles se esperan realmente y simulamos el partido 10,000 veces para encontrar en qué mercado (Ganador o Línea de Goles) está la mejor oportunidad.
              </div>
            </div>
          )}

          {/* PESTAÑAS DE COMPETICIÓN */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLeague("ligapro")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "ligapro" ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              🇪🇨 LigaPro Primera A (Calendario Oficial de la Semana)
            </button>
            <button
              onClick={() => setLeague("champions")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "champions" ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              🇪🇺 Champions & Europa League (Calendario Oficial de la Semana)
            </button>
          </div>
        </header>

        {/* 1. GRILLA COMPLETA DE PARTIDOS EXTRAÍDOS EN VIVO */}
        <section className="mb-8 bg-[#131d3b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1c2a52] px-4 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                {isLoadingMatches
                  ? "Extrayendo partidos oficiales de la semana en tiempo real..."
                  : `Cartelera Oficial Extraída en Vivo (${matches.length} Partidos Programados)`}
              </h2>
            </div>
            <div className="hidden lg:flex gap-16 text-[11px] font-bold text-slate-300 pr-6">
              <span>Ganador 1 X 2 (Cuotas)</span>
              <span>Total Goles (Más / Menos)</span>
              <span>Veredicto Honesto EV</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[420px] overflow-y-auto">
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
                  {/* EQUIPOS Y FECHA */}
                  <div className="flex items-center gap-3 w-full lg:w-1/3">
                    <div className="text-xs font-bold text-amber-400 w-16 shrink-0">
                      {m.date.split(",")[0].slice(0, 3).toUpperCase()}<br />
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

                  {/* BOTONES DE CUOTAS 1X2 */}
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

                  {/* BOTONES MÁS/MENOS GOLES Y BADGE HONESTO DE VALOR */}
                  <div className="grid grid-cols-3 gap-2 w-full lg:w-1/3 items-center">
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400">Más de {m.lineGoals}</span>
                      <strong className="text-sm text-amber-300">{m.cuotaOver.toFixed(2)}</strong>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400">Menos de {m.lineGoals}</span>
                      <strong className="text-sm text-amber-300">{m.cuotaUnder.toFixed(2)}</strong>
                    </div>
                    <div className={`${!unlocked ? "bg-slate-800 border-slate-600" : isProfitable ? "bg-green-950/70 border-green-500/50" : "bg-amber-950/50 border-amber-500/40"} border rounded-lg px-2 py-1.5 text-center`}>
                      <span className="block text-[9px] text-slate-300 uppercase font-bold">
                        {!unlocked ? "Valor IA" : isProfitable ? "✅ Apostar" : "⛔ Evitar"}
                      </span>
                      <strong className={`text-xs md:text-sm font-black ${!unlocked ? "text-amber-300" : isProfitable ? "text-green-400" : "text-amber-400"}`}>
                        {unlocked ? `${m.ev >= 0 ? "+" + m.ev : m.ev}% EV` : "🔒 VIP"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. PANEL DE AUDITORÍA DEL PARTIDO SELECCIONADO */}
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
            
            {/* COLUMNA IZQUIERDA Y CENTRAL (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ENCABEZADO DEL PARTIDO */}
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
                    Fuente: {currentMatch.dataSource}
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

              {/* LOS 4 CUADROS PRINCIPALES SIN MAQUILLAJE */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/90 border border-amber-400/50 rounded-xl p-3.5 text-center">
                  <p className="text-amber-300 text-[10px] uppercase font-black">1. Opción Analizada</p>
                  <p className="text-xs md:text-sm text-white font-black mt-1">{currentMatch.bestMarketName}</p>
                  <p className="text-[11px] text-amber-300 mt-0.5">Paga Cuota: <strong>{currentMatch.bestOdd}</strong></p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-300 text-[10px] uppercase font-bold">2. Lo que cree la Casa</p>
                  <p className="text-2xl text-slate-300 font-bold mt-1">{currentMatch.probImplicitaBest}%</p>
                  <p className="text-[10px] text-slate-400">Según cuota de {currentMatch.bestOdd}</p>
                </div>
                <div className="bg-slate-800/90 border-t-4 border-blue-500 rounded-xl p-3.5 text-center">
                  <p className="text-blue-300 text-[10px] uppercase font-black">3. Simulación Montecarlo</p>
                  <p className="text-2xl text-blue-400 font-black mt-1">{currentMatch.probReal}%</p>
                  <p className="text-[10px] text-slate-300">Probabilidad Real (10k Sim)</p>
                </div>
                <div className={`${currentMatch.ev >= 1.0 ? "bg-green-950/40 border-green-500/60" : "bg-amber-950/40 border-amber-500/60"} border rounded-xl p-3.5 text-center`}>
                  <p className={`${currentMatch.ev >= 1.0 ? "text-green-400" : "text-amber-400"} text-[10px] uppercase font-black`}>
                    4. Valor Esperado Real
                  </p>
                  <p className={`text-2xl font-black mt-1 ${currentMatch.ev >= 1.0 ? "text-green-400" : "text-amber-400"}`}>
                    {currentMatch.ev >= 0 ? `+${currentMatch.ev}%` : `${currentMatch.ev}%`}
                  </p>
                  <p className="text-[10px] text-slate-200 font-bold">
                    {currentMatch.ev >= 1.0 ? "✅ SÍ APOSTAR" : "⛔ NO APOSTAR"}
                  </p>
                </div>
              </div>

              {/* CAJÓN DE REPORTE DE DATOS OFICIALES Y EXPLICACIÓN CLARA */}
              <div className="bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-300">📋 Reporte Oficial Extraído y Significado de la Jugada</h4>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">Datos Reales</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {currentMatch.reportePlantilla}
                </p>
                <p className="text-xs md:text-sm text-amber-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  💡 <strong>En sencillo:</strong> La opción mejor posicionada es <strong>"{currentMatch.bestMarketName}"</strong> ({currentMatch.bestMarketExplanation}). {currentMatch.ev >= 1.0 ? `Como el EV es positivo (+${currentMatch.ev}%), sí conviene invertir.` : `Como el EV es de ${currentMatch.ev}%, la casa lleva ventaja y recomendamos NO arriesgar dinero en este partido.`}
                </p>
              </div>

              {/* BARRA DE PESTAÑAS DE MERCADOS */}
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
                          <span className="text-[10px] text-green-400 font-bold mt-2">✓ Extraído en tiempo real</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* CAJÓN DEL COMENTARISTA DEPORTIVO HONESTO */}
              <div className="bg-blue-950/40 border-2 border-blue-500/50 p-5 rounded-2xl space-y-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                  <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider">🎙️ Veredicto Honesto del Analista (Poisson + Montecarlo En Vivo)</h3>
                </div>
                <p className="text-slate-100 text-sm md:text-base leading-relaxed font-medium whitespace-pre-line">
                  {currentMatch.analisisDinamico}
                </p>
              </div>

            </div>

            {/* COLUMNA DERECHA (1/3): CUPÓN SIMULADOR DE GANANCIA + CHAT IA */}
            <div className="space-y-6">
              
              {/* CUPÓN INTELIGENTE */}
              <div className="bg-[#131d3b] border-2 border-amber-400/70 rounded-2xl overflow-hidden shadow-2xl">
                <div className={`${currentMatch.ev >= 1.0 ? "bg-green-500 text-slate-950" : "bg-amber-400 text-slate-950"} px-4 py-2.5 font-black text-xs uppercase flex justify-between items-center`}>
                  <span>🎟️ Calculadora de Ganancia</span>
                  <span>{currentMatch.ev >= 1.0 ? `+${currentMatch.ev}% VENTAJA` : `EV: ${currentMatch.ev}% (EVITAR)`}</span>
                </div>
                <div className="p-4 space-y-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{currentMatch.home} vs {currentMatch.away}</span>
                    <strong className="text-sm text-amber-300 block mt-0.5">Jugada: {currentMatch.bestMarketName}</strong>
                    <span className="text-[11px] text-slate-300 block mt-0.5">{currentMatch.bestMarketExplanation}</span>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                      <span>Cuota a pagar: <strong className="text-white">{currentMatch.bestOdd}</strong></span>
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

              {/* ASISTENTE IA MULTIMERCADO */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[380px] shadow-xl">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-white font-bold text-xs uppercase">Pregúntale al Auditor en Vivo</h3>
                  <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">100% REAL</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isTyping && <div className="text-xs text-blue-400 animate-pulse">Auditando partidos de la semana...</div>}
                </div>
                <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ej: ¿En qué partidos sí conviene apostar hoy?" className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none" />
                  <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold">Preguntar</button>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
