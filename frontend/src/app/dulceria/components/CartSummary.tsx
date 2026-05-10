'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * CartSummary.tsx
 * Representa visualmente el estado del objeto "v : Venta" durante la fase EnCarga.
 * Implementa el Diagrama de Secuencia (CU-05, Diagrama 7):
 *   - Muestra DetalleVenta[] con subtotales calculados.
 *   - Dispara la transición EnCarga → ValidandoStock al confirmar el cobro.
 */

import { useCart } from '../layout';

interface CartSummaryProps {
  total: number;
  descuentoPuntos: number;
  granTotal: number;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartSummary({
  total,
  descuentoPuntos,
  granTotal,
  onClearCart,
  onCheckout,
}: CartSummaryProps) {
  const { carrito: items, agregarProducto, restarProducto, operacion, puntosDisponibles, idCliente } = useCart();

  // Helper para manejar el onAdd antiguo (id, nombre, precio) -> nuevo (producto completo)
  // Pero aquí solo tenemos el ID del item del carrito.
  const handleSubtract = (id: number) => restarProducto(id);
  const handleAdd = (id: number) => {
    const item = items.find(i => i.id_articulo === id);
    if (item) agregarProducto(item);
  };
  return (
    <aside
      className="w-[360px] shrink-0 sticky top-[65px] h-[calc(100vh-65px)] flex flex-col border-l border-white/5"
      style={{ background: 'rgba(8,11,20,0.7)' }}
    >
      {/* Encabezado */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <h2
          className="text-base font-semibold tracking-wide text-white"
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.08em', fontSize: '1.1rem' }}
        >
          Ticket de Venta
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('¿Está seguro de que desea abandonar la carga y limpiar el ticket?')) {
                onClearCart();
              }
            }}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
            style={{
              color: 'rgba(255,100,100,0.8)',
              background: 'rgba(255,80,80,0.08)',
              border: '1px solid rgba(255,80,80,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,80,80,0.18)';
              e.currentTarget.style.color = '#ff6464';
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,80,80,0.08)';
              e.currentTarget.style.color = 'rgba(255,100,100,0.8)';
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.2)';
            }}
          >
            🗑 Limpiar
          </button>
        )}
      </div>

      {/* Lista de DetalleVenta */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center py-16"
            >
              <div
                className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <svg className="w-5 h-5 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/15">
                Orden vacía
              </p>
            </motion.div>
          ) : (
            items.map(item => (
              <motion.div
                key={item.id_articulo}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
              >
                {/* Nombre y precio unitario */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{item.nombre}</p>
                  <p className="text-[11px] text-white/25 font-mono mt-0.5">
                    ${item.precio.toFixed(2)} × {item.cantidad}
                  </p>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-1 rounded-lg border border-white/6 p-0.5"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <button
                    onClick={() => handleSubtract(item.id_articulo)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:bg-white/8 hover:text-white transition-colors text-sm leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-semibold font-mono text-white/60">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => handleAdd(item.id_articulo)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:bg-white/8 hover:text-white transition-colors text-sm leading-none"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-sm font-medium font-mono text-white/70 w-16 text-right">
                  ${item.subtotal.toFixed(2)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Totales y acción de cobro */}
      <div className="px-6 py-5 border-t border-white/5 space-y-4">
        {/* Mejora Dinámica: Puntos (Awareness vs Ahorro) */}
        {total > 0 && idCliente && (
          <div className="px-6 -mx-6 py-3 bg-[#f9a825]/5 border-t border-b border-[#f9a825]/10 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
              {operacion === 'acumular' ? 'Puntos a ganar' : 'Puntos a canjear'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold ${operacion === 'acumular' ? 'text-[#f9a825]' : 'text-red-400'}`}>
                {operacion === 'acumular' 
                  ? `+${Math.floor(total * 0.05)}` 
                  : `-${Math.min(puntosDisponibles, Math.floor(total))}`}
              </span>
              <span className={`text-[10px] font-bold uppercase ${operacion === 'acumular' ? 'text-[#f9a825]/60' : 'text-red-400/60'}`}>
                pts
              </span>
            </div>
          </div>
        )}

        {/* Mejora: Si no hay cliente, incentivar el registro */}
        {total > 0 && !idCliente && (
          <div className="px-6 -mx-6 py-3 bg-white/5 border-t border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/20 font-medium italic">Gana puntos en esta compra</span>
            <span className="text-[10px] font-bold text-[#f9a825]">+{Math.floor(total * 0.05)} pts</span>
          </div>
        )}

        {/* Desglose */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-white/30">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          {operacion === 'canjear' && descuentoPuntos > 0 && (
            <div className="flex justify-between" style={{ color: '#f9a825' }}>
              <span>Descuento puntos</span>
              <span>−${descuentoPuntos.toFixed(2)}</span>
            </div>
          )}
          <div className="h-px bg-white/5 my-1" />
          <div className="flex justify-between text-white text-lg font-bold">
            <span className="text-xs uppercase tracking-widest font-sans text-white/40 self-end pb-0.5">
              Total a Pagar
            </span>
            <span>${granTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón CTA principal */}
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-[0.97] disabled:cursor-not-allowed"
          style={
            items.length > 0
              ? { background: 'linear-gradient(135deg, #ff4e50, #f9a825)', color: '#000' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.06)' }
          }
        >
          {items.length === 0 ? 'Sin artículos' : 'Procesar Venta'}
        </button>
      </div>
    </aside>
  );
}
