'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DoorOpen, Check, Users } from 'lucide-react';
import { FuncionFormData, Sala } from '../types';

interface SeleccionarSalaProps {
  formData: FuncionFormData;
  setFormData: (data: any) => void; // Usamos un updater funcional
}

export function SeleccionarSala({ formData, setFormData }: SeleccionarSalaProps) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/cartelera/salas');
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setSalas(data);
      } catch (error) {
        console.error('Error:', error);
        setSalas([{ id_sala: 1, nombre: 'Sala Premium VIP', capacidad: 120, tipo: 'IMAX', estado: 'Disponible' }]);
      } finally {
        setLoading(false);
      }
    };
    fetchSalas();
  }, []);

  // SOLUCIÓN AL ERROR DE SELECCIÓN:
  // Usamos el estado previo (prev) para asegurar que no se pierdan otros campos
  const handleSelect = (id: number) => {
    setFormData((prev: FuncionFormData) => ({
      ...prev,
      id_sala: id
    }));
  };

  const selectedSala = salas.find(s => s.id_sala === formData.id_sala);

  // Mapeo estático de colores para evitar errores de compilación en Tailwind
  const salaStyles: { [key: string]: string } = {
    'IMAX': 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    '3D': 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    'Tradicional': 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    'Familiar': 'border-green-500/50 bg-green-500/10 text-green-400',
    'Evento': 'border-pink-500/50 bg-pink-500/10 text-pink-400',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <DoorOpen size={28} className="text-[#ff4e50]" />
          Selecciona una Sala
        </h2>
        <p className="text-gray-400 text-sm">CU-01: Paso 2. La capacidad define el límite de boletos.</p>
      </div>

      {/* Resumen de selección con AnimatePresence */}
      <AnimatePresence>
        {selectedSala && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`p-4 rounded-xl border-2 ${salaStyles[selectedSala.tipo] || 'border-gray-500'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Sala Seleccionada</p>
                <p className="text-xl font-bold text-white">{selectedSala.nombre}</p>
                <p className="text-sm opacity-90">{selectedSala.tipo} • {selectedSala.capacidad} Asientos</p>
              </div>
              <Check className="text-white" size={30} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-500 italic">Consultando disponibilidad de salas...</p>
        ) : (
          salas.map((sala) => {
            const isSelected = formData.id_sala === sala.id_sala;
            const isAvailable = sala.estado === 'Disponible';

            return (
              <motion.button
                key={sala.id_sala}
                type="button"
                whileHover={isAvailable ? { scale: 1.02 } : {}}
                whileTap={isAvailable ? { scale: 0.98 } : {}}
                disabled={!isAvailable}
                onClick={() => handleSelect(sala.id_sala)}
                className={`p-5 rounded-xl text-left transition-all border-2 relative overflow-hidden ${
                  isSelected
                    ? 'border-[#f9a825] bg-[#f9a825]/20 shadow-[0_0_20px_rgba(249,168,37,0.15)]'
                    : isAvailable 
                    ? 'border-white/10 bg-white/5 hover:border-white/30 text-white'
                    : 'border-red-900/30 bg-red-950/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="z-10">
                    <p className={`font-bold ${isSelected ? 'text-[#f9a825]' : ''}`}>{sala.nombre}</p>
                    <p className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">{sala.tipo}</p>
                  </div>
                  {isSelected && <Check size={18} className="text-[#f9a825]" />}
                </div>

                <div className="flex items-center gap-2 text-xs opacity-80">
                  <Users size={14} />
                  <span>{sala.capacidad} capacidad</span>
                </div>

                {!isAvailable && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 rounded text-[10px] text-red-400 font-bold">
                    OCUPADA
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}