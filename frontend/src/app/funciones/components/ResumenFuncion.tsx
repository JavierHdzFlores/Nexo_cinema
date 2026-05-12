'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { FuncionFormData, Pelicula, Sala } from '../types';

interface ResumenFuncionProps {
  formData: FuncionFormData;
  pelicula?: Pelicula;
  sala?: Sala;
}

interface ConflictoHorario {
  existe: boolean;
  mensaje?: string;
}

export function ResumenFuncion({ formData, pelicula, sala }: ResumenFuncionProps) {
  const [conflicto, setConflicto] = useState<ConflictoHorario>({ existe: false });

  // Calcular horas
  const calcularHoraFin = () => {
    if (!formData.hora_inicio || !pelicula) return null;

    const inicio = new Date(`2000-01-01T${formData.hora_inicio}`);
    const duracionTotal = pelicula.duracion_minutos + formData.duracion_limpieza;
    const fin = new Date(inicio.getTime() + duracionTotal * 60000);

    return fin.toTimeString().substring(0, 5);
  };

  // Validar empalmes de horarios
  useEffect(() => {
    const validarConflictos = async () => {
      if (!formData.hora_inicio || !formData.fecha || !pelicula) {
        setConflicto({ existe: false });
        return;
      }

      try {
        // Calcular hora de fin
        const inicio = new Date(`2000-01-01T${formData.hora_inicio}`);
        const duracionTotal = pelicula.duracion_minutos + formData.duracion_limpieza;
        const fin = new Date(inicio.getTime() + duracionTotal * 60000);
        const horaFin = fin.toTimeString().substring(0, 5);

        // Llamar al backend para validar disponibilidad de sala
        const response = await fetch(
          `http://localhost:8000/api/cartelera/salas-disponibles?inicio=${encodeURIComponent(
            `${formData.fecha}T${formData.hora_inicio}:00`
          )}&fin=${encodeURIComponent(`${formData.fecha}T${horaFin}:00`)}`
        );

        if (response.ok) {
          const salasDisponibles = await response.json();
          const salaDisponible = salasDisponibles.some((s: any) => s.id_sala === formData.id_sala);

          if (!salaDisponible) {
            setConflicto({
              existe: true,
              mensaje: 'Esta sala no está disponible en el horario seleccionado.',
            });
          } else {
            setConflicto({ existe: false });
          }
        } else {
          setConflicto({ existe: false });
        }
      } catch (error) {
        console.error('Error validando conflictos:', error);
        setConflicto({ existe: false });
      }
    };

    validarConflictos();
  }, [formData, pelicula, sala]);

  const horaFin = calcularHoraFin();
  const duracionTotal = pelicula ? pelicula.duracion_minutos + formData.duracion_limpieza : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle size={28} className="text-[#f9a825]" />
          Resumen de Programación
        </h2>
        <p className="text-gray-400 text-sm">
          Verifica todos los detalles antes de confirmar. El sistema valida automáticamente conflictos de horario.
        </p>
      </div>

      {/* Grilla de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Película */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all"
        >
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-4">
            🎬 Película
          </p>
          {pelicula ? (
            <div className="space-y-2">
              <p className="text-lg font-bold text-white">{pelicula.titulo}</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p>📽️ Director: {pelicula.director}</p>
                <p>⏱️ Duración: <span className="font-bold text-[#f9a825]">{pelicula.duracion_minutos} minutos</span></p>
                <p>🎭 Género: {pelicula.genero}</p>
                <p>🏷️ Clasificación: <span className="px-2 py-0.5 rounded bg-white/10">{pelicula.clasificacion}</span></p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No seleccionada</p>
          )}
        </motion.div>

        {/* Sala */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all"
        >
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-4">
            🚪 Sala
          </p>
          {sala ? (
            <div className="space-y-2">
              <p className="text-lg font-bold text-white">{sala.nombre}</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p>👥 Capacidad: {sala.capacidad} personas</p>
                <p>🎬 Tipo: {sala.tipo}</p>
                <p>
                  Estado:{' '}
                  <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">
                    {sala.estado}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No seleccionada</p>
          )}
        </motion.div>

        {/* Horario Función */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#ff4e50]/15 to-[#f9a825]/15 border border-[#ff4e50]/30"
        >
          <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-4">
            ⏰ Horario de Función
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fecha:</span>
              <span className="font-bold text-white">
                {new Date(formData.fecha).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inicio:</span>
              <span className="font-mono font-bold text-[#ff4e50] text-lg">{formData.hora_inicio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fin Película:</span>
              <span className="font-mono font-bold text-white text-lg">
                {horaFin || 'Calculando...'}
              </span>
            </div>
            <div className="text-xs text-gray-400 px-3 py-2 rounded bg-black/30 border border-white/5">
              Duración película: {pelicula?.duracion_minutos} min
            </div>
          </div>
        </motion.div>

        {/* Horario Limpieza */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-400/30"
        >
          <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-4">
            🧹 Horario de Limpieza
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inicio Limpieza:</span>
              <span className="font-mono font-bold text-blue-300 text-lg">{horaFin || 'Calculando...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fin Limpieza:</span>
              <span className="font-mono font-bold text-blue-300 text-lg">
                {horaFin
                  ? new Date(`2000-01-01T${horaFin}`).getTime() + 30 * 60000 <= 86400000
                    ? new Date(new Date(`2000-01-01T${horaFin}`).getTime() + 30 * 60000)
                        .toTimeString()
                        .substring(0, 5)
                    : 'Siguiente día'
                  : 'Calculando...'}
              </span>
            </div>
            <div className="text-xs text-gray-400 px-3 py-2 rounded bg-black/30 border border-white/5">
              Limpieza obligatoria: {formData.duracion_limpieza} minutos
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validación de Conflictos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`p-4 rounded-xl border ${
          conflicto.existe
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}
      >
        <div className="flex items-start gap-3">
          {conflicto.existe ? (
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div>
            <p
              className={`font-bold text-sm ${
                conflicto.existe ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {conflicto.existe ? 'Conflicto de Horario Detectado' : 'Horario Disponible'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {conflicto.existe
                ? conflicto.mensaje || 'Existe empalme con otra función en esta sala'
                : 'No hay conflictos de horario. La función puede programarse correctamente.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Nota de Operación */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs"
      >
        <p className="font-bold mb-1">📝 Nota:</p>
        <p>
          Una vez confirmes, la función se guardará en el sistema y los boletos estarán disponibles para la venta
          inmediatamente.
        </p>
      </motion.div>
    </motion.div>
  );
}
