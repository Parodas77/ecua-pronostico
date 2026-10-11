"use client";
import { useState } from "react";

export default function EcuaPronosticoDashboard() {
  const [view, setView] = useState("basic");
  const [sport, setSport] = useState("football");
  const [league, setLeague] = useState("ligapro");
  const [match, setMatch] = useState("ldu-bsc");

  // Número de WhatsApp (Cambiar por el tuyo)
  const whatsappNumber = "593939197775"; 
  const whatsappMessage = "Hola, quiero activar mi suscripción Premium en EcuaPronóstico para acceder a las ventajas matemáticas. ¿Me ayudan con los datos de transferencia bancaria?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER Y NAVEGACIÓN */}
        <header className="mb-8 border-b border-slate-700 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            
            {/* LOGO GIGANTE FORZADO POR ALTURA */}
            <div className="w-full md:w-auto flex justify-center md:justify-start flex-1">
              <img 
                src="/logo.png" 
                alt="EcuaPronóstico Logo" 
                className="h-28 md:h-40 w-auto object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all hover:scale-105" 
              />
            </div>

            {/* SWITCHER BÁSICO / PREMIUM */}
            <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-xl shrink-0">
              <button
                onClick={() => setView("basic")}
                className={`px-6 py-3 text-sm font-bold rounded-lg transition-all ${
                  view === "basic" ? "bg-slate-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Vista Básica
              </button>
              <button
                onClick={() => setView("premium")}
                className={`px-6 py-3 text-sm font-bold rounded-lg transition-all ${
                  view === "premium" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "text-slate-400 hover:text-white"
                }`}
              >
                Vista Premium
              </button>
            </div>
          </div>

          {/* SELECTORES EN CASCADA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Deporte</label>
              <select 
                value={sport} 
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="football">Fútbol (Soccer)</option>
                <option value="mma">Artes Marciales Mixtas (UFC)</option>
                <option value="boxing">Boxeo</option>
                <option value="basketball">Básquetbol</option>
                <option value="baseball">Béisbol</option>
              </select>
            </div>
            
            <div className={`transition-opacity ${sport === 'football' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Competición</label>
              <select 
                value={league} 
                onChange={(e) => setLeague(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="ligapro">LigaPro Ecuador</option>
                <option value="champions">UEFA Champions League</option>
                <option value="conmebol">Copa Libertadores</option>
                <option value="premier">Premier League</option>
              </select>
            </div>

            <div className={`transition-opacity ${sport === 'football' && league === 'ligapro' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Evento Programado</label>
              <select 
                value={match} 
                onChange={(e) => setMatch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="ldu-bsc">LDU Quito vs Barcelona SC</option>
                <option value="idv-emelec">Ind. del Valle vs Emelec</option>
                <option value="auc-elf">Aucas vs El Nacional</option>
              </select>
            </div>
          </div>
        </header>

        {/* ESTADO SI EL DEPORTE NO ESTÁ DISPONIBLE */}
        {sport !== "football" && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-800/30 border border-slate-700 border-dashed rounded-xl">
            <svg className="w-16 h-16 text-blue-500 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <h2 className="text-2xl font-bold text-white mb-2">Modelo Matemático en Entrenamiento</h2>
            <p className="text-slate-400 max-w-lg">
              Nuestros algoritmos para <strong>{sport.toUpperCase()}</strong> están actualmente ingiriendo bases de datos históricas para calibrar la red neuronal. Estará disponible en el próximo trimestre.
            </p>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {sport === "football" && league === "ligapro" && match === "ldu-bsc" && (
          <div className="animate-fade-in">
            
            {/* CABECERA DEL PARTIDO */}
            <div className="rounded-xl p-6 mb-6 flex justify-between items-center bg-slate-800/80 border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center w-1/3">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xl mb-3 shadow-[0_0_15px_rgba(255,255,255,0.3)]">LDU</div>
                <h2 className="text-xl font-bold text-center">LDU Quito</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">Local - Altitud: 2,850 msnm</p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-3 whitespace-nowrap">LIGAPRO - FECHA 14</span>
                <p className="text-sm text-slate-300 font-medium text-center">Domingo, 11 de octubre de 2026<br /><span className="text-white text-xl font-bold mt-1 block">16:00 EST</span></p>
              </div>
              
              <div className="flex flex-col items-center w-1/3">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-black text-xl mb-3 shadow-[0_0_15px_rgba(250,204,21,0.3)]">BSC</div>
                <h2 className="text-xl font-bold text-center">Barcelona SC</h2>
                <p className="text-slate-400 text-xs mt-1 text-center">Visitante - Altitud: Nivel del mar</p>
              </div>
            </div>

            {/* SECCIÓN DE TRANSPARENCIA */}
            <div className="mb-6 bg-slate-800/40 border border-slate-700 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-blue-900/50 rounded-lg text-blue-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div className="w-full">
                <h4 className="text-white font-bold text-sm mb-2">Parámetros Ingeridos para esta Simulación (10,000 iteraciones):</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md">xG (Goles Esperados) Histórico</span>
                  <span className="text-xs font-semibold bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md">Fuerza de Ataque/Defensa (Poisson)</span>
                  <span className="text-xs font-semibold bg-red-900/50 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-md animate-pulse">Desgaste por Altitud (Factor K)</span>
                  <span className="text-xs font-semibold bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md">Posesión en 1/3 rival</span>
                </div>
              </div>
            </div>

            {/* VISTA BÁSICA CON BOTÓN DE WHATSAPP */}
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
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md flex flex-col justify-center items-center z-10 p-6">
                    <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Ventaja Matemática Oculta</h3>
                    <p className="text-slate-300 text-sm mb-6 max-w-lg leading-relaxed">Las casas de apuestas han cometido un error estadístico en este evento. Aprovecha el Valor Esperado (+EV) antes de que ajusten la cuota.</p>
                    
                    {/* BOTÓN WHATSAPP */}
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105 flex items-center gap-3 text-lg"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Activar Premium vía WhatsApp - $17.99
                    </a>
                  </div>
                  <div className="opacity-10 blur-md pointer-events-none">
                    <div className="h-6 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-20 bg-slate-700 rounded w-full mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA PREMIUM (Sin cambios estructurales) */}
            {view === "premium" && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Cuota Mercado</p>
                    <p className="text-4xl font-light text-white">2.15</p>
                    <p className="text-slate-500 text-xs mt-2">Probabilidad Implícita: 46.5%</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-6 text-center border-t-4 border-blue-500 shadow-lg">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Probabilidad Real</p>
                    <p className="text-4xl font-bold text-blue-400">61.3%</p>
                    <p className="text-slate-400 text-xs mt-2">Nuestra Cuota Justa: <strong className="text-white">1.63</strong></p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(74,222,128,0.1)]">
                    <p className="text-green-400 text-sm mb-1 uppercase tracking-wider font-bold">Valor Esperado (+EV)</p>
                    <p className="text-4xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">+14.8%</p>
                    <p className="text-green-500/70 text-xs mt-2">Alta Rentabilidad Detectada</p>
                  </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                    Conclusión del Algoritmo
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Al cruzar el poder ofensivo de LDU (xG) con el severo decaimiento físico proyectado para Barcelona SC debido a los 2,850 msnm, la red neuronal confirma que LDU ganará en un <strong>61.3%</strong> de los escenarios. Apostar bajo estas condiciones te otorga un margen de error a favor (Edge) del <strong>14.8%</strong>. Es una posición obligatoria.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}