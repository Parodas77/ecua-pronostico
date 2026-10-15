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
    { role: "ai", text: "Radar sincronizado con la cartelera y cuotas reales de las casas de apuestas. Audito mercado 1X2, Más/Menos Goles, Tiros de Esquina, Tarjetas, Remates y detecto trampas en 'Cuotas Mejoradas'. ¿Qué encuentro revisamos?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para desbloquear todas las auditorías multimercado. ¿Me ayudan con los datos de pago?";
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
    jornada: "SINCRONIZANDO CARTELERA...", date: "...", time: "...",
    cuotaLocal: 1.85, cuotaEmpate: 3.33, cuotaVisita: 4.20,
    lineGoals: 2.5, cuotaOver: 2.22, cuotaUnder: 1.58,
    cuotaBttsYes: 1.90, cuotaBttsNo: 1.80,
    cornersLine: "Más de 8.5 Córners", cuotaCorners: 1.82, probCorners: 64.2,
    cardsLine: "Más de 4.5 Tarjetas", cuotaCards: 1.75, probCards: 68.5,
    shotsLine: "+4.5 Remates a Puerta", cuotaShots: 1.72, probShots: 66.0,
    bestMarketName: "Cargando...", bestOdd: 1.85, probImplicitaBest: 54.0,
    probReal: 61.8, ev: 14.3,
    cuotaMejoradaTrampa: "Analizando...",
    analisisDinamico: "Sincronizando con el motor estocástico..."
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
      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico. Responde como un comentarista y trader deportivo experto. Explica qué mercado conviene más (1X2, Más/Menos goles, Córners, Tarjetas, Remates) frente a las casas de apuestas usando Poisson y Montecarlo. Nunca menciones marcas de casas de apuestas específicas, di siempre 'las casas de apuestas'. No uses Markdown.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `PARTIDO: ${currentMatch.home} vs ${currentMatch.away}\nCUOTAS DE LAS CASAS DE APUESTAS: 1(${currentMatch.cuotaLocal}) X(${currentMatch.cuotaEmpate}) 2(${currentMatch.cuotaVisita}) | Más/Menos ${currentMatch.lineGoals} goles: (${currentMatch.cuotaOver} / ${currentMatch.cuotaUnder})\nANÁLISIS: ${currentMatch.analisisDinamico}\n\nPREGUNTA DEL USUARIO: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: `En este duelo (${currentMatch.home} vs ${currentMatch.away}), la mejor grieta frente a las casas de apuestas está en '${currentMatch.bestMarketName}' a cuota ${currentMatch.bestOdd} (Probabilidad real Montecarlo: ${currentMatch.probReal}%) y en el mercado de ${currentMatch.cornersLine} (${currentMatch.probCorners}% real). Evita las Cuotas Mejoradas combinadas de la casa.` }]);
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
              <h3 className="text-xl font-bold text-white mb-1">Terminal Cuantitativa VIP</h3>
              <p className="text-xs text-slate-400 mb-4">Desbloquea todos los partidos y mercados secundarios (Córners, Tarjetas, Goles)</p>

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
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Auditor Cuantitativo de Casas de Apuestas</span>
                <h1 className="text-base md:text-xl font-black text-white mt-0.5">RADAR MULTIMERCADO INTELIGENTE</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-2 rounded-lg font-bold">
                {showGuide ? "Ocultar Manual" : "📖 ¿Cómo funciona?"}
              </button>
              <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button onClick={() => setView("basic")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "basic" ? "bg-slate-600 text-white" : "text-slate-400"}`}>Gratis</button>
                <button onClick={handlePremiumSwitch} className={`px-3 py-1.5 text-xs font-bold rounded-md ${view === "premium" ? "bg-blue-600 text-white" : "text-slate-400"}`}>VIP ($17.99)</button>
              </div>
              {isAuthenticated && <button onClick={handleLogout} className="text-xs text-red-400 border border-slate-700 px-2.5 py-1.5 rounded-lg">Salir</button>}
            </div>
          </div>

          {showGuide && (
            <div className="mb-4 bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-amber-400 block mb-1">¿Por qué las casas de apuestas solo te muestran cuotas (ej: 1.85) y NUNCA porcentajes?</strong>
                Porque la cuota esconde la probabilidad real y les permite cobrarte una comisión oculta (margen de la casa del 6% al 9%). Aquí destapamos el porcentaje exacto con 10,000 simulaciones de Montecarlo y te decimos en qué mercado (Ganador, Más/Menos Goles, Córners, Tarjetas o Remates) está la verdadera ventaja matemática (+EV).
              </div>
              <div>
                <strong className="text-red-400 block mb-1">¡Cuidado con las "Cuotas Mejoradas" (6.40, 25.00, 56.00)!</strong>
                Las casas de apuestas promocionan combinadas de 3 o 4 cosas muy específicas (ej: Marcador exacto + Córners + Tarjetas) porque saben que la probabilidad matemática conjunta es menor al 2%. Nuestro radar te alerta de esas trampas y te guía hacia apuestas profesionales.
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
              🇪🇺 Champions & Europa League (Cartelera Real 15-21 Oct)
            </button>
          </div>
        </header>

        {/* 1. GRILLA COMPLETA DE PARTIDOS */}
        <section className="mb-8 bg-[#131d3b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1c2a52] px-4 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                Cartelera Interactiva — Haz clic en cualquier partido para abrir su Auditoría Multimercado
              </h2>
            </div>
            <div className="hidden lg:flex gap-16 text-[11px] font-bold text-slate-300 pr-6">
              <span>1 X 2 (Cuotas Mercado)</span>
              <span>Total Goles (Más / Menos)</span>
              <span>Ventaja Detectada (+EV)</span>
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
                      <span className="block text-[10px] text-slate-400 truncate">1 ({m.homeInitials})</span>
                      <strong className="text-sm text-white">{m.cuotaLocal.toFixed(2)}</strong>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400">Empate</span>
                      <strong className="text-sm text-white">{m.cuotaEmpate.toFixed(2)}</strong>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="block text-[10px] text-slate-400 truncate">2 ({m.awayInitials})</span>
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
                      <span className="block text-[9px] text-green-300 uppercase font-bold">Valor IA</span>
                      <strong className="text-sm text-green-400 font-black">{unlocked ? `+${m.ev}% EV` : "🔒 VIP"}</strong>
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
            <h3 className="text-2xl font-black text-white mb-2">🔒 Auditoría Multimercado VIP Bloqueada para {currentMatch.home} vs {currentMatch.away}</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
              Desbloquea las probabilidades exactas de Montecarlo para Ganador 1X2, Más/Menos de {currentMatch.lineGoals} goles, Tiros de Esquina, Tarjetas, Remates a Puerta y el detector de trampas en Cuotas Mejoradas.
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
              
              {/* ENCABEZADO DEL PARTIDO EN ESTUDIO CON PORCENTAJES EN ROJO RESTAURADOS */}
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

              {/* TARJETAS RESUMEN DE LA MEJOR JUGADA DETECTADA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Mejor Mercado Detectado</p>
                  <p className="text-sm text-amber-300 font-black mt-1">{currentMatch.bestMarketName}</p>
                  <p className="text-xs text-slate-300 mt-0.5">Cuota Casa: <strong>{currentMatch.bestOdd}</strong></p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Lo que dice la Casa</p>
                  <p className="text-2xl text-slate-300 font-bold mt-1">{currentMatch.probImplicitaBest}%</p>
                  <p className="text-[10px] text-slate-400">Prob. Implícita en Cuota</p>
                </div>
                <div className="bg-slate-800/90 border-t-4 border-blue-500 rounded-xl p-3.5 text-center">
                  <p className="text-blue-300 text-[10px] uppercase font-bold">Nuestro Motor (10k Sim)</p>
                  <p className="text-2xl text-blue-400 font-black mt-1">{currentMatch.probReal}%</p>
                  <p className="text-[10px] text-slate-300">Probabilidad Real</p>
                </div>
                <div className="bg-green-950/40 border border-green-500/60 rounded-xl p-3.5 text-center">
                  <p className="text-green-400 text-[10px] uppercase font-bold">Ventaja Matemática (+EV)</p>
                  <p className="text-2xl text-green-400 font-black mt-1">+{currentMatch.ev}%</p>
                  <p className="text-[10px] text-green-300">Inversión Rentable</p>
                </div>
              </div>

              {/* BARRA DE PESTAÑAS DE MERCADOS */}
              <div className="bg-[#131d3b] border border-slate-700 rounded-2xl overflow-hidden">
                <div className="flex overflow-x-auto bg-[#1c2a52] border-b border-slate-700 p-1.5 gap-1.5 text-xs font-bold">
                  {[
                    { id: "todos", label: "📊 Todos los Mercados Auditados" },
                    { id: "goles", label: "⚽ Más/Menos Goles & Ambos Marcan" },
                    { id: "corners", label: "🚩 Tiros de Esquina & Tarjetas" },
                    { id: "trampas", label: "⚠️ Alerta: Cuotas Mejoradas" }
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
                  
                  {/* 1. GANADOR 1X2 CON COMPARATIVA DE PORCENTAJES */}
                  {(activeMarketTab === "todos") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-black uppercase text-amber-400">⭐ Mercado 1X2 (Quién Gana vs Nuestro Porcentaje Real)</h4>
                        <span className="text-[11px] text-slate-400">xG Total Proyectado: <strong className="text-white">{currentMatch.expectedGoals} goles</strong></span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>1. {currentMatch.home}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaLocal}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa cree: {probImplicitaLocal}%</span>
                            <strong className="text-blue-400">Real IA: {currentMatch.probHomeSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>X. Empate</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaEmpate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa cree: {probImplicitaEmpate}%</span>
                            <strong className="text-blue-400">Real IA: {currentMatch.probDrawSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>2. {currentMatch.away}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaVisita}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Casa cree: {probImplicitaVisita}%</span>
                            <strong className="text-blue-400">Real IA: {currentMatch.probAwaySim}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. TOTAL DE GOLES (MÁS/MENOS) Y AMBOS EQUIPOS MARCAN */}
                  {(activeMarketTab === "todos" || activeMarketTab === "goles") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <h4 className="text-xs font-black uppercase text-green-400 mb-3">⚽ Línea de Goles (Over/Under {currentMatch.lineGoals}) & Ambos Equipos Marcan</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Más de {currentMatch.lineGoals} goles</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaOver}</span>
                          </div>
                          <p className="text-[11px] text-blue-300 font-semibold">Prob. Montecarlo (+2.5): {currentMatch.probOver25Sim}%</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Menos de {currentMatch.lineGoals} goles</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaUnder}</span>
                          </div>
                          <p className="text-[11px] text-blue-300 font-semibold">Prob. Montecarlo (-2.5): {currentMatch.probUnder25Sim}%</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Ambos Equipos Marcan (Sí)</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaBttsYes}</span>
                          </div>
                          <p className="text-[11px] text-green-400 font-semibold">Prob. Real Simulación: {currentMatch.probBttsSim}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. TIROS DE ESQUINA (CÓRNERS), TARJETAS Y REMATES A PUERTA */}
                  {(activeMarketTab === "todos" || activeMarketTab === "corners") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <h4 className="text-xs font-black uppercase text-sky-400 mb-3">🚩 Mercados Especiales de Alto Valor (Tiros de Esquina, Tarjetas y Remates OPTA)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-sky-500/30">
                          <span className="text-[10px] text-sky-300 font-bold uppercase block">Tiros de Esquina</span>
                          <strong className="text-white text-sm block mt-0.5">{currentMatch.cornersLine}</strong>
                          <div className="flex justify-between mt-2 text-[11px]">
                            <span className="text-amber-300 font-bold">Cuota: {currentMatch.cuotaCorners}</span>
                            <span className="text-green-400 font-bold">Certeza IA: {currentMatch.probCorners}%</span>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/30">
                          <span className="text-[10px] text-amber-300 font-bold uppercase block">Tarjetas del Partido</span>
                          <strong className="text-white text-sm block mt-0.5">{currentMatch.cardsLine}</strong>
                          <div className="flex justify-between mt-2 text-[11px]">
                            <span className="text-amber-300 font-bold">Cuota: {currentMatch.cuotaCards}</span>
                            <span className="text-green-400 font-bold">Certeza IA: {currentMatch.probCards}%</span>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-purple-500/30">
                          <span className="text-[10px] text-purple-300 font-bold uppercase block">Remates / Jugador (OPTA)</span>
                          <strong className="text-white text-sm block mt-0.5">{currentMatch.shotsLine}</strong>
                          <div className="flex justify-between mt-2 text-[11px]">
                            <span className="text-amber-300 font-bold">Cuota: {currentMatch.cuotaShots}</span>
                            <span className="text-green-400 font-bold">Certeza IA: {currentMatch.probShots}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. DETECTOR DE TRAMPAS EN CUOTAS MEJORADAS */}
                  {(activeMarketTab === "todos" || activeMarketTab === "trampas") && (
                    <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">⚠️ Alerta Anti-Cazabobos (Cuotas Mejoradas de las Casas de Apuestas)</span>
                        <p className="text-xs text-slate-200 mt-1.5">
                          Las casas de apuestas promocionan en este partido: <strong className="text-amber-300">{currentMatch.cuotaMejoradaTrampa}</strong>. Nuestro motor estocástico advierte que acertar múltiples variables encadenadas reduce tu probabilidad real por debajo del 3.5%. ¡No regales tu dinero ahí!
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* CAJÓN DEL COMENTARISTA / TRADER CUANTITATIVO */}
              <div className="bg-blue-950/40 border-2 border-blue-500/50 p-5 rounded-2xl space-y-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                  <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider">🎙️ Veredicto del Comentarista & Trader Cuantitativo</h3>
                </div>
                <p className="text-slate-100 text-sm md:text-base leading-relaxed font-medium">
                  {currentMatch.analisisDinamico}
                </p>
              </div>

            </div>

            {/* COLUMNA DERECHA (1/3): CUPÓN SIMULADOR DE GANANCIA + CHAT IA */}
            <div className="space-y-6">
              
              {/* CUPÓN INTELIGENTE */}
              <div className="bg-[#131d3b] border-2 border-amber-400/70 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-amber-400 text-slate-950 px-4 py-2.5 font-black text-xs uppercase flex justify-between items-center">
                  <span>🎟️ Cupón de Inversión Auditado</span>
                  <span>+EV ACTIVO</span>
                </div>
                <div className="p-4 space-y-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{currentMatch.home} vs {currentMatch.away}</span>
                    <strong className="text-sm text-amber-300 block mt-0.5">Selección IA: {currentMatch.bestMarketName}</strong>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                      <span>Cuota en Casa de Apuestas: <strong className="text-white">{currentMatch.bestOdd}</strong></span>
                      <span className="text-green-400 font-bold">Prob. Real: {currentMatch.probReal}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">¿Cuánto planeas invertir hoy? ($ USD)</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-bold text-base outline-none"
                    />
                  </div>

                  <div className="bg-green-950/50 border border-green-500/40 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Retorno Total Estimado:</span>
                      <strong className="text-base text-white">${(stakeAmount * currentMatch.bestOdd).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-green-400 font-bold">
                      <span>Ganancia Neta Libre:</span>
                      <span>+${(stakeAmount * currentMatch.bestOdd - stakeAmount).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ASISTENTE IA MULTIMERCADO */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden flex flex-col h-[360px] shadow-xl">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-white font-bold text-xs uppercase">Consultor de Mercados IA</h3>
                  <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">LIVE ODDS</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isTyping && <div className="text-xs text-blue-400 animate-pulse">Auditando líneas de las casas de apuestas...</div>}
                </div>
                <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pregunta por córners, goles o tarjetas..." className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none" />
                  <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold">Consultar</button>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
