"use client";
import { useState, useEffect } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [league, setLeague] = useState("ligapro");
  const [activeMarketTab, setActiveMarketTab] = useState("todos");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(10);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "¡Hola! Tengo listos los pronósticos calculados con la Distribución de Poisson, 10,000 Simulaciones de Montecarlo y el reporte de bajas y plantillas de cada equipo. ¿Qué partido quieres que te explique en sencillo?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para desbloquear todas las jugadas con Poisson y Montecarlo. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchMatchesFromServer = async (targetLeague: string) => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch(`/api/partidos?league=${targetLeague}`);
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSelectedMatchId(data.matches[0].id);
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
    home: "Cargando...", homeInitials: "...", homeAlt: "...",
    away: "Cargando...", awayInitials: "...", awayAlt: "...",
    jornada: "SINCRONIZANDO POISSON + MONTECARLO...", date: "...", time: "...",
    cuotaLocal: 1.85, cuotaEmpate: 3.33, cuotaVisita: 4.20,
    lineGoals: 2.5, cuotaOver: 2.22, cuotaUnder: 1.58,
    marginCasa: 6.4,
    cleanProb1: 50.8, cleanProbX: 28.2, cleanProb2: 21.0,
    xgHome: 1.45, xgAway: 0.85, expectedGoals: 2.30,
    probHomeSim: 52.4, probDrawSim: 26.8, probAwaySim: 20.8,
    probOverSim: 41.2, probUnderSim: 58.8,
    probBttsYesSim: 46.5, probBttsNoSim: 53.5,
    fairOddBttsYes: 2.15, fairOddBttsNo: 1.87,
    prob1X: 79.2, probX2: 47.6,
    topScores: [{ score: "1-0", prob: 16.4 }, { score: "1-1", prob: 12.8 }, { score: "2-0", prob: 11.9 }],
    bestMarketName: "Calculando...",
    bestMarketExplanation: "Calculando jugada recomendada...",
    bestOdd: 1.85, probImplicitaBest: 54.1,
    probReal: 56.2, ev: 5.4,
    reportePlantilla: "Cargando estado de plantillas y bajas...",
    factorTactico: "Cargando análisis táctico...",
    cuotaMejoradaCasa: "Analizando...",
    analisisDinamico: "Ejecutando Distribución de Poisson y 10,000 Simulaciones de Montecarlo..."
  };

  const isFreePreview = currentMatch.isFreeSample === true;
  const isMatchUnlocked = view === "premium" || isFreePreview;

  const probImplicitaLocal = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
  const probImplicitaEmpate = ((1 / currentMatch.cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / currentMatch.cuotaVisita) * 100).toFixed(1);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { role: "user", text: chatInput };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const reglas = `Eres el 'Comentarista y Trader Cuantitativo' de EcuaPronóstico. Habla siempre en lenguaje humano, claro, apasionado y fácil de entender para cualquier apostador, sin usar símbolos griegos ni palabras raras en inglés. Explica los datos usando la Distribución de Poisson, las 10,000 Simulaciones de Montecarlo, el reporte de bajas/plantillas y las cuotas de las casas de apuestas. No uses Markdown.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `PARTIDO: ${currentMatch.home} vs ${currentMatch.away}\nDATOS REALES DE POISSON Y MONTECARLO:\n- Cuotas en casas de apuestas: Local ${currentMatch.cuotaLocal} | Empate ${currentMatch.cuotaEmpate} | Visita ${currentMatch.cuotaVisita}\n- Comisión oculta de la casa: ${currentMatch.marginCasa}%\n- Goles Esperados (Poisson): ${currentMatch.home} (${currentMatch.xgHome} goles) vs ${currentMatch.away} (${currentMatch.xgAway} goles) -> Total esperado: ${currentMatch.expectedGoals} goles\n- Plantillas y Bajas: ${currentMatch.reportePlantilla}\n- Marcadores más probables (Montecarlo): ${currentMatch.topScores?.map((s: any) => s.score + " (" + s.prob + "%)").join(", ")}\n- Jugada Recomendada: ${currentMatch.bestMarketName} (${currentMatch.bestMarketExplanation}) a cuota ${currentMatch.bestOdd} con +${currentMatch.ev}% de ventaja.\n\nPREGUNTA DEL APOSTADOR: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: `En sencillo para ${currentMatch.home} vs ${currentMatch.away}: según la Distribución de Poisson y nuestras 10,000 simulaciones de Montecarlo, se esperan unos ${currentMatch.expectedGoals} goles en total (${currentMatch.xgHome} del local y ${currentMatch.xgAway} del visitante). La jugada más inteligente es '${currentMatch.bestMarketName}' (${currentMatch.bestMarketExplanation}) que paga cuota ${currentMatch.bestOdd} y tiene un ${currentMatch.probReal}% de probabilidad de salir.` }]);
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
              <p className="text-xs text-slate-400 mb-4">Desbloquea todos los partidos analizados con Poisson, 10,000 simulaciones de Montecarlo y reporte de plantillas</p>

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
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Distribución de Poisson + 10,000 Simulaciones de Montecarlo</span>
                <h1 className="text-base md:text-xl font-black text-white mt-0.5">RADAR MULTIMERCADO INTELIGENTE</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-2 rounded-lg font-bold">
                {showGuide ? "Ocultar Guía" : "📖 Guía Fácil en 3 Pasos"}
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
                <strong className="text-amber-400 block mb-1">1. ¿Qué hacen Poisson y Montecarlo?</strong>
                La Distribución de Poisson calcula cuántos goles se esperan en el partido según el ataque, la defensa, la altura y las bajas. Luego, el motor de Montecarlo juega el partido 10,000 veces en computadora para decirte el porcentaje exacto de cada resultado.
              </div>
              <div>
                <strong className="text-blue-400 block mb-1">2. ¿Cómo leer los 4 cuadros principales?</strong>
                Te dicen directo: cuál es la Mejor Jugada Recomendada, qué porcentaje cree la casa de apuestas que tiene esa jugada según su cuota, qué porcentaje real tienen nuestras 10,000 simulaciones, y cuánta ventaja (+EV) sacas a tu favor.
              </div>
              <div>
                <strong className="text-green-400 block mb-1">3. ¿Por qué a veces recomienda 'Menos de 3.5 Goles'?</strong>
                Porque cuando un favorito paga muy poquito (como 1.22), arriesgas mucho dinero para ganar centavos. En cambio, apostar a que en el partido habrá máximo 3 goles en total suele pagar el doble (Cuota 2.00) con alta probabilidad de acierto.
              </div>
            </div>
          )}

          {/* PESTAÑAS DE COMPETICIÓN */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLeague("ligapro")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "ligapro" ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              🇪🇨 LigaPro Primera A (Ecuador)
            </button>
            <button
              onClick={() => setLeague("champions")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm flex items-center gap-2 transition-all ${league === "champions" ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              🇪🇺 Champions & Europa League (Cartelera Oficial)
            </button>
          </div>
        </header>

        {/* 1. GRILLA COMPLETA DE PARTIDOS */}
        <section className="mb-8 bg-[#131d3b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1c2a52] px-4 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                Cartelera de la Jornada — Toca cualquier partido para ver su Jugada Recomendada y Bajas
              </h2>
            </div>
            <div className="hidden lg:flex gap-16 text-[11px] font-bold text-slate-300 pr-6">
              <span>Ganador 1 X 2 (Cuotas)</span>
              <span>Total Goles (Más / Menos)</span>
              <span>Ventaja Montecarlo</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {matches.map((m) => {
              const isSelected = m.id === currentMatch.id;
              const unlocked = view === "premium" || m.isFreeSample;
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

                  {/* BOTONES MÁS/MENOS GOLES Y BADGE DE VALOR */}
                  <div className="grid grid-cols-3 gap-2 w-full lg:w-1/3 items-center">
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400">Más de {m.lineGoals}</span>
                      <strong className="text-sm text-amber-300">{m.cuotaOver.toFixed(2)}</strong>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400">Menos de {m.lineGoals}</span>
                      <strong className="text-sm text-amber-300">{m.cuotaUnder.toFixed(2)}</strong>
                    </div>
                    <div className="bg-green-950/70 border border-green-500/50 rounded-lg px-2 py-1.5 text-center">
                      <span className="block text-[9px] text-green-300 uppercase font-bold">Ventaja IA</span>
                      <strong className="text-sm font-black text-green-400">
                        {unlocked ? `+${m.ev}% EV` : "🔒 VIP"}
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
            <h3 className="text-2xl font-black text-white mb-2">🔒 Análisis Completo VIP Bloqueado para {currentMatch.home} vs {currentMatch.away}</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
              Desbloquea la Jugada Recomendada por las 10,000 Simulaciones de Montecarlo, la proyección de goles de Poisson, el reporte de bajas en las plantillas y los marcadores exactos más probables.
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
              
              {/* ENCABEZADO DEL PARTIDO CON LOS PORCENTAJES ROJOS QUE TE GUSTAN Y EXPLICACIÓN CLARA */}
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
                  <span className="text-[11px] text-slate-300 mt-1.5">
                    Comisión oculta de la casa: <strong className="text-amber-300">{currentMatch.marginCasa}%</strong>
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

              {/* LOS 4 CUADROS PRINCIPALES TRADUCIDOS A ESPAÑOL HUMANO Y CLARO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/90 border border-amber-400/50 rounded-xl p-3.5 text-center">
                  <p className="text-amber-300 text-[10px] uppercase font-black">1. Jugada Recomendada</p>
                  <p className="text-xs md:text-sm text-white font-black mt-1">{currentMatch.bestMarketName}</p>
                  <p className="text-[11px] text-amber-300 mt-0.5">Paga Cuota: <strong>{currentMatch.bestOdd}</strong></p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-300 text-[10px] uppercase font-bold">2. Lo que cree la Casa</p>
                  <p className="text-2xl text-slate-300 font-bold mt-1">{currentMatch.probImplicitaBest}%</p>
                  <p className="text-[10px] text-slate-400">Según su cuota de {currentMatch.bestOdd}</p>
                </div>
                <div className="bg-slate-800/90 border-t-4 border-blue-500 rounded-xl p-3.5 text-center">
                  <p className="text-blue-300 text-[10px] uppercase font-black">3. Simulación Montecarlo</p>
                  <p className="text-2xl text-blue-400 font-black mt-1">{currentMatch.probReal}%</p>
                  <p className="text-[10px] text-slate-300">Probabilidad Real (10k Sim)</p>
                </div>
                <div className="bg-green-950/40 border border-green-500/60 rounded-xl p-3.5 text-center">
                  <p className="text-green-400 text-[10px] uppercase font-black">4. Tu Ventaja (+EV)</p>
                  <p className="text-2xl font-black mt-1 text-green-400">+{currentMatch.ev}%</p>
                  <p className="text-[10px] text-green-300">Rentabilidad a tu favor</p>
                </div>
              </div>

              {/* CAJÓN NUEVO: REPORTE DE PLANTILLAS, BAJAS Y EXPLICACIÓN DE LA JUGADA EN CRISTIANO */}
              <div className="bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-300">📋 Estado de Plantillas, Bajas y Qué Significa la Apuesta</h4>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">Contexto Real</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-white">Plantillas y Bajas:</strong> {currentMatch.reportePlantilla}
                </p>
                <p className="text-xs md:text-sm text-amber-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  💡 <strong>En sencillo:</strong> La recomendación principal es apostar a <strong>"{currentMatch.bestMarketName}"</strong> ({currentMatch.bestMarketExplanation}). Por cada $10 que apuestes en esta opción a cuota <strong>{currentMatch.bestOdd}</strong>, cobras <strong>${(10 * currentMatch.bestOdd).toFixed(2)}</strong>.
                </p>
              </div>

              {/* BARRA DE PESTAÑAS DE MERCADOS EXPLICADOS EN ESPAÑOL CLARO */}
              <div className="bg-[#131d3b] border border-slate-700 rounded-2xl overflow-hidden">
                <div className="flex overflow-x-auto bg-[#1c2a52] border-b border-slate-700 p-1.5 gap-1.5 text-xs font-bold">
                  {[
                    { id: "todos", label: "📊 Todas las Opciones Explicadas" },
                    { id: "goles", label: "⚽ Goles (Poisson) & Ambos Marcan" },
                    { id: "marcadores", label: "🎯 Marcadores Más Probables & Doble Oportunidad" },
                    { id: "trampas", label: "⚠️ Alerta de Cuotas Trampa" }
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
                  
                  {/* 1. GANADOR DEL PARTIDO (1X2) CON EXPLICACIÓN HUMANA */}
                  {(activeMarketTab === "todos") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                        <h4 className="text-xs font-black uppercase text-amber-400">⭐ ¿Quién tiene más probabilidad de ganar el partido? (10,000 Simulaciones Montecarlo)</h4>
                        <span className="text-[11px] text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                          Promedio de Goles Esperados (Poisson): <strong className="text-blue-400">{currentMatch.homeInitials} {currentMatch.xgHome}</strong> vs <strong className="text-amber-400">{currentMatch.awayInitials} {currentMatch.xgAway}</strong> (Total: {currentMatch.expectedGoals} goles)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>Gana {currentMatch.home}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaLocal}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa calcula: {currentMatch.cleanProb1}%</span>
                            <strong className="text-blue-400">Montecarlo: {currentMatch.probHomeSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>Empate</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaEmpate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa calcula: {currentMatch.cleanProbX}%</span>
                            <strong className="text-blue-400">Montecarlo: {currentMatch.probDrawSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>Gana {currentMatch.away}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaVisita}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa calcula: {currentMatch.cleanProb2}%</span>
                            <strong className="text-blue-400">Montecarlo: {currentMatch.probAwaySim}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. TOTAL DE GOLES Y AMBOS MARCAN EXPLICADO EN SENCILLO */}
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
                          <p className="text-[11px] text-slate-300">Solo vale si pagan más de: <strong className="text-white">{currentMatch.fairOddBttsYes}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. MARCADORES EXACTOS Y DOBLE OPORTUNIDAD */}
                  {(activeMarketTab === "todos" || activeMarketTab === "marcadores") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <h4 className="text-xs font-black uppercase text-sky-400 mb-3">🎯 Los 3 Marcadores Más Probables (Simulación Montecarlo) & Doble Oportunidad</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-sky-500/30">
                          <span className="text-[10px] text-sky-300 font-bold uppercase block">Marcadores más repetidos en 10,000 simulaciones</span>
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
                            <span className="text-[10px] text-amber-300 font-bold uppercase block">Apuesta Segura: Doble Oportunidad</span>
                            <strong className="text-white text-xs block mt-1">Gana {currentMatch.home} o Empatan: {currentMatch.prob1X}%</strong>
                            <strong className="text-slate-200 text-xs block mt-1">Gana {currentMatch.away} o Empatan: {currentMatch.probX2}%</strong>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-2">Ideal para combinar con bajo riesgo</span>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-purple-500/30 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase block">Arco en Cero / No Anotan Ambos</span>
                            <strong className="text-white text-xs block mt-1">Al menos un equipo NO anota: {currentMatch.probBttsNoSim}%</strong>
                            <span className="text-[11px] text-slate-300 block mt-1">Cuota mínima recomendada: {currentMatch.fairOddBttsNo}</span>
                          </div>
                          <span className="text-[10px] text-green-400 font-bold mt-2">✓ Calculado con Poisson + Montecarlo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. DETECTOR DE TRAMPAS EN CUOTAS MEJORADAS */}
                  {(activeMarketTab === "todos" || activeMarketTab === "trampas") && (
                    <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">⚠️ ¡Cuidado con esta Trampa de las Casas de Apuestas!</span>
                        <p className="text-xs text-slate-200 mt-1.5">
                          Las casas de apuestas promocionan en este partido: <strong className="text-amber-300">{currentMatch.cuotaMejoradaCasa}</strong>. Aunque la cuota se vea gigante, obligarte a acertar 3 o 4 cosas al mismo tiempo hace que pierdas tu dinero más del 96% de las veces. ¡Mejor sigue la Jugada Recomendada de arriba!
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* CAJÓN DEL COMENTARISTA DEPORTIVO DINÁMICO Y HUMANO */}
              <div className="bg-blue-950/40 border-2 border-blue-500/50 p-5 rounded-2xl space-y-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                  <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider">🎙️ El Veredicto del Comentarista (Poisson + Montecarlo + Plantillas)</h3>
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
                <div className="bg-amber-400 text-slate-950 px-4 py-2.5 font-black text-xs uppercase flex justify-between items-center">
                  <span>🎟️ Calculadora de Ganancia</span>
                  <span>+{currentMatch.ev}% VENTAJA</span>
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
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">¿Cuánto quieres apostar hoy? ($ USD)</label>
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
                      <span>Ganancia limpia a tu bolsillo:</span>
                      <span>+${(stakeAmount * currentMatch.bestOdd - stakeAmount).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ASISTENTE IA MULTIMERCADO */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[360px] shadow-xl">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-white font-bold text-xs uppercase">Pregúntale al Analista IA</h3>
                  <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">EN SENCILLO</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isTyping && <div className="text-xs text-blue-400 animate-pulse">Analizando jugada...</div>}
                </div>
                <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pregunta qué apostar o cómo están las bajas..." className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none" />
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
