'use client';

/**
 * LoyaltyPanel.tsx — CU-06: Gestionar Puntos (Monedero)
 * ─────────────────────────────────────────────────────────────────────────────
 * Implementa el Diagrama de Secuencia CU-06 (Diagrama 3):
 *   Paso 1: solicitarValidacion(id) → Vendedor ingresa ID
 *   Paso 3: retornarSaldo()         → Sistema muestra saldo disponible
 *   Paso 4: seleccionarOperacion()  → Cliente elige Acumular O Canjear
 *
 * Diferencia entre los estados del Diagrama 5 (Estado del Monedero):
 *   "bloqueada" (403) → mensaje específico
 *   "inexistente" (404) → mensaje específico
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type OperacionMonedero = 'acumular' | 'canjear';

interface LoyaltyPanelProps {
  idCliente: number | null;
  puntosDisponibles: number;
  operacion: OperacionMonedero;
  setOperacion: (op: OperacionMonedero) => void;
  onValidarCuenta: (id: string) => Promise<void>;
  onLimpiarCuenta: () => void;
  isLoading: boolean;
  errorCuenta: string | null;
}

export function LoyaltyPanel({
  idCliente,
  puntosDisponibles,
  operacion,
  setOperacion,
  onValidarCuenta,
  onLimpiarCuenta,
  isLoading,
  errorCuenta,
}: LoyaltyPanelProps) {
  const [inputId, setInputId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputId.trim();
    if (id) {
      onValidarCuenta(id);
      setInputId('');
    }
  };

  return (
    <div
      className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4 transition-colors"
      style={{
        background: idCliente ? 'rgba(249,168,37,0.04)' : 'rgba(255,255,255,0.02)',
        borderColor: idCliente ? 'rgba(249,168,37,0.2)' : 'rgba(255,255,255,0.06)',
        minHeight: '56px',
      }}
    >
      {/* Etiqueta izquierda */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center border text-[10px] font-bold"
          style={{
            background: idCliente ? 'rgba(249,168,37,0.12)' : 'rgba(255,255,255,0.04)',
            borderColor: idCliente ? 'rgba(249,168,37,0.25)' : 'rgba(255,255,255,0.08)',
            color: idCliente ? '#f9a825' : 'rgba(255,255,255,0.3)',
          }}
        >
          NX
        </div>
        <div>
          <p className="text-xs font-semibold text-white/70 leading-none">Monedero Nexo</p>
          {idCliente && (
            <p className="text-[10px] text-white/30 mt-0.5">Cliente ID: {idCliente}</p>
          )}
        </div>
      </div>

      {/* Panel derecho — cambia según estado */}
      <AnimatePresence mode="wait">
        {idCliente ? (
          <motion.div
            key="activo"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-5"
          >
            {/* Saldo */}
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/25 leading-none mb-1">Saldo</p>
              <p className="text-base font-semibold font-mono" style={{ color: '#f9a825' }}>
                {puntosDisponibles} pts
              </p>
            </div>

            {/* Selección de operación (Paso 4 CU-06) */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {(['acumular', 'canjear'] as OperacionMonedero[]).map(op => (
                <button
                  key={op}
                  onClick={() => setOperacion(op)}
                  disabled={op === 'canjear' && puntosDisponibles === 0}
                  className="relative px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-30"
                  style={{ color: operacion === op ? '#000' : 'rgba(255,255,255,0.3)' }}
                >
                  {operacion === op && (
                    <motion.span
                      layoutId="monedero-op-pill"
                      className="absolute inset-0 rounded-md"
                      style={{
                        background: op === 'acumular'
                          ? 'linear-gradient(135deg, #f9a825, #ffca28)'
                          : 'linear-gradient(135deg, #ff4e50, #f9a825)',
                        boxShadow: `0 0 12px ${op === 'acumular' ? 'rgba(249,168,37,0.5)' : 'rgba(255,78,80,0.4)'}`
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.25 }}
                    />
                  )}
                  <span className="relative z-10">{op}</span>
                </button>
              ))}
            </div>

            {/* Cambiar cliente */}
            <button
              onClick={onLimpiarCuenta}
              className="text-[10px] font-medium text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
            >
              Cambiar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex flex-col items-end gap-1"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ID del Cliente"
                value={inputId}
                onChange={e => setInputId(e.target.value)}
                className="h-8 px-3 rounded-lg text-xs text-white placeholder:text-white/20 border border-white/8 focus:outline-none focus:border-[#f9a825]/40 transition-colors w-32"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputId.trim()}
                className="h-8 px-4 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
              >
                {isLoading ? 'Validando...' : 'Validar'}
              </button>
            </form>
            {/* Error de cuenta — diferencia bloqueada vs inexistente (E2 CU-06) */}
            {errorCuenta && (
              <p className="text-[10px] text-red-400/60">{errorCuenta}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
