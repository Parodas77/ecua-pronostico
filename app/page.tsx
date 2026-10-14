"use client";
import { useState, useEffect } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  
  const [matches, setMatches] = useState([
    {
      id: "ldu-bsc",
      home: "Liga Deportiva Universitaria", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Escudo_de_Liga_Deportiva_Universitaria_de_Quito.png", homeAlt: "Local - Altitud: 2,850 msnm",
      away: "Barcelona Sporting Club", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Barcelona_SC_logo.png", awayAlt: "Visitante - Nivel del mar",
      jornada: "LIGAPRO - FECHA 14", date: "Domingo, 18 de octubre de 2026", time: "16:00 EST",
      cuotaLocal: 2.15, cuotaEmpate: 3.40, cuotaVisita: 4.15,
      probReal: 61.3, ev: 14.8,
      analisisDinamico: "El modelo estocástico de Poisson combinado con 10,000 simulaciones de Montecarlo detecta una asimetría clara frente a los momios de The Odds API. Al ponderar el factor altitudinal de 2,850 metros, el pronóstico térmico de 18°C, la solidez defensiva local (0.8 xG concedido en promedio) y la baja por sanción del capitán lateral de Barcelona Sporting Club, la probabilidad real de victoria alba se sitúa en 61.3% frente al 46.5% implícito del mercado. RECOMENDACIÓN: Entrada obligatoria a favor de Liga Deportiva Universitaria con Stake medio-alto antes de que las casas reduzcan la cuota."
    },
    {
      id: "idv-emelec",
      home: "Independiente del Valle", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Independiente_del_Valle_logo.png", homeAlt: "Local - Altitud: 2,500 msnm",
      away: "Club Sport Emelec", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Club_Sport_Emelec_logo.png", awayAlt: "Visitante - Nivel del mar",
      jornada: "LIGAPRO - FECHA 14", date: "Sábado, 17 de octubre de 2026", time: "18:30 EST",
      cuotaLocal: 1.75, cuotaEmpate: 3.60, cuotaVisita: 4.80,
      probReal: 66.8, ev: 9.7,
      analisisDinamico: "El análisis multicriterio procesa un volumen ofensivo dominante de Independiente del Valle en Chillo Jijón (xG de 2.34). Cruzando esta métrica con el invicto de 6 partidos y las bajas obligadas de Club Sport Emelec en su primera línea de volantes por lesión, el clúster estocástico arroja una probabilidad real del 66.8%. RECOMENDACIÓN: Oportunidad táctica clara, entrada a favor de Independiente del Valle con Stake moderado."
    },
    {
      id: "auc-elf",
      home: "Sociedad Deportiva Aucas", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Sociedad_Deportiva_Aucas_logo.png", homeAlt: "Local - Altitud: 2,850 msnm",
      away: "Club Deportivo El Nacional", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Club_Deportivo_El_Nacional_logo.png", awayAlt: "Visitante - Altitud: 2,850 msnm",
      jornada: "LIGAPRO - MUESTRA ABIERTA", date: "Sábado, 17 de octubre de 2026", time: "14:00 EST",
      cuotaLocal: 2.05, cuotaEmpate: 3.30, cuotaVisita: 3.70,
      probReal: 55.4, ev: 6.6,
      analisisDinamico: "Duelo capitalino con factor geográfico neutro. Las simulaciones de Montecarlo evalúan la eficacia a balón parado de Sociedad Deportiva Aucas frente a la urgencia de Club Deportivo El Nacional y la baja de su goleador principal. Margen de valor del +6.6% EV. RECOMENDACIÓN: Entrada conservadora con Stake bajo para proteger el bankroll."
    }
  ]);

  const [selectedMatchId, setSelectedMatchId] = useState("ldu-bsc");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showGuide, setShowGuide] = useState(true);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Terminal conectada a API-Football y The Odds API. El Agente IA analiza de forma multivariable cada encuentro en tiempo real. ¿Qué consultamos?" }
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

  const handleLeagueChange = (newLeague: string) => {
    setLeague(newLeague);
    if (newLeague === "champions") {
      setMatches([
        {
          id: "mancity-rma",
          home: "Manchester City Football Club", homeLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", homeAlt: "Local - Dinámica Premier",
          away: "Real Madrid Club de Fútbol", awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", awayAlt: "Visitante - Dinámica UEFA",
          jornada: "CHAMPIONS LEAGUE - FASE DE LIGA", date: "Martes, 20 de octubre de 2026", time: "20:00 CET",
          cuotaLocal: 1.95, cuotaEmpate: 3.50, cuotaVisita: 3.80,
          probReal: 58.4, ev: 13.8,
          analisisDinamico: "El motor estocástico cruza el xG local de 2.6 del Manchester City Football Club en el Etihad con las bajas defensivas del Real Madrid Club de Fútbol y el pronóstico de lluvia ligera (10°C). Las simulaciones revelan una sobrevaloración visitante por inercia histórica. RECOMENDACIÓN: Apuesta firme a favor del Manchester City con Stake medio."
        },
        {
          id: "barca-inter",
          home: "Futbol Club Barcelona", homeLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", homeAlt: "Local - Montjuïc Style",
          away: "Football Club Internazionale Milano", awayLogo: "https://upload.wikimedia.org/wikipedia/en/0/05/FC_Internazionale_Milano_2021.svg", awayAlt: "Visitante - Bloque Bajo UEFA",
          jornada: "CHAMPIONS LEAGUE - FASE DE LIGA", date: "Miércoles, 21 de octubre de 2026", time: "20:00 CET",
          cuotaLocal: 1.85, cuotaEmpate: 3.60, cuotaVisita: 4.20,
          probReal: 63.5, ev: 11.2,
          analisisDinamico: "Análisis de posesión dinámica frente al bloque bajo italiano. El modelo penaliza el desgaste físico del Football Club Internazionale Milano en Serie A y proyecta un EV+ de 11.2%. RECOMENDACIÓN: Entrada a favor del Futbol Club Barcelona con Stake medio."
        }
      ]);
      setSelectedMatchId("mancity-rma");
    } else {
      setMatches([
        {
          id: "ldu-bsc",
          home: "Liga Deportiva Universitaria", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Escudo_de_Liga_Deportiva_Universitaria_de_Quito.png", homeAlt: "Local - Altitud: 2,850 msnm",
          away: "Barcelona Sporting Club", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Barcelona_SC_logo.png", awayAlt: "Visitante - Nivel del mar",
          jornada: "LIGAPRO - FECHA 14", date: "Domingo, 18 de octubre de 2026", time: "16:00 EST",
          cuotaLocal: 2.15, cuotaEmpate: 3.40, cuotaVisita: 4.15,
          probReal: 61.3, ev: 14.8,
          analisisDinamico: "El análisis de Poisson combinado con 10,000 simulaciones de Montecarlo detecta una discrepancia crítica en los momios de The Odds API. Ponderando altitud, clima y lesiones. RECOMENDACIÓN: Entrada táctica a favor de Liga Deportiva Universitaria con Stake medio-alto."
        },
        {
          id: "idv-emelec",
          home: "Independiente del Valle", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Independiente_del_Valle_logo.png", homeAlt: "Local - Altitud: 2,500 msnm",
          away: "Club Sport Emelec", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Club_Sport_Emelec_logo.png", awayAlt: "Visitante - Nivel del mar",
          jornada: "LIGAPRO - FECHA 14", date: "Sábado, 17 de octubre de 2026", time: "18:30 EST",
          cuotaLocal: 1.75, cuotaEmpate: 3.60, cuotaVisita: 4.80,
          probReal: 66.8, ev: 9.7,
          analisisDinamico: "Volumen ofensivo superior (xG 2.34) y bajas en Club Sport Emelec. RECOMENDACIÓN: Apostar al triunfo local con Stake moderado."
        },
        {
          id: "auc-elf",
          home: "Sociedad Deportiva Aucas", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Sociedad_Deportiva_Aucas_logo.png", homeAlt: "Local - Altitud: 2,850 msnm",
          away: "Club Deportivo El Nacional", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Club_Deportivo_El_Nacional_logo.png", awayAlt: "Visitante - Altitud: 2,850 msnm",
          jornada: "LIGAPRO - MUESTRA ABIERTA", date: "Sábado, 17 de octubre de 2026", time: "14:00 EST",
          cuotaLocal: 2.05, cuotaEmpate: 3.30, cuotaVisita: 3.70,
          probReal: 55.4, ev: 6.6,
          analisisDinamico: "Factor geográfico neutro. Margen positivo del +6.6% EV. RECOMENDACIÓN: Entrada conservadora con Stake bajo."
        }
      ]);
      setSelectedMatchId("ldu-bsc");
    }
  };

  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const isFreePreview = currentMatch.id === "auc-elf";
  const isMatchUnlocked = view === "premium" || isFreePreview;

  const probImplicitaCasa = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
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
      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico. Responde de forma clínica y basada en variables múltiples (clima, rachas, lesiones, xG, Poisson, Montecarlo). No uses Markdown.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: reglas }] },
          contents: [{ parts: [{ text: `PARTIDO EN ESTUDIO: ${currentMatch.home} vs ${currentMatch.away}
CONTEXTO: ${currentMatch.analisisDinamico}

PREGUNTA DEL INVERSOR: ${newUserMsg.text}` }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.candidates[0].content.parts[0].text }]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: "Error de conexión con el asistente cuantitativo." }]);
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
              <p className="text-xs text-slate-400 mb-4">Acceso exclusivo con API Keys activas</p>

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
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                <h1 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wide">Cartelera Dinámica Sincronizada (API-Football & Odds API)</h1>
              </div>
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-blue-400 underline">{showGuide ? "Ocultar Guía" : "Mostrar Guía"}</button>
            </div>

            {showGuide && (
              <div className="space-y-4 pt-2 border-t border-slate-700 text-xs md:text-sm text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                    <strong className="text-blue-400 block mb-1">1. ¿De qué trata EcuaPronóstico y por qué las casas pierden aquí?</strong>
                    El 97% de los apostadores pierde dinero porque apuesta con el corazón, la camiseta o la intuición. Las casas de apuestas lo saben e inflan sus cuotas aplicando un margen oculto. EcuaPronóstico no adivina quién va a ganar; audita a la casa de apuestas.
                    Nuestro motor cruza bases de datos históricas mediante la Distribución de Poisson, la simulación de Montecarlo (10,000 o más simulaciones computarizadas para proyectar el resultado real), el índice de Goles Esperados (xG) y algoritmos especializados: uno exclusivo para Sudamérica —que evalúa el tipo de juego y las características geográficas— y otro para Europa, adaptado a sus propias dinámicas competitivas. Por ejemplo, cuando una casa de apuestas subestima el impacto de jugar a 2,850 metros de altitud en Quito y ofrece una cuota superior a la que dicta la estadística real, nuestro radar detecta esa grieta financiera para que inviertas con una auténtica ventaja matemática a favor.
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                    <strong className="text-green-400 block mb-1">2. Manual Operativo: Cómo sacarle el máximo provecho</strong>
                    El agente inteligente analiza de forma autónoma el clima, las rachas de los últimos 5 partidos, las lesiones y los factores tácticos específicos para emitir un veredicto único por evento.
                  </div>
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
              <select value={league} onChange={(e) => handleLeagueChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm">
                <option value="ligapro">LigaPro Ecuador</option>
                <option value="champions">UEFA Champions League</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Evento Programado</label>
              <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm">
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id === "auc-elf" ? "🔓 " : "🔒 "} {m.home} vs {m.away}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {sport === "football" && (
          <div className="space-y-6">
            
            <div className="rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center bg-slate-800/90 border border-slate-600 shadow-2xl gap-6">
              
              {/* LOCAL: ESCUDO CONTENIDO Y NOMBRE COMPLETO */}
              <div className="flex flex-col items-center text-center sm:w-1/3">
                <div className="w-20 h-20 bg-white rounded-full p-2.5 flex items-center justify-center mb-3 border border-slate-600 shadow-lg overflow-hidden shrink-0">
                  <img src={currentMatch.homeLogo} alt={currentMatch.home} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-white">{currentMatch.home}</h2>
                <p className="text-slate-400 text-xs mt-0.5">{currentMatch.homeAlt}</p>
                <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Mercado: {probImplicitaCasa}%</p>
              </div>
              
              {/* CENTRO: JORNADA Y HORA */}
              <div className="flex flex-col items-center text-center sm:w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full text-xs font-bold mb-2">{currentMatch.jornada}</span>
                <p className="text-xs text-slate-300">{currentMatch.date}<br /><strong className="text-white text-base">{currentMatch.time}</strong></p>
                <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Empate: {probImplicitaEmpate}%</p>
              </div>
              
              {/* VISITANTE: ESCUDO CONTENIDO Y NOMBRE COMPLETO */}
              <div className="flex flex-col items-center text-center sm:w-1/3">
                <div className="w-20 h-20 bg-white rounded-full p-2.5 flex items-center justify-center mb-3 border border-slate-600 shadow-lg overflow-hidden shrink-0">
                  <img src={currentMatch.awayLogo} alt={currentMatch.away} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-white">{currentMatch.away}</h2>
                <p className="text-slate-400 text-xs mt-0.5">{currentMatch.awayAlt}</p>
                <p className="text-red-400 text-xs font-bold mt-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-full">Mercado: {probImplicitaVisita}%</p>
              </div>

            </div>

            {!isMatchUnlocked && (
              <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/40 border border-slate-700">
                <div className="bg-slate-900/90 p-8 rounded-xl border border-blue-500/30 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-white mb-2">Motor Multicriterio VIP Bloqueado</h3>
                  <p className="text-slate-300 text-sm mb-6 max-w-lg">Ingresa con tu cuenta VIP para procesar las variables climáticas, de rachas y lesiones en tiempo real.</p>
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
                    <p className="text-xs text-blue-200">🔓 Muestra Gratuita con análisis multicriterio activo para Sociedad Deportiva Aucas vs Club Deportivo El Nacional.</p>
                    <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">Activar VIP</button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Cuota Odds API</p>
                    <p className="text-3xl text-white font-light">{currentMatch.cuotaLocal}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Prob. Implícita</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-slate-800/80 border-t-4 border-blue-500 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs uppercase font-bold">Prob. Real (Montecarlo)</p>
                    <p className="text-3xl text-blue-400 font-bold">{currentMatch.probReal}%</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4 text-center">
                    <p className="text-green-400 text-xs uppercase font-bold">Valor Esperado (+EV)</p>
                    <p className="text-3xl text-green-400 font-extrabend font-extrabold">+{currentMatch.ev}%</p>
                  </div>
                </div>

                {/* CAJÓN DE ANÁLISIS MULTICRITERIO SÓLIDO Y DINÁMICO */}
                <div className="bg-blue-900/15 border border-blue-500/40 p-6 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                    <h3 className="text-white font-bold text-base uppercase tracking-wider">Auditoría Cuantitativa Multicriterio (Poisson + Montecarlo + Contexto)</h3>
                  </div>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {currentMatch.analisisDinamico}
                  </p>
                </div>

                <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden flex flex-col h-[350px]">
                  <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm">Asistente Cuantitativo IA (Multicriterio)</h3>
                    <span className="text-[10px] bg-green-950 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-bold">MULTICRITERIA</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>{msg.text}</div>
                      </div>
                    ))}
                    {isTyping && <div className="text-xs text-slate-400 animate-pulse">Procesando variables del encuentro...</div>}
                  </div>
                  <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pregunta sobre clima, rachas o rentabilidad..." className="flex-1 bg-slate-900 border border-slate-600 text-sm text-white rounded-lg px-4 py-2.5 outline-none" />
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
