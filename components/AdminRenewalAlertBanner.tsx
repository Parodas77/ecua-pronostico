"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SubscriptionAlert {
  id: number;
  nombre_servicio: string;
  fecha_renovacion: string;
  costo: number;
  moneda: string;
  dias_restantes: number;
  requiere_alerta: boolean;
  estado_alerta: "vencida" | "urgente" | "al_dia";
  mensaje_alerta: string;
  url_portal?: string;
}

interface AdminRenewalAlertBannerProps {
  isAdmin?: boolean;
}

export default function AdminRenewalAlertBanner({ isAdmin: propIsAdmin }: AdminRenewalAlertBannerProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(propIsAdmin ?? false);
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);

  // 1. Verificación de Seguridad Estricta: Sólo administradores
  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdmin(propIsAdmin);
      return;
    }

    try {
      const raw = localStorage.getItem("ecuapronostico_vip_session_v1");
      if (raw) {
        const session = JSON.parse(raw);
        if (session.authenticated && (session.username === "admin" || session.role === "admin")) {
          setIsAdmin(true);
          return;
        }
      }
      setIsAdmin(false);
    } catch {
      setIsAdmin(false);
    }
  }, [propIsAdmin]);

  // 2. Consulta de alertas de suscripciones únicamente si es Administrador
  useEffect(() => {
    if (!isAdmin) {
      setAlerts([]);
      return;
    }

    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/admin/subscriptions?alerts=true");
        const data = await res.json();
        if (data.success && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error("Error al cargar alertas de suscripciones admin:", err);
      }
    };

    fetchAlerts();
    // Consultar periódicamente cada 10 minutos
    const interval = setInterval(fetchAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Rotación suave si hay más de una alerta urgente
  useEffect(() => {
    if (alerts.length <= 1) return;
    const rotInterval = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(rotInterval);
  }, [alerts.length]);

  // RESTRICCIÓN DE SEGURIDAD ESTRICTA:
  // Si no es admin, si no hay alertas (dias_restantes <= 5), o si fue descartada: NO RENDERIZAR NADA
  if (!isAdmin || alerts.length === 0 || isDismissed) {
    return null;
  }

  const currentAlert = alerts[activeAlertIndex] || alerts[0];

  return (
    <div
      role="alert"
      className="relative z-50 bg-gradient-to-r from-amber-950/95 via-amber-900/90 to-amber-950/95 border-b border-amber-500/50 text-amber-100 shadow-lg px-4 py-2.5 backdrop-blur-md transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Mensaje Dinámico de la Alerta */}
        <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-amber-500 text-slate-950 uppercase shadow-sm">
            ADMIN EXCLUSIVO
          </span>
          <span className="font-semibold text-amber-200 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentAlert.mensaje_alerta}
          </span>
          {alerts.length > 1 && (
            <span className="text-[11px] text-amber-400/80 font-mono">
              ({activeAlertIndex + 1}/{alerts.length} servicios urgentes)
            </span>
          )}
        </div>

        {/* Acciones para el Administrador */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin#apis"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 border border-amber-500/40 hover:border-amber-400 rounded-md text-xs font-bold transition shadow-sm"
          >
            <span>Gestionar Servicios</span>
            <span>↗</span>
          </Link>

          {currentAlert.url_portal && (
            <a
              href={currentAlert.url_portal}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/60 hover:bg-slate-900 text-amber-200/90 border border-amber-500/20 rounded-md text-xs transition"
            >
              <span>Portal {currentAlert.nombre_servicio.split(" ")[0]}</span>
              <span className="text-[10px]">🌐</span>
            </a>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            title="Ocultar alerta durante esta sesión"
            className="p-1 text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/10 rounded transition text-xs"
            aria-label="Cerrar alerta"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
