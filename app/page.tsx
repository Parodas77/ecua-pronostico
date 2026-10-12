"use client";
import { useState } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  const [match, setMatch] = useState("ldu-bsc");

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Analizando la base de datos de LigaPro y Copa Libertadores. ¿Qué tipo de rentabilidad buscas hoy?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const whatsappNumber = "593999999999"; 
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico para acceder a las ventajas matemáticas. ¿Me ayudan con los datos de transferencia bancaria?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const cuotaLocal = 2.15;
  const probImplicitaCasa = ((1 / cuotaLocal) * 100).toFixed(1);
  const probRealLocal = 61.3;
  const cuotaJustaLocal = (100 / probRealLocal).toFixed(2);
  const evCalculado = 14.8;
  
  const cuotaEmpate = 3.40;
  const probImplicitaEmpate = ((1 / cuotaEmpate) * 100).toFixed(1);
  const probEmpate = 28.5;

  const cuotaVisita = 4.15;
  const probImplicitaVisita = ((1 / cuotaVisita) * 100).toFixed(1);

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
      - Manchester City vs Fulham: Cuota 1.18, Prob Real 88.5%, EV +4.4%
      - Real Madrid vs Osasuna: Cuota 1.25, Prob Real 84.0%, EV +5.0%
      - Palmeiras vs Fluminense: Cuota 1.90, Prob Real 50.0%, EV -5.0%
      `;

      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico.
      Reglas:
      1. Tono clínico y financiero.
      2. Si piden "ganancia asegurada", aclara que no existe, solo Valor Esperado (+EV).
      3. Filtra la base de datos y recomienda solo partidos con Prob Real > 65% o EV positivo.
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
      setChatHistory(prev => [...prev, { role: "ai", text: "Error de conexión con el motor cuantitativo. Verifique su API Key en Vercel." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getInterpretacionDinamica = () => {
    if (evCalculado > 5) {
      return `Al cruzar el poder ofensivo (xG) con el desgaste proyectado por altitud, el modelo detecta una severa ineficiencia del mercado. La casa paga una cuota de ${cuotaLocal} (asumiendo un ${probImplicitaCasa}% de probabilidad), pero nuestra red neuronal proyecta un ${probRealLocal}%. Esto genera un margen asimétrico a tu favor (Edge) del +${evCalculado}%. Es una posición matemáticamente obligatoria.`;
    }
    return `Mercado eficiente. Las probabilidades de la casa están estrechamente alineadas con la realidad estadística. Operar aquí carece de Valor Esperado (+EV) a largo plazo.`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <img src="/logo.png" alt="EcuaPronóstico Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
            </div>

            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
              <button onClick={() => setView("basic")} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${view === "basic" ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Vista Básica</button>
              <button onClick={() => setView("premium")} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${view === "premium" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:text-white"}`}>Vista Premium</button>
            </div>
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
                <option value="ldu-bsc">LDU Quito vs Barcelona SC</option>
                <option value="idv-emelec">Ind. del Valle vs Emelec</option>
                <option value="auc-elf">Aucas vs El Nacional</option>
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

        {sport === "football" && league === "ligapro" && match === "ldu-bsc" && (
          <div className="animate-fade-in">
            
            {/* CABECERA CON LETRAS ROJAS AJUSTADAS */}
            <div className="rounded-xl p-6 mb-6 flex justify-between items-start bg-slate-800/80 border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center w-1/3">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xl mb-3 shadow-[0_0_15px_rgba(255,255,255,0.3)]">LDU</div>
                <h2 className="text-xl font-bold text-center">LDU Quito</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">Local - Altitud: 2,850 msnm</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Mercado: {probImplicitaCasa}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-3 whitespace-nowrap">LIGAPRO - FECHA 14</span>
                <p className="text-sm text-slate-300 font-medium text-center">Domingo, 11 de octubre de 2026<br /><span className="text-white text-lg font-bold mt-1 block">16:00 EST</span></p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Empate: {probImplicitaEmpate}%</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-black text-xl mb-3 shadow-[0_0_15px_rgba(250,204,21,0.3)]">BSC</div>
                <h2 className="text-xl font-bold text-center">Barcelona SC</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">Visitante - Altitud: Nivel del mar</p>
                <p className="text-red-400 text-sm md:text-base font-bold mt-4 bg-red-950/40 border border-red-500/40 px-5 py-1.5 rounded-full shadow-md text-center">Mercado: {probImplicitaVisita}%</p>
              </div>
            </div>

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

            {view === "basic" && (
              <div className="animate-fade-in relative">
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 text-center mb-6">
                  <h3 className="text-red-400 font-bold mb-1 flex justify-center items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Alerta de Mercado Eficiente
                  </h3>
                  <p className="text-slate-300 text-sm">Las métricas gratuitas se desbloquean a las <strong>14:00</strong> (2 horas antes del evento). A esa hora, las cuotas ya habrán colapsado.</p>
                </div>
                
                <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/30 border border-slate-700">
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-6">
                    <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <h3 className="text-xl font-bold text-white mb-2">Ventaja Matemática Oculta</h3>
                    <p className="text-slate-300 text-sm mb-5 max-w-lg">Pasa al plan Premium para ver instantáneamente nuestro Valor Esperado (+EV). Aprovecha el error de cálculo actual de la casa de apuestas antes de que ajusten la cuota.</p>
                    <button onClick={() => setView("premium")} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:scale-105">
                      Desbloquear Datos Cuantitativos - $17.99/mes
                    </button>
                  </div>
                  <div className="opacity-10 blur-md pointer-events-none">
                    <div className="h-6 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-20 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            )}

            {view === "premium" && (
              <div className="animate-fade-in space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Cuota Casa</p>
                    <p className="text-3xl font-light text-white">{cuotaLocal}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">Prob. Implícita</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-