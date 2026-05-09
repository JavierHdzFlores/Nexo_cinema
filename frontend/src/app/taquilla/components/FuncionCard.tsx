import React from 'react';
import { motion } from 'motion/react';

interface Funcion {
  id: number;
  pelicula: string;
  clasificacion: string;
  fecha_hora_inicio: string;
  precio_boleto: number;
  id_sala: number;
  sala_nombre: string;
  imagen_url?: string;
}

interface FuncionCardProps {
  funcion: Funcion;
  onClick: (f: Funcion) => void;
  formatearFecha: (iso: string) => string;
}

export function FuncionCard({ funcion, onClick, formatearFecha }: FuncionCardProps) {
  // Use a fallback image if none provided
  const bgImage = funcion.imagen_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=600";

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(funcion)}
      className="relative text-left rounded-2xl overflow-hidden transition-all group flex flex-col justify-end"
      style={{
        height: "360px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030213] via-[#030213]/80 to-transparent opacity-90" />

      {/* Content */}
      <div className="relative z-10 p-5 w-full flex flex-col gap-2">
        {/* Top Badges (Price / Room) */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span className="text-sm font-bold text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
            <span style={{ color: "#f9a825" }}>$</span>{funcion.precio_boleto.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-black uppercase tracking-widest px-2 py-1 rounded bg-[#f9a825] shadow-lg">
            {funcion.sala_nombre}
          </span>
        </div>

        {/* Bottom Text */}
        <div className="mt-auto">
          {funcion.clasificacion && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#ff4e50" }}>
              {funcion.clasificacion === 'A' ? 'Apta p/Todos' : funcion.clasificacion === 'B15' ? 'Drama · Ficción' : 'Restringida'}
            </span>
          )}
          <h3 className="text-2xl font-bold text-white leading-tight uppercase tracking-wide" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>
            {funcion.pelicula}
          </h3>
          <p className="text-xs text-gray-300 mt-2 font-medium">
            {formatearFecha(funcion.fecha_hora_inicio)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
