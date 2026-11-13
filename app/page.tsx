import SportCourtBackground from "@/components/SportCourtBackground";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen w-full bg-transparent text-slate-900 flex flex-col items-center justify-center px-6 py-12 select-none overflow-hidden relative">
      {/* Fondo claro inmersivo de cancha de fútbol */}
      <SportCourtBackground sport="soccer" />

      <div className="relative z-10 max-w-2xl w-full bg-white/95 border-2 border-emerald-500/80 rounded-3xl p-8 sm:p-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md flex flex-col items-center">
        {/* Logo de EcuaPronóstico */}
        <div className="mb-8 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-amber-400/25 rounded-full blur-xl opacity-80" />
          <img
            src="/logo.png"
            alt="EcuaPronóstico"
            className="relative h-28 sm:h-36 object-contain mx-auto drop-shadow-[0_4px_20px_rgba(15,23,42,0.2)]"
          />
        </div>

        {/* Separador sutil */}
        <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-600 rounded-full mb-8" />

        {/* Mensaje de pausa técnica (sin enlaces ni botones de navegación) */}
        <p className="text-lg sm:text-2xl font-black text-slate-900 leading-relaxed tracking-tight">
          &ldquo;Pedimos mil disculpas por esta interrupción técnica, que tardará solo un par de días en solucionarse. Volveremos con EcuaPronóstico recargados.&rdquo;
        </p>
      </div>
    </main>
  );
}
