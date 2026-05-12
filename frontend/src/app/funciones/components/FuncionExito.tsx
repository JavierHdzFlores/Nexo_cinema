'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Copy, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FuncionResponse } from '../types';

interface FuncionExitoProps {
  resultado: FuncionResponse;
}

export function FuncionExito({ resultado }: FuncionExitoProps) {
  const [copiado, setCopiado] = React.useState(false);

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Icono de Éxito Animado */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-xl opacity-50 animate-pulse" />
          <CheckCircle size={80} className="text-green-400 relative" />
        </motion.div>
      </div>

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          ¡Función Programada
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            {' '}
            Exitosamente
          </span>
          !
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          La función ha sido guardada en el sistema. Los boletos están disponibles para la venta inmediatamente.
        </p>
      </motion.div>

      {/* Detalles de Confirmación */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Información Función */}
        <div className="p-6 rounded-xl bg-black/40 border border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-4">
            📋 Información de la Función
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-1">ID Evento</p>
              <div className="flex items-center justify-between">
                <p className="font-mono font-bold text-white">{resultado.id_evento}</p>
                <button
                  onClick={() => copiarAlPortapapeles(resultado.id_evento.toString())}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                >
                  <Copy size={16} className={copiado ? 'text-green-400' : 'text-gray-400'} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Película</p>
              <p className="font-bold text-white">{resultado.titulo_pelicula}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Sala</p>
              <p className="font-bold text-white">{resultado.nombre_sala}</p>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/15 border border-green-400/30">
          <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-4">
            ⏰ Horarios
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-gray-300 text-xs mb-1">Inicio Función</p>
              <p className="font-mono font-bold text-lg text-white">
                {new Date(resultado.fecha_hora_inicio).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-xs mb-1">Fin Limpieza</p>
              <p className="font-mono font-bold text-lg text-emerald-300">
                {new Date(resultado.fecha_hora_fin).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Resumen de Duración */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
      >
        <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-3">
          📊 Desglose de Duración
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
          <div>
            <p className="text-gray-400">Película</p>
            <p className="font-bold text-white text-lg">
              {(() => {
                const start = new Date(resultado.fecha_hora_inicio);
                const end = new Date(resultado.fecha_hora_fin);
                const totalMs = end.getTime() - start.getTime();
                const totalMin = Math.floor(totalMs / 60000);
                const peliculaMin = totalMin - resultado.duracion_limpieza;
                return `${peliculaMin}m`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Limpieza</p>
            <p className="font-bold text-white text-lg">{resultado.duracion_limpieza}m</p>
          </div>
          <div>
            <p className="text-gray-400">Total</p>
            <p className="font-bold text-white text-lg">
              {(() => {
                const start = new Date(resultado.fecha_hora_inicio);
                const end = new Date(resultado.fecha_hora_fin);
                const totalMs = end.getTime() - start.getTime();
                const totalMin = Math.floor(totalMs / 60000);
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                return `${hours}h ${mins}m`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Estado</p>
            <p className="font-bold text-green-400 text-lg">✓ {resultado.estado}</p>
          </div>
        </div>
      </motion.div>

      {/* Acciones Disponibles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Descargar Comprobante */}
        <button className="group p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 transition-all hover:bg-white/5">
          <Download size={24} className="text-white/60 group-hover:text-white mb-2" />
          <p className="font-bold text-sm text-white">Descargar Comprobante</p>
          <p className="text-xs text-gray-400 mt-1">PDF con detalles de programación</p>
        </button>

        {/* Ver en Cartelera */}
        <Link
          href="/cartelera"
          className="group p-4 rounded-xl bg-gradient-to-br from-[#ff4e50]/20 to-[#f9a825]/20 border border-[#ff4e50]/30 hover:border-[#ff4e50]/50 transition-all hover:bg-gradient-to-br hover:from-[#ff4e50]/30 hover:to-[#f9a825]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-white">Ver en Cartelera</p>
              <p className="text-xs text-gray-400 mt-1">Consultar estado en línea</p>
            </div>
            <ArrowRight
              size={20}
              className="text-[#ff4e50] group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Link>

        {/* Programar Otra */}
        <button className="group p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 transition-all hover:bg-white/5">
          <p className="font-bold text-sm text-white">Programar Otra Función</p>
          <p className="text-xs text-gray-400 mt-1">Volver al inicio del proceso</p>
        </button>
      </motion.div>

      {/* Nota Final */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs"
      >
        <p className="font-bold mb-1">💡 Información:</p>
        <p>
          La función está ahora activa en el sistema. Los clientes pueden comenzar a comprar boletos inmediatamente.
          Los cambios posteriores deben ser realizados por un administrador.
        </p>
      </motion.div>
    </motion.div>
  );
}
