import React from "react";
import { RentaFormData, Sala } from "../types";

interface ResumenRentaProps {
  formData: RentaFormData;
  selectedSala?: Sala;
  calculateTotal: () => number;
}

export function ResumenRenta({ formData, selectedSala, calculateTotal }: ResumenRentaProps) {
  return (
    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4e50] to-[#f9a825]" />
      <h3 className="text-xs font-black text-[#f9a825] uppercase tracking-[0.3em] mb-8">
        Resumen de Reservación
      </h3>
      
      <div className="space-y-6">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Evento y Organizador</p>
          <p className="text-xl font-bold">{formData.nombre_evento || "Evento Sin Nombre"}</p>
          <p className="text-sm text-gray-400">{formData.organizador || "Organizador no especificado"}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Sala Asignada</p>
            <p className="font-bold text-lg">{selectedSala?.nombre || "N/A"}</p>
            {selectedSala && (
              <p className="text-[10px] text-[#f9a825] uppercase tracking-widest mt-1">
                {selectedSala.tipo} • {selectedSala.capacidad} pax
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Horario Reservado</p>
            <p className="font-bold">{formData.fecha}</p>
            <p className="text-sm text-gray-400">{formData.hora_inicio} - {formData.hora_fin}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Servicios Añadidos</p>
          <div className="flex flex-wrap gap-2">
            {formData.req_microfonos && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">Micrófonos</span>
            )}
            {formData.req_catering && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">Catering Premium</span>
            )}
            {formData.req_iluminacion && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">Iluminación Extra</span>
            )}
            {!formData.req_microfonos && !formData.req_catering && !formData.req_iluminacion && (
              <span className="text-xs text-gray-600 italic">Ningún servicio adicional seleccionado.</span>
            )}
          </div>
        </div>

        <div className="pt-8 mt-4 border-t border-white/10 flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-400">Total a Facturar</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Concepto: Renta de Sala</p>
          </div>
          <p className="text-4xl font-bold text-[#f9a825] tracking-tight">
            ${calculateTotal().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
