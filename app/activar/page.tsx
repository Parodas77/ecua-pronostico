"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VIP_SESSION_KEY = "ecuapronostico_vip_session_v1";

const CIUDADES_ECUADOR = [
  "Quito",
  "Guayaquil",
  "Cuenca",
  "Santo Domingo",
  "Machala",
  "Durán",
  "Manta",
  "Portoviejo",
  "Loja",
  "Ambato",
  "Esmeraldas",
  "Quevedo",
  "Riobamba",
  "Milagro",
  "Ibarra",
  "La Libertad",
  "Babahoyo",
  "Sangolquí",
  "Daule",
  "Latacunga",
  "Otra Ciudad (Ecuador o Exterior)",
];

export default function ActivacionVipPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono_whatsapp: "+593 ",
    ciudad: "Quito",
    ciudadOtra: "",
    correo: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const ciudadFinal =
      formData.ciudad === "Otra Ciudad (Ecuador o Exterior)"
        ? formData.ciudadOtra.trim() || "Ecuador"
        : formData.ciudad;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          telefono_whatsapp: formData.telefono_whatsapp.trim(),
          ciudad: ciudadFinal,
          correo: formData.correo.trim(),
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Ocurrió un error al procesar tu activación.");
        setIsLoading(false);
        return;
      }

      // Guardar sesión VIP activa automáticamente (2 horas de inactividad)
      const session = {
        authenticated: true,
        username: data.user.username,
        role: "vip",
        lastActivity: Date.now(),
      };
      try {
        localStorage.setItem(VIP_SESSION_KEY, JSON.stringify(session));
      } catch {}

      setSuccessData(data.user);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión. Por favor verifica tu internet e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] -right-32 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* LOGO SUPERIOR Y TÍTULO */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="Ecuapronóstico"
              className="h-16 mx-auto object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Activación VIP Post-Pago • Link Oficial</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Crea tu Perfil y Desbloquea la Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Completa tus datos para activar tu suscripción mensual VIP y recibir pronósticos
            exclusivos vía WhatsApp.
          </p>
        </div>

        {/* VISTA DE ÉXITO TRAS COMPLETAR REGISTRO */}
        {successData ? (
          <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              🎉
            </div>

            <span className="bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
              ¡Membresía Activada!
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              ¡Bienvenido a Ecuapronóstico VIP, {successData.nombre}!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Tu cuenta ha sido creada exitosamente con estado{" "}
              <strong className="text-emerald-400 font-bold uppercase">Activo</strong>. Tienes acceso
              completo e ilimitado al Radar de todas las ligas, Las 4 Fijas del Día y el Auditor IA.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Usuario Registrado:</span>
                <strong className="text-amber-300 font-mono font-bold">{successData.username}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp Asociado:</span>
                <strong className="text-slate-200">{successData.telefono_whatsapp}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vigencia hasta:</span>
                <strong className="text-emerald-400">
                  {new Date(successData.fecha_expiracion_suscripcion).toLocaleDateString("es-EC", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>

            <button
              onClick={() => router.push("/radar")}
              className="mt-6 w-full bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>Entrar a la Terminal VIP Ahora</span>
            </button>
          </div>
        ) : (
          /* FORMULARIO DE CAPTURA DE PERFIL */
          <div className="bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FILA 1: NOMBRE Y APELLIDO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                    Nombre <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                    Apellido <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                  />
                </div>
              </div>

              {/* FILA 2: TELÉFONO WHATSAPP */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                  Número de WhatsApp <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base select-none">📱</span>
                  <input
                    type="tel"
                    name="telefono_whatsapp"
                    value={formData.telefono_whatsapp}
                    onChange={handleChange}
                    placeholder="+593 99 123 4567"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none font-mono transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Fundamental para enviarte alertas de Las 4 Fijas y promociones de renovación.
                </span>
              </div>

              {/* FILA 3: CIUDAD */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                  Ciudad de Residencia <span className="text-amber-400">*</span>
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition cursor-pointer"
                >
                  {CIUDADES_ECUADOR.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>

                {formData.ciudad === "Otra Ciudad (Ecuador o Exterior)" && (
                  <input
                    type="text"
                    name="ciudadOtra"
                    value={formData.ciudadOtra}
                    onChange={handleChange}
                    placeholder="Escribe tu ciudad o país"
                    required
                    className="mt-2 w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                  />
                )}
              </div>

              {/* FILA 4: CORREO ELECTRÓNICO */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                  Correo Electrónico <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  required
                  autoCapitalize="none"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block mb-2">
                  Credenciales de Acceso a la Terminal
                </span>

                {/* FILA 5: USUARIO ELEGIDO */}
                <div className="mb-3">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                    Crea tu Usuario <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Elige un usuario (ej: carlos_bet)"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono transition"
                  />
                </div>

                {/* FILA 6: CONTRASEÑA */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Crea tu Contraseña <span className="text-amber-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-amber-300 hover:text-amber-200 font-bold"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 5 caracteres"
                    required
                    autoCapitalize="none"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                  />
                </div>
              </div>

              {/* MENSAJE DE ERROR */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-xs text-red-200 flex items-start gap-2">
                  <span className="text-sm">⚠️</span>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* BOTÓN DE SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 disabled:bg-slate-700 text-slate-950 font-black py-4 px-6 rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(251,191,36,0.4)] transform hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "⏳" : "🔓"}</span>
                <span>{isLoading ? "Activando tu Cuenta VIP..." : "Activar mi Acceso VIP (30 Días)"}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/radar" className="text-amber-300 hover:underline font-bold">
                    Inicia sesión en la Terminal
                  </Link>
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
