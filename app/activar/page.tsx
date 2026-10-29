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

function ActivacionVipForm() {
  const searchParams = useSearchParams();

  // Estados de control de acceso por token
  const [tokenStatus, setTokenStatus] = useState<"validating" | "authorized" | "unauthorized">("validating");
  const [tokenError, setTokenError] = useState("");
  const [currentToken, setCurrentToken] = useState("");
  const [verifiedAmount, setVerifiedAmount] = useState<number>(14.99);

  // Selector de Pestaña: "nuevo" (Crear cuenta) o "reactivar" (Cliente existente)
  const [activeTab, setActiveTab] = useState<"nuevo" | "reactivar">("nuevo");

  // Estado Pestaña A: Nuevo Usuario
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

  // Estado Pestaña B: Ya soy cliente / Reactivar
  const [reactivateData, setReactivateData] = useState({
    identifier: "",
    password: "",
  });
  const [showReactivatePassword, setShowReactivatePassword] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reactivateError, setReactivateError] = useState("");

  // Resultado de éxito común
  const [successData, setSuccessData] = useState<any>(null);
  const [isReactivated, setIsReactivated] = useState(false);

  // 1. VALIDACIÓN DEL TOKEN ÚNICO DE ACTIVACIÓN
  useEffect(() => {
    const rawToken = searchParams.get("token");
    if (!rawToken || !rawToken.trim()) {
      setTokenStatus("unauthorized");
      setTokenError(
        "Acceso Restringido: Este formulario es privado y exclusivo para clientes con comprobante verificado por WhatsApp. Para recibir tu enlace único, realiza tu transferencia bancaria y envía el comprobante por WhatsApp."
      );
      return;
    }

    const tokenVal = rawToken.trim();
    setCurrentToken(tokenVal);

    // Consultar al backend para validar autenticidad y estado de no-uso del token
    fetch(`/api/auth/validate-token?token=${encodeURIComponent(tokenVal)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenStatus("authorized");
          if (data.tokenData) {
            const td = data.tokenData;
            setVerifiedAmount(td.amount || 14.99);
            setFormData((prev) => ({
              ...prev,
              telefono_whatsapp: td.phone || prev.telefono_whatsapp,
              referencia_pago: td.reference || prev.referencia_pago,
              metodo_pago: td.bank ? `Transferencia ${td.bank}` : prev.metodo_pago,
            }));
          }
        } else {
          setTokenStatus("unauthorized");
          setTokenError(
            data.error ||
              "El token de activación no es válido, ha expirado o ya fue consumido previamente para registrar una cuenta."
          );
        }
      })
      .catch((err) => {
        console.error("Error al validar token:", err);
        setTokenStatus("unauthorized");
        setTokenError("Error de conexión al verificar el token de seguridad. Por favor intenta recargar la página.");
      });
  }, [searchParams]);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
  };

  // Envío Formulario Pestaña A: Nuevo Usuario
  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
          token: currentToken,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          telefono_whatsapp: formData.telefono_whatsapp.trim(),
          ciudad: ciudadFinal,
          correo: formData.correo.trim(),
          username: formData.username.trim(),
          password: formData.password,
          metodo_pago: formData.metodo_pago,
          referencia_pago: formData.referencia_pago.trim() || "Comprobante verificado",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Ocurrió un error al procesar tu solicitud.");
        setIsLoading(false);
        return;
      }

      // Guardar sesión VIP automática en localStorage
      try {
        localStorage.setItem(
          "ecuapronostico_vip_session_v1",
          JSON.stringify({
            authenticated: true,
            username: data.user.username,
            role: "vip",
            expiresAt: data.user.fecha_expiracion_suscripcion,
            activatedAt: Date.now(),
          })
        );
      } catch {}

      setIsReactivated(false);
      setSuccessData(data.user);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión. Por favor verifica tu internet e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Envío Formulario Pestaña B: Ya soy cliente / Reactivar Cuenta (+30 días)
  const handleReactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReactivateLoading(true);
    setReactivateError("");

    try {
      const res = await fetch("/api/auth/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: currentToken,
          identifier: reactivateData.identifier.trim(),
          password: reactivateData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setReactivateError(data.error || "No se pudo reactivar tu cuenta.");
        setReactivateLoading(false);
        return;
      }

      // Guardar sesión VIP automática en localStorage
      try {
        localStorage.setItem(
          "ecuapronostico_vip_session_v1",
          JSON.stringify({
            authenticated: true,
            username: data.user.username,
            role: "vip",
            expiresAt: data.user.fecha_expiracion_suscripcion,
            activatedAt: Date.now(),
          })
        );
      } catch {}

      setIsReactivated(true);
      setSuccessData(data.user);
    } catch (err) {
      console.error(err);
      setReactivateError("Error de conexión. Por favor verifica tu internet e intenta nuevamente.");
    } finally {
      setReactivateLoading(false);
    }
  };

  const adminWhatsappNumber = "593979198755";
  const whatsappSolicitudUrl = `https://wa.me/${adminWhatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero activar mi suscripción Premium en EcuaPronóstico ($14.99/mes) para desbloquear las 4 Fijas del Día. ¿Me ayudan con los datos de pago?"
  )}`;

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 py-8 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] -right-32 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-xl mx-auto w-full relative z-10">
        {/* LOGO SUPERIOR */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="Ecuapronóstico"
              className="h-16 mx-auto object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* ============================================================== */}
        {/* CASO 1: CARGANDO Y VERIFICANDO TOKEN DE SEGURIDAD */}
        {/* ============================================================== */}
        {tokenStatus === "validating" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-black text-white">Validando Token de Activación VIP...</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Verificando la autenticidad y vigencia de tu enlace privado de un solo uso.
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 2: ACCESO DENEGADO / TOKEN INVÁLIDO O SIN TOKEN */}
        {/* ============================================================== */}
        {tokenStatus === "unauthorized" && (
          <div className="bg-slate-900/95 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 text-3xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              🔒
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 border border-red-500/60 text-red-300 text-xs font-black uppercase tracking-wider">
              <span>Blindaje de Seguridad Activo</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Acceso Restringido • Registro Exclusivo VIP
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {tokenError}
            </p>

            {/* CAJA DE PASOS PARA OBTENER EL ENLACE */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                ¿Cómo obtener tu enlace único de activación?
              </span>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="bg-slate-800 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Realiza tu transferencia de <strong>$14.99 USD</strong> a Banco Pichincha o Banco del Guayaquil.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="bg-slate-800 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Envía la foto de tu comprobante por WhatsApp a nuestro bot institucional.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="bg-slate-800 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Nuestra IA auditará el comprobante al instante y te entregará tu enlace privado de un solo uso.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={whatsappSolicitudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <span>📲</span>
                <span>Solicitar Cuentas Bancarias por WhatsApp</span>
              </a>

              <Link
                href="/radar"
                className="w-full inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                ← Volver al Radar de Partidos
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 3: TOKEN VÁLIDO -> VISTA DE ÉXITO O TABS (NUEVO / REACTIVAR) */}
        {/* ============================================================== */}
        {tokenStatus === "authorized" && (
          <>
            {/* VISTA DE CONFIRMACIÓN TRAS REGISTRO O REACTIVACIÓN EXITOSA */}
            {successData ? (
              <div className="bg-slate-900/90 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  🎉
                </div>

                <span className="bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                  {isReactivated ? "🔁 Membresía VIP Reactivada (+30 Días)" : "🟢 Nueva Membresía VIP Activada (30 Días)"}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  {isReactivated
                    ? `¡Bienvenido de nuevo, ${successData.nombre}!`
                    : `¡Bienvenido a Ecuapronóstico VIP, ${successData.nombre}!`}
                </h2>

                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  {isReactivated ? (
                    <>
                      Tu pago ha sido acreditado a tu cuenta existente.{" "}
                      <strong className="text-emerald-300 font-bold">
                        Hemos sumado +30 días a tu suscripción y tu historial se ha conservado intacto.
                      </strong>
                    </>
                  ) : (
                    <>
                      Tu usuario ha sido configurado con éxito y tu token ha sido consumido.{" "}
                      <strong className="text-emerald-300 font-bold">
                        Tus 30 días de acceso total al Radar Cuantitativo ya están activos.
                      </strong>
                    </>
                  )}
                </p>

                {/* RESUMEN DE LA CUENTA */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-6 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Usuario VIP:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {successData.username}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">WhatsApp Vinculado:</span>
                    <span className="font-mono font-bold text-white">
                      {successData.telefono_whatsapp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Estado de Suscripción:</span>
                    <span className="text-emerald-400 font-bold uppercase text-[11px]">
                      🟢 Activo • 30 Días Corriendo
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Válido Hasta:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {successData.fecha_expiracion_suscripcion
                        ? new Date(successData.fecha_expiracion_suscripcion).toLocaleDateString("es-EC", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "30 días a partir de hoy"}
                    </span>
                  </div>
                </div>

                <Link
                  href="/radar"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm md:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>🚀</span>
                  <span>Ingresar a la Terminal Radar VIP</span>
                </Link>
              </div>
            ) : (
              /* FORMULARIO PRIVADO CON SELECTOR DE PESTAÑAS (TABS) */
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
                {/* BANNER DE PAGO VERIFICADO POR TOKEN */}
                <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500/70 rounded-2xl flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <span className="text-2xl">🟢</span>
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide">
                      Pago Verificado • Token de Activación Activo
                    </h3>
                    <p className="text-[11px] text-emerald-200/90 mt-0.5">
                      Comprobante validado por ${verifiedAmount.toFixed(2)} USD. Elige si eres un usuario nuevo o si deseas renovar una cuenta existente.
                    </p>
                  </div>
                </div>

                {/* SELECTOR DE PESTAÑAS (TABS) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("nuevo");
                      setErrorMessage("");
                      setReactivateError("");
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === "nuevo"
                        ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>✨</span>
                    <span>Nuevo Usuario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reactivar");
                      setErrorMessage("");
                      setReactivateError("");
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === "reactivar"
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🔁</span>
                    <span>Ya soy Cliente (Reactivar)</span>
                  </button>
                </div>

                {/* ========================================================== */}
                {/* PESTAÑA A: FORMULARIO NUEVO USUARIO / REGISTRO */}
                {/* ========================================================== */}
                {activeTab === "nuevo" && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
                    <div className="text-center pt-1 pb-1">
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Crea tu Nuevo Perfil VIP
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Registra tus credenciales personales para activar tus 30 días
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* DATOS PERSONALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Nombre *</label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleRegisterChange}
                          placeholder="Ej: Wilson"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Apellido *</label>
                        <input
                          type="text"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleRegisterChange}
                          placeholder="Ej: Salazar"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                    </div>

                    {/* WHATSAPP Y CIUDAD */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          WhatsApp Vinculado al Pago *
                        </label>
                        <input
                          type="text"
                          name="telefono_whatsapp"
                          value={formData.telefono_whatsapp}
                          onChange={handleRegisterChange}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Ciudad *</label>
                        <select
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleRegisterChange}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          required
                        >
                          {CIUDADES_ECUADOR.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.ciudad === "Otra Ciudad (Ecuador o Exterior)" && (
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Escribe el nombre de tu ciudad o país *
                        </label>
                        <input
                          type="text"
                          name="ciudadOtra"
                          value={formData.ciudadOtra}
                          onChange={handleRegisterChange}
                          placeholder="Ej: Manta / New York"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                    )}

                    {/* CORREO */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleRegisterChange}
                        placeholder="tu.correo@ejemplo.com"
                        autoCapitalize="none"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    {/* CREDENCIALES */}
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                        🔐 Elige tus Credenciales de Acceso
                      </span>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Nombre de Usuario Deseado *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleRegisterChange}
                          placeholder="Ej: wilsons2026"
                          autoCapitalize="none"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-amber-400"
                          required
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Solo letras y números, sin espacios ni caracteres especiales.
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleRegisterChange}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400 pr-12"
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

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Activando Cuenta VIP...</span>
                        </span>
                      ) : (
                        "Crear Usuario y Activar 30 Días VIP 🚀"
                      )}
                    </button>
                  </form>
                )}

                {/* ========================================================== */}
                {/* PESTAÑA B: YA SOY CLIENTE / REACTIVAR CUENTA (+30 DÍAS) */}
                {/* ========================================================== */}
                {activeTab === "reactivar" && (
                  <form onSubmit={handleReactivateSubmit} className="space-y-4 animate-in fade-in">
                    <div className="text-center pt-1 pb-1">
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Reactivar o Extender Cuenta Existente
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ingresa tus credenciales habituales para sumar +30 días sin duplicar tu perfil
                      </p>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200/90 leading-relaxed">
                      💡 <strong>Clientes Recurrentes:</strong> Si ya contrataste el servicio anteriormente, no necesitas volver a llenar todos tus datos. Ingresa tu usuario o correo y contraseña para sumar <strong>+30 días adicionales</strong> a tu suscripción.
                    </div>

                    {reactivateError && (
                      <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{reactivateError}</span>
                      </div>
                    )}

                    <div className="space-y-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Usuario o Correo Electrónico *
                        </label>
                        <input
                          type="text"
                          value={reactivateData.identifier}
                          onChange={(e) => {
                            setReactivateData({ ...reactivateData, identifier: e.target.value });
                            setReactivateError("");
                          }}
                          placeholder="Tu nombre de usuario o correo"
                          autoCapitalize="none"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña Actual *</label>
                        <div className="relative">
                          <input
                            type={showReactivatePassword ? "text" : "password"}
                            value={reactivateData.password}
                            onChange={(e) => {
                              setReactivateData({ ...reactivateData, password: e.target.value });
                              setReactivateError("");
                            }}
                            placeholder="Tu contraseña habitual"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-400 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowReactivatePassword(!showReactivatePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                          >
                            {showReactivatePassword ? "Ocultar" : "Ver"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN REACTIVACIÓN */}
                    <button
                      type="submit"
                      disabled={reactivateLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {reactivateLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Reactivando Suscripción...</span>
                        </>
                      ) : (
                        <>
                          <span>🔁</span>
                          <span>Reactivar y Añadir +30 Días VIP</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-2">
                  Al procesarse cualquiera de las dos opciones, tu token de activación será destruido para garantizar la seguridad de tu enlace de un solo uso.
                </p>
              </div>
            )}
          </>
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
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Verificando token de activación...</span>
          </div>
        </div>
      }
    >
      <ActivacionVipForm />
    </Suspense>
  );
}
