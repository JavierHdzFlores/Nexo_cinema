import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Ticket } from "lucide-react";
import { CarteleraExitoData } from "../types";

interface Props {
  resultado: CarteleraExitoData;
}

export function CarteleraExito({ resultado }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-xl"
    >
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      
      <h3 className="font-bebas text-3xl text-emerald-500 tracking-wider mb-2">FUNCIÓN PUBLICADA</h3>
      <p className="text-emerald-500/80 font-medium mb-8">Folio de Programación #{resultado.id_proyeccion}</p>

      <div className="space-y-4 mb-8">
        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <Ticket className="w-6 h-6 text-zinc-500" />
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Estado en Taquilla</p>
            <p className="text-white font-medium">Boletos disponibles para venta</p>
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Protocolo de Limpieza</p>
            <p className="text-white font-medium">Bloqueado correctamente post-función</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-4 rounded-2xl transition-colors border border-emerald-500/20 tracking-widest text-sm"
      >
        PROGRAMAR OTRA FUNCIÓN
      </button>
    </motion.div>
  );
}
