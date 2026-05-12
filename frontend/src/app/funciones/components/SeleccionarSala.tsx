'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DoorOpen, Check } from 'lucide-react';
import { FuncionFormData, Sala } from '../types';

interface SeleccionarSalaProps {
  formData: FuncionFormData;
  setFormData: (data: FuncionFormData) => void;
}

export function SeleccionarSala({ formData, setFormData }: SeleccionarSalaProps) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/cartelera/salas');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setSalas(data);
      } catch (error) {
        console.error('Error cargando salas:', error);
        // Fallback a datos mock en caso de error
        setSalas([
          {
            id_sala: 1,
            nombre: 'Sala Premium VIP',
            capacidad: 120,
            tipo: 'IMAX',
            estado: 'Disponible',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  const selectedSala = salas.find(s => s.id_sala === formData.id_sala);

  const getColorBySalaType = (tipo: string) => {
    const colors: { [key: string]: string } = {
      'IMAX': 'from-purple-500 to-indigo-500',
      '3D': 'from-blue-500 to-cyan-500',
      'Tradicional': 'from-amber-500 to-orange-500',
      'Familiar': 'from-green-500 to-emerald-500',
      'Evento': 'from-pink-500 to-rose-500',
    };
    return colors[tipo] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <DoorOpen size={28} className="text-[#ff4e50]" />
          Selecciona una Sala
        </h2>
        <p className="text-gray-400 text-sm">
          Elige la sala donde se exhibirá la película. El sistema validará disponibilidad horaria automáticamente.
        </p>
      </div>

      {/* Sala Seleccionada */}
      {selectedSala && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl bg-gradient-to-r ${getColorBySalaType(selectedSala.tipo)}/10 border-2 border-${getColorBySalaType(selectedSala.tipo)}/30`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-2">✓ Seleccionada</p>
              <p className="text-lg font-bold text-white mb-1">{selectedSala.nombre}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <p>👥 Capacidad: {selectedSala.capacidad} personas</p>
                <p>🎬 Tipo: {selectedSala.tipo}</p>
              </div>
            </div>
            <Check size={24} className="text-[#f9a825]" />
          </div>
        </motion.div>
      )}

      {/* Grilla de Salas */}
      <div>
        <h3 className="text-sm uppercase tracking-widest font-bold text-white/60 mb-4">
          {salas.filter(s => s.estado === 'Disponible').length} Salas Disponibles
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map((sala) => (
              <motion.button
                key={sala.id_sala}
                whileHover={sala.estado === 'Disponible' ? { scale: 1.02 } : {}}
                whileTap={sala.estado === 'Disponible' ? { scale: 0.98 } : {}}
                disabled={sala.estado !== 'Disponible'}
                onClick={() =>
                  sala.estado === 'Disponible' &&
                  setFormData({ ...formData, id_sala: sala.id_sala })
                }
                className={`p-5 rounded-xl text-left transition-all ${
                  formData.id_sala === sala.id_sala
                    ? `bg-gradient-to-br ${getColorBySalaType(sala.tipo)} text-black border border-transparent shadow-lg`
                    : sala.estado === 'Disponible'
                    ? 'bg-black/30 border border-white/10 text-white hover:border-white/30'
                    : 'bg-black/50 border border-red-500/20 text-gray-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-sm">{sala.nombre}</p>
                    <p className="text-xs opacity-75 mt-1">{sala.tipo}</p>
                  </div>
                  {formData.id_sala === sala.id_sala && (
                    <Check size={20} className="text-black" />
                  )}
                </div>
                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-current/20">
                  <span>👥 {sala.capacidad} personas</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      sala.estado === 'Disponible'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {sala.estado}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
