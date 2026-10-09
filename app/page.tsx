"use client";
import { useState } from "react";

export default function QuantEdgeDashboard() {
  const [view, setView] = useState("basic");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-500 uppercase tracking-wider">
              Quant<span className="text-white">Edge</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Terminal de Inteligencia Deportiva</p>
          </div>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setView("basic")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                view === "basic" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Vista Básica
            </button>
            <button
              onClick={() => setView("premium")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                view === "premium" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Vista Premium
            </button>
          </div>
        </header>

        {/* Match Info */}
        <div className="rounded-xl p-6 mb-6 flex justify-between items-center bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
          <div className="text-center w-1/3">
            <h2 className="text-xl font-bold">LDU Quito</h2>
            <p className="text-slate-400 text-xs">Local - 2,850 msnm</p>
          </div>
          <div className="text-center w-1/3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest">LIGAPRO</span>
            <p className="mt-2 text-sm text-slate-300">Sábado, 10 de octubre de 2026<br />19:00 EST</p>
          </div>
          <div className="text-center w-1/3">
            <h2 className="text-xl font-bold">Barcelona SC</h2>
            <p className="text-slate-400 text-xs">Visitante - Llano</p>
          </div>
        </div>

        {/* BASIC VIEW */}
        {view === "basic" && (
          <div className="block animate-fade-in">
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center mb-6">
              <h3 className="text-red-400 font-bold mb-2">⚠️ Mercado Eficiente - Ventana Cerrada</h3>
              <p className="text-slate-300 text-sm">Los datos de este pronóstico recién estarán disponibles el <strong>sábado a las 17:00</strong> (2 horas antes del evento). A esa hora, el mercado ya se ajustó y la tasa de premios (cuota) disminuye drásticamente, eliminando tu margen de ganancia.</p>
            </div>
            <div className="rounded-xl p-8 text-center relative overflow-hidden bg-slate-800/50 border border-slate-700">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-6">
                <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">Datos Cuantitativos Bloqueados</h3>
                <p className="text-slate-300 text-sm mb-4 max-w-md">Por esta razón deberías pasar al plan Premium: para obtener la ventaja del <strong>+EV (Valor Esperado Positivo)</strong>. El +EV te permite ver esta alerta 24 horas antes y asegurar cuotas altas aprovechando los errores matemáticos de la casa de apuestas.</p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Actualizar a Premium - $17.99</button>
              </div>
              <div className="opacity-20 blur-md">
                <div className="flex justify-between mb-4"><span className="font-bold">Probabilidad LDU:</span><span>61%</span></div>
                <div className="flex justify-between mb-4"><span className="font-bold">Valor Esperado:</span><span>+13.4%</span></div>
                <div className="h-4 bg-slate-700 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM VIEW */}
        {view === "premium" && (
          <div className="block animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center backdrop-blur-sm">
                <p className="text-slate-400 text-sm mb-1">Cuota Casa de Apuestas</p>
                <p className="text-3xl font-bold text-white">2.15</p>
                <p className="text-slate-500 text-xs mt-1">Prob. Implícita: 46.5%</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 text-center border-blue-500 border-2 backdrop-blur-sm">
                <p className="text-slate-400 text-sm mb-1">Probabilidad Modelo</p>
                <p className="text-3xl font-bold text-blue-400">61.3%</p>
                <p className="text-slate-500 text-xs mt-1">Cuota Justa: 1.63</p>
              </div>
              <div className="rounded-xl p-6 text-center bg-green-900/20 border border-green-500/50 backdrop-blur-sm">
                <p className="text-green-400 text-sm font-bold mb-1">Valor Esperado (+EV)</p>
                <p className="text-4xl font-extrabold text-green-400" style={{ textShadow: "0 0 10px rgba(74, 222, 128, 0.5)" }}>+14.8%</p>
                <p className="text-green-500/70 text-xs mt-1">Ventaja de Mercado</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
              <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">Simulación Monte Carlo (10,000 iteraciones)</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1"><span>Victoria LDU Quito</span><span className="font-bold">61.3%</span></div>
                <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "61.3%" }}></div></div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1"><span>Empate</span><span className="font-bold">23.9%</span></div>
                <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-slate-400 h-2.5 rounded-full" style={{ width: "23.9%" }}></div></div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1"><span>Victoria Barcelona SC</span><span className="font-bold">14.8%</span></div>
                <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "14.8%" }}></div></div>
              </div>
            </div>

            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"></path>
                </svg>
                Conclusión del Agente Redactor:
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Las casas de apuestas están subestimando fuertemente a Liga de Quito. Han fijado una cuota de <strong>2.15</strong> asumiendo un riesgo tradicional, pero nuestro modelo detecta un error de cálculo: tras cruzar las métricas ofensivas (xG) con el desgaste físico que sufrirá Barcelona SC por la altura de Quito (2,850 msnm), las 10,000 simulaciones confirman que la probabilidad real de victoria local es del <strong>61.3%</strong>. <br /><br />
                <strong>Veredicto:</strong> Tienes una ventaja matemática masiva del <strong>+14.8% (Valor Esperado)</strong>. Apostar a la victoria de Liga de Quito a esta cuota es altamente rentable a largo plazo porque la casa te está pagando mucho más de lo que matemáticamente debería.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}