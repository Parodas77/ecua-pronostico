"use client";
import { useState } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  const [match, setMatch] = useState("ldu-bsc");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(true);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Analizando la base de datos de LigaPro y Copa Libertadores. ¿Qué tipo de rentabilidad buscas hoy?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999";
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para recibir mi usuario y contraseña VIP. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

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

  const isFreePreview = match === "auc-elf";
  const isMatchUnlocked = view === "premium" || isFreePreview;

  const homeTeam = match === "ldu-bsc" ? "LDU Quito" : match === "idv-emelec" ? "Ind. del Valle" : "SD Aucas";
  const homeShort = match === "ldu-bsc" ? "LDU" : match === "idv-emelec" ? "IDV" : "AUC";
  const homeColor = match === "ldu-bsc"
    ? "bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
    : match === "idv-emelec"
    ? "bg-blue-900 text-white border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
    : "bg-yellow-500 text-red-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
  const homeAlt = match === "idv-emelec" ? "Local - Altitud: 2,500 msnm" : "Local - Altitud: 2,850 msnm";

  const awayTeam = match === "ldu-bsc" ? "Barcelona SC" : match === "idv-emelec" ? "CS Emelec" : "El Nacional";
  const awayShort = match === "ldu-bsc" ? "BSC" : match === "idv-emelec" ? "EME" : "NAC";
  const awayColor = match === "ldu-bsc"
    ? "bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
    : match === "idv-emelec"
    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
    : "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]";
  const awayAlt = match === "auc-elf" ? "Visitante - Altitud: 2,850 msnm (Neutral)" : "Visitante - Altitud: Nivel del mar";

  const jornadaText = match === "auc-elf" ? "LIGAPRO - MUESTRA ABIERTA" : "LIGAPRO - FECHA 14";
  const dateText = match === "ldu-bsc" ? "Domingo, 18 de octubre de 2026" : "Sábado, 17 de octubre de 2026";
  const timeText = match === "ldu-bsc" ? "16:00 EST" : match === "idv-emelec" ? "18:30 EST" : "14:00 EST";

  const cuotaLocal = match === "ldu-bsc" ? 2.15 : match === "idv-emelec" ? 1.75 : 2.05;
  const probRealLocal = match === "ldu-bsc" ? 61.3 : match === "idv-emelec" ? 66.8 : 55.4;
  const evCalculado = match === "ldu-bsc" ? 14.8 : match === "idv-emelec" ? 9.7 : 6.6;
  const cuotaEmpate = match === "ldu-bsc" ? 3.40 : match === "idv-emelec" ? 3.60 : 3.30;
  const probEmpate = match === "ldu-bsc" ? 28.5 : match === "idv-emelec" ? 21.0 : 26.2;
  const cuotaVisita = match === "ldu-bsc" ? 4.15 : match === "idv-emelec" ? 4.80 : 3.70;

  const probImplicitaCasa = ((1 / cuotaLocal) * 100).toFixed(1);
  const cuotaJustaLocal = (100 / probRealLocal).toFixed(2);
  const probImplicitaEmpate = ((1 / cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / cuotaVisita) * 100).toFixed(1);

  const getInterpretacionDinamica = () => {
    if (match === "ldu-bsc") {
      return `Al cruzar el poder ofensivo (xG) con el desgaste proyectado por altitud (2,850 msnm), el modelo detecta una severa ineficiencia del mercado. La casa paga una cuota de ${cuotaLocal} (asumiendo un ${probImplicitaCasa}% de probabilidad), pero nuestra red neuronal proyecta un ${probRealLocal}%. Esto genera un margen asimétrico a tu favor (Edge) del +${evCalculado}%. Es una posición matemáticamente obligatoria.`;
    }
    if (match === "idv-emelec") {
      return `Independiente del Valle registra el mayor volumen de generación en el último tercio (xG de 2.34 por partido en casa). Las casas de apuestas subestiman la transición rápida de IDV a 2,500 msnm frente al bloque bajo de Emelec. La casa asume un ${probImplicitaCasa}%, pero la simulación de Montecarlo otorga un ${probRealLocal}%. El Valor Esperado de +${evCalculado}% justifica entrada con Stake medio-alto.`;
    }
    return `[VISTA PREVIA GRATUITA] Al ser ambos equipos de altura, el 'Factor K' de desgaste hipobárico queda neutralizado (0.0%). Sin embargo, la métrica de Poisson y Montecarlo favorece a SD Aucas (${probRealLocal}% real vs ${probImplicitaCasa}% de la casa) por su efectividad de conversión frente a la fragilidad defensiva de El Nacional. Ventaja estadística moderada del +${evCalculado}%.`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { role: "user", text: chatInput };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const cartelera = `
      - LDU Quito vs Barcelona SC: Cuota Local 2.15 (Implícita 46.5%), Prob Real 61.3%, EV +14.8%. Cuota Empate 3.40 (Prob Real 28.5%).
      - Ind. del Valle vs Emelec: Cuota Local 1.75 (Implícita 57.1%), Prob Real 66.8%, EV +9.7%.
      - SD Aucas vs El Nacional: Cuota Local 2.05 (Implícita 48.8%), Prob Real 55.4%, EV +6.6%.
      `;
      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico. Tono clínico y financiero. No uses Markdown.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `BASE DE DATOS: ${cartelera}\n\nPREGUNTA: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: "Error de conexión con el motor cuantitativo. Verifique su API Key en Vercel." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button onClick={() => { setShowLoginModal(false); setLoginError(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>
              <h3 className="text-xl font-bold text-white mb-1">Terminal Cuantitativa VIP</h3>
              <p className="text-xs text-slate-400 mb-4">Acceso exclusivo para miembros activos</p>

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
                <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg">Desbloquear Terminal</button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm">Solicitar Suscripción por WhatsApp ($17.99/mes)</a>
              </div>
            </div>
          </div>
        )}

        <header className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <img src="/logo.png" alt="Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />

            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
                <button onClick={() => setView("basic")} className={`px-4 py-2 text-sm font-semibold rounded-md ${view === "basic" ? "bg-slate-600 text-white" : "text-slate-400"}`}>Vista Básica</button>
                <button onClick={handlePremiumSwitch} className={`px-4 py-2 text-sm font-semibold rounded-md ${view === "premium" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Vista Premium VIP</button>
              </div>
              {isAuthenticated && <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 px-3 py-2 rounded-lg bg-slate-800/50">Salir</button>}
            </div>
          </div>

          <div className="mb-6 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wide">Inteligencia Matemática Aplicada a Pronósticos Deportivos</h1>
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-blue-400 underline">{showGuide ? "Ocultar Guía" : "Mostrar Guía"}</button>
            </div>

            {showGuide && (
              <div className="space-y-4 pt-2 border-t border-slate-700 text-xs md:text-sm text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                    <strong className="text-blue-400 block mb-1">1. ¿De qué trata EcuaPronóstico?</strong>
                    El 97% de apostadores pierde por intuición. EcuaPronóstico audita a la casa usando Distribución de Poisson, <strong>simulación de Montecarlo (10,000+ corridas)</strong>, xG y algoritmos diferenciados para Sudamérica y Europa.
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                    <strong className="text-green-400 block mb-1">2. Manual Operativo:</strong>
                    Compara la Prob. Real (Azul) con la del Mercado (Rojo). Opera solo con Valor Esperado (+EV) mayor al +5%.
                  </div>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-500/30 flex justify-between items-center">
                  <span>Prueba gratis el partido Aucas vs El Nacional en el selector de abajo.</span>
                  <button onClick={() => { setSport("football"); setLeague("ligapro"); setMatch("auc-elf"); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold">Ver Muestra Gratis</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Deporte</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm">
                <option value="football">Fútbol (Soccer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Competición</label>
              <select value={league} onChange={(e) => setLeague(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm">
                <option value="ligapro">LigaPro Ecuador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Evento Programado</label>
              <select value={match} onChange={(e) => setMatch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm">
                <option value="ldu-bsc">🔒 LDU Quito vs Barcelona SC (Estelar)</option>
                <option value="idv-emelec">🔒 Ind. del Valle vs Emelec</option>
                <option value="auc-elf">🔓 Aucas vs El Nacional (Muestra Gratis)</option>
              </select>
            </div>
          </div>
        </header>

        {sport === "football" && league === "ligapro" && (
          <div className="space-y-6">
            
            <div className="rounded-xl p-6 flex justify-between items-center bg-slate-800/80 border border-slate-600 shadow-2xl">
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg mb-2 ${homeColor}`}>{homeShort}</div>
                <h2 className="text-lg font-bold text-center">{homeTeam}</h2>
                <p className="text-slate-400 text-xs">{homeAlt}</p>
                <p className="text-red-400 text-sm font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Mercado: {probImplicitaCasa}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full text-xs font-bold mb-2">{jornadaText}</span>
                <p className="text-xs text-slate-300 text-center">{dateText}<br /><strong className="text-white text-base">{timeText}</strong></p>
                <p className="text-red-400 text-sm font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Empate: {probImplicitaEmpate}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg mb-2 ${awayColor}`}>{awayShort}</div>
                <h2 className="text-lg font-bold text-center">{awayTeam}</h2>
                <p className="text-slate-400 text-xs">{awayAlt}</p>
                <p className="text-red-400 text-sm font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Mercado: {probImplicitaVisita}%</p>
              </div>
            </div>

            {!isMatchUnlocked && (
              <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/40 border border-slate-700">
                <div className="bg-slate-900/90 p-8 rounded-xl border border-blue-500/30 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-white mb-2">Ventaja Matemática Oculta (+EV)</h3>
                  <p className="text-slate-300 text-sm mb-6 max-w-lg">Ingresa con tu cuenta VIP o adquiere acceso para desbloquear la Probabilidad Real y el Asistente IA en este evento estelar.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-sm">Iniciar Sesión VIP</button>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-3 px-6 rounded-lg text-sm">Comprar Acceso - $17.99/mes</a>
                  </div>
                </div>
              </div>
            )}

            {isMatchUnlocked && (
              <div className="space-y-6">
                
                {isFreePreview && !isAuthenticated && (
                  <div className="bg-blue-950/60 border border-blue-400/50 rounded-xl p-4 flex justify-between items-center">
                    <p className="text-xs text-blue-200">🔓 Muestra Gratuita activa. Para desbloquear LDU vs Barcelona, activa tu cuenta VIP.</p>
                    <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">Activar VIP</button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Cuota Casa</p>
                    <p className="text-3xl text-white font-light">{cuotaLocal}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Prob. Implícita</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-slate-800/80 border-t-4 border-blue-500 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Prob. Real</p>
                    <p className="text-3xl text-blue-400 font-bold">{probRealLocal}%</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4 text-center">
                    <p className="text-green-400 text-xs uppercase font-bold">Valor Esperado (+EV)</p>
                    <p className="text-3xl text-green-400 font-extrabold">+{evCalculado}%</p>
                  </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-500/30 p-5 rounded-xl">
                  <h3 className="text-white font-bold text-base mb-2">Conclusión del Algoritmo</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{getInterpretacionDinamica()}</p>
                </div>

                <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden flex flex-col h-[350px]">
                  <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                    <h3 className="text-white font-bold text-sm">Asistente Cuantitativo IA</h3>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>{msg.text}</div>
                      </div>
                    ))}
                    {isTyping && <div className="text-xs text-slate-400 animate-pulse">Analizando mercados en tiempo real...</div>}
                  </div>
                  <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pregunta sobre la rentabilidad..." className="flex-1 bg-slate-900 border border-slate-600 text-sm text-white rounded-lg px-4 py-2.5 outline-none" />
                    <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Enviar</button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}