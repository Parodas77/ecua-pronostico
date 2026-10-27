"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserItem {
  id: number;
  nombre: string;
  apellido: string;
  telefono_whatsapp: string;
  ciudad: string;
  correo: string;
  username: string;
  estado_suscripcion: "activo" | "inactivo" | "expirado";
  fecha_inicio_suscripcion: string;
  fecha_expiracion_suscripcion: string;
  created_at: string;
  notas_admin?: string;
}

export default function AdminCrmPage() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState<UserItem[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, activos: 0, inactivos: 0, expirados: 0 });
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Chequear sesión admin en localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ecuapronostico_vip_session_v1");
      if (raw) {
        const session = JSON.parse(raw);
        if (session.authenticated && (session.username === "admin" || session.role === "admin")) {
          setIsAdminAuth(true);
        }
      }
    } catch {}
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.trim().toLowerCase() === "admin" && adminPass.trim() === "ecuapronostico2026@") {
      setIsAdminAuth(true);
      setAuthError("");
      try {
        localStorage.setItem(
          "ecuapronostico_vip_session_v1",
          JSON.stringify({ authenticated: true, username: "admin", role: "admin", lastActivity: Date.now() })
        );
      } catch {}
    } else {
      setAuthError("Credenciales de administrador inválidas.");
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus !== "todos") query.set("status", filterStatus);
      if (searchQuery) query.set("q", searchQuery);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuth) {
      fetchUsers();
    }
  }, [isAdminAuth, filterStatus, searchQuery]);

  const handleExtendDays = async (id: number, days: number = 30) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, extendDays: days }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Suscripción de ID #${id} extendida por +${days} días.`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado_suscripcion: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Estado de usuario #${id} actualizado a "${newStatus}".`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyBroadcastList = () => {
    const list = users
      .filter((u) => u.username !== "admin")
      .map((u) => `${u.nombre} ${u.apellido} (${u.telefono_whatsapp}) - ${u.ciudad} [${u.estado_suscripcion}]`)
      .join("\n");

    navigator.clipboard.writeText(list);
    setActionSuccess("📋 ¡Lista de difusión copiada al portapapeles!");
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleCopyActivationLink = () => {
    const link = typeof window !== "undefined" ? `${window.location.origin}/activar` : "https://ecuapronostico.com/activar";
    navigator.clipboard.writeText(link);
    setActionSuccess(`🔗 Link de activación copiado: ${link}`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-amber-400/70 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Panel de Administración CRM</h1>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Acceso restringido para gestión de suscriptores y retención
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Usuario Administrador</label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
                autoCapitalize="none"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                required
              />
            </div>

            {authError && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg transition cursor-pointer"
            >
              Ingresar al Panel CRM
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link href="/radar" className="text-xs text-slate-400 hover:text-white">
              ← Volver a la Terminal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ENCABEZADO DEL CRM */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">CRM & RETENCIÓN DE CLIENTES</h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Base de datos de suscriptores VIP, fechas de expiración y campañas de remarketing por WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end">
            <button
              onClick={handleCopyActivationLink}
              className="text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>🔗</span>
              <span>Copiar Link Post-Pago</span>
            </button>

            <Link
              href="/radar"
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1"
            >
              <span>📊</span>
              <span>Terminal Radar</span>
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("ecuapronostico_vip_session_v1");
                setIsAdminAuth(false);
              }}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-2 rounded-xl font-bold transition cursor-pointer"
            >
              Salir
            </button>
          </div>
        </header>

        {/* NOTIFICACIÓN TOAST */}
        {actionSuccess && (
          <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white font-black text-sm">
              ✕
            </button>
          </div>
        )}

        {/* KPIS DE SUSCRIPTORES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Clientes</span>
            <div className="text-3xl font-black text-white mt-1 font-mono">{metrics.total}</div>
            <span className="text-[11px] text-slate-500">Perfiles registrados en DB</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">🟢 Activos VIP</span>
            <div className="text-3xl font-black text-emerald-300 mt-1 font-mono">{metrics.activos}</div>
            <span className="text-[11px] text-emerald-400/80">Con membresía mensual al día</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">🟡 Inactivos</span>
            <div className="text-3xl font-black text-amber-300 mt-1 font-mono">{metrics.inactivos}</div>
            <span className="text-[11px] text-amber-300/80">Pausados o pendientes</span>
          </div>

          <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded">
              Objetivo Retención
            </div>
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider block">🔴 Expirados</span>
            <div className="text-3xl font-black text-red-300 mt-1 font-mono">{metrics.expirados}</div>
            <span className="text-[11px] text-red-400/80">Listos para campaña de descuento</span>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS Y SEGMENTACIÓN PARA RETENCIÓN */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
            {/* FILTROS POR ESTADO */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterStatus("todos")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterStatus === "todos" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Todos ({metrics.total})
              </button>
              <button
                onClick={() => setFilterStatus("activo")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterStatus === "activo" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-white"
                }`}
              >
                Activos ({metrics.activos})
              </button>
              <button
                onClick={() => setFilterStatus("expirado")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterStatus === "expirado" ? "bg-red-600 text-white" : "text-red-400 hover:text-white"
                }`}
              >
                Expirados ({metrics.expirados})
              </button>
              <button
                onClick={() => setFilterStatus("inactivo")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterStatus === "inactivo" ? "bg-amber-600 text-slate-950" : "text-amber-400 hover:text-white"
                }`}
              >
                Inactivos ({metrics.inactivos})
              </button>
            </div>

            {/* BÚSQUEDA RÁPIDA */}
            <div className="flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, teléfono, ciudad..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* BOTONES DE EXPORTACIÓN PARA WHATSAPP */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBroadcastList}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>📋</span>
                <span>Copiar Difusión</span>
              </button>

              <a
                href={`/api/admin/export?scope=${filterStatus === "todos" ? "all" : "retargeting"}`}
                download
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <span>📥</span>
                <span>Exportar CSV WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL DE CLIENTES */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b132b] border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Cliente / Nombre</th>
                  <th className="py-3 px-4">WhatsApp (Chat Directo)</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Usuario & Correo</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4 text-right">Acciones de Retención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-amber-300 font-bold animate-pulse">
                      Cargando base de datos de suscriptores...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No se encontraron usuarios bajo los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isExpired = new Date(u.fecha_expiracion_suscripcion).getTime() < Date.now();
                    const daysRemaining = Math.round(
                      (new Date(u.fecha_expiracion_suscripcion).getTime() - Date.now()) / 86400000
                    );

                    // Mensaje personalizado de remarketing por WhatsApp
                    const waMessage =
                      u.estado_suscripcion === "activo"
                        ? `¡Hola ${u.nombre}! Te saludamos de Ecuapronóstico. Tu membresía VIP está activa y cuentas con Las 4 Fijas listas para hoy.`
                        : `¡Hola ${u.nombre}! Te saludamos de Ecuapronóstico. Notamos que tu membresía VIP ha vencido. Queremos ofrecerte un descuento exclusivo del 20% para reactivar tu acceso a las 4 Fijas de hoy. ¿Te gustaría activarlo?`;

                    const waLink = `https://wa.me/${u.telefono_whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      waMessage
                    )}`;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-400">#{u.id}</td>

                        <td className="py-3 px-4">
                          <strong className="text-white text-sm block">
                            {u.nombre} {u.apellido}
                          </strong>
                          {u.notas_admin && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                              📝 {u.notas_admin}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition group"
                            title="Abrir chat de WhatsApp con plantilla de mensaje de retención"
                          >
                            <span className="text-xs">💬</span>
                            <span className="font-mono">{u.telefono_whatsapp}</span>
                            <span className="text-[10px] text-emerald-400 opacity-60 group-hover:opacity-100">↗</span>
                          </a>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                            📍 {u.ciudad}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-amber-300 font-mono font-bold block">{u.username}</span>
                          <span className="text-slate-400 text-[11px] block">{u.correo}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.estado_suscripcion === "activo"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                                : u.estado_suscripcion === "inactivo"
                                ? "bg-amber-950 text-amber-300 border border-amber-500/50"
                                : "bg-red-950 text-red-300 border border-red-500/50"
                            }`}
                          >
                            {u.estado_suscripcion}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="block text-slate-300 font-mono">
                            {u.fecha_expiracion_suscripcion.slice(0, 10)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              daysRemaining > 5
                                ? "text-emerald-400"
                                : daysRemaining >= 0
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {daysRemaining > 0
                              ? `Quedan ${daysRemaining} días`
                              : daysRemaining === 0
                              ? "Vence hoy"
                              : `Vencido hace ${Math.abs(daysRemaining)} días`}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleExtendDays(u.id, 30)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black transition cursor-pointer"
                              title="Extender suscripción por 30 días"
                            >
                              +30 Días
                            </button>

                            <select
                              value={u.estado_suscripcion}
                              onChange={(e) => handleStatusChange(u.id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 text-[10px] text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="activo">Activo</option>
                              <option value="inactivo">Inactivo</option>
                              <option value="expirado">Expirado</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
