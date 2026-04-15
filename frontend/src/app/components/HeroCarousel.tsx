"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Star, Clock, Ticket } from "lucide-react";

const heroMovies = [
  {
    id: 1,
    title: "SINGULARITY",
    subtitle: "El Último Horizonte",
    genre: "Ciencia Ficción",
    rating: 9.1,
    duration: "2h 28min",
    year: 2026,
    description:
      "Cuando los límites de la realidad colapsan, un físico brillante debe enfrentarse al mayor dilema de la humanidad: elegir entre salvar el mundo o preservar su propia existencia. Una épica visual sin precedentes.",
    bgImage: "https://images.unsplash.com/photo-1648655913393-8cce93fc2a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920",
    posterImage: "https://images.unsplash.com/photo-1648655913393-8cce93fc2a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    accentColor: "#4fc3f7",
    gradientFrom: "#0d47a1",
    gradientTo: "#4fc3f7",
    badge: "ESTRENO MUNDIAL",
  },
  {
    id: 2,
    title: "DARK MERIDIAN",
    subtitle: "La Sombra del Pasado",
    genre: "Thriller · Crimen",
    rating: 8.7,
    duration: "2h 04min",
    year: 2026,
    description:
      "En las calles oscuras de una ciudad sin nombre, un detective atormentado rastrea a un asesino en serie que deja pistas imposibles. El tiempo se acaba y la verdad es más retorcida de lo que parece.",
    bgImage: "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920",
    posterImage: "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    accentColor: "#ef5350",
    gradientFrom: "#7f1d1d",
    gradientTo: "#ef5350",
    badge: "ACLAMADA POR LA CRÍTICA",
  },
  {
    id: 3,
    title: "BEYOND THE VOID",
    subtitle: "Al Borde del Universo",
    genre: "Épica Espacial",
    rating: 9.4,
    duration: "2h 52min",
    year: 2026,
    description:
      "La misión más ambiciosa de la historia humana lleva a una tripulación de astronautas más allá de los confines del sistema solar. Lo que descubren cambiará para siempre la definición de vida.",
    bgImage: "https://images.unsplash.com/photo-1760490196378-85127689ab0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920",
    posterImage: "https://images.unsplash.com/photo-1760490196378-85127689ab0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    accentColor: "#ab47bc",
    gradientFrom: "#4a148c",
    gradientTo: "#ab47bc",
    badge: "MEJOR PELÍCULA 2026",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + heroMovies.length) % heroMovies.length);
    },
    []
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => navigate(1), 7000);
    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const movie = heroMovies[current];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "92vh" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image with parallax blur */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={movie.bgImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "blur(2px) brightness(0.35) saturate(1.2)" }}
          />
          {/* gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, rgba(8,11,20,0.97) 0%, rgba(8,11,20,0.7) 45%, rgba(8,11,20,0.2) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(8,11,20,1) 0%, transparent 40%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Ambient color glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 20% 50%, ${movie.accentColor}18 0%, transparent 70%)`,
          transition: "background 1s ease",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 h-full flex items-center" style={{ minHeight: "92vh" }}>
        <div className="w-full flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-20 pb-24">
          {/* Left: Movie Info */}
          <div className="flex-1 max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`info-${current}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-5"
              >
                {/* Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs tracking-widest uppercase"
                    style={{
                      background: `linear-gradient(90deg, ${movie.gradientFrom}99, ${movie.gradientTo}99)`,
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${movie.accentColor}60`,
                      color: movie.accentColor,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {movie.badge}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-sans"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {movie.genre}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h1
                    className="text-white leading-none font-bebas"
                    style={{
                      fontSize: "clamp(56px, 8vw, 96px)",
                      letterSpacing: "0.04em",
                      textShadow: `0 0 60px ${movie.accentColor}40`,
                      lineHeight: 0.9,
                    }}
                  >
                    {movie.title}
                  </h1>
                  <p
                    className="mt-2 uppercase"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "clamp(16px, 2.5vw, 22px)",
                      color: movie.accentColor,
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {movie.subtitle}
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5 font-sans">
                    <Star size={14} fill={movie.accentColor} style={{ color: movie.accentColor }} />
                    <span className="text-white text-sm font-semibold">
                      {movie.rating}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>/10</span>
                  </div>
                  <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <div className="flex items-center gap-1.5 font-sans" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                    <Clock size={13} />
                    {movie.duration}
                  </div>
                  <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <span className="font-sans" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{movie.year}</span>
                </div>

                {/* Description */}
                <p
                  className="leading-relaxed font-sans"
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "15px",
                    maxWidth: "460px",
                    lineHeight: 1.75,
                  }}
                >
                  {movie.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center gap-4 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white relative overflow-hidden group uppercase"
                    style={{
                      background: `linear-gradient(135deg, #ff4e50, #f9a825)`,
                      boxShadow: "0 8px 32px rgba(249, 168, 37, 0.35)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #f9a825, #ff4e50)" }} />
                    <Ticket size={16} className="relative z-10" />
                    <span className="relative z-10">Comprar Boletos</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-full uppercase"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                    }}
                  >
                    <Play size={14} fill="white" />
                    Ver Tráiler
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Movie Poster */}
          <div className="flex-shrink-0 hidden md:block">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`poster-${current}`}
                custom={direction}
                initial={{ opacity: 0, x: 80, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -40, rotateY: -10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
                style={{ perspective: "1000px" }}
              >
                {/* Glow behind poster */}
                <div
                  className="absolute inset-0 rounded-3xl blur-3xl scale-90"
                  style={{ background: `radial-gradient(ellipse at center, ${movie.accentColor}50, transparent 70%)`, transform: "translate(0, 20px) scaleX(0.85)" }}
                />
                <motion.div
                  whileHover={{ scale: 1.03, rotateY: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative rounded-3xl overflow-hidden"
                  style={{
                    width: "clamp(240px, 22vw, 340px)",
                    aspectRatio: "2/3",
                    boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px ${movie.accentColor}25`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <img
                    src={movie.posterImage}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Poster overlay shimmer */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(160deg, ${movie.accentColor}15 0%, transparent 40%, rgba(0,0,0,0.3) 100%)`,
                    }}
                  />
                  {/* Poster bottom info */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bebas text-white" style={{ fontSize: "14px", letterSpacing: "0.1em" }}>
                        {movie.year}
                      </span>
                      <div className="flex items-center gap-1 font-sans">
                        <Star size={11} fill={movie.accentColor} style={{ color: movie.accentColor }} />
                        <span style={{ color: movie.accentColor, fontSize: "12px", fontWeight: 700 }}>
                          {movie.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        {/* Prev */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <ChevronLeft size={18} />
        </motion.button>

        {/* Dots */}
        <div className="flex items-center gap-2.5">
          {heroMovies.map((m, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className="transition-all duration-500 rounded-full"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                background: i === current ? m.accentColor : "rgba(255,255,255,0.25)",
                boxShadow: i === current ? `0 0 12px ${m.accentColor}80` : "none",
              }}
            />
          ))}
        </div>

        {/* Next */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.06)" }}>
        {!isPaused && (
          <motion.div
            key={`progress-${current}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 7, ease: "linear" }}
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${movie.accentColor}, transparent)` }}
          />
        )}
      </div>
    </div>
  );
}