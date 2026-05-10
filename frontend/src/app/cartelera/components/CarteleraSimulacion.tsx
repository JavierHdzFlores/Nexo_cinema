import React from "react";
import { motion } from "motion/react";
import { Film, Info } from "lucide-react";
import { SimulacionCartelera, CarteleraFormData, Pelicula } from "../types";

interface Props {
  simulacion: SimulacionCartelera;
  formData: CarteleraFormData;
  peliculaSeleccionada: Pelicula | undefined;
  onGenerar: () => void;
  loading: boolean;
}

export function CarteleraSimulacion({ simulacion, formData, peliculaSeleccionada, onGenerar, loading }: Props) {
  // Convertir a formato 12 horas para display
  const formatTime = (time24: string) => {
    const [h, m] = time24.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // el hora 0 es 12
    return `${hours}:${m} ${ampm}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl"
    >
      <h3 className="font-bebas text-3xl text-amber-500 tracking-wider mb-8">PROGRAMACIÓN APROBADA</h3>
      
      <div className="space-y-6 mb-10">
        <div className="flex justify-between items-end pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Proyección Pública</span>
            <p className="text-white font-medium">{peliculaSeleccionada?.titulo}</p>
          </div>
          <span className="text-xl font-bold">{formatTime(formData.hora_inicio)}</span>
        </div>

        <div className="flex justify-between items-end pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Fin de Película Estimado</span>
            <p className="text-white font-medium">({peliculaSeleccionada?.duracion_minutos} minutos)</p>
          </div>
          <span className="text-xl font-bold">{formatTime(simulacion.hora_fin_pelicula)}</span>
        </div>

        <div className="flex justify-between items-center pt-4 opacity-75">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block text-amber-500/70">Limpieza Obligatoria</span>
            <p className="text-amber-500/80 font-medium text-sm">+ 30 minutos</p>
          </div>
          <span className="text-2xl font-bebas text-amber-500 tracking-widest">FIN: {formatTime(simulacion.hora_fin_limpieza)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onGenerar}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-5 rounded-2xl shadow-[0_10px_30px_-5px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Film className="w-5 h-5" />
              PUBLICAR FUNCIÓN EN TAQUILLA
            </>
          )}
        </button>
        <div className="flex items-center gap-2 justify-center py-2">
          <Info className="w-3.5 h-3.5 text-zinc-600" />
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Evita empalmes automáticos E1</p>
        </div>
      </div>
    </motion.div>
  );
}
