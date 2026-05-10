import React from "react";
import { motion } from "motion/react";
import { AlertCircle, ChevronRight } from "lucide-react";

interface Props {
  error: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
}

export function CotizacionError({ error, setFormData, setError }: Props) {
  const errorMessage = typeof error === "string" ? error : error.mensaje;
  const sugerencias = error.salas_sugeridas || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <AlertCircle className="w-24 h-24 text-red-500" />
      </div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-bold text-red-500 uppercase tracking-widest text-sm">Error de Validación</h3>
      </div>
      
      <p className="text-white text-lg font-medium leading-tight mb-6 relative z-10">
        {errorMessage}
      </p>
      
      {sugerencias.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-red-500/10 relative z-10">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Opciones Disponibles Sugeridas:</p>
          <div className="grid grid-cols-1 gap-2">
            {sugerencias.map((s: any) => (
              <button
                key={s.id_sala}
                onClick={() => {
                  setFormData((prev: any) => ({...prev, id_sala: s.id_sala}));
                  setError(null);
                }}
                className="flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 rounded-xl transition-all group"
              >
                <span className="text-sm font-semibold">{s.nombre || `Sala ${s.id_sala}`}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
