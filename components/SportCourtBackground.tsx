"use client";

import React from "react";

export type SportSurfaceType = "soccer" | "basketball" | "football" | "hockey" | "baseball";

export function getSportSurfaceFromLeague(leagueId?: string, sportCategory?: string): SportSurfaceType {
  const id = (leagueId || "").toLowerCase().trim();
  const cat = (sportCategory || "").toLowerCase().trim();

  if (id === "nba" || cat === "basketball") return "basketball";
  if (id === "nfl" || cat === "football") return "football";
  if (id === "nhl" || cat === "hockey") return "hockey";
  if (id === "mlb" || cat === "baseball") return "baseball";
  return "soccer";
}

export default function SportCourtBackground({
  sport = "soccer",
}: {
  sport?: SportSurfaceType;
}) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* ===================================================================== */}
      {/* 1. FÚTBOL SOCCER: CANCHA DE CÉSPED CLARA Y LUMINOSA DE DÍA             */}
      {/* ===================================================================== */}
      {sport === "soccer" && (
        <div
          className="w-full h-full relative"
          style={{
            background:
              "linear-gradient(180deg, #dff7ea 0%, #c7f0d8 35%, #b8ebc9 70%, #d4f5df 100%)",
          }}
        >
          {/* Franjas claras de césped cortado */}
          <div
            className="absolute inset-0 opacity-55"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.42) 0px, rgba(255,255,255,0.42) 90px, rgba(16,185,129,0.10) 90px, rgba(16,185,129,0.10) 180px)",
            }}
          />
          <svg
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full opacity-85"
          >
            {/* Líneas de banda y fondo */}
            <rect
              x="70"
              y="55"
              width="1460"
              height="890"
              rx="8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
            />
            {/* Línea de medio campo */}
            <line x1="800" y1="55" x2="800" y2="945" stroke="#ffffff" strokeWidth="6" />
            {/* Círculo central y punto central */}
            <circle cx="800" cy="500" r="135" fill="none" stroke="#ffffff" strokeWidth="6" />
            <circle cx="800" cy="500" r="9" fill="#ffffff" />

            {/* Área grande izquierda */}
            <rect x="70" y="245" width="235" height="510" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="6" />
            {/* Área chica izquierda */}
            <rect x="70" y="370" width="85" height="260" fill="none" stroke="#ffffff" strokeWidth="6" />
            {/* Punto penal y medialuna izquierda */}
            <circle cx="235" cy="500" r="7" fill="#ffffff" />
            <path d="M 305 405 A 115 115 0 0 1 305 595" fill="none" stroke="#ffffff" strokeWidth="6" />

            {/* Área grande derecha */}
            <rect x="1295" y="245" width="235" height="510" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="6" />
            {/* Área chica derecha */}
            <rect x="1445" y="370" width="85" height="260" fill="none" stroke="#ffffff" strokeWidth="6" />
            {/* Punto penal y medialuna derecha */}
            <circle cx="1365" cy="500" r="7" fill="#ffffff" />
            <path d="M 1295 405 A 115 115 0 0 0 1295 595" fill="none" stroke="#ffffff" strokeWidth="6" />

            {/* Tiros de esquina */}
            <path d="M 70 90 A 35 35 0 0 0 105 55" fill="none" stroke="#ffffff" strokeWidth="5" />
            <path d="M 1495 55 A 35 35 0 0 0 1530 90" fill="none" stroke="#ffffff" strokeWidth="5" />
            <path d="M 70 910 A 35 35 0 0 1 105 945" fill="none" stroke="#ffffff" strokeWidth="5" />
            <path d="M 1495 945 A 35 35 0 0 1 1530 910" fill="none" stroke="#ffffff" strokeWidth="5" />
          </svg>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BÁSQUETBOL: CANCHA DE MADERA ARCE CLARA (BASKETBALL COURT)          */}
      {/* ===================================================================== */}
      {sport === "basketball" && (
        <div
          className="w-full h-full relative"
          style={{
            background:
              "linear-gradient(180deg, #fef3c7 0%, #fde68a 45%, #fcd34d 85%, #fef3c7 100%)",
          }}
        >
          {/* Textura sutil de tablones de parquet claro */}
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.45) 0px, rgba(255,255,255,0.45) 26px, rgba(217,119,6,0.12) 26px, rgba(217,119,6,0.12) 52px)",
            }}
          />
          <svg
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full opacity-85"
          >
            {/* Perímetro de la cancha */}
            <rect
              x="70"
              y="55"
              width="1460"
              height="890"
              rx="6"
              fill="rgba(255,251,235,0.22)"
              stroke="#1d4ed8"
              strokeWidth="8"
            />
            {/* Línea central */}
            <line x1="800" y1="55" x2="800" y2="945" stroke="#1d4ed8" strokeWidth="6" />
            {/* Círculo central NBA */}
            <circle cx="800" cy="500" r="125" fill="rgba(59,130,246,0.14)" stroke="#dc2626" strokeWidth="6" />
            <circle cx="800" cy="500" r="45" fill="rgba(245,158,11,0.25)" stroke="#ffffff" strokeWidth="5" />

            {/* Pintura / Zona izquierda */}
            <rect x="70" y="340" width="290" height="320" fill="rgba(234,88,12,0.18)" stroke="#ffffff" strokeWidth="6" />
            <circle cx="360" cy="500" r="95" fill="none" stroke="#ffffff" strokeWidth="6" />
            {/* Arco de 3 puntos izquierdo */}
            <line x1="70" y1="125" x2="240" y2="125" stroke="#dc2626" strokeWidth="6" />
            <line x1="70" y1="875" x2="240" y2="875" stroke="#dc2626" strokeWidth="6" />
            <path d="M 240 125 A 395 395 0 0 1 240 875" fill="none" stroke="#dc2626" strokeWidth="6" />
            {/* Aro izquierdo */}
            <circle cx="135" cy="500" r="18" fill="none" stroke="#ea580c" strokeWidth="5" />

            {/* Pintura / Zona derecha */}
            <rect x="1240" y="340" width="290" height="320" fill="rgba(234,88,12,0.18)" stroke="#ffffff" strokeWidth="6" />
            <circle cx="1240" cy="500" r="95" fill="none" stroke="#ffffff" strokeWidth="6" />
            {/* Arco de 3 puntos derecho */}
            <line x1="1530" y1="125" x2="1360" y2="125" stroke="#dc2626" strokeWidth="6" />
            <line x1="1530" y1="875" x2="1360" y2="875" stroke="#dc2626" strokeWidth="6" />
            <path d="M 1360 125 A 395 395 0 0 0 1360 875" fill="none" stroke="#dc2626" strokeWidth="6" />
            {/* Aro derecho */}
            <circle cx="1465" cy="500" r="18" fill="none" stroke="#ea580c" strokeWidth="5" />
          </svg>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. FÚTBOL AMERICANO: CAMPO EMPASTADO CON YARDAS CLARO (FOOTBALL FIELD) */}
      {/* ===================================================================== */}
      {sport === "football" && (
        <div
          className="w-full h-full relative"
          style={{
            background:
              "linear-gradient(180deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.38) 0px, rgba(255,255,255,0.38) 65px, rgba(22,163,74,0.09) 65px, rgba(22,163,74,0.09) 130px)",
            }}
          />
          <svg
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full opacity-85"
          >
            {/* Perímetro del emparrillado */}
            <rect x="60" y="55" width="1480" height="890" fill="none" stroke="#ffffff" strokeWidth="8" />
            {/* Zonas de Anotación (Endzones) */}
            <rect x="60" y="55" width="140" height="890" fill="rgba(29,78,216,0.16)" stroke="#ffffff" strokeWidth="6" />
            <rect x="1400" y="55" width="140" height="890" fill="rgba(29,78,216,0.16)" stroke="#ffffff" strokeWidth="6" />

            {/* Líneas cada 10 yardas */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
              const xPos = 200 + i * 120;
              const isMid = i === 5;
              return (
                <g key={i}>
                  <line
                    x1={xPos}
                    y1="55"
                    x2={xPos}
                    y2="945"
                    stroke="#ffffff"
                    strokeWidth={isMid ? "7" : "4"}
                  />
                  {/* Hash marks superiores e inferiores */}
                  <line x1={xPos - 60} y1="365" x2={xPos - 60} y2="390" stroke="#ffffff" strokeWidth="3" />
                  <line x1={xPos - 60} y1="610" x2={xPos - 60} y2="635" stroke="#ffffff" strokeWidth="3" />
                </g>
              );
            })}

            {/* Números de yardaje grandes */}
            {[
              { x: 320, label: "10" },
              { x: 440, label: "20" },
              { x: 560, label: "30" },
              { x: 680, label: "40" },
              { x: 800, label: "50" },
              { x: 920, label: "40" },
              { x: 1040, label: "30" },
              { x: 1160, label: "20" },
              { x: 1280, label: "10" },
            ].map((yd, idx) => (
              <g key={idx} fill="rgba(255,255,255,0.88)" fontFamily="monospace" fontWeight="900" fontSize="54" textAnchor="middle">
                <text x={yd.x} y="155">{yd.label}</text>
                <text x={yd.x} y="885">{yd.label}</text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. HOCKEY SOBRE HIELO: PISTA DE HIELO LUMINOSA (ICE RINK)              */}
      {/* ===================================================================== */}
      {sport === "hockey" && (
        <div
          className="w-full h-full relative"
          style={{
            background:
              "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 45%, #bae6fd 85%, #f0f9ff 100%)",
          }}
        >
          {/* Reflejos cristalinos del hielo */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.65) 0px, rgba(255,255,255,0.65) 70px, rgba(56,189,248,0.08) 70px, rgba(56,189,248,0.08) 140px)",
            }}
          />
          <svg
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full opacity-90"
          >
            {/* Borde redondeado de la pista (Rink Boards) */}
            <rect
              x="70"
              y="55"
              width="1460"
              height="890"
              rx="185"
              fill="rgba(255,255,255,0.55)"
              stroke="#0284c7"
              strokeWidth="8"
            />
            {/* Líneas de gol rojas */}
            <line x1="210" y1="90" x2="210" y2="910" stroke="#ef4444" strokeWidth="4" />
            <line x1="1390" y1="90" x2="1390" y2="910" stroke="#ef4444" strokeWidth="4" />

            {/* Líneas azules de zona */}
            <line x1="560" y1="55" x2="560" y2="945" stroke="#0284c7" strokeWidth="10" />
            <line x1="1040" y1="55" x2="1040" y2="945" stroke="#0284c7" strokeWidth="10" />

            {/* Línea roja central punteada */}
            <line
              x1="800"
              y1="55"
              x2="800"
              y2="945"
              stroke="#dc2626"
              strokeWidth="10"
              strokeDasharray="24 16"
            />

            {/* Círculo central de Face-Off */}
            <circle cx="800" cy="500" r="130" fill="rgba(14,165,233,0.08)" stroke="#0284c7" strokeWidth="6" />
            <circle cx="800" cy="500" r="12" fill="#0284c7" />

            {/* 4 Círculos de Face-Off en zonas */}
            {[
              { cx: 365, cy: 275 },
              { cx: 365, cy: 725 },
              { cx: 1235, cy: 275 },
              { cx: 1235, cy: 725 },
            ].map((fc, idx) => (
              <g key={idx}>
                <circle cx={fc.cx} cy={fc.cy} r="110" fill="rgba(239,68,68,0.04)" stroke="#ef4444" strokeWidth="5" />
                <circle cx={fc.cx} cy={fc.cy} r="10" fill="#ef4444" />
              </g>
            ))}

            {/* Áreas de portería (Goal Creases) */}
            <path d="M 210 445 A 55 55 0 0 1 210 555 Z" fill="rgba(56,189,248,0.35)" stroke="#ef4444" strokeWidth="4" />
            <path d="M 1390 445 A 55 55 0 0 0 1390 555 Z" fill="rgba(56,189,248,0.35)" stroke="#ef4444" strokeWidth="4" />
          </svg>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. BÉISBOL: DIAMANTE DE BÉISBOL CLARO Y SOLEADO (BASEBALL DIAMOND)     */}
      {/* ===================================================================== */}
      {sport === "baseball" && (
        <div
          className="w-full h-full relative"
          style={{
            background:
              "linear-gradient(180deg, #dcfce7 0%, #bbf7d0 45%, #fef3c7 100%)",
          }}
        >
          {/* Patrón radial de jardín de béisbol */}
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                "repeating-conic-gradient(from -45deg at 50% 88%, rgba(255,255,255,0.35) 0deg 10deg, rgba(22,163,74,0.08) 10deg 20deg)",
            }}
          />
          <svg
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full opacity-90"
          >
            {/* Arco de Warning Track / Muro del Outfield */}
            <path
              d="M 140 310 A 780 720 0 0 1 1460 310"
              fill="none"
              stroke="#d97706"
              strokeWidth="18"
              strokeOpacity="0.35"
            />

            {/* Tierra del Infield (Arco de arcilla clara) */}
            <path
              d="M 455 615 A 390 390 0 0 1 1145 615 L 800 925 Z"
              fill="rgba(253, 224, 71, 0.45)"
              stroke="#f59e0b"
              strokeWidth="4"
            />

            {/* Líneas de Foul izquierda y derecha */}
            <line x1="800" y1="925" x2="120" y2="265" stroke="#ffffff" strokeWidth="6" />
            <line x1="800" y1="925" x2="1480" y2="265" stroke="#ffffff" strokeWidth="6" />

            {/* Diamante interior de césped (Infield Grass) */}
            <polygon
              points="800,455 1035,685 800,915 565,685"
              fill="rgba(187, 247, 208, 0.75)"
              stroke="#ffffff"
              strokeWidth="6"
            />

            {/* Montículo del lanzador (Pitcher's Mound) */}
            <circle cx="800" cy="685" r="46" fill="#fde68a" stroke="#f59e0b" strokeWidth="4" />
            <rect x="782" y="680" width="36" height="10" rx="3" fill="#ffffff" />

            {/* Círculo de Home Plate y Bases */}
            <circle cx="800" cy="915" r="52" fill="#fde68a" stroke="#f59e0b" strokeWidth="4" />
            {/* 2da Base */}
            <rect x="786" y="441" width="28" height="28" transform="rotate(45 800 455)" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            {/* 1ra Base */}
            <rect x="1021" y="671" width="28" height="28" transform="rotate(45 1035 685)" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            {/* 3ra Base */}
            <rect x="551" y="671" width="28" height="28" transform="rotate(45 565 685)" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            {/* Home Plate */}
            <polygon points="800,930 785,915 785,900 815,900 815,915" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}
