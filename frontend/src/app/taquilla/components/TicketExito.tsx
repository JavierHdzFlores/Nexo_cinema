import React from 'react';
import { motion } from 'motion/react';

interface ResultadoVenta {
  mensaje: string;
  id_venta: number;
  total: number;
  boletos_generados: number;
  estado: string;
}

interface TicketExitoProps {
  resultado: ResultadoVenta;
  nuevaVenta: () => void;
}

export function TicketExito({ resultado, nuevaVenta }: TicketExitoProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      className="max-w-md mx-auto text-center mt-12"
    >
      <div className="relative inline-block mb-8">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#f9a825]/30"
          style={{ padding: "40px" }}
        />
        <div className="text-7xl relative z-10 drop-shadow-[0_0_15px_rgba(249,168,37,0.5)]">🎟️</div>
      </div>
      
      <h2 className="text-3xl font-bold mb-3 tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>¡Transacción Exitosa!</h2>
      <p className="text-gray-400 text-sm mb-10">{resultado.mensaje}</p>

      {/* Ticket visual */}
      <div className="relative rounded-t-3xl rounded-b-xl border border-white/10 p-8 text-left mb-10 overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)" }}>
        
        {/* Adorno superior del ticket */}
        <div className="absolute top-0 left-0 w-full flex justify-around -mt-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-[#030213] shadow-inner"></div>
          ))}
        </div>

        <div className="mt-4 space-y-6">
          <div className="flex flex-col border-b border-white/5 pb-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Folio de Venta</span>
            <span className="font-mono text-2xl font-bold text-white">NEXO-{String(resultado.id_venta).padStart(6, '0')}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Boletos Emitidos</span>
            <span className="font-mono text-xl text-white">{resultado.boletos_generados}</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Monto Total</span>
            <span className="font-mono font-bold text-2xl" style={{ color: "#f9a825" }}>${resultado.total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Estado</span>
            <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              {resultado.estado}
            </span>
          </div>
        </div>

        {/* Adorno inferior del ticket */}
        <div className="absolute bottom-0 left-0 w-full flex justify-around -mb-3 opacity-50">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-[#030213]"></div>
          ))}
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={nuevaVenta}
        className="px-10 py-4 rounded-xl font-bold text-sm text-black uppercase tracking-widest shadow-lg transition-all"
        style={{ background: "linear-gradient(135deg, #f9a825, #ff4e50)" }}>
        Iniciar Nueva Venta
      </motion.button>
    </motion.div>
  );
}
