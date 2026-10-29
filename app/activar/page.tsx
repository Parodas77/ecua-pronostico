"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

const METODOS_PAGO = [
  "Banco Pichincha (Transferencia Directa)",
  "Banco Pichincha (Deuna / QR)",
  "Banco Guayaquil",
  "Banco del Pacífico",
  "Produbanco / Servipagos",
  "Western Union / Pago Internacional",
  "Efectivo / Depósito en Agente",
  "Otro Método",
];

function ActivacionVipForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono_whatsapp: "+593 ",
    ciudad: "Quito",
    ciudadOtra: "",
    correo: "",
    username: "",
    password: "",
    metodo_pago: "Banco Pichincha (Transferencia Directa)",
    referencia_pago: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [isPreVerified, setIsPreVerified] = useState(false);
  const [verifiedAmount, setVerifiedAmount] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tel = searchParams.get("tel");
      const ref = searchParams.get("ref");
      const amt = searchParams.get("amt");
      const bank = searchParams.get("bank");

      if (tel || ref || amt) {
        setIsPreVerified(true);
        if (amt) setVerifiedAmount(amt);
        setFormData((prev) => ({
          ...prev,
          telefono_whatsapp: tel ? tel.trim() : prev.telefono_whatsapp,
          referencia_pago: ref ? ref.trim() : prev.referencia_pago,
          metodo_pago: bank ? `Transferencia ${bank}` : prev.metodo_pago,
        }));
      }
    } catch {}
  }, [searchParams]);

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
          metodo_pago: formData.metodo_pago,
          referencia_pago: formData.referencia_pago.trim() || "Comprobante enviado por WhatsApp",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Ocurrió un error al procesar tu solicitud.");
        setIsLoading(false);
        return;
      }

      setSuccessData(data.user);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión. Por favor verifica tu internet e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const adminWhatsappNumber = "593979198755";
  const whatsappNotifyMessage = successData
    ? `Hola Administrador de Ecuapronóstico. Acabo de registrar mi cuenta VIP con los siguientes datos:\n\n• Nombre: ${successData.nombre} ${successData.apellido}\n• Usuario: ${successData.username}\n• WhatsApp: ${successData.telefono_whatsapp}\n• Método: ${successData.metodo_pago || formData.metodo_pago}\n• Comprobante: ${successData.referencia_pago || formData.referencia_pago || "Adjunto comprobante"}\n\nPor favor autoricen mi cuenta para que inicien mis 30 días de acceso VIP. ¡Muchas gracias!`
    : "";

  const whatsappNotifyUrl = `https://wa.me/${adminWhatsappNumber}?text=${encodeURIComponent(whatsappNotifyMessage)}`;

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
            <span>Registro y Verificación VIP • Link Oficial</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Crea tu Perfil y Registra tu Pago
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Ingresa tus datos y tu comprobante de pago ($14.99). El administrador verificará tu
            transferencia y autorizará tu cuenta para iniciar tus 30 días.
          </p>
        </div>

        {/* VISTA DE CONFIRMACIÓN TRAS COMPLETAR REGISTRO */}
        {isPreVerified && !successData && (
          <div className="mb-6 p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-in fade-in">
            <span className="text-2xl">🟢</span>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-black text-emerald-300">
                ¡Comprobante Validado por WhatsApp con IA!
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5">
                Detectamos tu pago{verifiedAmount ? ` de $${verifiedAmount}` : ""}. Hemos prellenado tus datos; solo elige tu usuario y contraseña.
              </p>
            </div>
          </div>
        )}

        {successData ? (
          <div className="bg-slate-900/90 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.25)] text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 text-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              ⏳
            </div>

            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
              En Espera de Autorización
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              ¡Datos Registrados con Éxito, {successData.nombre}!
            </h2>

            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Tu usuario ha sido creado y tu comprobante de pago está en la cola de verificación del
              administrador. En cuanto sea autorizado,{" "}
              <strong className="text-amber-300 font-bold">
                tus 30 días de suscripción VIP comenzarán a correr desde ese momento exacto
              </strong>
              .
            </p>

            {/* RESUMEN DE LOS DATOS REGISTRADOS */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-6 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Usuario elegido:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {successData.username}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">WhatsApp registrado:</span>
                <span className="font-mono font-bold text-white">
                  {successData.telefono_whatsapp}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Método de Pago:</span>
                <span className="font-bold text-white">
                  {successData.metodo_pago || formData.metodo_pago}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Comprobante / Referencia:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {successData.referencia_pago || formData.referencia_pago || "Enviado por chat"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Estado de Cuenta:</span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-500/50">
                  Pendiente de Autorización
                </span>
              </div>
            </div>

            {/* BOTÓN WHATSAPP PARA ACELERAR AUTORIZACIÓN */}
            <div className="space-y-3">
              <a
                href={whatsappNotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)] transition hover:scale-[1.02] cursor-pointer"
              >
                <span className="text-lg">📲</span>
                <span>Notificar al Administrador por WhatsApp (Acelerar Autorización)</span>
              </a>

              <Link
                href="/radar"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs block transition"
              >
                ← Ir a la Portada / Terminal
              </Link>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO POST-PAGO */
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-4 text-left"
          >
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-shake">
                <span className="text-base">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Wilson"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ej: Salazar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            </div>

            {/* TELÉFONO WHATSAPP */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Número de Teléfono / WhatsApp *
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  (Para autorizar tu cuenta y enviarte notificaciones)
                </span>
              </label>
              <input
                type="tel"
                name="telefono_whatsapp"
                value={formData.telefono_whatsapp}
                onChange={handleChange}
                placeholder="+593 99 123 4567"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            {/* CIUDAD */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Ciudad de Residencia *</label>
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition cursor-pointer"
              >
                {CIUDADES_ECUADOR.map((c) => (
                  <option key={c} value={c}>
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
                  placeholder="Escribe el nombre de tu ciudad o país"
                  className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400 transition"
                  required
                />
              )}
            </div>

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                autoCapitalize="none"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            {/* SECCIÓN 2: INFORMACIÓN DE PAGO */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block mb-2">
                💳 Información de tu Pago ($14.99 USD)
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Método de Pago Utilizado *</label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition cursor-pointer"
                  >
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Número de Comprobante / Referencia de Transferencia *
                  </label>
                  <input
                    type="text"
                    name="referencia_pago"
                    value={formData.referencia_pago}
                    onChange={handleChange}
                    placeholder="Ej: Comprobante #12345678 o Nombre del titular de la cuenta"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-400 transition"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    El administrador usará este dato para verificar el depósito y activar tu cuenta.
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CREDENCIALES DE ACCESO ELEGIDAS */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block mb-2">
                🔐 Elige tus Credenciales de Acceso
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nombre de Usuario Deseado *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ej: wilsons2026"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-400 transition"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Solo letras y números, sin espacios ni tildes.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      autoCapitalize="none"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 transition pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm md:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enviando Registro...</span>
                </span>
              ) : (
                "Enviar Registro y Comprobante de Pago 🚀"
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
              Al enviar tu formulario, tus datos son enviados al CRM y tu comprobante entra a
              revisión administrativa. Tus 30 días VIP inician desde el momento de la autorización.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ActivacionVipPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070d1e] text-slate-100 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando formulario de activación...</span>
          </div>
        </div>
      }
    >
      <ActivacionVipForm />
    </Suspense>
  );
}
