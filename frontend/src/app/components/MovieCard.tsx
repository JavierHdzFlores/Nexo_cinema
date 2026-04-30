"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Star, Clock, Ticket, Play } from "lucide-react";

export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  duration: string;
  year: number;
  image: string;
  accentColor: string;
  isNew?: boolean;
}

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "2/3" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster Image */}
      <motion.img
        src={movie.image}
        alt={movie.title}
        className="w-full h-full object-cover"
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Base gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(8,11,20,0.95) 0%, rgba(8,11,20,0.3) 50%, rgba(8,11,20,0.1) 100%)",
        }}
      />

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(to top, rgba(8,11,20,0.98) 0%, rgba(8,11,20,0.75) 60%, ${movie.accentColor}20 100%)`,
        }}
      />

      {/* NEW badge */}
      {movie.isNew && (
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs"
          style={{
            background: "linear-gradient(90deg, #ff4e50, #f9a825)",
            color: "white",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontSize: "11px",
          }}
        >
          NUEVO
        </div>
      )}

      {/* Rating badge top right */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Star size={10} fill={movie.accentColor} style={{ color: movie.accentColor }} />
        <span style={{ color: "white", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600 }}>
          {movie.rating}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Always visible info */}
        <div>
          <p
            className="text-xs mb-1"
            style={{
              color: movie.accentColor,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "11px",
            }}
          >
            {movie.genre}
          </p>
          <h3
            className="text-white leading-tight"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "22px",
              letterSpacing: "0.05em",
            }}
          >
            {movie.title}
          </h3>
        </div>

        {/* Hover revealed info */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.3, delay: hovered ? 0.05 : 0 }}
          className="mt-3 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
              <Clock size={11} />
              <span>{movie.duration}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>{movie.year}</span>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #ff4e50, #f9a825)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow: "0 4px 16px rgba(249,168,37,0.3)",
              }}
            >
              <Ticket size={12} />
              Boletos
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            >
              <Play size={13} fill="white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}