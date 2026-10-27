"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HistorialAciertosPage() {
  const [filterLeague, setFilterLeague] = useState("todas");
  const [viewFormat, setViewFormat] = useState<"cards" | "matrix">("cards");
  const [aciertos, setAciertos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    efectividad48h: 83,
    total48h: 6,
    aciertos48h: 5,
    fallos48h: 1,
    efectividadGlobal: 80,
    totalGlobal: 10,
    aciertosGlobal: 8,
    fallosGlobal: 2,
    fechaLanzamiento: "20 de octubre de 2026",
    ultimaActualizacion: "En tiempo real",
  });

  const whatsappNumber = "593979198755";
  const whatsappMessage = "Hola, vi el Historial de Aciertos en EcuaPronóstico y quiero activar mi suscripción VIP ($14.99/mes) para recibir los pronósticos de mañana antes de los partidos. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchAciertosData = async (leagueParam: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/aciertos?league=${leagueParam}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.aciertos)) setAciertos(data.aciertos);
      }
    } catch (e) {
      console.error("Error al cargar historial de aciertos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAciertosData(filterLeague);
  }, [filterLeague]);

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABECERA CON NAVEGACIÓN Y TÍTULO */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Link 
                href="/radar" 
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              >
                ← Volver al Radar
              </Link>
              <Link 
                href="/" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              >
                🏠 Portada
              </Link>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Auditoría Automática en Vivo (IA + ESPN)
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight">
              HISTORIAL DE ACIERTOS COMPROBADOS
            </h1>
            <p className="text-xs text-slate-400">
              Evaluación estricta y transparente de pronósticos finalizados. Base de datos auditada automáticamente sin intervención humana.
            </p>
          </div>

          {/* CONTROLES: FILTRO DE LIGA Y TOGGLE MATRIZ/TARJETAS */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewFormat("cards")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewFormat === "cards" ? "bg-amber-400 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🃏</span> Tarjetas
              </button>
              <button
                onClick={() => setViewFormat("matrix")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewFormat === "matrix" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📊</span> Matriz de Filas
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setFilterLeague("todas")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${filterLeague === "todas" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilterLeague("ligapro")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${filterLeague === "ligapro" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"}`}
              >
                🇪🇨 LigaPro
              </button>
              <button 
                onClick={() => setFilterLeague("espana")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${filterLeague === "espana" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"}`}
              >
                🇪🇸 LaLiga
              </button>
            </div>
          </div>
        </header>

        {/* MÉTRICAS DE EFECTIVIDAD DINÁMICAS (48H Y GLOBAL HISTÓRICA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MÉTRICA 1: EFECTIVIDAD ÚLTIMAS 48 HORAS */}
          <div className="bg-gradient-to-b from-emerald-950/70 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-center flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Ventana Móvil 48h
              </span>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Efectividad Últimas 48 Horas
              </span>
              <div className="text-4xl md:text-5xl font-black text-white font-mono my-2">
                {metrics.efectividad48h}%
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400">{metrics.aciertos48h} aciertos</strong> de {metrics.total48h} partidos disputados ({metrics.fallos48h} fallos)
            </div>
          </div>

          {/* MÉTRICA 2: EFECTIVIDAD GLOBAL HISTÓRICA */}
          <div className="bg-gradient-to-b from-blue-950/70 to-slate-900 border-2 border-blue-500/80 rounded-2xl p-5 shadow-[0_0_25px_rgba(59,130,246,0.2)] text-center flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Oficial desde Hoy
              </span>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block mb-1">
                Efectividad Global Histórica
              </span>
              <div className="text-4xl md:text-5xl font-black text-white font-mono my-2">
                {metrics.efectividadGlobal}%
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
              <strong className="text-blue-400">{metrics.aciertosGlobal} aciertos totales</strong> en {metrics.totalGlobal} pronósticos auditados
            </div>
          </div>

          {/* MÉTRICA 3: LLAMADO A ACCIÓN FREEMIUM VIP */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-400/80 rounded-2xl p-5 text-center flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-1">
                Membresía VIP Ecuapronóstico
              </span>
              <div className="text-3xl font-black text-white my-1">$14.99 <span className="text-xs text-slate-400 font-normal">/ mes</span></div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Acceso a Las 4 Fijas del Día y pronósticos de mañana antes del inicio
              </p>
            </div>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase"
            >
              <span>📲</span> Activar VIP por WhatsApp
            </a>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: VISTA TARJETAS O VISTA MATRIZ */}
        {isLoading ? (
          <div className="p-12 text-center text-amber-400 bg-slate-900/60 rounded-3xl border border-slate-800 animate-pulse">
            <span className="text-2xl block mb-2">🔄</span>
            Sincronizando y auditando resultados con ESPN y API-Football...
          </div>
        ) : viewFormat === "matrix" ? (
          /* ============================================================ */
          /* VISTA MATRIZ: TABLA DE FILAS Y COLUMNAS CON CHECKS VERDES    */
          /* ============================================================ */
          <div className="bg-slate-900/90 border-2 border-blue-500/60 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 md:px-6 bg-[#091024] border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <span>📊</span> Matriz de Auditoría Histórica de Pronósticos
                </h3>
                <p className="text-xs text-slate-400">Verificación fila a fila del resultado oficial vs el pronóstico cuantitativo</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {aciertos.length} Registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Competición</th>
                    <th className="py-3 px-4">Partido Disputado</th>
                    <th className="py-3 px-4">Pronóstico Emitido</th>
                    <th className="py-3 px-4">Marcador Final Real</th>
                    <th className="py-3 px-4 text-center">Cuota</th>
                    <th className="py-3 px-4 text-center">Veredicto IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {aciertos.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/50 transition-colors ${
                        item.acerto ? "bg-emerald-950/10" : "bg-red-950/10"
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono">
                        <div>{item.date.split(",")[1]?.trim() || item.date}</div>
                        <div className="text-[10px] text-slate-500">{item.time}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-300/90 whitespace-nowrap">
                        {item.league}
                      </td>
                      <td className="py-3 px-4 font-black text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-blue-300 border border-slate-700">
                            {item.homeInitials}
                          </span>
                          <span>{item.home}</span>
                          <span className="text-slate-500 text-[10px]">vs</span>
                          <span>{item.away}</span>
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-amber-300 border border-slate-700">
                            {item.awayInitials}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-bold">
                        {item.prediccion}
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-white whitespace-nowrap">
                        <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                          {item.resultadoFinal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {item.cuotaRegistrada ? item.cuotaRegistrada.toFixed(2) : "1.80"}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.acerto ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-md text-[11px] shadow">
                            ✓ ACERTADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white font-black px-2.5 py-1 rounded-md text-[11px] shadow">
                            ✕ NO ACERTÓ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* VISTA TARJETAS DETALLADAS                                    */
          /* ============================================================ */
          <section className="space-y-4">
            {aciertos.map((item) => (
              <div 
                key={item.id}
                className={`bg-slate-900/90 border-2 ${
                  item.acerto ? "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-red-500/80"
                } rounded-3xl overflow-hidden shadow-xl transition-all`}
              >
                {/* ENCABEZADO DE TARJETA */}
                <div className="bg-[#091024] px-5 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.acerto ? "bg-emerald-400 animate-ping" : "bg-red-400"}`}></span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      🟡 {item.league}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-300 font-mono">
                    📅 {item.date} • ⏰ <strong className="text-white">{item.time}</strong>
                  </div>
                </div>

                {/* CUERPO DE LA TARJETA */}
                <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* MATCH & PRONÓSTICO */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center font-black text-sm text-white shrink-0">
                        {item.homeInitials}
                      </span>
                      <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                        {item.home} <span className="text-slate-500 text-sm font-normal">vs</span> {item.away}
                      </h3>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lo que pronosticamos:</span>
                        <strong className="text-amber-300 font-extrabold">{item.prediccion}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Probabilidad calculada en Montecarlo:</span>
                        <strong className="text-emerald-400 font-extrabold">{item.probabilidadEstimada}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      💡 {item.detalle}
                    </p>
                  </div>

                  {/* CAJA DE VEREDICTO / ACIERTO */}
                  <div className={`md:col-span-5 ${
                    item.acerto ? "bg-emerald-950/60 border-emerald-400" : "bg-red-950/60 border-red-400"
                  } border-2 rounded-2xl p-5 text-center shadow-lg`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-1">
                      RESULTADO OFICIAL FINAL (ESPN)
                    </span>
                    <div className="text-xl md:text-2xl font-black text-white font-mono uppercase my-1">
                      {item.resultadoFinal}
                    </div>
                    <div className={`mt-2 ${
                      item.acerto ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-white"
                    } font-black text-xs md:text-sm py-2 px-4 rounded-xl uppercase tracking-wider shadow-lg inline-block`}>
                      {item.estado}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </section>
        )}

        {/* PIE CON LLAMADO A LA ACCIÓN (CTA) FREEMIUM HACIA SUSCRIPCIÓN VIP */}
        <footer className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-2 border-amber-400/70 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
          <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest">
            Suscripción VIP Exclusiva
          </span>
          <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
            ¿Quieres recibir los pronósticos de mañana antes de que inicien los partidos?
          </h3>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Únete a la suscripción Premium de EcuaPronóstico por solo <strong className="text-amber-300 text-base">$14.99 / mes</strong>. Desbloquea toda la cartelera completa de las 22 ligas, Las 4 Fijas del Día y el Auditor Cuantitativo en vivo sin censura.
          </p>
          <div className="pt-2">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black px-8 py-4 rounded-2xl text-xs md:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105"
            >
              📲 Solicitar Membresía VIP por WhatsApp (+593 97 919 8755)
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
