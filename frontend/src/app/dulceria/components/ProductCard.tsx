'use client';

/**
 * ProductCard.tsx
 * Representa visualmente un ArticuloDulceria (UML Diagrama 4).
 * Cumple el paso 3 del flujo normal del CU-05:
 *   "El vendedor selecciona los ítems y cantidades indicados por el cliente."
 */

import React from 'react';
import { motion } from 'motion/react';
import type { ArticuloDulceriaResponse } from '../types';

interface ProductCardProps {
  producto: ArticuloDulceriaResponse;
  cantidad: number;
  onAdd: (prod: ArticuloDulceriaResponse) => void;
  onSubtract: (id: number) => void;
}

export function ProductCard({ producto, cantidad, onAdd, onSubtract }: ProductCardProps) {
  const isCombo = producto.tipo_articulo === 'combo';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      className="group flex flex-col justify-between rounded-xl border transition-colors duration-150"
      style={{
        background: cantidad > 0 ? 'rgba(249,168,37,0.04)' : 'rgba(255,255,255,0.02)',
        borderColor: cantidad > 0 ? 'rgba(249,168,37,0.25)' : 'rgba(255,255,255,0.06)',
        padding: '1.25rem',
      }}
    >
      {/* Encabezado: tipo + precio */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{
            background: isCombo ? 'rgba(249,168,37,0.12)' : 'rgba(255,255,255,0.05)',
            color: isCombo ? '#f9a825' : 'rgba(255,255,255,0.35)',
          }}
        >
          {isCombo ? 'Combo' : 'Individual'}
        </span>
        <span className="text-base font-semibold font-mono text-white">
          ${producto.precio.toFixed(2)}
        </span>
      </div>

      {/* Nombre del artículo */}
      <p className="text-sm font-medium text-white/80 leading-snug mb-4 line-clamp-2">
        {producto.nombre}
      </p>

      {/* Controles de cantidad (UML: agregarDetalle / DetalleVenta) */}
      <div className="flex items-center gap-2 mt-auto">
        {cantidad > 0 ? (
          <>
            <button
              onClick={() => onSubtract(producto.id_articulo)}
              aria-label="Reducir cantidad"
              className="flex-1 h-9 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold font-mono" style={{ color: '#f9a825' }}>
              {cantidad}
            </span>
            <button
              onClick={() => onAdd(producto)}
              aria-label="Aumentar cantidad"
              className="flex-1 h-9 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'rgba(249,168,37,0.15)', color: '#f9a825' }}
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={() => onAdd(producto)}
            aria-label="Agregar a la orden"
            className="w-full h-9 rounded-lg text-xs font-semibold uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Agregar
          </button>
        )}
      </div>
    </motion.article>
  );
}
