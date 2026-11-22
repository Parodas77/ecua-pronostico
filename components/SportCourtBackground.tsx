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

const STADIUM_IMAGES: Record<SportSurfaceType, { src: string; alt: string }> = {
  soccer: {
    src: "/stadiums/soccer.jpg",
    alt: "Estadio real de Fútbol Soccer",
  },
  basketball: {
    src: "/stadiums/basketball.jpg",
    alt: "Arena real de Baloncesto NBA",
  },
  football: {
    src: "/stadiums/football.jpg",
    alt: "Estadio real de Fútbol Americano NFL",
  },
  hockey: {
    src: "/stadiums/hockey.jpg",
    alt: "Arena real de Hockey sobre Hielo NHL",
  },
  baseball: {
    src: "/stadiums/baseball.jpg",
    alt: "Estadio real de Béisbol MLB",
  },
};

export default function SportCourtBackground({
  sport = "soccer",
}: {
  sport?: SportSurfaceType;
}) {
  const activeStadium = STADIUM_IMAGES[sport] || STADIUM_IMAGES.soccer;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Fotografía real del estadio a pantalla completa con ~5% de desenfoque óptico (blur 2.5px) */}
      <img
        key={activeStadium.src}
        src={activeStadium.src}
        alt={activeStadium.alt}
        fetchPriority="high"
        className="w-full h-full object-cover object-center transition-all duration-500"
        style={{
          filter: "blur(2.5px) brightness(1.03) saturate(1.06)",
          transform: "scale(1.03)",
        }}
      />

      {/* Velo luminoso muy sutil para garantizar contraste perfecto de las tarjetas y textos en primera capa */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(248,250,252,0.12) 50%, rgba(255,255,255,0.18) 100%)",
        }}
      />
    </div>
  );
}
