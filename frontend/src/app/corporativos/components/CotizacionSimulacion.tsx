import React from "react";
import { motion } from "motion/react";
import { Building2, Info } from "lucide-react";
import { SimulacionData, CotizacionFormData } from "../types";

interface Props {
  simulacion: SimulacionData;
  formData: CotizacionFormData;
  onGenerar: () => void;
  loading: boolean;
}

export function CotizacionSimulacion({ simulacion, formData, onGenerar, loading }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl"
    >
      <h3 className="font-bebas text-3xl text-amber-500 tracking-wider mb-8">DESGLOSE ESTIMADO</h3>
      
      <div className="space-y-6 mb-10">
        <div className="flex justify-between items-end pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Uso de Infraestructura</span>
            <p className="text-white font-medium">Renta Sala #{formData.id_sala} ({simulacion.horas})</p>
          </div>
          <span className="text-xl font-bold">${simulacion.costo_sala.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-end pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Servicios de Catering</span>
            <p className="text-white font-medium">{formData.paquete_dulceria} ({formData.asistentes} pax)</p>
          </div>
          <span className="text-xl font-bold">${simulacion.costo_dulceria.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center pt-4">
          <span className="font-bebas text-2xl text-amber-500 tracking-widest">TOTAL</span>
          <span className="text-5xl font-bebas text-white tracking-widest">${simulacion.total.toLocaleString()}</span>
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
              <Building2 className="w-5 h-5" />
              GUARDAR COTIZACIÓN
            </>
          )}
        </button>
        <div className="flex items-center gap-2 justify-center py-2">
          <Info className="w-3.5 h-3.5 text-zinc-600" />
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Este documento no reserva la sala</p>
        </div>
      </div>
    </motion.div>
  );
}
