import React from "react";
import Link from "next/link";
import { RentaResponse } from "../types";
import { ShieldCheck, FileText, ArrowRight } from "lucide-react";

interface RentaExitoProps {
  resultado: RentaResponse;
}

export function RentaExito({ resultado }: RentaExitoProps) {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping opacity-50" />
        <ShieldCheck size={48} />
      </div>
      
      <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "1px" }}>
        ¡Reserva <span className="text-emerald-500">Confirmada</span>!
      </h2>
      <p className="text-gray-400 mb-8">{resultado.mensaje}</p>
      
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f9a825]/5 rounded-bl-full" />
        
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
          <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Folio de Evento</span>
          <span className="font-mono text-xl text-[#f9a825] font-bold">#{resultado.id_evento}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Horas Facturadas</span>
            <span className="font-bold">{resultado.desglose_cobro.horas_rentadas} hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Costo Servicios</span>
            <span className="font-bold text-gray-300">
              ${resultado.desglose_cobro.costo_servicios_adicionales.toLocaleString()}
            </span>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-end mt-4">
            <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Cobro Total</span>
            <span className="text-2xl font-bold text-[#f9a825]">
              ${resultado.desglose_cobro.gran_total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <a 
          href={`http://localhost:8000/api/cartelera/renta-sala/${resultado.id_evento}/contrato-pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest text-black bg-gradient-to-r from-[#ff4e50] to-[#f9a825] hover:shadow-[0_0_20px_rgba(249,168,37,0.3)] transition-all flex items-center justify-center gap-3"
        >
          <FileText size={20} />
          <span>Descargar Contrato PDF</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform opacity-50" />
        </a>

        {/* Nuevo botón para conectar el CU-02 con el CU-05 */}
        <Link
          href={`/dulceria?evento=${resultado.id_evento}`}
          className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-white/5 text-[#f9a825] hover:bg-[#f9a825]/10 hover:border-[#f9a825]/50 transition-all border border-white/10 flex items-center justify-center gap-3"
        >
          Añadir Dulcería para el Evento
        </Link>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-transparent text-gray-400 hover:text-white transition-all underline decoration-white/20 underline-offset-4"
        >
          Iniciar Nueva Reserva
        </button>
      </div>
    </div>
  );
}
