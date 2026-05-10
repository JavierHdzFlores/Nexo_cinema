import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { CotizacionResponse } from "../types";

interface Props {
  resultado: CotizacionResponse;
}

export function CotizacionExito({ resultado }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <CheckCircle2 className="w-24 h-24 text-emerald-500" />
      </div>
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <h3 className="font-bold text-emerald-500 uppercase tracking-widest text-sm">Cotización Confirmada</h3>
      </div>

      <div className="space-y-6 mb-8 relative z-10">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest mb-1">ID de Folio</span>
          <span className="text-3xl font-bebas text-white tracking-widest">#{resultado.id_cotizacion.toString().padStart(6, '0')}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Renta Sala</span>
            <span className="text-lg font-bold">${resultado.desglose.costo_sala.toLocaleString()}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Alimentos</span>
            <span className="text-lg font-bold">${resultado.desglose.costo_dulceria.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-500/10">
          <span className="text-[10px] text-emerald-500/60 uppercase font-bold tracking-widest mb-1 block text-center">Inversión Total</span>
          <p className="text-5xl font-bebas text-emerald-400 text-center tracking-wider">
            ${resultado.desglose.gran_total.toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-center text-zinc-500 font-medium relative z-10">
        Vigencia de cotización: {new Date(resultado.valida_hasta).toLocaleDateString()}
      </p>
    </motion.div>
  );
}
