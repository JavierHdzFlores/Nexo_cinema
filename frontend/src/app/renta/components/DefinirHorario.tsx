import React from "react";
import { Calendar, Clock, Users, Info } from "lucide-react";
import { RentaFormData } from "../types";

interface DefinirHorarioProps {
  formData: RentaFormData;
  setFormData: (data: RentaFormData) => void;
}

export function DefinirHorario({ formData, setFormData }: DefinirHorarioProps) {
  const inputClass = "w-full bg-[#0a0a0a]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all placeholder:text-zinc-600 autofill:bg-[#0a0a0a] autofill:text-white";

  const HORA_APERTURA = 10;
  const timeSlots = [];
  for (let i = HORA_APERTURA; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const time24 = `${hour}:${minute}`;
      const isPM = i >= 12;
      const hour12 = i > 12 ? i - 12 : (i === 0 ? 12 : i);
      const ampm = isPM ? 'PM' : 'AM';
      timeSlots.push({ value: time24, label: `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}` });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Columna Izquierda: Fecha y Horario */}
      <div className="space-y-6">
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f9a825]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
            <Calendar className="text-[#f9a825]" /> Fecha y Horario
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Fecha del Evento</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-zinc-500 group-focus-within:text-[#f9a825]" />
                </div>
                <input 
                  type="date" 
                  className={inputClass}
                  style={{ colorScheme: "dark" }}
                  value={formData.fecha}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Hora Inicio</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-zinc-500 group-focus-within:text-[#f9a825]" />
                  </div>
                  <select 
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
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
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Hora Fin</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-zinc-500 group-focus-within:text-[#f9a825]" />
                  </div>
                  <select 
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
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
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-[#f9a825]/5 border border-[#f9a825]/20 flex items-start gap-3">
          <Info className="text-[#f9a825] shrink-0" size={18} />
          <p className="text-xs text-gray-400 leading-relaxed">
            El cine opera de <span className="text-[#f9a825]">10:00 AM</span> a <span className="text-[#f9a825]">11:59 PM</span>. Selecciona el horario deseado para verificar las salas disponibles en el siguiente paso.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Detalles del Organizador */}
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff4e50]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
          <Users className="text-[#ff4e50]" /> Detalles del Organizador
        </h3>
        <div className="space-y-4 relative z-10">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Nombre del Organizador / Empresa</label>
            <input 
              placeholder="Ej. Juan Pérez / Tech Corp"
              className={inputClass}
              value={formData.organizador}
              onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Nombre del Evento</label>
            <input 
              placeholder="Ej. Conferencia Anual 2026"
              className={inputClass}
              value={formData.nombre_evento}
              onChange={(e) => setFormData({ ...formData, nombre_evento: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Motivo (Opcional)</label>
            <textarea 
              placeholder="Breve descripción del evento..."
              rows={3}
              className={`${inputClass} resize-none`}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
