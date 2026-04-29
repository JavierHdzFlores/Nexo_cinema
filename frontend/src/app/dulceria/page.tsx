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
import { CatalogoProductos } from './components/CatalogoProductos';
import type { ArticuloDulceriaResponse } from './types';

/* ─── Definición de categorías ─── */
type Categoria = 'todos' | 'combo' | 'palomitas' | 'bebidas' | 'snacks';

const CATEGORIAS: { id: Categoria; label: string }[] = [
  { id: 'todos', label: 'Todo el menú' },
  { id: 'combo', label: 'Combos' },
  { id: 'palomitas', label: 'Palomitas' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'snacks', label: 'Snacks' },
];

export default function DulceriaMainPage() {
  const { carrito, agregarProducto, restarProducto } = useCart();

  // Estado local de filtro — cambio instantáneo, sin navegación
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos');

  const handleAdd = (prod: ArticuloDulceriaResponse) =>
    agregarProducto(prod.id_articulo, prod.nombre, prod.precio);

  const handleSubtract = (id: number) => restarProducto(id);

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Encabezado de sección ── */}
      <header>

        <h1
          className="text-2xl font-semibold text-white"
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}
        >
          Catálogo de Dulcería
        </h1>
      </header>

      {/* ── Tabs de filtro instantáneo ── */}
      <nav className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {CATEGORIAS.map(cat => {
          const isActive = categoriaActiva === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className="relative px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-colors"
              style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.35)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="dulceria-filter-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
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
      />

    </div>
  );
}