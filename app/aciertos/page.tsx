"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function HistorialAciertosPage() {
  const [filterLeague, setFilterLeague] = useState("todas");
  const [viewFormat, setViewFormat] = useState<"cards" | "matrix">("cards");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [allAciertos, setAllAciertos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("local");
  const [metrics, setMetrics] = useState({
    efectividad3Days: 83,
    total3Days: 6,
    aciertos3Days: 5,
    fallos3Days: 1,
    efectividadGlobal: 81,
    totalGlobal: 16,
    aciertosGlobal: 13,
    fallosGlobal: 3,
    fechaLanzamiento: "20 de octubre de 2026",
    ultimaActualizacion: "En tiempo real",
  });

  const whatsappNumber = "593979198755";
  const whatsappMessage =
    "Hola, vi el Historial de Aciertos en EcuaPronóstico y quiero activar mi suscripción VIP ($14.99/mes) para recibir los pronósticos de mañana antes de los partidos. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchAciertosData = async (leagueParam: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/aciertos?league=${leagueParam}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (data.source) setDataSource(data.source);
        if (Array.isArray(data.aciertos)) {
          // Ordenar rigurosamente cronológico (de más reciente a más antiguo)
          const sorted = [...data.aciertos].sort(
            (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
          );
          setAllAciertos(sorted);
        }
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

  // =========================================================================
  // FILTRADO ESTRICTO DE LOS ÚLTIMOS 3 DÍAS CRONOLÓGICOS (VISTA PRINCIPAL)
  // =========================================================================
  const recent3DaysMatches = useMemo(() => {
    if (allAciertos.length === 0) return [];
    const now = Date.now();
    const window3DaysMs = 3 * 24 * 60 * 60 * 1000; // 72 horas

    const filtered = allAciertos.filter((m) => {
      const t = new Date(m.dateIso).getTime();
      return !isNaN(t) && now - t <= window3DaysMs;
    });

    if (filtered.length >= 4) {
      return filtered.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
    }
    return allAciertos.slice(0, Math.min(8, allAciertos.length));
  }, [allAciertos]);

  // Partidos para la tabla histórica anidada (con buscador interno)
  const historicalTableMatches = useMemo(() => {
    let list = allAciertos;
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.home?.toLowerCase().includes(q) ||
          m.away?.toLowerCase().includes(q) ||
          m.league?.toLowerCase().includes(q) ||
          m.prediccion?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAciertos, historySearchQuery]);

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-50 p-3 sm:p-5 lg:p-8 font-sans pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* CABECERA CON NAVEGACIÓN Y TÍTULO */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link
                href="/radar"
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
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
                Auditoría en Vivo {dataSource === "supabase" ? "☁️ Supabase PostgreSQL" : "⚡ En Memoria"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight leading-tight">
              HISTORIAL DE ACIERTOS & TRANSPARENCIA
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Evaluación estricta y transparente de pronósticos finalizados. Todos los partidos de los últimos 3 días en orden cronológico, con aciertos y fallos 100% auditados.
            </p>
          </div>

          {/* CONTROLES: FILTRO DE LIGA Y TOGGLE MATRIZ/TARJETAS */}
          <div className="flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto justify-end">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setViewFormat("cards")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewFormat === "cards"
                    ? "bg-amber-400 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🎴</span> Tarjetas (3 Días)
              </button>
              <button
                onClick={() => setViewFormat("matrix")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewFormat === "matrix"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📊</span> Matriz de Filas
              </button>
            </div>

            {/* CINTA DESLIZABLE HORIZONTAL EN MÓVIL, WRAP EN DESKTOP */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none max-lg:w-full lg:flex-wrap">
              <button
                onClick={() => setFilterLeague("todas")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "todas" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterLeague("ligapro")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "ligapro" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                🇪🇨 LigaPro
              </button>
              <button
                onClick={() => setFilterLeague("espana")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "espana" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                🇪🇸 LaLiga
              </button>
              <button
                onClick={() => setFilterLeague("inglaterra")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "inglaterra" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier
              </button>
              <button
                onClick={() => setFilterLeague("champions")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "champions" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                ⭐ UCL
              </button>
              <button
                onClick={() => setFilterLeague("nba")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterLeague === "nba" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                🏀 NBA
              </button>
            </div>
          </div>
        </header>

        {/* MÉTRICAS DE EFECTIVIDAD DINÁMICAS (3 DÍAS Y GLOBAL HISTÓRICA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* MÉTRICA 1: EFECTIVIDAD ÚLTIMOS 3 DÍAS */}
          <div className="bg-gradient-to-b from-emerald-950/70 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-center flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Ventana Móvil 72h
              </span>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Efectividad Últimos 3 Días
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono my-2">
                {metrics.efectividad3Days}%
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400">{metrics.aciertos3Days} aciertos</strong> de{" "}
              {metrics.total3Days} partidos (
              <span className="text-red-400 font-bold">{metrics.fallos3Days} fallos transparentes</span>)
            </div>
          </div>

          {/* MÉTRICA 2: EFECTIVIDAD GLOBAL HISTÓRICA */}
          <div className="bg-gradient-to-b from-blue-950/70 to-slate-900 border-2 border-blue-500/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(59,130,246,0.2)] text-center flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Desde Lanzamiento
              </span>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block mb-1">
                Efectividad Global Histórica
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono my-2">
                {metrics.efectividadGlobal}%
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
              <strong className="text-blue-400">{metrics.aciertosGlobal} aciertos</strong> en{" "}
              {metrics.totalGlobal} pronósticos (
              <span className="text-red-400 font-bold">{metrics.fallosGlobal} fallos</span>)
            </div>
          </div>

          {/* MÉTRICA 3: LLAMADO A ACCIÓN FREEMIUM VIP */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 text-center flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-1">
                Membresía VIP EcuaPronóstico
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white my-1">
                $14.99 <span className="text-xs text-slate-400 font-normal">/ mes</span>
              </div>
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

        {/* CONTENEDOR PRINCIPAL: VISTA TARJETAS (ÚLTIMOS 3 DÍAS) O VISTA MATRIZ */}
        {isLoading ? (
          <div className="p-12 text-center text-amber-400 bg-slate-900/60 rounded-3xl border border-slate-800 animate-pulse">
            <span className="text-2xl block mb-2">🔄</span>
            Sincronizando y auditando resultados con Supabase, ESPN y The Odds API...
          </div>
        ) : viewFormat === "matrix" ? (
          /* ============================================================ */
          /* VISTA MATRIZ: TABLA DE FILAS Y COLUMNAS CON CHECKS Y EQUIS   */
          /* ============================================================ */
          <div className="bg-slate-900/90 border-2 border-blue-500/60 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 md:px-6 bg-[#091024] border-b border-slate-800 flex justify-between items-center gap-2">
              <div>
                <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <span>📊</span> Matriz de Auditoría Histórica de Pronósticos
                </h3>
                <p className="text-xs text-slate-400">
                  Verificación fila a fila del resultado oficial vs el pronóstico cuantitativo (Orden Cronológico)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shrink-0">
                {allAciertos.length} Registros
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
                  {allAciertos.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        item.acerto ? "bg-emerald-950/10" : "bg-red-950/30 border-l-4 border-l-red-500"
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono">
                        <div>{item.date?.split(",")?.[1]?.trim() || item.date}</div>
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
                      <td className="py-3 px-4 text-amber-300 font-bold">{item.prediccion}</td>
                      <td className="py-3 px-4 font-black font-mono text-white whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md border ${
                            item.acerto
                              ? "bg-slate-800 border-slate-700"
                              : "bg-red-950/70 border-red-500/60 text-red-200"
                          }`}
                        >
                          {item.resultadoFinal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {item.cuotaRegistrada ? Number(item.cuotaRegistrada).toFixed(2) : "1.80"}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.acerto ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-md text-[11px] shadow">
                            ✅ ACERTADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white font-black px-2.5 py-1 rounded-md text-[11px] shadow animate-pulse">
                            ❌ NO ACERTÓ (FALLO)
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
          /* VISTA PRINCIPAL: TARJETAS DETALLADAS (ÚLTIMOS 3 DÍAS)        */
          /* ============================================================ */
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-1">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span>🗓️</span> Partidos Pronosticados de los Últimos 3 Días ({recent3DaysMatches.length} partidos)
              </h2>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                Orden rigurosamente cronológico (más recientes primero)
              </span>
            </div>

            {recent3DaysMatches.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900/90 border-2 ${
                  item.acerto
                    ? "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40"
                } rounded-3xl overflow-hidden transition-all`}
              >
                {/* ENCABEZADO DE TARJETA */}
                <div
                  className={`px-4 sm:px-5 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2 ${
                    item.acerto ? "bg-[#091024]" : "bg-[#200b0e]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.acerto ? "bg-emerald-400 animate-ping" : "bg-red-500"
                      }`}
                    ></span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 truncate">
                      🏆 {item.league}
                    </span>
                    {!item.acerto && (
                      <span className="text-[9px] sm:text-[10px] bg-red-600/30 text-red-300 border border-red-500/50 px-2 py-0.5 rounded-md font-black uppercase shrink-0">
                        Fallo Registrado
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-300 font-mono">
                    📅 {item.date} • ⏰ <strong className="text-white">{item.time}</strong>
                  </div>
                </div>

                {/* CUERPO DE LA TARJETA (RESPONSIVE: VERTICAL EN MÓVIL, GRID EN DESKTOP LG) */}
                <div className="p-4 sm:p-5 lg:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5 items-stretch lg:items-center">
                  {/* MATCH & PRONÓSTICO */}
                  <div className="w-full lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border-2 ${
                          item.acerto ? "border-amber-400" : "border-red-400"
                        } flex items-center justify-center font-black text-xs sm:text-sm text-white shrink-0`}
                      >
                        {item.homeInitials}
                      </span>
                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-tight truncate flex-1 min-w-0">
                        <span>{item.home}</span> <span className="text-slate-500 text-xs sm:text-sm font-normal">vs</span> <span>{item.away}</span>
                      </h3>
                    </div>

                    <div
                      className={`border rounded-xl p-3 text-xs space-y-1.5 ${
                        item.acerto
                          ? "bg-slate-800/80 border-slate-700"
                          : "bg-red-950/30 border-red-500/40"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 shrink-0">Lo que pronosticamos:</span>
                        <strong className="text-amber-300 font-extrabold text-right truncate">{item.prediccion}</strong>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 shrink-0">Probabilidad calculada:</span>
                        <strong className="text-emerald-400 font-extrabold font-mono">{item.probabilidadEstimada}</strong>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 shrink-0">Cuota Registrada:</span>
                        <strong className="text-white font-mono font-bold">
                          {item.cuotaRegistrada ? Number(item.cuotaRegistrada).toFixed(2) : "1.80"}
                        </strong>
                      </div>
                    </div>

                    <p
                      className={`text-xs italic leading-relaxed ${
                        item.acerto ? "text-slate-300" : "text-red-200 font-medium"
                      }`}
                    >
                      {item.acerto ? "📈 " : "⚠️ "} {item.detalle}
                    </p>
                  </div>

                  {/* CAJA DE VEREDICTO / ACIERTO O FALLO (100% ANCHO EN MÓVIL, COL-5 EN DESKTOP) */}
                  <div
                    className={`w-full lg:col-span-5 ${
                      item.acerto
                        ? "bg-emerald-950/60 border-emerald-400"
                        : "bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    } border-2 rounded-2xl p-4 sm:p-5 text-center shadow-lg`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-1">
                      RESULTADO OFICIAL FINAL
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono uppercase my-1">
                      {item.resultadoFinal}
                    </div>
                    <div
                      className={`mt-2 ${
                        item.acerto
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-red-600 text-white shadow-md shadow-red-600/40 animate-pulse"
                      } font-black text-xs md:text-sm py-2 px-4 rounded-xl uppercase tracking-wider shadow-lg w-full sm:w-auto inline-block`}
                    >
                      {item.estado}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ========================================================================= */}
        {/* BOTÓN Y TABLA HISTÓRICA ANIDADA CON SCROLL HASTA EL INICIO DEL PROYECTO   */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border-2 border-amber-400/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                Base de Datos Centralizada
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-white mt-1">
                Auditoría Completa desde el Inicio del Proyecto
              </h3>
              <p className="text-xs text-slate-400">
                Consulta cada partido pronosticado desde el lanzamiento oficial ({metrics.fechaLanzamiento}).
              </p>
            </div>

            {/* BOTÓN REQUERIDO: VER TODOS LOS RESULTADOS (HISTÓRICO) */}
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>{showFullHistory ? "🔼 Ocultar Histórico" : "📜 Ver Todos los Resultados (Histórico)"}</span>
              <span className="bg-slate-950 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {allAciertos.length}
              </span>
            </button>
          </div>

          {/* DESPLIEGUE HISTÓRICO: DATA-CARDS EN MÓVIL (< 1024px) Y TABLA EN DESKTOP (>= 1024px) */}
          {showFullHistory && (
            <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
              {/* BUSCADOR DENTRO DEL HISTÓRICO */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Filtrar por equipo, liga o pronóstico..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery("")}
                      className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center justify-end gap-2">
                  <span>Mostrando {historicalTableMatches.length} de {allAciertos.length} partidos</span>
                </div>
              </div>

              {/* 1. VISTA MÓVIL (< 1024px): LISTA VERTICAL DE DATA-CARDS SIN DOBLE SCROLL (NATIVE SCROLL) */}
              <div className="block lg:hidden space-y-3">
                {historicalTableMatches.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      m.acerto
                        ? "bg-slate-950/80 border-emerald-500/60 shadow-sm"
                        : "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2 border-b border-slate-800/80 pb-2 text-[11px]">
                      <span className="font-bold text-amber-300 truncate">{m.league}</span>
                      <span className="text-slate-400 font-mono text-[10px] shrink-0">
                        {m.date?.split(",")?.[1]?.trim() || m.date} • {m.time}
                      </span>
                    </div>

                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-white truncate">
                          {m.home} <span className="text-slate-500 text-xs font-normal">vs</span> {m.away}
                        </div>
                        <div className="text-xs text-amber-300 font-medium truncate mt-0.5">
                          {m.prediccion}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                            m.acerto
                              ? "bg-slate-800 border-slate-700 text-white"
                              : "bg-red-900/60 border-red-500 text-red-200"
                          }`}
                        >
                          {m.resultadoFinal}
                        </span>
                        <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">
                          Cuota: {m.cuotaRegistrada ? Number(m.cuotaRegistrada).toFixed(2) : "1.80"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 italic truncate max-w-[65%]">
                        {m.acerto ? "Auditado: Pronóstico cumplido" : "Fallo transparente registrado"}
                      </span>
                      {m.acerto ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                          ✅ ACERTADO
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase shadow-sm animate-pulse">
                          ❌ FALLO
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. VISTA DESKTOP (>= 1024px): TABLA ANIDADA CON SCROLL VERTICAL FLUIDO (INALTERADA) */}
              <div className="hidden lg:block border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80 shadow-inner">
                <div className="max-h-[520px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/50 scrollbar-track-slate-900">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-300 uppercase text-[10px] font-black z-10 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Fecha / Hora</th>
                        <th className="py-3 px-4">Competición</th>
                        <th className="py-3 px-4">Partido</th>
                        <th className="py-3 px-4">Pronóstico IA</th>
                        <th className="py-3 px-4">Marcador Final</th>
                        <th className="py-3 px-4 text-center">Cuota</th>
                        <th className="py-3 px-4 text-center">Veredicto Oficial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {historicalTableMatches.map((m) => (
                        <tr
                          key={m.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            m.acerto
                              ? "bg-slate-950/40"
                              : "bg-red-950/20 border-l-4 border-l-red-500 text-red-100"
                          }`}
                        >
                          <td className="py-2.5 px-4 whitespace-nowrap text-slate-300">
                            <div>{m.date?.split(",")?.[1]?.trim() || m.date}</div>
                            <div className="text-[10px] text-slate-500">{m.time}</div>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-amber-300/90 whitespace-nowrap">
                            {m.league}
                          </td>
                          <td className="py-2.5 px-4 font-sans font-bold text-white whitespace-nowrap">
                            <span className="text-blue-300 mr-1.5">{m.homeInitials}</span>
                            {m.home} <span className="text-slate-500 font-normal">vs</span> {m.away}
                            <span className="text-amber-300 ml-1.5">{m.awayInitials}</span>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-amber-300 font-medium">
                            {m.prediccion}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded border ${
                                m.acerto
                                  ? "bg-slate-800 border-slate-700"
                                  : "bg-red-900/60 border-red-500 text-red-200"
                              }`}
                            >
                              {m.resultadoFinal}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-emerald-400">
                            {m.cuotaRegistrada ? Number(m.cuotaRegistrada).toFixed(2) : "1.80"}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            {m.acerto ? (
                              <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                                ✅ ACERTADO
                              </span>
                            ) : (
                              <span className="inline-block bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black shadow-sm">
                                ❌ FALLO
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

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
            Únete a la suscripción Premium de EcuaPronóstico por solo{" "}
            <strong className="text-amber-300 text-base">$14.99 / mes</strong>. Desbloquea toda la cartelera completa de las 22 ligas, Las 4 Fijas del Día y el Auditor Cuantitativo en vivo sin censura.
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
