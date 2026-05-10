import React from "react";
import { Building2, Calendar, Clock, Users, Coffee, DollarSign, ChevronRight } from "lucide-react";
import { CotizacionFormData } from "../types";

interface Props {
  formData: CotizacionFormData;
  setFormData: React.Dispatch<React.SetStateAction<CotizacionFormData>>;
  onSimular: () => void;
  onCancel: () => void;
}

// Capacidades de aforo definidas por la logística del cine
const CAPACIDAD_POR_SALA: Record<number, number> = {
  1: 50,  // Sala 1 IMAX
  2: 100, // Sala 2 VIP
  3: 150, // Sala 3 Tradicional
  4: 200, // Sala 4 Macro XE
  5: 300  // Sala 5 Auditorio
};

export function CotizacionForm({ formData, setFormData, onSimular, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const maxCapacidadActual = CAPACIDAD_POR_SALA[formData.id_sala] || 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validaciones estrictas de frontera
    if (name === "asistentes") {
      let val = Number(value);
      if (val < 0) val = 0;
      if (val > maxCapacidadActual) val = maxCapacidadActual;
      setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }

    if (name === "id_sala") {
      const nuevaSala = Number(value);
      const nuevaCapacidad = CAPACIDAD_POR_SALA[nuevaSala] || 100;
      
      setFormData(prev => ({ 
        ...prev, 
        id_sala: nuevaSala,
        // Si al cambiar de sala los invitados actuales exceden la nueva capacidad, los ajustamos al nuevo máximo
        asistentes: prev.asistentes > nuevaCapacidad ? nuevaCapacidad : prev.asistentes
      }));
      return;
    }
    
    if (name === "costo_base_hora") {
      let val = Number(value);
      if (val < 0) val = 0;
      if (val > 50000) val = 50000;
      setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }

    if (name === "nombre_cliente") {
      if (value.length > 100) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generador de intervalos de 30 minutos desde 10:00 hasta 23:30
  const timeSlots = [];
  for (let i = 10; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      if (i === 23 && j === 30) break;
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const time24 = `${hour}:${minute}`;
      
      const isPM = i >= 12;
      const hour12 = i > 12 ? i - 12 : (i === 0 ? 12 : i);
      const ampm = isPM ? 'PM' : 'AM';
      const label = `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`;

      timeSlots.push({ value: time24, label });
    }
  }
  timeSlots.push({ value: "23:30", label: "11:30 PM" });

  const inputClass = "w-full bg-[#0a0a0a]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 autofill:bg-[#0a0a0a] autofill:text-white";

  return (
    <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      <h2 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
        <Building2 className="w-5 h-5 text-amber-500" />
        Configuración del Evento
      </h2>

      <form className="grid grid-cols-1 gap-6" onSubmit={(e) => e.preventDefault()}>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nombre del Cliente Corporativo</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              name="nombre_cliente"
              value={formData.nombre_cliente}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Ej. Empresa SA de CV"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Sala a Rentar</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <select
                name="id_sala"
                value={formData.id_sala}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value={1} className="bg-[#0a0a0a]">Sala #1 - IMAX (50 pax)</option>
                <option value={2} className="bg-[#0a0a0a]">Sala #2 - VIP (100 pax)</option>
                <option value={3} className="bg-[#0a0a0a]">Sala #3 - Tradicional (150 pax)</option>
                <option value={4} className="bg-[#0a0a0a]">Sala #4 - Macro XE (200 pax)</option>
                <option value={5} className="bg-[#0a0a0a]">Sala #5 - Auditorio (300 pax)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Costo Base por Hora ($)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <input
                type="number"
                name="costo_base_hora"
                value={formData.costo_base_hora || ""}
                onChange={handleInputChange}
                min="0"
                max="50000"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Fecha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                min={today}
                onChange={handleInputChange}
                className={`${inputClass} cursor-pointer`}
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Hora Inicio</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <select
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="" disabled className="bg-[#0a0a0a]">Selecciona...</option>
                {timeSlots.map(slot => (
                  <option key={`start-${slot.value}`} value={slot.value} className="bg-[#0a0a0a]">
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Hora Fin</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <select
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="" disabled className="bg-[#0a0a0a]">Selecciona...</option>
                {timeSlots.map(slot => (
                  <option key={`end-${slot.value}`} value={slot.value} className="bg-[#0a0a0a]">
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Aforo Estimado (Máx. {maxCapacidadActual})</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <input
                type="number"
                name="asistentes"
                value={formData.asistentes || ""}
                onChange={handleInputChange}
                min="0"
                max={maxCapacidadActual}
                className={inputClass}
                placeholder={`Ej. ${Math.floor(maxCapacidadActual / 2)} invitados`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Paquetes de Dulcería</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Coffee className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <select
                name="paquete_dulceria"
                value={formData.paquete_dulceria}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="Ninguno" className="bg-[#0a0a0a]">Sin Servicio</option>
                <option value="Basico" className="bg-[#0a0a0a]">Combo Básico ($150 p/p)</option>
                <option value="Premium" className="bg-[#0a0a0a]">Combo Premium ($250 p/p)</option>
                <option value="VIP" className="bg-[#0a0a0a]">Experiencia VIP ($400 p/p)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onSimular}
            className="flex-1 bg-amber-500/5 text-amber-500 border border-amber-500/30 font-bold py-4 px-6 rounded-2xl hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            CALCULAR PRESUPUESTO
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-red-500/5 hover:bg-red-500/20 text-red-400 font-medium rounded-2xl transition-colors border border-red-500/20 uppercase tracking-widest text-xs"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

