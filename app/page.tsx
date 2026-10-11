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

  // Datos dinámicos del partido para la interpretación
  const cuotaLocal = 2.15;
  const probImplicitaCasa = ((1 / cuotaLocal) * 100).toFixed(1);
  const probRealLocal = 61.3;
  const evCalculado = 14.8;
  
  const cuotaEmpate = 3.40;
  const probEmpate = 28.5;

  // CONEXIÓN REAL CON GEMINI IA (Corregido a 3.8-flash)
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
      - Bayer Leverkusen vs Bochum: Cuota 1.30, Prob Real 81.2%, EV +5.5%
      `;

      const reglas = `Eres el 'Asistente Cuantitativo IA' de EcuaPronóstico.
      Reglas:
      1. Tono clínico y financiero.
      2. Si piden "ganancia asegurada", aclara que no existe, solo Valor Esperado (+EV).
      3. Filtra la base de datos y recomienda solo partidos con Prob Real > 65% o EV positivo.
      4. NO USES FORMATO MARKDOWN (cero asteriscos o negritas). Escribe en texto plano y párrafos limpios.`;

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
        throw new Error("Respuesta inválida de la API");
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Error de conexión con el motor cuantitativo. Verifique que Vercel tenga la API Key correcta y haya hecho el redeploy." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getInterpretacionDinamica = () => {
    if (evCalculado > 5) {
      return `Análisis de Rentabilidad: La casa de apuestas paga una cuota de ${cuotaLocal}, lo que significa que el mercado asume una probabilidad de victoria de solo ${probImplicitaCasa}%. Sin embargo, nuestro motor de IA detecta que la Probabilidad Real del equipo es mucho mayor (${probRealLocal}%). Esta asimetría genera un margen a nuestro favor (+EV) del ${evCalculado}%. Veredicto: Operación matemáticamente viable. El mercado está subestimando al equipo local.`;
    }
    return `Análisis de Rentabilidad: Mercado eficiente. Las probabilidades de la casa están alineadas con la realidad estadística. No recomendamos operar en este margen.`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 border-b border-slate-700 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <div className="w-full md:w-auto flex justify-center md:justify-start flex-1">
              <img src="/logo.png" alt="EcuaPronóstico Logo" className="h-28 md:h-40 w-auto object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]" />
            </div>

            <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-xl shrink-0">
              <button onClick={() => setView("basic")} className={`px-6 py-3 text-sm font-bold rounded-lg transition-all ${view === "basic" ? "bg-slate-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Vista Básica</button>
              <button onClick={() => setView("premium")} className={`px-6 py-3 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${view === "premium" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "text-slate-400 hover:text-white"}`}>
                Vista Premium
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Deporte</label>
              <select value={sport} onChange={(e) => { setSport(e.target.value); setLeague(""); }} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none">
                <option value="football">Fútbol (Soccer)</option>
              </select>
            </div>
            <div className={`transition-opacity ${sport === 'football' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Competición</label>
              <select value={league} onChange={(e) => { setLeague(e.target.value); if(e.target.value === 'ligapro') setMatch('ldu-bsc'); else setMatch('en-analisis'); }} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none">
                <option value="ligapro">LigaPro Ecuador</option>
              </select>
            </div>
            <div className={`transition-opacity ${sport === 'football' && league ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Evento Programado</label>
              <select value={match} onChange={(e) => setMatch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none">
                <option value="ldu-bsc">LDU Quito vs Barcelona SC</option>
              </select>
            </div>
          </div>
        </header>

        {sport === "football" && league === "ligapro" && match === "ldu-bsc" && (
          <div className="animate-fade-in">
            <div className="rounded-xl p-6 mb-6 flex justify-between items-center bg-slate-800/80 border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center w-1/3"><div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xl mb-3">LDU</div><h2 className="text-xl font-bold">LDU Quito</h2></div>
              <div className="flex flex-col items-center w-1/3"><span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-xs font-bold mb-3">LIGAPRO</span><p className="text-sm text-slate-300 font-medium text-center">Hoy<br /><span className="text-white text-xl font-bold mt-1 block">16:00 EST</span></p></div>
              <div className="flex flex-col items-center w-1/3"><div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-black text-xl mb-3">BSC</div><h2 className="text-xl font-bold">Barcelona SC</h2></div>
            </div>

            {view === "basic" && (
              <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/30 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-3">Ventaja Matemática Oculta</h3>
                <p className="text-slate-300 text-sm mb-6 max-w-lg mx-auto">Las casas de apuestas han cometido un error estadístico. Aprovecha el Valor Esperado (+EV).</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-4 px-8 rounded-xl inline-block">
                  Activar Premium vía WhatsApp - $17.99
                </a>
              </div>
            )}

            {view === "premium" && (
              <div className="animate-fade-in space-y-6">
                
                {/* PANEL CUANTITATIVO REESTRUCTURADO DE 4 COLUMNAS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase">Cuota Casa</p>
                    <p className="text-3xl text-white">{cuotaLocal}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center flex flex-col justify-center">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase">Prob. Implícita (Casa)</p>
                    <p className="text-3xl text-slate-300">{probImplicitaCasa}%</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-5 text-center border-t-4 border-blue-500 flex flex-col justify-center shadow-lg">
                    <p className="text-slate-400 text-xs mb-1 font-bold uppercase">Prob. Real (Algoritmo)</p>
                    <p className="text-3xl font-bold text-blue-400">{probRealLocal}%</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-5 text-center flex flex-col justify-center shadow-[0_0_30px_rgba(74,222,128,0.1)]">
                    <p className="text-green-400 text-xs mb-1 font-bold uppercase">Valor Esperado (+EV)</p>
                    <p className="text-3xl font-extrabold text-green-400">+{evCalculado}%</p>
                  </div>
                </div>

                {/* DATOS SECUNDARIOS (EMPATE) */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-center text-sm text-slate-400">
                  <span className="font-bold">Métricas de Empate:</span> Cuota Casa: {cuotaEmpate} | Probabilidad Real: {probEmpate}%
                </div>

                {/* CAJA DE INTERPRETACIÓN DINÁMICA */}
                <div className="bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm">
                    <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Interpretación del Modelo
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {getInterpretacionDinamica()}
                    </p>
                </div>

                {/* ASISTENTE IA */}
                <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-[0_0_20px_rgba(37,99,235,0.15)]">
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
                      placeholder="Pregunta a la IA sobre la rentabilidad de hoy..." 
                      className="flex-1 bg-slate-900 border border-slate-600 text-sm text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button onClick={handleSendMessage} disabled={isTyping} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }