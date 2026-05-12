'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock } from 'lucide-react';
import { FuncionFormData } from '../types';

interface DefinirFechaProps {
  formData: FuncionFormData;
  setFormData: (data: FuncionFormData) => void;
}

export function DefinirFecha({ formData, setFormData }: DefinirFechaProps) {
  // Calcular fecha mínima (hoy) y máxima (90 días adelante)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Calendar size={28} className="text-[#ff4e50]" />
          Define la Fecha y Horario
        </h2>
        <p className="text-gray-400 text-sm">
          Selecciona cuándo y a qué hora comenzará la función. El sistema calculará automáticamente el horario de fin.
        </p>
      </div>

      {/* Contenedor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda - Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Fecha */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">
              📅 Fecha de la Función
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#f9a825] focus:ring-1 focus:ring-[#f9a825]/20 transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">
              Disponible desde hoy hasta 90 días adelante
            </p>
          </div>

          {/* Hora de Inicio */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">
              ⏰ Hora de Inicio
            </label>
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#f9a825] focus:ring-1 focus:ring-[#f9a825]/20 transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">
              Elige la hora de inicio de la película
            </p>
          </div>

          {/* Información de Limpieza */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-[#f9a825]/10 border border-[#f9a825]/20"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-[#f9a825] mb-2">
              ⚙️ Parámetro del Sistema
            </p>
            <p className="text-sm text-white">
              Limpieza Obligatoria: <span className="font-bold text-[#f9a825]">30 minutos</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Se agregará automáticamente después de la duración de la película
            </p>
          </motion.div>
        </motion.div>

        {/* Columna Derecha - Resumen Calculado */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          {/* Card Película */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-2">
              🎬 Película Seleccionada
            </p>
            <p className="text-sm text-white/80">
              Ver película anterior para detalles
            </p>
          </div>

          {/* Card Sala */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-2">
              🚪 Sala Seleccionada
            </p>
            <p className="text-sm text-white/80">
              Ver sala anterior para detalles
            </p>
          </div>

          {/* Resumen Horario */}
          {formData.fecha && formData.hora_inicio && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#ff4e50]/20 to-[#f9a825]/20 border border-[#ff4e50]/30"
            >
              <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-3">
                📋 Resumen Temporal Calculado
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Fecha:</span>
                  <span className="font-bold text-white">
                    {new Date(formData.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Inicio Función:</span>
                  <span className="font-bold text-white">{formData.hora_inicio}</span>
                </div>
                <div className="border-t border-white/10 my-2 pt-2">
                  <p className="text-xs text-white/40 mb-1">
                    (Se recalculará con datos de película en resumen final)
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Advertencia de Validación */}
          {formData.fecha && formData.hora_inicio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs"
            >
              ✓ La validación de empalmes se ejecutará en el resumen final
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
