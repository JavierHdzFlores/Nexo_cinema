'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../layout';

const DATA_PRODUCTOS: Record<string, any[]> = {
  combos: [
    { id: 101, nombre: "Combo Clásico", precio: 210, desc: "Palomitas G + 2 Refrescos M", icono: "🍿", stock: 50 },
    { id: 102, nombre: "Combo Cuates", precio: 295, desc: "2 Palomitas M + 2 Refrescos G + HotDog", icono: "🌭", stock: 30 },
    { id: 103, nombre: "Combo Infantil", precio: 155, desc: "Palomitas Ch + Jugo + Dulce", icono: "🎁", stock: 25 },
  ],
  palomitas: [
    { id: 201, nombre: "Mantequilla G", precio: 95, desc: "Caja grande clásica", icono: "🍿", stock: 100 },
    { id: 202, nombre: "Caramelo G", precio: 110, desc: "Recubrimiento premium", icono: "🍯", stock: 40 },
  ],
  bebidas: [
    { id: 301, nombre: "Refresco Jumbo", precio: 85, desc: "1.2 Litros de sabor", icono: "🥤", stock: 200 },
    { id: 303, nombre: "Agua Purificada", precio: 45, desc: "Ciel 600ml", icono: "💧", stock: 150 },
  ],
  snacks: [
    { id: 401, nombre: "Nachos Queso", precio: 85, desc: "Con jalapeños", icono: "🧀", stock: 45 },
    { id: 402, nombre: "Hot Dog", precio: 75, desc: "Pavo premium", icono: "🌭", stock: 20 },
  ],
};



export default function CategoriaPage() {
  const params = useParams();
  const { agregarProducto, restarProducto, carrito } = useCart();
  
  const categoriaSlug = (params.category as string) || 'combos';
  const productos = DATA_PRODUCTOS[categoriaSlug] || [];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-red-600 mb-1">Categoría</h2>
        <h1 className="text-4xl font-black text-white capitalize">{categoriaSlug}</h1>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
        {productos.map((prod) => {
          const itemEnCarrito = carrito.find((i: any) => i.id_articulo === prod.id);
          const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

          return (
            <div 
              key={prod.id}
              className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:bg-zinc-900/50 transition-colors"
            >
              
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <span className="text-3xl mb-2 block">{prod.icono}</span>
                  <h3 className="text-lg font-bold text-white leading-tight">{prod.nombre}</h3>
                  <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{prod.desc}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-600 bg-black px-2 py-1 rounded border border-zinc-800">
                  STK: {prod.stock}
                </span>
              </div>

             
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold">$</span>
                  <span className="text-xl font-black text-white">{prod.precio}</span>
                </div>

               
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-full p-1 shadow-inner">
                  <button 
                    onClick={() => restarProducto(prod.id)}
                    disabled={cantidad === 0}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-0 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>

                  <span className={`w-8 text-center text-sm font-bold ${cantidad > 0 ? 'text-red-500' : 'text-zinc-700'}`}>
                    {cantidad}
                  </span>

                  <button 
                    onClick={() => agregarProducto(prod.id, prod.nombre, prod.precio)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}