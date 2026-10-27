"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VIP_SESSION_KEY = "ecuapronostico_vip_session_v1";
const VIP_INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas

export default function LandingPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasActiveVip, setHasActiveVip] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const whatsappNumber = "593979198755";
  const whatsappMessage =
    "Hola, quiero activar mi membresía VIP en EcuaPronóstico ($14.99/mes) para desbloquear todas las ligas y Las 4 Fijas del Día. ¿Me ayudan con los datos de pago?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIP_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const now = Date.now();
        const lastActivity = Number(session.lastActivity || session.timestamp || 0);
        if (session.authenticated && now - lastActivity < VIP_INACTIVITY_LIMIT_MS) {
          setHasActiveVip(true);
        }
      }
    } catch {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isMasterAdmin =
      (validUser === "admin" || validUser === "pedro") &&
      (cleanPass === "AdminEcua2026$Master" || cleanPass === "ecuapronostico2026@");

    const isVipUser =
      validUser === "vip" &&
      (cleanPass === "ecuapronostico2026@" || cleanPass === "AdminEcua2026$Master");

    if (isMasterAdmin || isVipUser) {
      try {
        const session = {
          authenticated: true,
          username: validUser,
          role: isMasterAdmin ? "admin" : "vip",
          lastActivity: Date.now(),
        };
        localStorage.setItem(VIP_SESSION_KEY, JSON.stringify(session));
      } catch {}
      setShowLoginModal(false);
      setLoginError("");
      router.push("/radar");
    } else {
      setLoginError("Usuario o contraseña incorrectos. Verifica tus credenciales de acceso.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-[65%] -right-40 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[160px]" />
      </div>

      {/* BANNER DE SESIÓN VIP ACTIVA (SI APLICA) */}
      {hasActiveVip && (
        <div className="relative z-30 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border-b border-amber-400/50 py-2.5 px-4 text-center text-xs md:text-sm font-black text-amber-200 flex items-center justify-center gap-3">
          <span>⭐ Tienes una sesión VIP activa en este dispositivo.</span>
          <Link
            href="/radar"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg text-xs font-black uppercase transition-all shadow"
          >
            Entrar a la Terminal VIP →
          </Link>
        </div>
      )}

      {/* MODAL DE LOGIN VIP */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-amber-400/70 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-[0_0_50px_rgba(251,191,36,0.35)] relative overflow-hidden">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700 transition-all hover:border-slate-500"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow mb-2">
                ⭐ ACCESO A MIEMBROS VIP
              </span>
              <h3 className="text-2xl font-black text-white">Ingreso a la Terminal</h3>
              <p className="text-xs text-slate-300 mt-1">
                Ingresa con tu usuario y contraseña de suscriptor activo
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                  Usuario VIP
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario (ej: vip o admin)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none text-sm focus:border-amber-400 transition"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                  Contraseña VIP
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña secreta"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none text-sm focus:border-amber-400 transition"
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-300 bg-red-950/60 border border-red-500/50 p-2.5 rounded-xl font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Ingresar a la Terminal VIP
              </button>

              <div className="pt-3 border-t border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 block mb-2">¿Aún no tienes membresía activa?</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Adquirir por WhatsApp por solo $14.99/mes →
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN SUPERIOR */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#070d1e]/90 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Ecuapronóstico"
              className="h-11 sm:h-13 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  ECUAPRONÓSTICO
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-black uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Radar Cuantitativo Multimercado
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/aciertos"
              className="text-xs bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>✅</span>
              <span className="hidden sm:inline">Historial de</span> Aciertos
            </Link>

            <Link
              href="/radar"
              className="text-xs bg-blue-600/90 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>📊</span>
              <span>Terminal en Vivo</span>
            </Link>

            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 px-3 py-2 rounded-xl font-black transition-all cursor-pointer"
            >
              <span className="sm:hidden">VIP</span>
              <span className="hidden sm:inline">Acceso VIP</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* ============================================================ */}
        {/* 1. SECCIÓN HERO (ENCABEZADO Y LOGOTIPO) */}
        {/* ============================================================ */}
        <section className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto text-center">
          {/* BADGE DE AUTORIDAD SUPERIOR */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Terminal de Inteligencia Deportiva • Radar Multimercado Inteligente</span>
          </div>

          {/* LOGOTIPO OFICIAL PROMINENTE */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-emerald-500/20 to-amber-400/30 rounded-full blur-2xl opacity-70 animate-pulse" />
              <img
                src="/logo.png"
                alt="Logo Oficial Ecuapronóstico"
                className="relative h-24 sm:h-32 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]"
              />
            </div>
          </div>

          {/* TITULAR PRINCIPAL (COPYWRITING DE CONVERSIÓN) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-300 tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
            El único radar cuantitativo de apuestas en Sudamérica que elimina el margen de las casas
            y encuentra valor matemático real.
          </h1>

          {/* SUBTÍTULO EXPLICATIVO PERSUASIVO */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Basta de corazonadas y opiniones de comentaristas. Procesamos en tiempo real datos
            oficiales de <strong className="text-white">ESPN, The Odds API y API-Football</strong>{" "}
            mediante algoritmos de <strong className="text-emerald-400">De-vigging</strong>,{" "}
            <strong className="text-amber-300">10,000 Simulaciones Montecarlo</strong> y distribución
            de Poisson para revelar la probabilidad pura y sin trampa de cada partido.
          </p>

          {/* DOBLE BOTÓN DE ENTRADA (HERO CTA) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            {/* BOTÓN 1: PRINCIPAL / VIP */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.45)] transform hover:scale-[1.03] transition-all cursor-pointer"
            >
              <span className="text-lg">🔓</span>
              <span>Obtener Membresía VIP ($14.99 / mes)</span>
            </a>

            {/* BOTÓN 2: SECUNDARIO / FREEMIUM */}
            <Link
              href="/radar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-green-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border-2 border-green-500/60 hover:border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.25)] transform hover:scale-[1.03] transition-all cursor-pointer"
            >
              <span className="text-lg">⚽</span>
              <span>Ver Muestra Gratuita (Sin Registro)</span>
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-3 font-medium">
            ⚡ Acceso instantáneo en 1 clic • Sin tarjetas requeridas para la muestra abierta • 100%
            auditado
          </p>

          {/* TARJETAS DE CONFIANZA RÁPIDA (STATS BAR) */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block font-mono">
                10,000
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Simulaciones / Partido
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block font-mono">
                83%
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Efectividad Comprobada
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 block font-mono">
                20+ Ligas
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Monitoreadas en Vivo
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-purple-400 block font-mono">
                0%
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Sesgo Emocional
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SECCIÓN DE AUTORIDAD: ¿POR QUÉ ALCANZAMOS ALTA EFECTIVIDAD? */}
        {/* ============================================================ */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#0b132b] via-[#0d1738] to-[#070d1e] border-y border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block bg-emerald-400/10 text-emerald-300 border border-emerald-400/40 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest mb-3">
                Rigor Matemático Sin Tecnicismos Complejos
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                ¿Por qué alcanzamos tan alta efectividad?
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                El 97% de los apostadores pierde dinero porque juega contra cuotas alteradas por las
                casas de apuestas. Nuestro modelo computacional no predice milagros:{" "}
                <strong className="text-amber-300">
                  elimina el margen oculto del casino y explota las matemáticas a tu favor
                </strong>
                .
              </p>
            </div>

            {/* 4 PILARES MATEMÁTICOS ACCESIBLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PILAR 1: DESMARGINIZACIÓN (DE-VIGGING) */}
              <div className="bg-[#0b132b]/90 border-2 border-slate-700/80 hover:border-amber-400/70 rounded-3xl p-6 sm:p-8 transition-all hover:scale-[1.01] shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-2xl mb-5 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  ⚖️
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2.5">
                  1. Desmarginización Algorítmica (De-vigging)
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Las casas de apuestas inflan las probabilidades con una comisión oculta (del 5% al
                  9% por partido), haciendo que todas las opciones sumen más del 100%. Nuestro
                  algoritmo extrae ese margen injusto y recalcula la{" "}
                  <strong className="text-amber-300">probabilidad pura y real</strong> del encuentro,
                  dejando al descubierto quién tiene verdadera ventaja.
                </p>
              </div>

              {/* PILAR 2: 10,000 SIMULACIONES MONTE CARLO */}
              <div className="bg-[#0b132b]/90 border-2 border-slate-700/80 hover:border-emerald-400/70 rounded-3xl p-6 sm:p-8 transition-all hover:scale-[1.01] shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 border-2 border-emerald-400/60 flex items-center justify-center text-2xl mb-5 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  ⚡
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2.5">
                  2. 10,000 Simulaciones de Montecarlo
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  En lugar de especular con la opinión de un analista deportivo, ejecutamos{" "}
                  <strong className="text-emerald-400">10,000 simulaciones computacionales</strong>{" "}
                  del mismo partido en milisegundos. El motor somete el evento a miles de escenarios
                  de presión, ritmo y dispersión para determinar el ganador empírico más consistente.
                </p>
              </div>

              {/* PILAR 3: DISTRIBUCIÓN DE POISSON & XG REAL */}
              <div className="bg-[#0b132b]/90 border-2 border-slate-700/80 hover:border-blue-400/70 rounded-3xl p-6 sm:p-8 transition-all hover:scale-[1.01] shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-400/20 border-2 border-blue-400/60 flex items-center justify-center text-2xl mb-5 shadow-[0_0_20px_rgba(96,165,250,0.3)]">
                  📐
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2.5">
                  3. Distribución de Poisson y Expected Goals (xG)
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Cruzamos el peligro ofensivo real de las plantillas (xG local vs visitante). Con la
                  distribución discreta de Poisson modelamos la probabilidad matemática de cada
                  marcador exacto (1-0, 2-1, 1-1, etc.) y detectamos las líneas de goles más seguras
                  del mercado.
                </p>
              </div>

              {/* PILAR 4: VALOR ESPERADO POSITIVO (+EV) */}
              <div className="bg-[#0b132b]/90 border-2 border-slate-700/80 hover:border-yellow-400/70 rounded-3xl p-6 sm:p-8 transition-all hover:scale-[1.01] shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400/60 flex items-center justify-center text-2xl mb-5 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  📈
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2.5">
                  4. Detección Estricta de Valor Esperado (+EV)
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Solo invertimos cuando la cuota que paga la casa es estadísticamente superior al
                  riesgo real del partido. Si un partido no ofrece ventaja medible,{" "}
                  <strong className="text-white">el radar indica explícitamente no apostar</strong>.
                  Proteger tu capital es la regla número uno.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. SECCIÓN COMPARATIVA DE IMPACTO (CRO) */}
        {/* ============================================================ */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 block mb-2">
              El Secreto del 3% Ganador
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Apostador Tradicional vs Apostador Cuantitativo
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Compara la diferencia entre quemar tu saldo y operar como un inversor disciplinado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* LADO ROJO: APOSTADOR TRADICIONAL */}
            <div className="bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-900 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-red-500/30">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-red-400">
                    Apostador Tradicional
                  </h3>
                  <span className="text-xs text-slate-400">
                    Juega por fanatismo o corazonadas
                  </span>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>
                    Elige al equipo que "le cae bien" o al favorito popular con cuotas miserables.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>
                    Paga el margen oculto del casino (5% a 9% en su contra en cada jugada).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>
                    Arma combinadas imposibles de 6 a 10 partidos con esperanza ciega.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>
                    No lleva auditoría y termina en quiebra por apuestas impulsivas de revancha.
                  </span>
                </li>
              </ul>
            </div>

            {/* LADO VERDE: USUARIO ECUAPRONÓSTICO */}
            <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900 to-[#0e1f3d] border-2 border-emerald-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_35px_rgba(16,185,129,0.2)] relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-emerald-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                Ventaja Matemática
              </div>

              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-emerald-500/40">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-300">
                    Usuario Ecuapronóstico (+EV)
                  </h3>
                  <span className="text-xs text-slate-300">
                    Invierte con rigor estadístico y algoritmos
                  </span>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-200 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black shrink-0">✓</span>
                  <span>
                    Decide con probabilidades limpias calculadas en 10,000 simulaciones Montecarlo.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black shrink-0">✓</span>
                  <span>
                    Aprovecha cuotas desmargenizadas donde el mercado comete errores de valoración.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black shrink-0">✓</span>
                  <span>
                    Tiene acceso a <strong>Las 4 Fijas del Día</strong> con la más alta certeza matemática.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black shrink-0">✓</span>
                  <span>
                    Auditoría histórica 100% pública para verificar efectividad antes de arriesgar $1.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. SECCIÓN DE LLAMADA A LA ACCIÓN (DOBLE BOTÓN DE ENTRADA) */}
        {/* ============================================================ */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-[#0d1c3e] via-[#132857] to-[#0d1c3e] border-t-2 border-amber-400/50 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow">
              Comienza Hoy Con Inteligencia Cuantitativa
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              ¿Listo para dejar de apostar a ciegas y jugar con ventaja matemática?
            </h2>

            <p className="mt-4 text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Elige cómo deseas comenzar. Puedes ingresar a la terminal ahora mismo para ver la muestra
              gratuita del día, o desbloquear todas las ligas completas con la membresía VIP.
            </p>

            {/* BLOQUE CENTRALIZADO CON DOBLE BOTÓN DE ACCIÓN */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              {/* BOTÓN 1 (PRINCIPAL / VIP) */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-[0_0_35px_rgba(251,191,36,0.5)] transform hover:scale-[1.04] transition-all cursor-pointer"
              >
                <span className="text-xl">🔓</span>
                <span>Obtener Membresía VIP ($14.99 / mes)</span>
              </a>

              {/* BOTÓN 2 (SECUNDARIO / FREEMIUM) */}
              <Link
                href="/radar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-green-300 hover:text-white bg-slate-900/95 hover:bg-slate-800 border-2 border-green-500/70 hover:border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] transform hover:scale-[1.04] transition-all cursor-pointer"
              >
                <span className="text-xl">⚽</span>
                <span>Ver Muestra Gratuita (Sin Registro)</span>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Muestra abierta sin registro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Activación VIP en 2 minutos por WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Cancelación en cualquier momento
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="border-t border-slate-800 bg-[#050914] text-slate-400 text-xs py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Ecuapronóstico" className="h-10 object-contain" />
            <div>
              <p className="font-black text-white text-sm">ECUAPRONÓSTICO © 2026</p>
              <p className="text-[11px] text-slate-500">
                Terminal de Inteligencia Deportiva & Radar Cuantitativo Multimercado
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/radar" className="text-slate-300 hover:text-amber-300 transition">
              Terminal en Vivo
            </Link>
            <Link href="/aciertos" className="text-slate-300 hover:text-emerald-300 transition">
              Historial de Aciertos
            </Link>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-slate-300 hover:text-white transition cursor-pointer"
            >
              Ingreso VIP
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              Contacto WhatsApp
            </a>
          </div>

          <div className="text-[11px] text-slate-500 max-w-xs">
            Datos en vivo de ESPN, The Odds API y API-Football. Solo para mayores de 18 años. Juega
            con responsabilidad.
          </div>
        </div>
      </footer>
    </div>
  );
}
