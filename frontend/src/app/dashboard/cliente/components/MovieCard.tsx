"use client";

import { motion } from "motion/react";
import { Clock, MonitorPlay, Ticket } from "lucide-react";
// Importamos la interfaz si la tienes en un archivo separado, o la declaras aquí
import { FuncionTaquilla } from "./MovieGrid"; 

interface MovieCardProps {
  funcion: FuncionTaquilla;
}

export default function MovieCard({ funcion }: MovieCardProps) {
  // Convertimos la fecha de ISO (del backend) a formato amigable
  const fechaObj = new Date(funcion.fecha_hora_inicio);
  
  // Extraemos la hora (Ej: "18:30")
  const horaFormateada = fechaObj.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extraemos la fecha (Ej: "12 May")
  const fechaFormateada = fechaObj.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

  // Imagen por defecto por si el backend manda una URL vacía
  const imagenMostrar = funcion.imagen_url || "https://via.placeholder.com/400x600?text=Sin+Poster";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative rounded-2xl overflow-hidden bg-[#0a0d18] border border-white/5 hover:border-white/15 transition-all"
    >
      {/* Etiqueta flotante de Precio */}
      <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className="text-[#f9a825] font-bold text-sm">
          ${funcion.precio_boleto}
        </span>
      </div>

      {/* Poster e Información principal */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={imagenMostrar}
          alt={`Poster de ${funcion.pelicula}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        
        {/* Gradiente inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/60 to-transparent" />
        
        {/* Contenido sobrepuesto en la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/80">
              {funcion.clasificacion}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f9a825]/20 text-[#f9a825]">
              {funcion.sala_tipo || "Tradicional"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2">
            {funcion.pelicula}
          </h3>
        </div>
      </div>

      {/* Detalles del horario y sala */}
      <div className="p-5 border-t border-white/5">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-white/60 mb-5">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#ff4e50]" />
            <span>{horaFormateada} ({fechaFormateada})</span>
          </div>
          <div className="flex items-center gap-2">
            <MonitorPlay size={15} className="text-[#ff4e50]" />
            <span className="truncate">{funcion.sala_nombre}</span>
          </div>
        </div>

        {/* Botón de Acción para Taquilla */}
        <button
          onClick={() => console.log("Ir al mapa de asientos con ID Evento:", funcion.id)}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
          style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)', color: '#000' }}
        >
          <Ticket size={18} />
          Seleccionar Asientos
        </button>
      </div>
    </motion.div>
  );
}