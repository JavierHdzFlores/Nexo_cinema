import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, Clock } from "lucide-react";
import { CarteleraFormData } from "../types";

interface Props {
  error: string;
  setError: (e: string | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<CarteleraFormData>>;
}

export function CarteleraError({ error, setError, setFormData }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="font-bebas text-3xl text-red-500 tracking-wider mb-4">EXCEPCIÓN E1: CONFLICTO DE HORARIO</h3>
      
      <p className="text-zinc-300 leading-relaxed mb-8">
        {error}
      </p>

      <div className="bg-[#0a0a0a] rounded-xl p-4 mb-8 border border-white/5">
        <div className="flex items-center gap-3 text-amber-500 text-sm font-medium mb-2">
          <Clock className="w-4 h-4" />
          Sugerencia del Sistema
        </div>
        <p className="text-zinc-400 text-sm">
          Por favor, selecciona una sala distinta o ajusta la "Hora de Inicio" para que no interfiera con proyecciones previas y sus tiempos de limpieza obligatoria.
        </p>
      </div>

      <button
        onClick={() => {
          setError(null);
          // Opcional: sugerir una hora diferente
        }}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-4 rounded-2xl transition-colors border border-red-500/20 tracking-widest text-sm"
      >
        AJUSTAR HORARIO
      </button>
    </motion.div>
  );
}
