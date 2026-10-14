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

  const currentMatch = MATCHES_DATA[match] || MATCHES_DATA["ldu-bsc"];
  const probImplicitaCasa = ((1 / currentMatch.cuotaLocal) * 100).toFixed(1);
  const cuotaJustaLocal = (100 / currentMatch.probRealLocal).toFixed(2);
  const probImplicitaEmpate = ((1 / currentMatch.cuotaEmpate) * 100).toFixed(1);
  const probImplicitaVisita = ((1 / currentMatch.cuotaVisita) * 100).toFixed(1);

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
                on