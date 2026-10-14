"use client";
import { useState, useEffect } from "react";

interface MatchMetrics {
  id: string;
  home: string;
  homeShort: string;
  homeColor: string;
  homeAlt: string;
  away: string;
  awayShort: string;
  awayColor: string;
  awayAlt: string;
  date: string;
  time: string;
  jornada: string;
  cuotaLocal: number;
  probRealLocal: number;
  evCalculado: number;
  cuotaEmpate: number;
  probEmpate: number;
  cuotaVisita: number;
  isFreePreview: boolean;
  analisis: string;
}

const MATCHES_DATA: Record<string, MatchMetrics> = {
  "ldu-bsc": {
    id: "ldu-bsc",
    home: "LDU Quito",
    homeShort: "LDU",
    homeColor: "bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]",
    homeAlt: "Local - Altitud: 2,850 msnm",
    away: "Barcelona SC",
    awayShort: "BSC",
    awayColor: "bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.3)]",
    awayAlt: "Visitante - Altitud: Nivel del mar",
    date: "Domingo, 18 de octubre de 2026",
    time: "16:00 EST",
    jornada: "LIGAPRO - FECHA 14",
    cuotaLocal: 2.15,
    probRealLocal: 61.3,
    evCalculado: 14.8,
    cuotaEmpate: 3.40,
    probEmpate: 28.5,
    cuotaVisita: 4.15,
    isFreePreview: false,
    analisis: "Al cruzar el poder ofensivo (xG) con el desgaste proyectado por altitud (2,850 msnm), el modelo detecta una severa ineficiencia del mercado. La casa paga una cuota de 2.15 (asumiendo un 46.5% de probabilidad), pero nuestra red neuronal proyecta un 61.3%. Esto genera un margen asimétrico a tu favor (Edge) del +14.8%. Es una posición matemáticamente obligatoria."
  },
  "idv-emelec": {
    id: "idv-emelec",
    home: "Ind. del Valle",
    homeShort: "IDV",
    homeColor: "bg-blue-900 text-white border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    homeAlt: "Local - Altitud: 2,500 msnm",
    away: "CS Emelec",
    awayShort: "EME",
    awayColor: "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    awayAlt: "Visitante - Altitud: Nivel del mar",
    date: "Sábado, 17 de octubre de 2026",
    time: "18:30 EST",
    jornada: "LIGAPRO - FECHA 14",
    cuotaLocal: 1.75,
    probRealLocal: 66.8,
    evCalculado: 9.7,
    cuotaEmpate: 3.60,
    probEmpate: 21.0,
    cuotaVisita: 4.80,
    isFreePreview: false,
    analisis: "Independiente del Valle registra el mayor volumen de generación en el último tercio (xG de 2.34 por partido en casa). Las casas de apuestas subestiman la transición rápida de IDV a 2,500 msnm frente al bloque bajo de Emelec. El Valor Esperado de +9.7% justifica entrada con Stake medio-alto."
  },
  "auc-elf": {
    id: "auc-elf",
    home: "SD Aucas",
    homeShort: "AUC",
    homeColor: "bg-yellow-500 text-red-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    homeAlt: "Local - Altitud: 2,850 msnm",
    away: "El Nacional",
    awayShort: "NAC",
    awayColor: "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]",
    awayAlt: "Visitante - Altitud: 2,850 msnm (Neutral)",
    date: "Sábado, 17 de octubre de 2026",
    time: "14:00 EST",
    jornada: "LIGAPRO - MUESTRA ABIERTA",
    cuotaLocal: 2.05,
    probRealLocal: 55.4,
    evCalculado: 6.6,
    cuotaEmpate: 3.30,
    probEmpate: 26.2,
    cuotaVisita: 3.70,
    isFreePreview: true,
    analisis: "[VISTA PREVIA GRATUITA] Al ser ambos equipos de altura, el 'Factor K' de desgaste hipobárico queda neutralizado (0.0%). Sin embargo, la métrica de Poisson favorece a SD Aucas por su efectividad de conversión a balón parado frente a la fragilidad defensiva aérea de El Nacional. Ventaja estadística moderada del +6.6%."
  }
};

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  const [match, setMatch] = useState("ldu-bsc");

  // ESTADOS DE AUTENTICACIÓN VIP
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ESTADO PARA MOSTRAR/OCULTAR LA GUÍA EDUCATIVA
  const [showGuide, setShowGuide] = useState(true);

  // ESTADOS DEL CHAT IA
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Analizando la base de datos de LigaPro y Copa Libertadores. ¿Qué tipo de rentabilidad buscas hoy?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999"; 
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($17.99/mes) para recibir mi usuario y contraseña VIP. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Recuperar sesión si ya ingresó antes
  useEffect(() => {
    const savedSession = localStorage.getItem("ecuapronostico_vip");
    if (savedSession === "true") {
      setIsAuthenticated(true);
      setView("premium");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = username.trim().toLowerCase();
    if ((validUser === "vip" || validUser === "admin" || validUser === "pedro") && password === "quant2026") {
      setIsAuthenticated(true);
      setView("premium");
      setShowLoginModal(false);
      setLoginError("");
      localStorage.setItem("ecuapronostico_vip", "true");
    } else {
      setLoginError("Credenciales inválidas. Verifica tu suscripción o solicita acceso vía WhatsApp.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView("basic");
    localStorage.removeItem("ecuapronostico_vip");
  };

  const handlePremiumSwitch = () => {
    if (isAuthenticated) {
      setView("premium");
    } else {
      setShowLoginModal(true);
    }
  };

  // Datos dinámicos según el partido seleccionado
  const currentMatch = MATCHES_DATA[match] || MATCHES_DATA["ldu-bsc"];
  const probImplicitaCasa = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
  const cuotaJustaLocal = (100 / currentMatch.probRealLocal).toFixed(2);
  const probImplicitaEmpate = ((1 / currentMatch.cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / currentMatch.cuotaVisita) * 100).toFixed(1);

  // Determinar si el partido actual muestra los datos desbloqueados
  const isMatchUnlocked = view === "premium" || currentMatch.isFreePreview;

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

      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico.
      Reglas:
      1. Tono clínico y financiero.
      2. Si piden "ganancia asegurada", aclara que no existe, solo Valor Esperado (+EV).
      3. Filtra la base de datos y recomienda solo partidos con Prob Real > 60% o EV positivo.
      4. NO USES FORMATO MARKDOWN. Escribe en texto plano y párrafos limpios.`;

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
        const aiText = data.candidates[0].content.parts[0].text;
        setChatHistory(prev => [...prev, { role: "ai", text: aiText }]);
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
        
        {/* MODAL DE LOGIN VIP */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in">
              <button 
                onClick={() => { setShowLoginModal(false); setLoginError(""); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Terminal Cuantitativa VIP</h3>
                  <p className="text-xs text-slate-400">Acceso exclusivo para miembros activos</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usuario / ID de Inversor</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: vip"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Clave de Acceso</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg">{loginError}</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all"
                >
                  Desbloquear Terminal
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-3">¿Aún no tienes tus credenciales de acceso?</p>
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm transition-all"
                >
                  Solicitar Suscripción por WhatsApp ($17.99/mes)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* HEADER Y NAVEGACIÓN */}
        <header className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <img src="/logo.png" alt="EcuaPronóstico Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
                <button 
                  onClick={() => setView("basic")} 
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${view === "basic" ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  Vista Básica
                </button>
                <button 
                  onClick={handlePremiumSwitch} 
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${view === "premium" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:text-white"}`}
                >
                  {!isAuthenticated && (
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                  )}
                  Vista Premium VIP
                </button>
              </div>

              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  title="Cerrar sesión VIP"
                  className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 px-3 py-2 rounded-lg bg-slate-800/50"
                >
                  Salir
                </button>
              )}
            </div>
          </div>

          {/* SECCIÓN EXPLICATIVA Y GUÍA DE USO (DESPLEGABLE) */}
          <div className="mb-6 bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-blue-950/30 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                <h1 className="text-base md:text-lg font-extrabold text-white uppercase tracking-wide">
                  Inteligencia Matemática Aplicada a Pronósticos Deportivos
                </h1>
              </div>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline shrink-0"
              >
                {showGuide ? "Ocultar Guía" : "Mostrar Guía y Video"}
              </button>
            </div>

            {showGuide && (
              <div className="space-y-6 animate-fade-in">
                {/* DOS COLUMNAS DE TEXTO EXPLICATIVO PROFUNDO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-700/70">
                  
                  {/* TEXTO 1: QUÉ ES Y POR QUÉ FUNCIONA */}
                  <div className="bg-slate-900/60 border border-slate-700/80 p-4 rounded-xl">
                    <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                      1. ¿De qué trata EcuaPronóstico y por qué las casas pierden aquí?
                    </h3>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-3">
                      El 97% de los apostadores pierde dinero porque apuesta con el corazón, la camiseta o la intuición. Las casas de apuestas lo saben e inflan sus cuotas aplicando un margen oculto. <strong>EcuaPronóstico no adivina quién va a ganar; Audita a la casa de apuestas.</strong>
                    </p>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      Nuestro motor cruza bases de datos históricas mediante la <strong>Distribución de Poisson</strong>, el índice de <strong>Goles Esperados (xG)</strong> y un algoritmo exclusivo para Sudamérica: el <strong>Factor K de Desgaste Hipobárico (Altitud)</strong>. Cuando una casa de apuestas subestima el impacto de jugar a 2,850 metros en Quito y paga una cuota más alta de lo que dicta la estadística real, nuestro radar detecta esa grieta financiera para que tú inviertas con ventaja matemática a favor.
                    </p>
                  </div>

                  {/* TEXTO 2: CÓMO SACARLE EL MÁXIMO PROVECHO */}
                  <div className="bg-slate-900/60 border border-slate-700/80 p-4 rounded-xl">
                    <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      2. Manual Operativo: Cómo sacarle el máximo provecho
                    </h3>
                    <ul className="text-slate-300 text-xs md:text-sm space-y-2.5 leading-relaxed">
                      <li>
                        <strong className="text-white">Paso A - Compara el Rojo vs. Azul:</strong> Bajo cada escudo verás en <span className="text-red-400 font-semibold">letras rojas</span> la probabilidad que la casa de apuestas cree que tiene el equipo. Compárala con nuestra <span className="text-blue-400 font-semibold">Probabilidad Real (Azul)</span>. Si nuestro porcentaje es mucho mayor que el de la casa, encontraste oro.
                      </li>
                      <li>
                        <strong className="text-white">Paso B - Regla de Oro del +EV:</strong> Jamás apuestes si el <strong>Valor Esperado (+EV)</strong> es negativo. Opera únicamente cuando la casilla verde marque <strong>+5% o más</strong>. Eso garantiza rentabilidad sostenida a mediano y largo plazo.
                      </li>
                      <li>
                        <strong className="text-white">Paso C - Consulta al Asistente IA:</strong> Usa el chat exclusivo abajo para preguntar cómo distribuir tu capital (Stake) del día o filtrar las mejores combinadas de baja varianza.
                      </li>
                    </ul>
                  </div>

                </div>

                {/* BANNER DE VIDEO DEMOSTRATIVO Y PRUEBA GRATIS */}
                <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">¿Quieres ver una demostración en vivo sin pagar un centavo?</h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Hemos liberado el partido <strong>SD Aucas vs El Nacional</strong> en el selector de abajo con todas las métricas Premium abiertas para que compruebes la potencia del algoritmo.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSport("football"); setLeague("ligapro"); setMatch("auc-elf"); }}
                    className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500 text-blue-300 hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shrink-0 whitespace-nowrap"
                  >
                    Ver Partido Gratis (Aucas vs El Nacional) →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SELECTORES EN CASCADA */}
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
            <svg className="w-16 h-16 text-blue-500 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <h2 className="text-2xl font-bold text-white mb-2">Modelo Matemático en Entrenamiento</h2>
            <p className="text-slate-400 max-w-lg">Nuestros algoritmos para <strong>{sport.toUpperCase()}</strong> están actualmente ingiriendo bases de datos históricas para calibrar la red neuronal. Estará disponible en el próximo trimestre.</p>
          </div>
        )}

        {sport === "football" && league === "ligapro" && (
          <div className="animate-fade-in">
            
            {/* CABECERA CON LETRAS ROJAS AJUSTADAS (INTACTA) */}
            <div className="rounded-xl p-6 mb-6 flex justify-between items-start bg-slate-800/80 border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mb-3 ${currentMatch.homeColor}`}>
                  {currentMatch.homeShort}
                </div>
                <h2 className="text-xl font-bold text-center">{currentMatch.home}</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">{currentMatch.homeAlt}</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">
                  Mercado: {probImplicitaCasa}%
                </p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-3 whitespace-nowrap">
                  {currentMatch.jornada}
                </span>
                <p className="text-sm text-slate-300 font-medium text-center">
                  {currentMatch.date}<br />
                  <span className="text-white text-lg font-bold mt-1 block">{currentMatch.time}</span>
                </p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">
                  Empate: {probImplicitaEmpate}%
                </p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mb-3 ${currentMatch.awayColor}`}>
                  {currentMatch.awayShort}
                </div>
                <h2 className="text-xl font-bold text-center">{currentMatch.away}</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">{currentMatch.awayAlt}</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">
                  Mercado: {probImplicitaVisita}%
                </p>
              </div>
            </div>

            {/* SECCIÓN DE TRANSPARENCIA (INTACTA) */}
            <div className="mb-6 bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400 mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Parámetros Ingeridos para esta Simulación (10,000 iteraciones):</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">xG (Goles Esperados) Histórico</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Fuerza de Ataque/Defensa (Poisson)</span>
                  <span className="text-xs bg-red-900/40 text-red-300 border border-red-500/30 px-2 py-1 rounded">Desgaste por Altitud (Factor K)</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Posesión en 1/3 rival</span>
                </div>
              </div>
            </div>

            {/* BLOQUEADO SI NO ES VIP Y NO ES EL PARTIDO DE MUESTRA GRATIS */}
            {!isMatchUnlocked && (
              <div className="animate-fade-in relative">
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 text-center mb-6">
                  <h3 className="text-red-400 font-bold mb-1 flex justify-center items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Ineficiencia Severa Detectada en {currentMatch.home} vs {currentMatch.away}
                  </h3>
                  <p className="text-slate-300 text-sm">Las métricas gratuitas se desbloquean 2 horas antes del partido. A esa hora, las cuotas ya habrán colapsado. <strong>(Prueba el partido Aucas vs El Nacional en el selector arriba para ver una muestra abierta).</strong></p>
                </div>
                
                <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/30 border border-slate-700">
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-6">
                    <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <h3 className="text-xl font-bold text-white mb-2">Ventaja Matemática Oculta (+EV)</h3>
                    <p className="text-slate-300 text-sm mb-6 max-w-lg">Ingresa con tu cuenta VIP para desbloquear la Probabilidad Real, la Cuota Justa y el Asistente Cuantitativo IA en todos los partidos de la jornada.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => setShowLoginModal(true)} 
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:scale-105"
                      >
                        Iniciar Sesión VIP
                      </button>
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
                      >
                        Comprar Acceso - $17.99/mes
                      </a>
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

            {/* VISTA DESBLOQUEADA (SI ES MIEMBRO VIP O SI ELIGIÓ EL PARTIDO DE MUESTRA GRATIS) */}
            {isMatchUnlocked && (
              <div className="animate-fade-in space-y-6">
                
                {currentMatch.isFreePreview && !isAuthenticated && (
                  <div className="bg-blue-950/60 border border-blue-400/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs md:text-sm text-blue-200">
                      🔓 <strong>Estás viendo una Muestra Gratuita de las métricas Premium.</strong> Para desbloquear el partido estelar (LDU vs BSC con +14.8% EV) y el Asistente IA, activa tu cuenta VIP.
                    </p>
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0"
                    >
                      Activar Cuenta VIP
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Cuota Casa</p>
                    <p className="text-3xl font-light text-white">{currentMatch.cuotaLocal.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Prob. Implícita</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-5 text-center border-t-4 border-blue-500 flex flex-col justify-center shadow-lg">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Prob. Real</p>
                    <p className="text-3xl font-bold text-blue-400">{currentMatch.probRealLocal}%</p>
                    <p className="text-slate-400 text-xs mt-2">Cuota Justa: <strong className="text-white">{cuotaJustaLocal}</strong></p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-5 text-center flex flex-col justify-center shadow-[0_0_30px_rgba(74,222,128,0.1)]">
                    <p className="text-green-400 text-xs mb-1 font-bold uppercase tracking-wider">Valor Esperado (+EV)</p>
                    <p className="text-3xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">+{currentMatch.evCalculado}%</p>
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-center text-sm text-slate-400">
                  <span className="font-bold text-slate-300">Proyección de Empate:</span> Cuota Casa: {currentMatch.cuotaEmpate.toFixed(2)} | Prob. Real Algorítmica: {currentMatch.probEmpate}%
                </div>

                <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                    Conclusión del Algoritmo
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {currentMatch.analisis}
                  </p>
                </div>

                {/* ASISTENTE IA EN VIVO */}
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
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isTyping}
                      placeholder="Pregunta a la IA sobre la rentabilidad..." 
                      className="flex-1 bg-slate-900 border border-slate-600 text-sm text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button onClick={handleSendMessage} disabled={isTyping} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50 font-bold">
                      Enviar
                    </button>
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