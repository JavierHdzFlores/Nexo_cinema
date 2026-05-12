'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
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

  // Calcular horas de forma segura
  const calcularHoraFin = () => {
    if (!formData.hora_inicio || !pelicula) return null;

    const inicio = new Date(`2000-01-01T${formData.hora_inicio}:00`);
    const duracionTotal = pelicula.duracion_minutos + formData.duracion_limpieza;
    const fin = new Date(inicio.getTime() + duracionTotal * 60000);

    return fin.toTimeString().substring(0, 5);
  };

  // Validar empalmes de horarios
  useEffect(() => {
    const validarConflictos = async () => {
      // Si faltan datos clave, no hacemos la petición
      if (!formData.hora_inicio || !formData.fecha || !formData.id_sala || !pelicula) {
        setConflicto({ existe: false });
        return;
      }

      try {
        const horaFin = calcularHoraFin();
        if (!horaFin) return;

        // Formato ISO estricto para tu backend FastAPI
        const inicioISO = `${formData.fecha}T${formData.hora_inicio}:00`;
        const finISO = `${formData.fecha}T${horaFin}:00`;

        const response = await fetch(
          `http://localhost:8000/api/cartelera/salas-disponibles?inicio=${encodeURIComponent(inicioISO)}&fin=${encodeURIComponent(finISO)}`
        );

        if (response.ok) {
          const salasDisponibles = await response.json();
          // Verificamos si la sala que eligió el usuario viene en la lista de "disponibles"
          const salaDisponible = salasDisponibles.some((s: any) => s.id_sala === formData.id_sala);

          if (!salaDisponible) {
            setConflicto({
              existe: true,
              mensaje: 'Esta sala ya está ocupada en el horario seleccionado.',
            });
          } else {
            setConflicto({ existe: false });
          }
        }
      } catch (error) {
        console.error('Error validando conflictos:', error);
      }
    };

    validarConflictos();
  }, [formData.hora_inicio, formData.fecha, formData.id_sala, pelicula]);

  const horaFin = calcularHoraFin();

  // Formatear fecha segura
  const fechaFormateada = formData.fecha 
    ? new Date(`${formData.fecha}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      })
    : 'No definida';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle size={28} className="text-[#f9a825]" />
          Resumen de Programación
        </h2>
        <p className="text-gray-400 text-sm">
          Verifica todos los detalles antes de confirmar. El sistema valida automáticamente conflictos de horario.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Película */}
        <motion.div className="p-6 rounded-xl bg-black/40 border border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-4">🎬 Película</p>
          {pelicula ? (
            <div className="space-y-2">
              <p className="text-lg font-bold text-white">{pelicula.titulo}</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p>📽️ Director: {pelicula.director}</p>
                <p>⏱️ Duración: <span className="font-bold text-[#f9a825]">{pelicula.duracion_minutos} min</span></p>
                <p>🎭 Género: {pelicula.genero}</p>
                <p>🏷️ Clasificación: <span className="px-2 py-0.5 rounded bg-white/10">{pelicula.clasificacion}</span></p>
              </div>
            </div>
          ) : (
            <p className="text-red-400 italic font-bold">Error: Película no seleccionada</p>
          )}
        </motion.div>

        {/* Sala */}
        <motion.div className="p-6 rounded-xl bg-black/40 border border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-4">🚪 Sala</p>
          {sala ? (
            <div className="space-y-2">
              <p className="text-lg font-bold text-white">{sala.nombre}</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p>👥 Capacidad: {sala.capacidad} personas</p>
                <p>🎬 Tipo: {sala.tipo}</p>
                <p>Estado: <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">{sala.estado}</span></p>
              </div>
            </div>
          ) : (
            <p className="text-red-400 italic font-bold">Error: Sala no seleccionada</p>
          )}
        </motion.div>

        {/* Horario Función */}
        <motion.div className="p-6 rounded-xl bg-gradient-to-br from-[#ff4e50]/15 to-[#f9a825]/15 border border-[#ff4e50]/30">
          <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-4">⏰ Horario de Función</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fecha:</span>
              <span className="font-bold text-white uppercase">{fechaFormateada}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inicio:</span>
              <span className="font-mono font-bold text-[#ff4e50] text-lg">{formData.hora_inicio || '--:--'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fin Película:</span>
              <span className="font-mono font-bold text-white text-lg">{horaFin || 'Calculando...'}</span>
            </div>
          </div>
        </motion.div>

        {/* Horario Limpieza */}
        <motion.div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-400/30">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-4">🧹 Horario de Limpieza</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inicio Limpieza:</span>
              <span className="font-mono font-bold text-blue-300 text-lg">{horaFin || '--:--'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fin Limpieza:</span>
              <span className="font-mono font-bold text-blue-300 text-lg">
                {horaFin 
                  ? new Date(new Date(`2000-01-01T${horaFin}:00`).getTime() + formData.duracion_limpieza * 60000).toTimeString().substring(0, 5)
                  : '--:--'}
              </span>
            </div>
            <div className="text-xs text-gray-400 px-3 py-2 rounded bg-black/30 border border-white/5">
              Limpieza obligatoria: {formData.duracion_limpieza} minutos
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validación de Conflictos */}
      <motion.div className={`p-4 rounded-xl border ${conflicto.existe ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <div className="flex items-start gap-3">
          {conflicto.existe ? <AlertTriangle className="text-red-400" size={20} /> : <CheckCircle className="text-green-400" size={20} />}
          <div>
            <p className={`font-bold text-sm ${conflicto.existe ? 'text-red-400' : 'text-green-400'}`}>
              {conflicto.existe ? 'Conflicto de Horario Detectado' : 'Horario Disponible'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {conflicto.existe ? conflicto.mensaje : 'No hay empalmes. La función puede programarse correctamente.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}