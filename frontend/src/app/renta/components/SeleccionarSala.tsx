import React, { useState, useEffect } from "react";
import { Sala, RentaFormData } from "../types";
import { Loader2, MonitorPlay } from "lucide-react";

interface SeleccionarSalaProps {
  formData: RentaFormData;
  setFormData: (data: RentaFormData) => void;
}

export function SeleccionarSala({ formData, setFormData }: SeleccionarSalaProps) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalasDisponibles = async () => {
      setLoading(true);
      setError(null);
      try {
        const isoInicio = `${formData.fecha}T${formData.hora_inicio}:00`;
        const isoFin = `${formData.fecha}T${formData.hora_fin}:00`;
        
        const response = await fetch(`http://localhost:8000/api/cartelera/salas-disponibles?inicio=${isoInicio}&fin=${isoFin}`);
        if (!response.ok) {
          throw new Error("Error al obtener las salas disponibles");
        }
        
        const data = await response.json();
        setSalas(data);
        
        // Autoseleccionar la primera sala si no hay ninguna seleccionada
        if (data.length > 0 && formData.id_sala === 0) {
          setFormData({ ...formData, id_sala: data[0].id_sala });
        } else if (data.length === 0) {
          setFormData({ ...formData, id_sala: 0 }); // Limpiar si no hay salas
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (formData.fecha && formData.hora_inicio && formData.hora_fin) {
      fetchSalasDisponibles();
    }
  }, [formData.fecha, formData.hora_inicio, formData.hora_fin]); // Remove setFormData from dependencies to avoid loop

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
        <Loader2 className="animate-spin text-[#f9a825] mb-4" size={40} />
        <p className="text-gray-400">Buscando salas disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center text-red-500">
        <p className="font-bold mb-2">Error de Conexión</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (salas.length === 0) {
    return (
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
        <MonitorPlay className="mx-auto text-gray-500 mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">No hay salas disponibles</h3>
        <p className="text-gray-400 text-sm">Todas las salas están ocupadas o reservadas en ese horario. Por favor, intenta con otra fecha u horario.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MonitorPlay className="text-[#f9a825]" /> Salas Disponibles
      </h3>
      <p className="text-sm text-gray-400 mb-6">Mostrando solo las salas libres de funciones o rentas en el horario seleccionado.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salas.map((sala) => (
          <button
            key={sala.id_sala}
            onClick={() => setFormData({ ...formData, id_sala: sala.id_sala })}
            className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
              formData.id_sala === sala.id_sala 
                ? "bg-gradient-to-br from-[#f9a825]/20 to-transparent border-[#f9a825] shadow-[0_0_30px_rgba(249,168,37,0.15)]" 
                : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {formData.id_sala === sala.id_sala && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#f9a825]/20 rounded-bl-full -z-10" />
            )}
            
            <div className="flex justify-between items-start mb-4">
              <p className="font-bold text-2xl" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "1px" }}>
                {sala.nombre}
              </p>
              {formData.id_sala === sala.id_sala && (
                <div className="w-3 h-3 rounded-full bg-[#f9a825] shadow-[0_0_10px_#f9a825]" />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sala.tipo === 'IMAX' ? 'bg-blue-500/20 text-blue-400' :
                  sala.tipo === 'VIP' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-white/10 text-gray-300'
                }`}>
                  {sala.tipo}
                </span>
              </p>
              <p className="text-sm text-gray-300 font-medium">{sala.capacidad} Asientos</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
