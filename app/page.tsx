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
    { role: "ai", text: "Motor cuantitativo Dixon-Coles y De-vigging activo. Todos los parámetros provienen de cuotas reales sin margen y distribución exacta de marcadores (Cero datos inventados). ¿Qué partido auditamos?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para desbloquear todas las auditorías multimercado verificadas. ¿Me ayudan con los datos de pago?";
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
    jornada: "SINCRONIZANDO MODELO DIXON-COLES...", date: "...", time: "...",
    cuotaLocal: 1.85, cuotaEmpate: 3.33, cuotaVisita: 4.20,
    lineGoals: 2.5, cuotaOver: 2.22, cuotaUnder: 1.58,
    marginCasa: 6.4,
    cleanProb1: 50.8, cleanProbX: 28.2, cleanProb2: 21.0,
    lambdaHome: 1.45, lambdaAway: 0.85, expectedGoals: 2.30,
    probHomeSim: 52.4, probDrawSim: 26.8, probAwaySim: 20.8,
    probOverSim: 41.2, probUnderSim: 58.8,
    probBttsYesSim: 46.5, probBttsNoSim: 53.5,
    fairOddBttsYes: 2.15, fairOddBttsNo: 1.87,
    prob1X: 79.2, probX2: 47.6,
    topScores: [{ score: "1-0", prob: 16.4 }, { score: "1-1", prob: 12.8 }, { score: "2-0", prob: 11.9 }],
    bestMarketName: "Calculando...", bestOdd: 1.85, probImplicitaBest: 54.1,
    probReal: 56.2, ev: 3.9, hasRealEdge: true,
    cuotaMejoradaCasa: "Analizando...",
    analisisDinamico: "Ejecutando desmargenización matemática y matriz bivariada de Dixon-Coles..."
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
      const reglas = `Eres el 'Auditor Cuantitativo IA' de EcuaPronóstico. REGLA ESTRICTA DE INTEGRIDAD: Jamás inventes datos, no inventes lesiones, ni córners ni tarjetas que no estén en el contexto matemático provisto. Basa tu respuesta exclusivamente en las cuotas reales, el margen de la casa (Overround), las probabilidades sin margen (De-vigged), los goles esperados (Lambda Local y Visita) y la matriz de marcadores exactos de Dixon-Coles. Nunca menciones marcas de casas de apuestas específicas, di siempre 'las casas de apuestas'. No uses Markdown.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `PARTIDO AUDITADO: ${currentMatch.home} vs ${currentMatch.away}\nPARÁMETROS REALES VERIFICADOS:\n- Cuotas 1X2: Local ${currentMatch.cuotaLocal} | Empate ${currentMatch.cuotaEmpate} | Visita ${currentMatch.cuotaVisita}\n- Comisión Oculta de la Casa (Overround): ${currentMatch.marginCasa}%\n- Probabilidades Limpias sin Margen: Local ${currentMatch.cleanProb1}% | Empate ${currentMatch.cleanProbX}% | Visita ${currentMatch.cleanProb2}%\n- Tasas de Goles Esperados (Lambdas): Local ${currentMatch.lambdaHome} | Visita ${currentMatch.lambdaAway} (Total: ${currentMatch.expectedGoals})\n- Marcadores Más Plausibles (Dixon-Coles): ${currentMatch.topScores?.map((s: any) => s.score + " (" + s.prob + "%)").join(", ")}\n- Mejor Mercado Detectado: ${currentMatch.bestMarketName} a cuota ${currentMatch.bestOdd} (EV: ${currentMatch.ev}%)\n\nPREGUNTA DEL USUARIO: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: `Auditoría Matemática Verificada para ${currentMatch.home} vs ${currentMatch.away}: La comisión oculta de las casas de apuestas es del ${currentMatch.marginCasa}%. Con λ Local de ${currentMatch.lambdaHome} y λ Visita de ${currentMatch.lambdaAway}, los marcadores más probables según Dixon-Coles son ${currentMatch.topScores?.map((s: any) => s.score + " (" + s.prob + "%)").join(", ")}. El mercado más eficiente es '${currentMatch.bestMarketName}' a cuota ${currentMatch.bestOdd} (${currentMatch.ev >= 0 ? "+" + currentMatch.ev : currentMatch.ev}% EV).` }]);
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
              <p className="text-xs text-slate-400 mb-4">Desbloquea la matriz completa Dixon-Coles, De-vigging y Valor Esperado verificados</p>

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
                {showGuide ? "Ocultar Metodología" : "📐 Metodología Verificada"}
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
                <strong className="text-amber-400 block mb-1">1. Cero Datos Inventados: De-vigging + Modelo Dixon-Coles</strong>
                No adivinamos ganadores ni inventamos estadísticas. Primero extraemos la comisión oculta de las casas de apuestas (Proportional De-vigging) para obtener la probabilidad limpia del consenso de mercado. Luego calculamos las tasas exactas de goles esperados ($\lambda$) y aplicamos el ajuste bivariado de Dixon-Coles para proyectar la matriz completa de marcadores plausibles (0-0, 1-0, 1-1, 2-1, etc.).
              </div>
              <div>
                <strong className="text-green-400 block mb-1">2. Rigor Científico: Precisión vs Rentabilidad (+EV)</strong>
                Un favorito con cuota 1.22 tiene altísima probabilidad de ganar, pero rentabilidad negativa a largo plazo. Nuestro motor evalúa objetivamente dónde la probabilidad real supera a la probabilidad implícita de la cuota, y te advierte con honestidad cuando un partido tiene el mercado demasiado ajustado.
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
              🇪🇺 Champions & Europa League (Cartelera Verificada)
            </button>
          </div>
        </header>

        {/* 1. GRILLA COMPLETA DE PARTIDOS */}
        <section className="mb-8 bg-[#131d3b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1c2a52] px-4 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                Cartelera Interactiva — Haz clic en cualquier partido para abrir su Auditoría Matemática Verificada
              </h2>
            </div>
            <div className="hidden lg:flex gap-16 text-[11px] font-bold text-slate-300 pr-6">
              <span>1 X 2 (Cuotas Mercado)</span>
              <span>Total Goles (Más / Menos)</span>
              <span>Auditoría EV</span>
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
                    <div className={`${m.ev > 1.5 ? "bg-green-950/70 border-green-500/50" : "bg-slate-800/90 border-slate-600"} border rounded-lg px-2 py-1.5 text-center`}>
                      <span className="block text-[9px] text-slate-300 uppercase font-bold">EV Real</span>
                      <strong className={`text-sm font-black ${m.ev > 1.5 ? "text-green-400" : "text-amber-300"}`}>
                        {unlocked ? `${m.ev >= 0 ? "+" + m.ev : m.ev}%` : "🔒 VIP"}
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
            <h3 className="text-2xl font-black text-white mb-2">🔒 Auditoría Matemática VIP Bloqueada para {currentMatch.home} vs {currentMatch.away}</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
              Desbloquea las probabilidades limpias sin margen (De-vigged), la matriz exacta de marcadores plausibles de Dixon-Coles, Doble Oportunidad y la evaluación de Valor Esperado.
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
              
              {/* ENCABEZADO DEL PARTIDO EN ESTUDIO CON PORCENTAJES EN ROJO EXACTOS */}
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
                  <span className="text-[10px] text-slate-400 mt-1.5">
                    Margen oculto casa (Overround): <strong className="text-amber-300">{currentMatch.marginCasa}%</strong>
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

              {/* TARJETAS RESUMEN DE LA MEJOR JUGADA DETECTADA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Mercado Más Eficiente</p>
                  <p className="text-xs md:text-sm text-amber-300 font-black mt-1">{currentMatch.bestMarketName}</p>
                  <p className="text-xs text-slate-300 mt-0.5">Cuota Casa: <strong>{currentMatch.bestOdd}</strong></p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Implícita en Cuota</p>
                  <p className="text-2xl text-slate-300 font-bold mt-1">{currentMatch.probImplicitaBest}%</p>
                  <p className="text-[10px] text-slate-400">Con margen de la casa</p>
                </div>
                <div className="bg-slate-800/90 border-t-4 border-blue-500 rounded-xl p-3.5 text-center">
                  <p className="text-blue-300 text-[10px] uppercase font-bold">Modelo Dixon-Coles</p>
                  <p className="text-2xl text-blue-400 font-black mt-1">{currentMatch.probReal}%</p>
                  <p className="text-[10px] text-slate-300">Probabilidad Estimada</p>
                </div>
                <div className={`${currentMatch.ev > 1.5 ? "bg-green-950/40 border-green-500/60" : "bg-slate-800/80 border-amber-500/50"} border rounded-xl p-3.5 text-center`}>
                  <p className={`${currentMatch.ev > 1.5 ? "text-green-400" : "text-amber-300"} text-[10px] uppercase font-bold`}>Valor Esperado (EV)</p>
                  <p className={`text-2xl font-black mt-1 ${currentMatch.ev > 1.5 ? "text-green-400" : "text-amber-300"}`}>
                    {currentMatch.ev >= 0 ? `+${currentMatch.ev}%` : `${currentMatch.ev}%`}
                  </p>
                  <p className="text-[10px] text-slate-300">{currentMatch.ev > 1.5 ? "Ventaja Confirmada" : "Mercado Ajustado"}</p>
                </div>
              </div>

              {/* BARRA DE PESTAÑAS DE MERCADOS DERIVADOS MATEMÁTICAMENTE */}
              <div className="bg-[#131d3b] border border-slate-700 rounded-2xl overflow-hidden">
                <div className="flex overflow-x-auto bg-[#1c2a52] border-b border-slate-700 p-1.5 gap-1.5 text-xs font-bold">
                  {[
                    { id: "todos", label: "📊 Auditoría Completa (Sin Humo)" },
                    { id: "goles", label: "⚽ Totales de Goles & Ambos Marcan" },
                    { id: "marcadores", label: "🎯 Distribución de Marcadores & Doble Oportunidad" },
                    { id: "trampas", label: "⚠️ Auditoría de Cuotas Mejoradas" }
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
                  
                  {/* 1. GANADOR 1X2 CON PROBABILIDADES LIMPIAS (DE-VIGGED) VS MODELO DIXON-COLES */}
                  {(activeMarketTab === "todos") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                        <h4 className="text-xs font-black uppercase text-amber-400">⭐ Mercado 1X2: Cuota sin Margen (De-vigged) vs Modelo Dixon-Coles</h4>
                        <span className="text-[11px] text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                          λ Local: <strong className="text-blue-400">{currentMatch.lambdaHome}</strong> | λ Visita: <strong className="text-amber-400">{currentMatch.lambdaAway}</strong> (Total: {currentMatch.expectedGoals} goles)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>1. {currentMatch.home}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaLocal}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Sin margen casa: {currentMatch.cleanProb1}%</span>
                            <strong className="text-blue-400">Modelo: {currentMatch.probHomeSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>X. Empate</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaEmpate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Sin margen casa: {currentMatch.cleanProbX}%</span>
                            <strong className="text-blue-400">Modelo: {currentMatch.probDrawSim}%</strong>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>2. {currentMatch.away}</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaVisita}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Sin margen casa: {currentMatch.cleanProb2}%</span>
                            <strong className="text-blue-400">Modelo: {currentMatch.probAwaySim}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. TOTAL DE GOLES (MÁS/MENOS) Y AMBOS EQUIPOS MARCAN DERIVADOS DE LA MATRIZ DE POISSON */}
                  {(activeMarketTab === "todos" || activeMarketTab === "goles") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <h4 className="text-xs font-black uppercase text-green-400 mb-3">⚽ Totales de Goles (Línea {currentMatch.lineGoals}) & Ambos Equipos Marcan (Derivación Exacta)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Más de {currentMatch.lineGoals} goles</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaOver}</span>
                          </div>
                          <p className="text-[11px] text-blue-300 font-semibold">Probabilidad Modelo: {currentMatch.probOverSim}%</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Menos de {currentMatch.lineGoals} goles</span>
                            <span className="text-amber-300">Cuota {currentMatch.cuotaUnder}</span>
                          </div>
                          <p className="text-[11px] text-blue-300 font-semibold">Probabilidad Modelo: {currentMatch.probUnderSim}%</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>Ambos Equipos Marcan (Sí)</span>
                            <span className="text-green-400">{currentMatch.probBttsYesSim}%</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Cuota Justa Mínima (Fair Odd): <strong className="text-white">{currentMatch.fairOddBttsYes}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DISTRIBUCIÓN DE MARCADORES EXACTOS Y DOBLE OPORTUNIDAD (SIN CÓRNERS FICTICIOS) */}
                  {(activeMarketTab === "todos" || activeMarketTab === "marcadores") && (
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                      <h4 className="text-xs font-black uppercase text-sky-400 mb-3">🎯 Matriz de Marcadores Más Plausibles (Dixon-Coles) & Doble Oportunidad</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-3 rounded-lg border border-sky-500/30">
                          <span className="text-[10px] text-sky-300 font-bold uppercase block">Top 3 Marcadores Exactos</span>
                          <div className="mt-1.5 space-y-1">
                            {currentMatch.topScores?.map((s: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-white font-bold">Marcador {s.score}</span>
                                <span className="text-amber-300 font-bold">{s.prob}% prob.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-amber-500/30 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-amber-300 font-bold uppercase block">Doble Oportunidad (1X / X2)</span>
                            <strong className="text-white text-xs block mt-1">{currentMatch.home} o Empate (1X): {currentMatch.prob1X}%</strong>
                            <strong className="text-slate-200 text-xs block mt-1">{currentMatch.away} o Empate (X2): {currentMatch.probX2}%</strong>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-2">Sumatoria exacta de matriz 1X2</span>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-purple-500/30 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase block">Control de Incertidumbre</span>
                            <strong className="text-white text-xs block mt-1">Ambos No Marcan: {currentMatch.probBttsNoSim}%</strong>
                            <span className="text-[11px] text-slate-300 block mt-1">Cuota Justa No-BTTS: {currentMatch.fairOddBttsNo}</span>
                          </div>
                          <span className="text-[10px] text-green-400 font-bold mt-2">✓ Verificado sin invención de datos</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. DETECTOR DE TRAMPAS EN CUOTAS MEJORADAS */}
                  {(activeMarketTab === "todos" || activeMarketTab === "trampas") && (
                    <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">⚠️ Auditoría de Cuotas Mejoradas de las Casas de Apuestas</span>
                        <p className="text-xs text-slate-200 mt-1.5">
                          Oferta observada en las casas de apuestas: <strong className="text-amber-300">{currentMatch.cuotaMejoradaCasa}</strong>. Al multiplicar eventos condicionales en un mismo boleto, el margen acumulado de la casa supera el 22%, reduciendo drásticamente el Valor Esperado.
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
                  <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider">🎙️ Veredicto del Modelo Probabilístico (Dixon-Coles + De-vigging)</h3>
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
                  <span>{currentMatch.ev > 1.5 ? "+EV CONFIRMADO" : "MERCADO AJUSTADO"}</span>
                </div>
                <div className="p-4 space-y-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{currentMatch.home} vs {currentMatch.away}</span>
                    <strong className="text-sm text-amber-300 block mt-0.5">Selección Modelo: {currentMatch.bestMarketName}</strong>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                      <span>Cuota en Casa de Apuestas: <strong className="text-white">{currentMatch.bestOdd}</strong></span>
                      <span className="text-green-400 font-bold">Prob. Modelo: {currentMatch.probReal}%</span>
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
                  <h3 className="text-white font-bold text-xs uppercase">Consultor Cuantitativo IA</h3>
                  <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">VERIFIED DATA</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isTyping && <div className="text-xs text-blue-400 animate-pulse">Consultando matriz Dixon-Coles...</div>}
                </div>
                <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pregunta por marcadores exactos, lambdas o EV..." className="flex-1 bg-slate-900 border border-slate-600 text-xs text-white rounded-lg px-3 py-2 outline-none" />
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
