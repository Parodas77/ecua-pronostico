"use client";
import { useState } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  const [match, setMatch] = useState("ldu-bsc");

  // ESTADOS DE AUTENTICACIÓN VIP (100% compatibles con Next.js estricto)
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

  // FUNCIONES DE LOGIN SIN TIPOS COMPLEJOS
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

  // DATOS DINÁMICOS SEGÚN EL PARTIDO SELECCIONADO (Lógica plana a prueba de fallos)
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
    } catch (error) {
      console.error(error);
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

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usuario / ID de Inversor</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: vip"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Clave de Acceso</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg">{loginError}</p>
                )}

                <button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all"
                >
                  Desbloquear Terminal
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-3">¿Aún no tienes tus credenciales de acceso?</p>
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm transition-all"
                >
                  Solicitar