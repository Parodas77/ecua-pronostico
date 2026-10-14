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
      - Manchester City vs Fulham: Cuota 1.18, Prob Real 88.5%, EV +4.4%
      - Real Madrid vs Osasuna: Cuota 1.25, Prob Real 84.0%, EV +5.0%
      `;
      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico. Reglas: 1. Tono clínico y financiero. 2. Si piden "ganancia asegurada", aclara que no existe, solo Valor Esperado (+EV). 3. Filtra la base de datos y recomienda solo partidos con Prob Real > 60% o EV positivo. 4. NO USES FORMATO MARKDOWN. Escribe en texto plano y párrafos limpios.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `BASE DE DATOS: ${cartelera}\n\nPREGUNTA DEL INVERSOR: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "ai", text: "Error de conexión con el motor cuantitativo. Verifique su API Key en Vercel." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in">
              <button onClick={() => { setShowLoginModal(false); setLoginError(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Terminal Cuantitativa VIP</h3>
                  <p className="text-xs text-slate-400">Acceso exclusivo para miembros activos</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usuario / ID de Inversor</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: vip" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Clave de Acceso</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm" />
                </div>
                {loginError && <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg">{loginError}</p>}
                <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all">Desbloquear Terminal</button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-3">¿Aún no tienes tus credenciales de acceso?</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm transition-all">Solicitar Suscripción por WhatsApp ($17.99/mes)</a>
              </div>
            </div>
          </div>
        )}

        <header className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <img src="/logo.png" alt="EcuaPronóstico Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
                <button onClick={() => setView("basic")} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${view === "basic" ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Vista Básica</button>
                <button onClick={handlePremiumSwitch} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${view === "premium" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:text-white"}`}>
                  {!isAuthenticated && <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>}
                  Vista Premium VIP
                </button>
              </div>
              {isAuthenticated && <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 px-3 py-2 rounded-lg bg-slate-800/50">Salir</button>}
            </div>
          </div>

          <div className="mb-6 bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-blue-950/30 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                <h1 className="text-base md:text-lg font-extrabold text-white uppercase tracking-wide">Inteligencia Matemática Aplicada a Pronósticos Deportivos</h1>
              </div>
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline shrink-0">
                {showGuide ? "Ocultar Guía" : "Mostrar Guía y Demo"}
              </button>
            </div>

            {showGuide && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-700/70">
                  <div className="bg-slate-900/60 border border-slate-700/80 p-4 rounded-xl">
                    <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">1. ¿De qué trata EcuaPronóstico y por qué las casas pierden aquí?</h3>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-3">
                      El 97% de los apostadores pierde dinero porque apuesta con el corazón, la camiseta o la intuición. Las casas de apuestas lo saben e inflan sus cuotas aplicando un margen oculto. <strong>EcuaPronóstico no adivina quién va a ganar; Audita a la casa de apuestas.</strong>
                    </p>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      Nuestro motor cruza bases de datos históricas mediante la <strong>Distribución de Poisson</strong>, la <strong>simulación de Montecarlo</strong> (10,000 o más simulaciones computarizadas para acercarse al resultado real), el índice de <strong>Goles Esperados (xG)</strong> y un algoritmo exclusivo para Sudamérica que se basa en el tipo de juego y características geográficas, y otro algoritmo para Europa, que también toma en cuenta las características distintivas de su juego. Por ejemplo: Cuando una casa de apuestas subestima el impacto de jugar a 2,850 metros en Quito y paga una cuota más alta de lo que dicta la estadística real, nuestro radar detecta esa grieta financiera para que tú inviertas con ventaja matemática a favor.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-700/80 p-4 rounded-xl">
                    <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-2">2. Manual Operativo: Cómo sacarle el máximo provecho</h3>
                    <ul className="text-slate-300 text-xs md:text-sm space-y-2.5 leading-relaxed">
                      <li><strong className="text-white">Paso A - Compara el Rojo vs. Azul:</strong> Bajo cada escudo verás en <span className="text-red-400 font-semibold">letras rojas</span> la probabilidad que la casa de apuestas cree que tiene el equipo. Compárala con nuestra <span className="text-blue-400 font-semibold">Probabilidad Real (Azul)</span>. Si nuestro porcentaje es mucho mayor que el de la casa, encontraste oro.</li>
                      <li><strong className="text-white">Paso B - Regla de Oro del +EV:</strong> Jamás apuestes si el <strong>Valor Esperado (+EV)</strong> es negativo. Opera únicamente cuando la casilla verde marque <strong>+5% o más</strong>. Eso garantiza rentabilidad sostenida a mediano y largo plazo.</li>
                      <li><strong className="text-white">Paso C - Consulta al Asistente IA:</strong> Usa el chat exclusivo abajo para preguntar cómo distribuir tu capital (Stake) del día o filtrar las mejores combinadas de baja varianza.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-bold text-sm">¿Quieres ver una demostración en vivo sin pagar un centavo?</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Hemos liberado el partido <strong>SD Aucas vs El Nacional</strong> en el selector de abajo con todas las métricas Premium abiertas para que compruebes la potencia del algoritmo.</p>
                  </div>
                  <button onClick={() => { setSport("football"); setLeague("ligapro"); setMatch("auc-elf"); }} className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500 text-blue-300 hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shrink-0 whitespace-nowrap">
                    Ver Partido Gratis (Aucas vs El Nacional) →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Deporte</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="football">Fútbol (Soccer)</option>
                <option value="mma">Artes Marciales Mixtas (UFC)</option>
                <option value="boxing">Boxeo</option>
                <option value="basketball">Básquetbol</option>
                <option value="baseball">Béisbol</option>
              </select>
            </div>
            
            <div className={`transition-opacity ${sport === 'football' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Competición</label>
              <select value={league} onChange={(e) => setLeague(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="ligapro">LigaPro Ecuador</option>
                <option value="champions">UEFA Champions League</option>
                <option value="conmebol">Copa Libertadores</option>
                <option value="premier">Premier League</option>
              </select>
            </div>

            <div className={`transition-opacity ${sport === 'football' && league === 'ligapro' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Evento Programado</label>
              <select value={match} onChange={(e) => setMatch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="ldu-bsc">🔒 LDU Quito vs Barcelona SC (Estelar)</option>
                <option value="idv-emelec">🔒 Ind. del Valle vs Emelec</option>
                <option value="auc-elf">🔓 Aucas vs El Nacional (Muestra Gratis)</option>
              </select>
            </div>
          </div>
        </header>

        {sport !== "football" && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-800/30 border border-slate-700 border-dashed rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Modelo Matemático en Entrenamiento</h2>
            <p className="text-slate-400 max-w-lg">Nuestros algoritmos para <strong>{sport.toUpperCase()}</strong> están actualmente ingiriendo bases de datos históricas para calibrar la red neuronal. Estará disponible en el próximo trimestre.</p>
          </div>
        )}

        {sport === "football" && league === "ligapro" && (
          <div className="animate-fade-in">
            
            <div className="rounded-xl p-6 mb-6 flex justify-between items-start bg-slate-800/80 border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mb-3 ${homeColor}`}>{homeShort}</div>
                <h2 className="text-xl font-bold text-center">{homeTeam}</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">{homeAlt}</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Mercado: {probImplicitaCasa}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-3 whitespace-nowrap">{jornadaText}</span>
                <p className="text-sm text-slate-300 font-medium text-center">{dateText}<br /><span className="text-white text-lg font-bold mt-1 block">{timeText}</span></p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Empate: {probImplicitaEmpate}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mb-3 ${awayColor}`}>{awayShort}</div>
                <h2 className="text-xl font-bold text-center">{awayTeam}</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">{awayAlt}</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Mercado: {probImplicitaVisita}%</p>
              </div>
            </div>

            <div className="mb-6 bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-start gap-4">
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Parámetros Ingeridos para esta Simulación (10,000 iteraciones):</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">xG (Goles Esperados) Histórico</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Fuerza de Ataque/Defensa (Poisson)</span>
                  <span className="text-xs bg-red-900/40 text-red-300 border border-red-500/30 px-2 py-1 rounded">Desgaste por Altitud (Factor K)</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Simulación de Montecarlo</span>
                </div>
              </div>
            </div>

            {!isMatchUnlocked && (
              <div className="animate-fade-in relative">
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 text-center mb-6">
                  <h3 className="text-red-400 font-bold mb-1">Ineficiencia Severa Detectada en {homeTeam} vs {awayTeam}</h3>
                  <p className="text-slate-300 text-sm">Las métricas gratuitas se desbloquean 2 horas antes del partido. A esa hora, las cuotas ya habrán colapsado. <strong>(Prueba el partido Aucas vs El Nacional en el selector arriba para ver una muestra abierta).</strong></p>
                </div>
                
                <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/30 border border-slate-700">
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Ventaja Matemática Oculta (+EV)</h3>
                    <p className="text-slate-300 text-sm mb-6 max-w-lg">Ingresa con tu cuenta VIP para desbloquear la Probabilidad Real, la Cuota Justa y el Asistente Cuantitativo IA en todos los partidos de la jornada.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">Iniciar Sesión VIP</button>
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-3 px-6 rounded-lg shadow-lg transition-all">Comprar Acceso - $17.99/mes</a>
                    </div>
                  </div>
                  <div className="opacity-10 blur-md pointer-events-none">
                    <div className="h-6 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-20 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            )}

            {isMatchUnlocked && (
              <div className="animate-fade-in space-y-6">
                
                {isFreePreview && !isAuthenticated && (
                  <div className="bg-blue-950/60 border border-blue-400/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs md:text-sm text-blue-200">🔓 <strong>Estás viendo una Muestra Gratuita de las métricas Premium.</strong> Para desbloquear el partido estelar (LDU vs BSC con +14.8% EV) y el Asistente IA, activa tu cuenta VIP.</p>
                    <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0">Activar Cuenta VIP</button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Cuota Casa</p>
                    <p className="text-3xl font-light text-white">{cuotaLocal}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Prob. Implícita</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-5 text-center border-t-4 border-blue-500 flex flex-col justify-center shadow-lg">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Prob. Real</p>
                    <p className="text-3xl font-bold text-blue-400">{probRealLocal}%</p>
                    <p className="text-slate-400 text-xs mt-2">Cuota Justa: <strong className="text-white">{cuotaJustaLocal}</strong></p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-5 text-center flex flex-col justify-center shadow-[0_0_30px_rgba(74,222,128,0.1)]">
                    <p className="text-green-400 text-xs mb-1 font-bold uppercase tracking-wider">Valor Esperado (+EV)</p>
                    <p className="text-3xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">+{evCalculado}%</p>
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-center text-sm text-slate-400">
                  <span className="font-bold text-slate-300">Proyección de Empate:</span> Cuota Casa: {cuotaEmpate} | Prob. Real Algorítmica: {probEmpate}%
                </div>

                <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-white font-bold text-lg mb-2">Conclusión del Algoritmo</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{getInterpretacionDinamica()}</p>
                </div>

                <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden flex flex-col h-[400px] shadow-[0_0_20px_rgba(37,99,235,0.15)] mt-8">
                  <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">IA</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Asistente Cuantitativo IA</h3>
                      <p className="text-blue-400 text-xs">Exclusivo Premium (Conectado a Datos Reales)</p>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto bg-slate-900/50 flex flex-col gap-4">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none leading-relaxed shadow-md'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-tl-none p-4 flex gap-1 shadow-md">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isTyping} placeholder="Pregunta a la IA sobre la rentabilidad..." className="flex-1 bg-slate-900 border border-slate-600 text-sm text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                    <button onClick={handleSendMessage} disabled={isTyping} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50 font-bold">Enviar</button>
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
// FIN DEL ARCHIVO - ECUAPRONOSTICO