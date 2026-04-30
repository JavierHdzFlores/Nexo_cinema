'use client';

/**
 * CatalogoProductos.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Implementa el Paso 2 del CU-05:
 *   "El sistema muestra el catálogo de productos disponibles con sus precios."
 *
 * Consume GET /dulceria/productos una sola vez (montaje del componente).
 * El filtrado por categoría ocurre en memoria — sin nuevas llamadas a la API.
 * Esto cumple el Requerimiento Especial 1:
 *   "El tiempo de respuesta para la validación no debe exceder los 2 segundos."
 */

import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import type { ArticuloDulceriaResponse, CartItem } from '../types';

const API_URL = 'http://127.0.0.1:8000/dulceria';

/* Mapeo de categorías del filtro UI → tipo_articulo del backend */
const FILTRO_MAP: Record<string, string[]> = {
  todos:     [],                        // sin filtro
  combo:     ['combo'],
  palomitas: ['producto_individual'],   // se filtra también por nombre abajo
  bebidas:   ['producto_individual'],
  snacks:    ['producto_individual'],
};

const KEYWORDS: Record<string, string[]> = {
  palomitas: ['palomitas', 'popcorn', 'caramelo', 'mantequilla'],
  bebidas:   ['refresco', 'agua', 'jugo', 'bebida', 'soda'],
  snacks:    ['nachos', 'hot dog', 'hotdog', 'dulce', 'galleta', 'snack'],
};

interface CatalogoProductosProps {
  carrito: CartItem[];
  onAdd: (prod: ArticuloDulceriaResponse) => void;
  onSubtract: (id: number) => void;
  filtroCategoria?: string;
}

export function CatalogoProductos({
  carrito,
  onAdd,
  onSubtract,
  filtroCategoria = 'todos',
}: CatalogoProductosProps) {
  const [catalogo, setCatalogo] = useState<ArticuloDulceriaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Carga única al montar — el filtrado es local */
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/productos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setCatalogo(await res.json());
      } catch {
        setError('No fue posible cargar el catálogo. Verifique la conexión con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getCantidad = (id: number) =>
    carrito.find(i => i.id_articulo === id)?.cantidad ?? 0;

  /* ── Filtrado en memoria (0ms) ── */
  const productosFiltrados: ArticuloDulceriaResponse[] = (() => {
    if (filtroCategoria === 'todos') return catalogo;

    const tiposPermitidos = FILTRO_MAP[filtroCategoria] ?? [];
    const keywords = KEYWORDS[filtroCategoria] ?? [];

    return catalogo.filter(p => {
      const tipoOk = tiposPermitidos.includes(p.tipo_articulo);
      if (!tipoOk) return false;
      if (filtroCategoria === 'combo') return true; // combos no necesitan keyword
      // Para palomitas, bebidas, snacks filtramos por nombre
      const nombre = p.nombre.toLowerCase();
      return keywords.some(kw => nombre.includes(kw));
    });
  })();

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-white/15 border-t-[#f9a825] rounded-full animate-spin" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/20">
          Cargando catálogo...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center rounded-xl border border-red-500/10"
        style={{ background: 'rgba(239,68,68,0.04)' }}>
        <p className="text-sm text-red-400/60">{error}</p>
      </div>
    );
  }

  if (productosFiltrados.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-white/20">
          {catalogo.length === 0
            ? 'El catálogo está vacío. Agregue productos desde el panel de administración.'
            : 'No hay productos en esta categoría.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {productosFiltrados.map(p => (
        <ProductCard
          key={p.id_articulo}
          producto={p}
          cantidad={getCantidad(p.id_articulo)}
          onAdd={onAdd}
          onSubtract={onSubtract}
        />
      ))}
    </div>
  );
}
