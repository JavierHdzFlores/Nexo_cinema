'use client';

/**
 * ProductCard.tsx — Layout vertical, más ancha y compacta.
 * Imagen arriba (más pequeña), nombre + precio + botón abajo.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ArticuloDulceriaResponse } from '../types';

interface ProductCardProps {
  producto: ArticuloDulceriaResponse;
  cantidad: number;
  onAdd: (prod: ArticuloDulceriaResponse) => void;
  onSubtract: (id: number) => void;
}

const getProductImage = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes('palomitas')) return 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('refresco') || n.includes('cola') || n.includes('manzana')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80';
  if (n.includes('agua')) return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('jugo') || n.includes('limonada')) return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('nachos')) return 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('hot dog')) return 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=400&q=80';
  if (n.includes('pizza')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80';
  if (n.includes('papas')) return 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chocolate')) return 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('gomita') || n.includes('gominola') || n.includes('dulce')) return 'https://images.unsplash.com/photo-1582058091374-e94bb1b01bba?auto=format&fit=crop&w=400&q=80';
  if (n.includes('galleta')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1594212691516-436fba4c7185?auto=format&fit=crop&w=400&q=80';
};

export function ProductCard({ producto, cantidad, onAdd, onSubtract }: ProductCardProps) {
  const isCombo = producto.tipo_articulo === 'combo';
  const imageUrl = getProductImage(producto.nombre);
  const accentColor = '#f9a825';

  const isAgotado = producto.stock_actual <= 0;
  const isLowStock = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isAgotado ? { scale: 1.02, y: -3 } : {}}
      whileTap={!isAgotado ? { scale: 0.98 } : {}}
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer ${isAgotado ? 'cursor-not-allowed opacity-60' : ''}`}
      style={{
        backgroundColor: 'rgba(10,12,20,0.9)',
        border: cantidad > 0 ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: cantidad > 0 ? `0 8px 24px rgba(249,168,37,0.2)` : '0 4px 16px rgba(0,0,0,0.4)'
      }}
    >
      {/* ── Imagen superior ── */}
      <div className="relative h-36 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080c18]" />

        {/* Badge COMBO / UNIT */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span
            className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded backdrop-blur-sm w-fit"
            style={{
              background: isCombo ? 'rgba(249,168,37,0.3)' : 'rgba(0,0,0,0.55)',
              color: isCombo ? accentColor : 'rgba(255,255,255,0.85)',
              border: `1px solid ${isCombo ? 'rgba(249,168,37,0.5)' : 'rgba(255,255,255,0.15)'}`
            }}
          >
            {isCombo ? 'COMBO' : 'UNIT'}
          </span>
          
          {/* Mejora: Badge de Stock */}
          {isAgotado ? (
            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-red-500 text-white w-fit shadow-lg">
              Agotado
            </span>
          ) : isLowStock && (
            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-orange-500 text-white w-fit shadow-lg animate-pulse">
              Últimas {producto.stock_actual} pzas
            </span>
          )}
        </div>

        {/* Burbuja de cantidad */}
        <AnimatePresence>
          {cantidad > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2 right-2 text-black text-xs font-black w-7 h-7 flex items-center justify-center rounded-full z-20"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 12px rgba(249,168,37,0.7)` }}
            >
              {cantidad}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info + controles ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3
            className="text-white leading-tight line-clamp-2 min-h-[2.6rem]"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em', fontSize: '1.1rem' }}
          >
            {producto.nombre}
          </h3>
          <p className="text-lg font-bold font-mono mt-1" style={{ color: accentColor }}>
            ${producto.precio.toFixed(2)}
          </p>
        </div>

        {/* Controles */}
        {cantidad > 0 ? (
          <div className="flex items-center justify-between rounded-xl p-0.5 bg-black/50 border border-white/10">
            <button
              onClick={(e) => { e.stopPropagation(); onSubtract(producto.id_articulo); }}
              className="w-10 h-9 rounded-lg bg-white/5 text-white font-bold hover:bg-red-500/70 transition-all text-xl flex items-center justify-center"
            >
              −
            </button>
            <span className="font-bold w-8 text-center text-base" style={{ color: accentColor }}>
              {cantidad}
            </span>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (cantidad < producto.stock_actual) onAdd(producto); 
              }}
              disabled={cantidad >= producto.stock_actual}
              className="w-10 h-9 rounded-lg font-bold text-black active:scale-90 text-xl flex items-center justify-center disabled:opacity-20"
              style={{ backgroundColor: accentColor }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); if (!isAgotado) onAdd(producto); }}
            disabled={isAgotado}
            className="w-full h-10 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200 disabled:bg-white/5 disabled:text-white/20 disabled:border-white/5"
            style={{ 
              backgroundColor: isAgotado ? 'transparent' : 'rgba(255,255,255,0.06)', 
              color: isAgotado ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)', 
              border: isAgotado ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)' 
            }}
            onMouseEnter={(e) => {
              if (isAgotado) return;
              e.currentTarget.style.backgroundColor = accentColor;
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.borderColor = accentColor;
            }}
            onMouseLeave={(e) => {
              if (isAgotado) return;
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {isAgotado ? 'Sin Stock' : 'Agregar'}
          </button>
        )}
      </div>
    </motion.article>
  );
}
