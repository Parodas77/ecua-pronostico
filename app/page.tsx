export default function MaintenancePage() {
  return (
    <main className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col items-center justify-center px-6 py-12 select-none overflow-hidden relative">
      {/* Iluminación ambiental sobria de fondo */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-14 text-center shadow-2xl backdrop-blur-md flex flex-col items-center">
        {/* Logo de EcuaPronóstico */}
        <div className="mb-8 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-emerald-500/15 to-amber-400/20 rounded-full blur-xl opacity-75" />
          <img
            src="/logo.png"
            alt="EcuaPronóstico"
            className="relative h-28 sm:h-36 object-contain mx-auto drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
          />
        </div>

        {/* Separador sutil */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent rounded-full mb-8" />

        {/* Mensaje de pausa técnica (sin enlaces ni botones de navegación) */}
        <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
          &ldquo;Pedimos mil disculpas por esta interrupción técnica, que tardará solo un par de días en solucionarse. Volveremos con EcuaPronóstico recargados.&rdquo;
        </p>
      </div>
    </main>
  );
}
