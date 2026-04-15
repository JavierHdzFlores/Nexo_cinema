'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


interface Item {
  id_articulo: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

const CartContext = createContext<{
  carrito: Item[];
  agregarProducto: (id: number, nombre: string, precio: number) => void;
  restarProducto: (id: number) => void;
  eliminarProducto: (id: number) => void;
  limpiarCarrito: () => void;
} | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};


export default function DulceriaLayout({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<Item[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const pathname = usePathname();

  
  const agregarProducto = (id: number, nombre: string, precio: number) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id_articulo === id);
      if (existe) {
        return prev.map(i => i.id_articulo === id 
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * precio } 
          : i
        );
      }
      return [...prev, { id_articulo: id, nombre, cantidad: 1, precio, subtotal: precio }];
    });
  };

  const restarProducto = (id: number) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id_articulo === id);
      if (!existe) return prev;
      
      if (existe.cantidad > 1) {
        return prev.map(i => i.id_articulo === id 
          ? { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precio } 
          : i
        );
      }
      return prev.filter(i => i.id_articulo !== id);
    });
  };

  const eliminarProducto = (id: number) => {
    setCarrito(prev => prev.filter(i => i.id_articulo !== id));
  };

  const limpiarCarrito = () => setCarrito([]);

  const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  
  const finalizarCompra = async () => {
    if (carrito.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:8000/dulceria/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: carrito.map(i => ({ id_articulo: i.id_articulo, cantidad: i.cantidad }))
        })
      });
      if (res.ok) {
        alert(" Venta exitosa. Inventario actualizado.");
        limpiarCarrito();
      }
    } catch (e) {
      alert("Error de comunicación con el servidor (dulceria.py)");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CartContext.Provider value={{ carrito, agregarProducto, restarProducto, eliminarProducto, limpiarCarrito }}>
      <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
        
        
        <main className="max-w-[1800px] mx-auto grid lg:grid-cols-12 gap-0">
          
      
          <section className="lg:col-span-8 p-10 border-r border-zinc-900 min-h-[calc(100vh-80px)]">
            <nav className="flex gap-10 mb-12 border-b border-zinc-900">
              {[
                { name: 'Inicio', path: '/dulceria' },
                { name: 'Combos', path: '/dulceria/combos' },
                { name: 'Palomitas', path: '/dulceria/palomitas' },
                { name: 'Bebidas', path: '/dulceria/bebidas' },
                { name: 'Snacks', path: '/dulceria/snacks' },

              ].map((cat) => (
                <Link 
                  key={cat.path} 
                  href={cat.path}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                    pathname === cat.path ? 'text-red-600 border-b-2 border-red-600' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              {children}
            </div>
          </section>

          
          <aside className="lg:col-span-4 p-10 bg-[#080808] h-[calc(100vh-80px)] sticky top-20 flex flex-col">
            <div className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ticket</h2>
              <button 
                onClick={limpiarCarrito}
                className="text-[10px] font-black text-zinc-600 hover:text-red-600 uppercase tracking-widest transition-colors"
              >
                Limpiar Orden
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <span className="text-8xl mb-4">🛒</span>
                  <p className="font-black uppercase tracking-widest">Sin artículos</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id_articulo} className="flex justify-between items-center group animate-in slide-in-from-right-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3">
                         <span className="text-red-600 font-mono font-bold">{item.cantidad}x</span>
                         <h4 className="text-sm font-black uppercase text-zinc-200 truncate max-w-[150px]">{item.nombre}</h4>
                      </div>
                      <div className="flex gap-4 mt-1">
                        <button 
                          onClick={() => restarProducto(item.id_articulo)}
                          className="text-[9px] font-black uppercase text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          Reducir 
                        </button>
                        <button 
                          onClick={() => eliminarProducto(item.id_articulo)}
                          className="text-[9px] font-black uppercase text-zinc-700 hover:text-red-600 transition-colors"
                        >
                          Quitar 
                        </button>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-lg text-white">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-zinc-900">
              <div className="flex justify-between items-end mb-8">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Subtotal</span>
                <span className="text-5xl font-black text-white italic tracking-tighter font-mono">${totalVenta.toFixed(2)}</span>
              </div>

              <button 
                onClick={finalizarCompra}
                disabled={carrito.length === 0 || isProcessing}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all ${
                  carrito.length > 0 && !isProcessing
                  ? 'bg-white text-black hover:bg-red-600 hover:text-white shadow-[0_20px_50px_rgba(255,255,255,0.05)] active:scale-[0.95]'
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                }`}
              >
                {isProcessing ? 'Sincronizando...' : 'Procesar Venta'}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </CartContext.Provider>
  );
}