import React from "react";
import { RentaFormData } from "../types";
import { Mic, Coffee, Lightbulb } from "lucide-react";

interface ServiciosAdicionalesProps {
  formData: RentaFormData;
  setFormData: (data: RentaFormData) => void;
}

export function ServiciosAdicionales({ formData, setFormData }: ServiciosAdicionalesProps) {
  const servicios = [
    { 
      key: "req_microfonos", 
      label: "Kit de Micrófonos", 
      price: 500, 
      icon: Mic,
      desc: "Sistema inalámbrico y sonido ambiental."
    },
    { 
      key: "req_catering", 
      label: "Catering Premium", 
      price: 3500, 
      icon: Coffee,
      desc: "Bocadillos finos y bebidas para asistentes."
    },
    { 
      key: "req_iluminacion", 
      label: "Iluminación Especial", 
      price: 1200, 
      icon: Lightbulb,
      desc: "Luces de acento y seguimiento."
    },
  ];

  return (
    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9a825]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <h3 className="text-xl font-bold mb-6 relative z-10">Servicios Adicionales</h3>
      <p className="text-sm text-gray-400 mb-8 relative z-10">
        Personaliza tu evento con nuestros servicios extra. El cobro se añadirá automáticamente a tu factura de renta.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {servicios.map((service) => {
          const Icon = service.icon;
          const isSelected = formData[service.key as keyof RentaFormData] as boolean;
          
          return (
            <button
              key={service.key}
              onClick={() => setFormData({ ...formData, [service.key]: !isSelected })}
              className={`p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group/btn ${
                isSelected
                  ? "bg-gradient-to-br from-[#f9a825]/20 to-transparent border-[#f9a825] shadow-[0_0_20px_rgba(249,168,37,0.1)]"
                  : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-[#f9a825] text-black' : 'bg-white/10 text-white'}`}>
                  <Icon size={20} />
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#f9a825] border-[#f9a825]' : 'border-white/30'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                </div>
              </div>
              
              <h4 className="font-bold text-lg mb-1">{service.label}</h4>
              <p className="text-xs text-gray-400 mb-4 h-8">{service.desc}</p>
              
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Costo Adicional</span>
                <span className={`font-bold ${isSelected ? 'text-[#f9a825]' : 'text-white'}`}>
                  +${service.price.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
