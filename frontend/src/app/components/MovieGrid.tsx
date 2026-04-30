"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MovieCard, type Movie } from "./MovieCard";
import { Filter, ChevronDown } from "lucide-react";



const nowPlayingMovies: Movie[] = [
  {
    id: 1,
    title: "SINGULARITY",
    genre: "Ciencia Ficción",
    rating: 9.1,
    duration: "2h 28min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1648655913393-8cce93fc2a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#4fc3f7",
    isNew: true,
  },
  {
    id: 2,
    title: "DARK MERIDIAN",
    genre: "Thriller",
    rating: 8.7,
    duration: "2h 04min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#ef5350",
    isNew: true,
  },
  {
    id: 3,
    title: "BEYOND THE VOID",
    genre: "Épica Espacial",
    rating: 9.4,
    duration: "2h 52min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1760490196378-85127689ab0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#ab47bc",
  },
  {
    id: 4,
    title: "VELOCITY",
    genre: "Acción",
    rating: 8.2,
    duration: "1h 58min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1512704699053-ca917ea0ba06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#ff7043",
  },
  {
    id: 5,
    title: "SHADOWFALL",
    genre: "Terror",
    rating: 7.9,
    duration: "1h 47min",
    year: 2025,
    image: "https://images.unsplash.com/photo-1766878777925-68fee89a290e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#66bb6a",
  },
  {
    id: 6,
    title: "BURNING HEART",
    genre: "Drama · Romance",
    rating: 8.0,
    duration: "2h 10min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1759568558557-72e79f7c86e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#f48fb1",
    isNew: true,
  },
  {
    id: 7,
    title: "IRON BATTALION",
    genre: "Bélico · Historia",
    rating: 8.5,
    duration: "2h 38min",
    year: 2025,
    image: "https://images.unsplash.com/photo-1600543640063-4ad1ea479bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#ffca28",
  },
  {
    id: 8,
    title: "NEON DREAMS",
    genre: "Animación · Fantasía",
    rating: 8.8,
    duration: "1h 52min",
    year: 2026,
    image: "https://images.unsplash.com/photo-1684610525931-d08fd63577ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    accentColor: "#7c4dff",
    isNew: true,
  },
];

const scheduleData = [
  {
    movie: "SINGULARITY",
    genre: "Ciencia Ficción",
    rating: 9.1,
    duration: "2h 28min",
    image: "https://images.unsplash.com/photo-1648655913393-8cce93fc2a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
    accentColor: "#4fc3f7",
    sessions: [
      { time: "12:00", format: "4DX", available: true, seats: 42 },
      { time: "14:40", format: "IMAX", available: true, seats: 18 },
      { time: "17:20", format: "2D", available: false, seats: 0 },
      { time: "20:00", format: "IMAX", available: true, seats: 95 },
    ],
  },
  {
    movie: "DARK MERIDIAN",
    genre: "Thriller",
    rating: 8.7,
    duration: "2h 04min",
    image: "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
    accentColor: "#ef5350",
    sessions: [
      { time: "11:30", format: "2D", available: true, seats: 67 },
      { time: "13:50", format: "IMAX", available: true, seats: 31 },
      { time: "16:10", format: "2D", available: true, seats: 88 },
      { time: "20:30", format: "4DX", available: true, seats: 12 },
    ],
  },
  {
    movie: "BEYOND THE VOID",
    genre: "Épica Espacial",
    rating: 9.4,
    duration: "2h 52min",
    image: "https://images.unsplash.com/photo-1760490196378-85127689ab0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
    accentColor: "#ab47bc",
    sessions: [
      { time: "13:00", format: "IMAX", available: false, seats: 0 },
      { time: "16:00", format: "4DX", available: true, seats: 5 },
      { time: "19:00", format: "IMAX", available: true, seats: 74 },
      { time: "22:00", format: "2D", available: true, seats: 120 },
    ],
  },
  {
    movie: "VELOCITY",
    genre: "Acción",
    rating: 8.2,
    duration: "1h 58min",
    image: "https://images.unsplash.com/photo-1512704699053-ca917ea0ba06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
    accentColor: "#ff7043",
    sessions: [
      { time: "11:00", format: "2D", available: true, seats: 55 },
      { time: "13:15", format: "4DX", available: true, seats: 28 },
      { time: "15:30", format: "IMAX", available: true, seats: 63 },
      { time: "21:00", format: "2D", available: false, seats: 0 },
    ],
  },
  {
    movie: "NEON DREAMS",
    genre: "Animación",
    rating: 8.8,
    duration: "1h 52min",
    image: "https://images.unsplash.com/photo-1684610525931-d08fd63577ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
    accentColor: "#7c4dff",
    sessions: [
      { time: "10:00", format: "2D", available: true, seats: 110 },
      { time: "12:00", format: "2D", available: true, seats: 85 },
      { time: "14:00", format: "IMAX", available: true, seats: 40 },
      { time: "16:10", format: "2D", available: true, seats: 70 },
    ],
  },
];

