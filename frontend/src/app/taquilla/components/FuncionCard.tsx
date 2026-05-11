import React from 'react';
import { motion } from 'motion/react';

interface Funcion {
  id: number;
  pelicula: string;
  clasificacion: string;
  duracion_minutos?: number;
  fecha_hora_inicio: string;
  precio_boleto: number;
  id_sala: number;
  sala_nombre: string;
  sala_tipo?: string;
  sala_capacidad?: number;
  imagen_url?: string;
}

interface FuncionCardProps {
  funcion: Funcion;
  onClick: (f: Funcion) => void;
  formatearFecha: (iso: string) => string;
}

// Colores por tipo de sala
const SALA_TIPO_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "IMAX":        { bg: "bg-blue-500/20",   text: "text-blue-300",   border: "border-blue-500/40",   glow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  "VIP":         { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40", glow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
  "Macro XE":    { bg: "bg-cyan-500/20",   text: "text-cyan-300",   border: "border-cyan-500/40",   glow: "shadow-[0_0_8px_rgba(6,182,212,0.5)]" },
  "Tradicional": { bg: "bg-white/5",       text: "text-zinc-400",   border: "border-white/10",       glow: "" },
};

export function FuncionCard({ funcion, onClick, formatearFecha }: FuncionCardProps) {
  const bgImage = funcion.imagen_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=600";
  const tipoStyle = SALA_TIPO_STYLES[funcion.sala_tipo || "Tradicional"] || SALA_TIPO_STYLES["Tradicional"];

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(funcion)}
      className="relative text-left rounded-2xl overflow-hidden transition-all group flex flex-col justify-end"
      style={{ height: "360px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030213] via-[#030213]/80 to-transparent opacity-90" />

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Top: clasificación + precio */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-white bg-[#f9a825] px-2 py-1 rounded shadow-lg uppercase tracking-widest">
            {funcion.clasificacion}
          </span>
          <span className="text-sm font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
            <span style={{ color: "#f9a825" }}>$</span>{funcion.precio_boleto.toFixed(2)}
          </span>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-2xl font-bold text-white leading-none uppercase tracking-wide line-clamp-2" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>
              {funcion.pelicula}
            </h3>
            {/* Sala + Tipo */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-[#f9a825] uppercase tracking-widest bg-[#f9a825]/10 px-2 py-0.5 rounded border border-[#f9a825]/20">
                {funcion.sala_nombre}
              </span>
              {funcion.sala_tipo && funcion.sala_tipo !== "Tradicional" && (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${tipoStyle.bg} ${tipoStyle.text} ${tipoStyle.border} ${tipoStyle.glow}`}>
                  {funcion.sala_tipo}
                </span>
              )}
              {funcion.duracion_minutos && (
                <span className="text-[10px] text-zinc-500 font-medium">
                  {funcion.duracion_minutos} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f9a825] shadow-[0_0_5px_#f9a825]"></div>
            <p className="text-[10px] text-gray-300 font-bold tracking-[0.1em] uppercase">
              {formatearFecha(funcion.fecha_hora_inicio)}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
