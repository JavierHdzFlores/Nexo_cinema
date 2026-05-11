'use client';

/**
 * PaymentModal.tsx
 * Implementa los estados del Diagrama de Estados UML (Diagrama 6 del CU-05):
 *   ValidandoStock → PendienteDePago → Pagada / Finalizada
 *
 * Representa las clases del Diagrama 5 (Dependencias de Venta):
 *   Venta ..> Ticket (genera)
 *   Venta ..> GestorPagosExterno (valida)
 *
 * Modela el Ticket del Diagrama 4 CU-06:
 *   Ticket.generarDetalle(saldoAnt, mov, saldoNvo) y Ticket.imprimir()
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { EstadoVenta, VentaDulceriaResponse, MovimientoMonederoResponse } from '../types';

interface PaymentModalProps {
  estado: EstadoVenta;
  total: number;
  descuentoPuntos: number;
  granTotal: number;
  respuesta: VentaDulceriaResponse | null;
  onConfirmarPago: (metodo: string) => void;
  onCancelar: () => void;
}

const ESTADOS_VISIBLES: EstadoVenta[] = ['ValidandoStock', 'PendienteDePago', 'Pagada', 'Finalizada'];

export function PaymentModal({
  estado,
  total,
  descuentoPuntos,
  granTotal,
  respuesta,
  onConfirmarPago,
  onCancelar,
}: PaymentModalProps) {
  const [metodoPago, setMetodoPago] = useState<string>('Efectivo');
  if (!ESTADOS_VISIBLES.includes(estado)) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: '#0d1017' }}
      >
        {/* Indicador de estado superior */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #ff4e50, #f9a825)' }} />

        <div className="p-8">

          {/* ── Estado: ValidandoStock ── */}
          {estado === 'ValidandoStock' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-white/10 border-t-[#f9a825] animate-spin" />
              <div>
                <p className="text-sm font-semibold text-white/80">Validando inventario</p>
                <p className="text-xs text-white/30 mt-1">Verificando disponibilidad de insumos en almacén...</p>
              </div>
            </div>
          )}

          {/* ── Estado: PendienteDePago ── */}
          {estado === 'PendienteDePago' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mt-1">Confirmar Cobro</h3>
                <p className="text-xs text-white/30 mt-1">
                  Solicite al cliente insertar su tarjeta o entregar efectivo.
                </p>
              </div>

              {/* Desglose del Pago (Ticket.generarDetalle) */}
              <div className="rounded-xl border border-white/6 divide-y divide-white/5"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="px-4 py-3 flex justify-between text-xs font-mono text-white/40">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {descuentoPuntos > 0 && (
                  <div className="px-4 py-3 flex justify-between text-xs font-mono" style={{ color: '#f9a825' }}>
                    <span>Descuento Monedero</span>
                    <span>−${descuentoPuntos.toFixed(2)}</span>
                  </div>
                )}
                <div className="px-4 py-4 flex justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Total</span>
                  <span className="text-2xl font-bold font-mono text-white">${granTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div className="flex bg-white/5 rounded-xl p-1">
                {['Efectivo', 'Tarjeta', 'Transferencia'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetodoPago(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
                      metodoPago === m
                        ? 'bg-[rgba(249,168,37,0.1)] text-[#f9a825] border border-[#f9a825]/50 shadow-sm'
                        : 'text-white/40 hover:text-white/70 border border-transparent'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancelar}
                  className="flex-1 h-11 rounded-xl text-xs font-semibold uppercase tracking-widest border border-white/8 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onConfirmarPago(metodoPago)}
                  className="flex-[2] h-11 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)', color: '#000' }}
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          )}

          {/* ── Estado: Pagada / Finalizada (Ticket emitido) ── */}
          {(estado === 'Pagada' || estado === 'Finalizada') && (
            <div className="space-y-5">
              <div className="text-center py-3 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full border border-green-500/20 flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Venta registrada</p>
                  <p className="text-xs text-white/30 mt-1">{respuesta?.mensaje ?? 'Operación completada.'}</p>
                </div>
              </div>

              {/* Comprobante Venta (Ticket.imprimir — CU-05) */}
              {respuesta && (
                <div
                  className="rounded-xl border border-white/6 divide-y divide-white/5 font-mono text-xs"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="px-4 py-2 flex justify-between text-white/30">
                    <span>ID Venta</span>
                    <span>#{respuesta.id_venta}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between text-white/30">
                    <span>Estado</span>
                    <span className="text-green-400/70">{respuesta.estado}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between text-white">
                    <span className="text-white/50">Total cobrado</span>
                    <span>${respuesta.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Comprobante Monedero — Ticket.generarDetalle(saldoAnt, mov, saldoNvo) CU-06 */}
              {respuesta?.monedero && (
                <div
                  className="rounded-xl border divide-y font-mono text-xs"
                  style={{
                    background: 'rgba(249,168,37,0.04)',
                    borderColor: 'rgba(249,168,37,0.2)',
                    divideColor: 'rgba(249,168,37,0.1)',
                  }}
                >
                  {/* Header del comprobante de puntos */}
                  <div className="px-4 py-2.5 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(249,168,37,0.1)' }}>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
                      Movimiento Monedero
                    </span>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{
                        background: respuesta.monedero.tipo_movimiento === 'Canje'
                          ? 'rgba(249,168,37,0.2)'
                          : 'rgba(255,255,255,0.08)',
                        color: respuesta.monedero.tipo_movimiento === 'Canje' ? '#f9a825' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {respuesta.monedero.tipo_movimiento}
                    </span>
                  </div>

                  {/* Saldo anterior */}
                  <div className="px-4 py-2 flex justify-between text-white/30"
                    style={{ borderBottom: '1px solid rgba(249,168,37,0.08)' }}>
                    <span>Saldo anterior</span>
                    <span>{respuesta.monedero.saldo_anterior} pts</span>
                  </div>

                  {/* Movimiento */}
                  <div className="px-4 py-2 flex justify-between"
                    style={{
                      borderBottom: '1px solid rgba(249,168,37,0.08)',
                      color: respuesta.monedero.puntos_movimiento >= 0 ? '#4ade80' : '#f9a825',
                    }}>
                    <span>{respuesta.monedero.puntos_movimiento >= 0 ? '+ Acumulados' : '− Canjeados'}</span>
                    <span>{Math.abs(respuesta.monedero.puntos_movimiento)} pts</span>
                  </div>

                  {/* Saldo nuevo */}
                  <div className="px-4 py-3 flex justify-between font-semibold"
                    style={{ color: '#f9a825' }}>
                    <span className="text-white/50 font-normal text-[10px] self-end pb-0.5">
                      Nuevo saldo
                    </span>
                    <span className="text-base">{respuesta.monedero.saldo_nuevo} pts</span>
                  </div>
                </div>
              )}

              <button
                onClick={onCancelar}
                className="w-full h-11 rounded-xl text-xs font-semibold uppercase tracking-widest border border-white/8 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                Nueva Venta
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