const genres = ["Todos", "Acción", "Drama", "Ciencia Ficción", "Terror", "Animación", "Thriller"];

export function MovieGrid() {
  const [activeTab, setActiveTab] = useState<"cartelera" | "horarios">("cartelera");
  const [activeGenre, setActiveGenre] = useState("Todos");

  const filtered = activeGenre === "Todos"
    ? nowPlayingMovies
    : nowPlayingMovies.filter((m) => m.genre.includes(activeGenre));

  return (
    <section className="pb-20" style={{ background: "#080b14" }}>
      {/* Section header + tabs */}
      <div
        className="sticky top-[72px] z-40 px-6 md:px-12 py-5"
        style={{
          background: "rgba(8,11,20,0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Main tabs */}
          <div
            className="flex items-center p-1.5 rounded-2xl gap-1"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {(["cartelera", "horarios"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-6 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: activeTab === tab ? "white" : "rgba(255,255,255,0.45)",
                }}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #ff4e50, #f9a825)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "cartelera" ? "Cartelera" : "Horarios"}
                </span>
              </button>
            ))}
          </div>

          {/* Genre filter (cartelera only) */}
          {activeTab === "cartelera" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
              <Filter size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className="px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: activeGenre === g ? 600 : 400,
                    color: activeGenre === g ? "white" : "rgba(255,255,255,0.45)",
                    background: activeGenre === g
                      ? "linear-gradient(135deg, #ff4e5066, #f9a82566)"
                      : "rgba(255,255,255,0.05)",
                    border: activeGenre === g
                      ? "1px solid rgba(249,168,37,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10">
        <AnimatePresence mode="wait">
          {activeTab === "cartelera" ? (
            <motion.div
              key="cartelera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Section title */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p
                    className="mb-1"
                    style={{ color: "#f9a825", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}
                  >
                    En Cartelera
                  </p>
                  <h2
                    className="text-white"
                    style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "0.05em" }}
                  >
                    Ahora en Cines
                  </h2>
                </div>
                <button
                  className="hidden sm:flex items-center gap-1.5 text-sm"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}
                >
                  Ver todas <ChevronDown size={14} className="rotate-[-90deg]" />
                </button>
              </div>

              {/* Movie Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                    No hay películas en este género actualmente.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="horarios"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p
                    className="mb-1"
                    style={{ color: "#f9a825", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}
                  >
                    Hoy · {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <h2
                    className="text-white"
                    style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "0.05em" }}
                  >
                    Horarios de Hoy
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {scheduleData.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Poster thumb */}
                    <div
                      className="relative rounded-xl overflow-hidden flex-shrink-0"
                      style={{ width: "64px", height: "90px", boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${item.accentColor}30` }}
                    >
                      <img src={item.image} alt={item.movie} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${item.accentColor}20, transparent)` }} />
                    </div>

                    {/* Movie info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          style={{ color: item.accentColor, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
                        >
                          {item.genre}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>{item.duration}</span>
                      </div>
                      <h3
                        className="text-white mb-3"
                        style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "22px", letterSpacing: "0.05em" }}
                      >
                        {item.movie}
                      </h3>

                      {/* Session buttons */}
                      <div className="flex flex-wrap gap-2">
                        {item.sessions.map((session, j) => (
                          <motion.button
                            key={j}
                            whileHover={session.available ? { scale: 1.05 } : {}}
                            whileTap={session.available ? { scale: 0.97 } : {}}
                            className="flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200"
                            disabled={!session.available}
                            style={{
                              background: session.available
                                ? `rgba(255,255,255,0.07)`
                                : "rgba(255,255,255,0.02)",
                              border: session.available
                                ? `1px solid ${item.accentColor}40`
                                : "1px solid rgba(255,255,255,0.05)",
                              cursor: session.available ? "pointer" : "not-allowed",
                              opacity: session.available ? 1 : 0.4,
                            }}
                          >
                            <span
                              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "16px", color: session.available ? "white" : "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}
                            >
                              {session.time}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  background: session.format === "IMAX" ? "#4fc3f720" : session.format === "4DX" ? "#f9a82520" : "rgba(255,255,255,0.05)",
                                  color: session.format === "IMAX" ? "#4fc3f7" : session.format === "4DX" ? "#f9a825" : "rgba(255,255,255,0.5)",
                                  fontFamily: "'Barlow Condensed', sans-serif",
                                  fontWeight: 700,
                                  fontSize: "10px",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {session.format}
                              </span>
                              {session.available && (
                                <span style={{ color: session.seats < 20 ? "#ef5350" : "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontSize: "10px" }}>
                                  {session.seats < 20 ? `¡${session.seats} left!` : `${session.seats}`}
                                </span>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}