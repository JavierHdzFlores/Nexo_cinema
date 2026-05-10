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
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Top Section: Price and Classification */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-white bg-[#f9a825] px-2 py-1 rounded shadow-lg uppercase tracking-widest">
            {funcion.clasificacion}
          </span>
          <span className="text-sm font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
            <span style={{ color: "#f9a825" }}>$</span>{funcion.precio_boleto.toFixed(2)}
          </span>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-2xl font-bold text-white leading-none uppercase tracking-wide line-clamp-2" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>
              {funcion.pelicula}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#f9a825] uppercase tracking-widest bg-[#f9a825]/10 px-2 py-0.5 rounded border border-[#f9a825]/20">
                {funcion.sala_nombre}
              </span>
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
