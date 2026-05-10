'use client';

/**
 * page.tsx — Vista principal del POS de Dulcería
 * ─────────────────────────────────────────────────────────────────────────────
 * Implementa el Paso 2 del CU-05:
 *   "El sistema muestra el catálogo de productos disponibles con sus precios."
 *
 * Las categorías son filtros de estado local (useState), NO rutas de Next.js.
 * Esto garantiza el Requerimiento Especial 2:
 *   "La interfaz debe ser táctil y optimizada para la rapidez del vendedor."
 * El cambio de categoría es instantáneo (0ms, sin red, sin re-render del layout).
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from './layout';
import { Search, X } from 'lucide-react';
import { CatalogoProductos } from './components/CatalogoProductos';
import type { ArticuloDulceriaResponse } from './types';

/* ─── Definición de categorías ─── */
type Categoria = 'todos' | 'combo' | 'palomitas' | 'bebidas' | 'snacks' | 'dulces';

const CATEGORIAS: { id: Categoria; label: string; emoji: string }[] = [
  { id: 'todos',    label: 'Todo el menú', emoji: '🎬' },
  { id: 'combo',    label: 'Combos',       emoji: '🍿' },
  { id: 'palomitas',label: 'Palomitas',    emoji: '🫙' },
  { id: 'bebidas',  label: 'Bebidas',      emoji: '🥤' },
  { id: 'snacks',   label: 'Snacks',       emoji: '🌮' },
  { id: 'dulces',   label: 'Dulces',       emoji: '🍬' },
];

export default function DulceriaMainPage() {
  const { carrito, agregarProducto, restarProducto } = useCart();

  // Estado local de filtro — cambio instantáneo, sin navegación
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos');
  const [busqueda, setBusqueda] = useState('');

  const handleAdd = (prod: ArticuloDulceriaResponse) =>
    agregarProducto(prod);

  const handleSubtract = (id: number) => restarProducto(id);

  return (
    <div className="space-y-6 w-full">

      {/* ── Encabezado de sección ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1
          className="text-2xl font-semibold text-white"
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}
        >
          Catálogo de Dulcería
        </h1>

        {/* Mejora: Buscador Profesional */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f9a825]/50 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          {busqueda && (
            <button 
              onClick={() => setBusqueda('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── Tabs de filtro instantáneo ── */}
      <nav className="flex items-center gap-2 p-1.5 rounded-2xl w-fit backdrop-blur-md shadow-lg"
        style={{ background: 'rgba(10,12,20,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {CATEGORIAS.map(cat => {
          const isActive = categoriaActiva === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className="relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all"
              style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.5)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="dulceria-filter-pill"
                  className="absolute inset-0 rounded-xl shadow-[0_5px_15px_rgba(249,168,37,0.3)]"
                  style={{ background: 'linear-gradient(135deg, #f9a825, #ff4e50)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Catálogo filtrado ── */}
      <CatalogoProductos
        carrito={carrito}
        onAdd={handleAdd}
        onSubtract={handleSubtract}
        filtroCategoria={categoriaActiva}
        filtroBusqueda={busqueda}
      />

    </div>
  );
}