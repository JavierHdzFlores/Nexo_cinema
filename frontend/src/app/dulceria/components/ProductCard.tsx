'use client';

/**
 * ProductCard.tsx
 * Representa visualmente un ArticuloDulceria (UML Diagrama 4).
 * Cumple el paso 3 del flujo normal del CU-05.
 * Diseño refactorizado a un estilo limpio y profesional (Cinépolis-like),
 * respetando estrictamente los contratos del Diagrama de Secuencia,
 * y adaptado a la paleta Dark Mode/Dorada original del proyecto.
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

// Función auxiliar para obtener imágenes placeholder premium por tipo de producto
const getProductImage = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes('palomitas')) return 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('refresco')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80';
  if (n.includes('nachos')) return 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('hot dog')) return 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chocolate')) return 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1594212691516-436fba4c7185?auto=format&fit=crop&w=400&q=80'; // Generic combo
};

export function ProductCard({ producto, cantidad, onAdd, onSubtract }: ProductCardProps) {
  const isCombo = producto.tipo_articulo === 'combo';
  const imageUrl = getProductImage(producto.nombre);
  const accentColor = '#f9a825';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: cantidad > 0 ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: cantidad > 0 ? `0 0 15px rgba(249,168,37,0.15)` : 'none'
      }}
    >
      {/* ── Mitad Superior: Área de Imagen (Estructura Cinépolis, Paleta Dark) ── */}
      <div 
        className="relative h-44 w-full flex items-center justify-center p-4 border-b border-white/5"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        {/* Badge superior izquierdo */}
        <div className="absolute top-3 left-3 z-10">
          <span 
            className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded shadow-sm"
            style={{
              background: isCombo ? 'rgba(249,168,37,0.15)' : 'rgba(255,255,255,0.1)',
              color: isCombo ? accentColor : 'rgba(255,255,255,0.7)',
              border: `1px solid ${isCombo ? 'rgba(249,168,37,0.3)' : 'rgba(255,255,255,0.1)'}`
            }}
          >
            {isCombo ? 'COMBO' : 'INDIVIDUAL'}
          </span>
        </div>

        {/* Imagen del producto */}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-black/50 shadow-lg group-hover:scale-105 transition-transform duration-500">
          <img 
            src={imageUrl} 
            alt={producto.nombre}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
        
        {/* Indicador de cantidad en el área de imagen si está agregado */}
        <AnimatePresence>
          {cantidad > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -bottom-3 right-4 text-black text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 z-20"
              style={{ backgroundColor: accentColor, borderColor: '#1a1a1a' }}
            >
              {cantidad}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mitad Inferior: Información y Controles (Paleta Dark) ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Nombre del producto */}
        <h3 className="text-[15px] font-medium text-white/90 leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
          {producto.nombre}
        </h3>
        
        {/* Precio */}
        <div className="text-lg font-bold font-mono mb-4" style={{ color: accentColor }}>
          ${producto.precio.toFixed(2)}
        </div>

        {/* Controles del Carrito */}
        <div className="mt-auto pt-3 border-t border-white/5">
          {cantidad > 0 ? (
            <div className="flex items-center justify-between rounded-lg p-1 bg-black/40 border border-white/5">
              <button
                onClick={() => onSubtract(producto.id_articulo)}
                className="w-10 h-9 rounded-md bg-white/5 text-white/70 font-bold hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="font-bold w-8 text-center text-sm" style={{ color: accentColor }}>
                {cantidad}
              </span>
              <button
                onClick={() => onAdd(producto)}
                className="w-10 h-9 rounded-md font-bold text-black shadow-sm transition-colors"
                style={{ backgroundColor: accentColor }}
                aria-label="Agregar otro"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(producto)}
              className="w-full h-11 rounded-lg font-semibold text-sm tracking-wide uppercase transition-all duration-200"
              style={{
                backgroundColor: 'rgba(249,168,37,0.1)',
                color: accentColor,
                border: `1px solid rgba(249,168,37,0.3)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentColor;
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(249,168,37,0.1)';
                e.currentTarget.style.color = accentColor;
              }}
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}


